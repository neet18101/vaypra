-- Enforce "one UPS per PC" at the database level — race-proof and immune to
-- direct SQL/API inserts that bypass the app's validation.
--
-- A "UPS installation" is a row whose product.category = 'UPS', linked to a PC
-- via custom_fields->>'linked_pc_installation_id'. A plain UNIQUE index can't
-- reference products.category (it lives on another table), so we denormalize
-- "the linked PC id, but only when this row is a UPS" into a dedicated column
-- (ups_linked_pc_id) and put the UNIQUE index on THAT. A trigger keeps the
-- column in sync on every insert/update; the unique index is what actually
-- closes the simultaneous-insert race (Postgres serializes index insertions).

-- 1. Denormalized column the unique index will sit on.
ALTER TABLE public.installations
  ADD COLUMN IF NOT EXISTS ups_linked_pc_id uuid;

-- 2. Keep ups_linked_pc_id in sync. Set it to the linked PC's installation id
--    ONLY when this row is a UPS with a link; NULL otherwise (NULLs don't
--    collide in a unique index, so non-UPS rows never conflict).
CREATE OR REPLACE FUNCTION public.set_ups_linked_pc_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_category text;
  v_link     text;
BEGIN
  -- product_id can be NULL (ON DELETE SET NULL) — then this is never a UPS link.
  IF NEW.product_id IS NOT NULL THEN
    SELECT category INTO v_category FROM public.products WHERE id = NEW.product_id;
  END IF;

  v_link := NULLIF(NEW.custom_fields->>'linked_pc_installation_id', '');

  IF upper(coalesce(v_category, '')) = 'UPS'
     AND v_link IS NOT NULL
     AND v_link ~ '^[0-9a-fA-F-]{36}$'
  THEN
    NEW.ups_linked_pc_id := v_link::uuid;
  ELSE
    NEW.ups_linked_pc_id := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_ups_linked_pc_id ON public.installations;
CREATE TRIGGER trg_set_ups_linked_pc_id
  BEFORE INSERT OR UPDATE ON public.installations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ups_linked_pc_id();

-- 3. Backfill existing rows so the rule applies retroactively.
UPDATE public.installations i
SET ups_linked_pc_id = CASE
  WHEN upper(coalesce(p.category, '')) = 'UPS'
       AND NULLIF(i.custom_fields->>'linked_pc_installation_id', '') ~ '^[0-9a-fA-F-]{36}$'
  THEN (i.custom_fields->>'linked_pc_installation_id')::uuid
  ELSE NULL
END
FROM public.products p
WHERE p.id = i.product_id;

-- 4. Fail loudly with a readable message if existing duplicates would block the
--    unique index — clean those up first (see the cleanup query we discussed),
--    then re-run this migration.
DO $$
DECLARE
  v_dupe_count int;
BEGIN
  SELECT count(*) INTO v_dupe_count FROM (
    SELECT ups_linked_pc_id
    FROM public.installations
    WHERE ups_linked_pc_id IS NOT NULL
    GROUP BY ups_linked_pc_id
    HAVING count(*) > 1
  ) d;

  IF v_dupe_count > 0 THEN
    RAISE EXCEPTION
      'Cannot enforce one-UPS-per-PC: % PC(s) already have multiple UPS linked. Remove the duplicates first, then re-run this migration.', v_dupe_count;
  END IF;
END;
$$;

-- 5. The race-proof guarantee: at most one UPS per linked PC.
--    The app hard-deletes installations, so a deleted UPS's row is gone and the
--    slot frees naturally. NOTE: if soft-delete (a deleted_at column) is ever
--    added to installations, also add `AND deleted_at IS NULL` here so a
--    soft-deleted UPS doesn't keep blocking the PC.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_one_ups_per_pc
  ON public.installations (ups_linked_pc_id)
  WHERE ups_linked_pc_id IS NOT NULL;
