-- ============================================
-- Migration 003: Soft Delete + Audit Trail
-- Requires migrations 001 (organizations) and 002 (gst_fields).
-- All column additions use IF NOT EXISTS; policy drops use IF EXISTS.
-- ============================================

-- ============================================
-- STEP 1: Add soft-delete + authorship columns
-- Tables: products, customers, invoices, invoice_items,
--         installments, dispatches, installations, branches
-- ============================================

-- products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- invoice_items (added by migration 002; no updated_at column exists here)
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- installments
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- dispatches
ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;
ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- installations
ALTER TABLE public.installations ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;
ALTER TABLE public.installations ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.installations ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- branches
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Partial indexes: NULLs are cheap to index; this makes the common live-records
-- scan fast and keeps the deleted rows queryable without a full-table scan.
CREATE INDEX IF NOT EXISTS idx_products_not_deleted     ON public.products     (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_not_deleted    ON public.customers    (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_not_deleted     ON public.invoices     (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inv_items_not_deleted    ON public.invoice_items(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_installments_not_deleted ON public.installments (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dispatches_not_deleted   ON public.dispatches   (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_installations_not_deleted ON public.installations(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_branches_not_deleted     ON public.branches     (organization_id) WHERE deleted_at IS NULL;

-- ============================================
-- STEP 2: Update SELECT RLS policies to exclude soft-deleted rows
-- Drop the policy created in 001/002, recreate with "AND deleted_at IS NULL".
-- INSERT / UPDATE / DELETE policies are unchanged — writers can still target
-- specific deleted_at values (e.g., the soft_delete_record helper below).
-- ============================================

-- products
DROP POLICY IF EXISTS "Org members can view products" ON public.products;
CREATE POLICY "Org members can view products"
  ON public.products FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()) AND deleted_at IS NULL);

-- customers
DROP POLICY IF EXISTS "Org members can view customers" ON public.customers;
CREATE POLICY "Org members can view customers"
  ON public.customers FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()) AND deleted_at IS NULL);

-- invoices
DROP POLICY IF EXISTS "Org members can view invoices" ON public.invoices;
CREATE POLICY "Org members can view invoices"
  ON public.invoices FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()) AND deleted_at IS NULL);

-- invoice_items (policy created in migration 002)
DROP POLICY IF EXISTS "Org members can view invoice_items" ON public.invoice_items;
CREATE POLICY "Org members can view invoice_items"
  ON public.invoice_items FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()) AND deleted_at IS NULL);

-- installments
DROP POLICY IF EXISTS "Org members can view installments" ON public.installments;
CREATE POLICY "Org members can view installments"
  ON public.installments FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()) AND deleted_at IS NULL);

-- dispatches
DROP POLICY IF EXISTS "Org members can view dispatches" ON public.dispatches;
CREATE POLICY "Org members can view dispatches"
  ON public.dispatches FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()) AND deleted_at IS NULL);

-- installations
DROP POLICY IF EXISTS "Org members can view installations" ON public.installations;
CREATE POLICY "Org members can view installations"
  ON public.installations FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()) AND deleted_at IS NULL);

-- branches
DROP POLICY IF EXISTS "Org members can view branches" ON public.branches;
CREATE POLICY "Org members can view branches"
  ON public.branches FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()) AND deleted_at IS NULL);

-- ============================================
-- STEP 3: audit_logs table
-- Immutable from the client side — written only by SECURITY DEFINER triggers.
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name      text        NOT NULL,
  record_id       uuid        NOT NULL,
  action          text        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  -- old_data / new_data: for UPDATE only changed columns are stored (diff),
  -- not the full row, to keep storage lean.
  old_data        jsonb,
  new_data        jsonb,
  -- Populated by app layer via set_config if available; triggers leave NULL.
  ip_address      text,
  user_agent      text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Org members may read their own audit trail; no client-side writes.
CREATE POLICY "Org members can view audit_logs"
  ON public.audit_logs FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()));

-- Indexes matching the two primary access patterns the user asked for.
CREATE INDEX IF NOT EXISTS idx_audit_org_time
  ON public.audit_logs (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_record
  ON public.audit_logs (table_name, record_id);

-- ============================================
-- STEP 4: Shared audit trigger function
--
-- Design choices for performance:
--   • AFTER trigger — row is already committed; no latency on the critical path.
--   • UPDATE diff — only changed columns stored, not full rows, reducing JSONB size.
--   • No-op guard — skips when OLD and NEW are identical (e.g. touch-only updates).
--   • SECURITY DEFINER — bypasses RLS so the function can always write audit_logs
--     regardless of the calling user's permissions.
--   • SET search_path — prevents privilege escalation via search_path manipulation.
-- ============================================

CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_old_full jsonb;
  v_new_full jsonb;
  v_old_diff jsonb;
  v_new_diff jsonb;
  v_record_id uuid;
  v_org_id    uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_record_id := NEW.id;
    v_org_id    := NEW.organization_id;
    v_new_diff  := to_jsonb(NEW);
    -- No old_data for inserts

  ELSIF TG_OP = 'UPDATE' THEN
    -- Skip pure no-op updates (e.g. triggered by middleware touching updated_at)
    v_old_full := to_jsonb(OLD);
    v_new_full := to_jsonb(NEW);
    IF v_old_full = v_new_full THEN
      RETURN NULL;
    END IF;

    v_record_id := NEW.id;
    v_org_id    := NEW.organization_id;

    -- Store only the diff: new values of changed columns
    SELECT
      jsonb_object_agg(n.key, n.value)
    INTO v_new_diff
    FROM jsonb_each(v_new_full) AS n
    WHERE v_new_full -> n.key IS DISTINCT FROM v_old_full -> n.key;

    -- Previous values of those same columns
    SELECT
      jsonb_object_agg(o.key, o.value)
    INTO v_old_diff
    FROM jsonb_each(v_old_full) AS o
    WHERE v_new_full -> o.key IS DISTINCT FROM v_old_full -> o.key;

  ELSIF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id;
    v_org_id    := OLD.organization_id;
    v_old_diff  := to_jsonb(OLD);
    -- No new_data for hard deletes
  END IF;

  INSERT INTO public.audit_logs
    (organization_id, user_id, table_name, record_id, action, old_data, new_data)
  VALUES
    (v_org_id, auth.uid(), TG_TABLE_NAME, v_record_id, TG_OP, v_old_diff, v_new_diff);

  RETURN NULL; -- AFTER trigger return value is ignored for row triggers
END;
$$;

-- ============================================
-- STEP 5: Attach audit triggers to the five critical tables
-- Using a single shared function keeps maintenance simple.
-- Tables omitted (dispatches, installations, branches) can be added
-- later by repeating the CREATE TRIGGER pattern below.
-- ============================================

DROP TRIGGER IF EXISTS trg_audit_invoices      ON public.invoices;
DROP TRIGGER IF EXISTS trg_audit_invoice_items ON public.invoice_items;
DROP TRIGGER IF EXISTS trg_audit_products      ON public.products;
DROP TRIGGER IF EXISTS trg_audit_customers     ON public.customers;
DROP TRIGGER IF EXISTS trg_audit_installments  ON public.installments;

CREATE TRIGGER trg_audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_invoice_items
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_customers
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_installments
  AFTER INSERT OR UPDATE OR DELETE ON public.installments
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- ============================================
-- STEP 6: soft_delete_record(table_name, record_id) → boolean
--
-- Sets deleted_at = now() and updated_by = auth.uid() for a single row.
-- Returns true if the row was found and deleted; false if already deleted
-- or not found.  Raises if the table is not in the soft-delete whitelist
-- or if the caller lacks write access to the owning organization.
--
-- The UPDATE this function runs will fire the audit trigger on tables
-- that have one (invoices, invoice_items, products, customers, installments),
-- so soft-deletes on those tables are automatically logged.
-- ============================================

CREATE OR REPLACE FUNCTION public.soft_delete_record(
  p_table_name text,
  p_record_id  uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_org_id    uuid;
  v_row_count integer;
BEGIN
  -- Whitelist: prevents SQL injection via p_table_name and restricts
  -- which tables the client may soft-delete.
  IF p_table_name NOT IN (
    'products', 'customers', 'invoices', 'invoice_items',
    'installments', 'dispatches', 'installations', 'branches'
  ) THEN
    RAISE EXCEPTION 'soft_delete_record: table "%" is not in the allowed list', p_table_name;
  END IF;

  -- Fetch the owning org without RLS (SECURITY DEFINER bypasses it).
  EXECUTE format('SELECT organization_id FROM public.%I WHERE id = $1', p_table_name)
  INTO v_org_id
  USING p_record_id;

  -- Record not found at all.
  IF v_org_id IS NULL THEN
    RETURN false;
  END IF;

  -- Enforce caller's write access; get_user_writable_organizations() still
  -- uses auth.uid() of the calling session even inside SECURITY DEFINER.
  IF NOT (v_org_id = ANY(public.get_user_writable_organizations())) THEN
    RAISE EXCEPTION 'soft_delete_record: access denied for organization %', v_org_id;
  END IF;

  -- Only update rows that are not already soft-deleted.
  -- updated_by is set here; updated_at is intentionally omitted because
  -- invoice_items (and future tables) may not have that column.
  EXECUTE format(
    'UPDATE public.%I SET deleted_at = now(), updated_by = auth.uid() WHERE id = $1 AND deleted_at IS NULL',
    p_table_name
  )
  USING p_record_id;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  RETURN v_row_count > 0;
END;
$$;

-- ============================================
-- Done.
-- Application layer checklist:
--   • Soft delete: call rpc('soft_delete_record', { p_table_name, p_record_id })
--     instead of .delete() — physical deletes are now only for admin use.
--   • Restore: UPDATE <table> SET deleted_at = NULL, updated_by = auth.uid()
--     where needed (add a restore_record() RPC if client-driven restores are needed).
--   • Audit log viewer: query audit_logs filtered by organization_id + optional
--     table_name / record_id.  ip_address and user_agent stay NULL from triggers;
--     populate them from the app layer via supabase.rpc if you need them:
--       await supabase.rpc('set_request_metadata', { ip, ua })  (custom RPC).
--   • created_by / updated_by: set these in INSERT/UPDATE payloads from the client:
--       { ...data, created_by: session.user.id }
--     or add a BEFORE trigger per-table if you want the DB to auto-fill them.
-- ============================================
