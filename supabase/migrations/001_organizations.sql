-- ============================================
-- Migration 001: Organization-based Multi-Tenancy
-- Converts user_id isolation to organization_id isolation.
-- Safe to run on an existing database; idempotent where possible.
-- ============================================

-- ============================================
-- STEP 1: organizations table
-- ============================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text        NOT NULL,
  business_name         text        DEFAULT '',
  gstin                 text        DEFAULT '',
  pan                   text        DEFAULT '',
  phone                 text        DEFAULT '',
  email                 text        DEFAULT '',
  address               text        DEFAULT '',
  city                  text        DEFAULT '',
  state                 text        DEFAULT '',
  state_code            text        DEFAULT '',
  pincode               text        DEFAULT '',
  business_type         text        DEFAULT 'retail',
  logo_url              text,
  subscription_plan     text        DEFAULT 'free',
  subscription_expires_at timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: organization_members table
-- ============================================

CREATE TABLE IF NOT EXISTS public.organization_members (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role              text        NOT NULL DEFAULT 'member'
                                CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions       jsonb       DEFAULT '{}',
  invited_by        uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at         timestamptz DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Helper functions
-- SECURITY DEFINER so they bypass RLS when reading organization_members,
-- avoiding infinite recursion when RLS policies call them.
-- ============================================

-- Returns all organization IDs the current user belongs to (any role).
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS uuid[] LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ARRAY(
    SELECT organization_id
    FROM   public.organization_members
    WHERE  user_id = auth.uid()
  );
$$;

-- Returns all organization IDs where the user can write (owner/admin/member).
CREATE OR REPLACE FUNCTION public.get_user_writable_organizations()
RETURNS uuid[] LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ARRAY(
    SELECT organization_id
    FROM   public.organization_members
    WHERE  user_id = auth.uid()
      AND  role IN ('owner', 'admin', 'member')
  );
$$;

-- Returns the user's primary (earliest-joined) organization id.
CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT organization_id
  FROM   public.organization_members
  WHERE  user_id = auth.uid()
  ORDER BY joined_at ASC
  LIMIT  1;
$$;

-- ============================================
-- STEP 4: RLS policies for new tables
-- ============================================

-- organizations: any member may read; owner/admin may update; owner may delete.
DROP POLICY IF EXISTS "Members can view their organizations"   ON public.organizations;
DROP POLICY IF EXISTS "Owners/admins can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Service role can insert organizations"  ON public.organizations;
DROP POLICY IF EXISTS "Owners can delete organizations"        ON public.organizations;

CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (id = ANY(public.get_user_organizations()));

CREATE POLICY "Owners/admins can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE  organization_id = organizations.id
        AND  user_id = auth.uid()
        AND  role IN ('owner', 'admin')
    )
  );

-- Insertion is performed by the trigger / server-side function only.
CREATE POLICY "Service role can insert organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can delete organizations"
  ON public.organizations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE  organization_id = organizations.id
        AND  user_id = auth.uid()
        AND  role = 'owner'
    )
  );

-- organization_members
DROP POLICY IF EXISTS "Members can view org members"          ON public.organization_members;
DROP POLICY IF EXISTS "Owners/admins can add members"         ON public.organization_members;
DROP POLICY IF EXISTS "Owners/admins can update members"      ON public.organization_members;
DROP POLICY IF EXISTS "Owners can remove members"             ON public.organization_members;

CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()));

CREATE POLICY "Owners/admins can add members"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE  user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners/admins can update members"
  ON public.organization_members FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE  user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can remove members"
  ON public.organization_members FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE  user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================
-- STEP 5: Backfill — one org per existing user
-- For each row in profiles, create an organization seeded with that
-- user's business data, then add them as owner.
-- Skips users who already have an org (idempotent).
-- ============================================

DO $$
DECLARE
  rec        RECORD;
  new_org_id uuid;
BEGIN
  FOR rec IN
    SELECT p.id AS user_id, p.business_name, p.gstin, p.phone, p.email, p.address, p.state
    FROM   public.profiles p
    WHERE  NOT EXISTS (
      SELECT 1 FROM public.organization_members om WHERE om.user_id = p.id
    )
  LOOP
    INSERT INTO public.organizations (name, business_name, gstin, phone, email, address, state)
    VALUES (
      COALESCE(NULLIF(rec.business_name, ''), NULLIF(rec.email, ''), 'My Organization'),
      rec.business_name,
      rec.gstin,
      rec.phone,
      rec.email,
      rec.address,
      rec.state
    )
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, rec.user_id, 'owner');
  END LOOP;
END;
$$;

-- ============================================
-- STEP 6: Add organization_id (nullable) to every data table
-- ============================================

ALTER TABLE public.categories     ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.products        ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.customers       ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.invoices        ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.installments    ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.branches        ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ai_insights     ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.dispatches      ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.dispatch_items  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.installations   ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.print_templates ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- ============================================
-- STEP 7: Backfill organization_id from each row's user_id
-- Joins through organization_members to find the user's owner org.
-- For users in multiple orgs (not expected at this stage), picks the
-- earliest-joined org (same logic as current_organization_id()).
-- ============================================

UPDATE public.categories t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.products t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.customers t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.invoices t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.installments t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.branches t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.ai_insights t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.dispatches t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.dispatch_items t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.installations t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

UPDATE public.print_templates t
SET    organization_id = om.organization_id
FROM   public.organization_members om
WHERE  om.user_id = t.user_id
  AND  t.organization_id IS NULL
  AND  om.joined_at = (
         SELECT MIN(om2.joined_at) FROM public.organization_members om2
         WHERE om2.user_id = om.user_id
       );

-- ============================================
-- STEP 8: Make organization_id NOT NULL + add indexes
-- Any rows that couldn't be backfilled (orphaned user_id with no org)
-- are deleted first to avoid constraint violations.
-- ============================================

DELETE FROM public.dispatch_items  WHERE organization_id IS NULL;
DELETE FROM public.installations   WHERE organization_id IS NULL;
DELETE FROM public.dispatches      WHERE organization_id IS NULL;
DELETE FROM public.ai_insights     WHERE organization_id IS NULL;
DELETE FROM public.print_templates WHERE organization_id IS NULL;
DELETE FROM public.installments    WHERE organization_id IS NULL;
DELETE FROM public.invoices        WHERE organization_id IS NULL;
DELETE FROM public.branches        WHERE organization_id IS NULL;
DELETE FROM public.customers       WHERE organization_id IS NULL;
DELETE FROM public.products        WHERE organization_id IS NULL;
DELETE FROM public.categories      WHERE organization_id IS NULL;

ALTER TABLE public.categories     ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.products        ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.customers       ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.invoices        ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.installments    ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.branches        ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.dispatches      ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.dispatch_items  ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.installations   ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.print_templates ALTER COLUMN organization_id SET NOT NULL;
-- ai_insights rows may be legitimately sparse; keep nullable.

CREATE INDEX IF NOT EXISTS idx_categories_org     ON public.categories     (organization_id);
CREATE INDEX IF NOT EXISTS idx_products_org        ON public.products        (organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_org       ON public.customers       (organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org        ON public.invoices        (organization_id);
CREATE INDEX IF NOT EXISTS idx_installments_org    ON public.installments    (organization_id);
CREATE INDEX IF NOT EXISTS idx_branches_org        ON public.branches        (organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_org     ON public.ai_insights     (organization_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_org      ON public.dispatches      (organization_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_items_org  ON public.dispatch_items  (organization_id);
CREATE INDEX IF NOT EXISTS idx_installations_org   ON public.installations   (organization_id);
CREATE INDEX IF NOT EXISTS idx_print_templates_org ON public.print_templates (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user    ON public.organization_members (user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org     ON public.organization_members (organization_id);

-- ============================================
-- STEP 9: Drop old user_id-based RLS policies
-- ============================================

-- categories
DROP POLICY IF EXISTS "Users can view own categories"   ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

-- products
DROP POLICY IF EXISTS "Users can view own products"   ON public.products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;

-- customers
DROP POLICY IF EXISTS "Users can view own customers"   ON public.customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;

-- invoices
DROP POLICY IF EXISTS "Users can view own invoices"   ON public.invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON public.invoices;

-- installments
DROP POLICY IF EXISTS "Users can view own installments"   ON public.installments;
DROP POLICY IF EXISTS "Users can insert own installments" ON public.installments;
DROP POLICY IF EXISTS "Users can update own installments" ON public.installments;
DROP POLICY IF EXISTS "Users can delete own installments" ON public.installments;

-- branches
DROP POLICY IF EXISTS "Users can view own branches"   ON public.branches;
DROP POLICY IF EXISTS "Users can insert own branches" ON public.branches;
DROP POLICY IF EXISTS "Users can update own branches" ON public.branches;
DROP POLICY IF EXISTS "Users can delete own branches" ON public.branches;

-- ai_insights
DROP POLICY IF EXISTS "Users can view own insights"   ON public.ai_insights;
DROP POLICY IF EXISTS "Users can insert own insights" ON public.ai_insights;

-- dispatches
DROP POLICY IF EXISTS "Users can view own dispatches"   ON public.dispatches;
DROP POLICY IF EXISTS "Users can insert own dispatches" ON public.dispatches;
DROP POLICY IF EXISTS "Users can update own dispatches" ON public.dispatches;
DROP POLICY IF EXISTS "Users can delete own dispatches" ON public.dispatches;

-- dispatch_items
DROP POLICY IF EXISTS "Users can view own dispatch_items"   ON public.dispatch_items;
DROP POLICY IF EXISTS "Users can insert own dispatch_items" ON public.dispatch_items;
DROP POLICY IF EXISTS "Users can update own dispatch_items" ON public.dispatch_items;
DROP POLICY IF EXISTS "Users can delete own dispatch_items" ON public.dispatch_items;

-- installations
DROP POLICY IF EXISTS "Users can view own installations"   ON public.installations;
DROP POLICY IF EXISTS "Users can insert own installations" ON public.installations;
DROP POLICY IF EXISTS "Users can update own installations" ON public.installations;
DROP POLICY IF EXISTS "Users can delete own installations" ON public.installations;

-- print_templates
DROP POLICY IF EXISTS "Users can view own print_templates"   ON public.print_templates;
DROP POLICY IF EXISTS "Users can insert own print_templates" ON public.print_templates;
DROP POLICY IF EXISTS "Users can update own print_templates" ON public.print_templates;
DROP POLICY IF EXISTS "Users can delete own print_templates" ON public.print_templates;

-- ============================================
-- STEP 10: New organization-based RLS policies
-- Pattern:
--   SELECT  → organization_id = ANY(get_user_organizations())
--   INSERT  → organization_id = ANY(get_user_writable_organizations())
--   UPDATE  → organization_id = ANY(get_user_writable_organizations())
--   DELETE  → organization_id = ANY(get_user_writable_organizations())
-- ============================================

-- categories
CREATE POLICY "Org members can view categories"   ON public.categories FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert categories" ON public.categories FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update categories" ON public.categories FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete categories" ON public.categories FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- products
CREATE POLICY "Org members can view products"   ON public.products FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert products" ON public.products FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update products" ON public.products FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete products" ON public.products FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- customers
CREATE POLICY "Org members can view customers"   ON public.customers FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert customers" ON public.customers FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update customers" ON public.customers FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete customers" ON public.customers FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- invoices
CREATE POLICY "Org members can view invoices"   ON public.invoices FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert invoices" ON public.invoices FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update invoices" ON public.invoices FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete invoices" ON public.invoices FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- installments
CREATE POLICY "Org members can view installments"   ON public.installments FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert installments" ON public.installments FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update installments" ON public.installments FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete installments" ON public.installments FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- branches
CREATE POLICY "Org members can view branches"   ON public.branches FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert branches" ON public.branches FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update branches" ON public.branches FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete branches" ON public.branches FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- ai_insights
CREATE POLICY "Org members can view ai_insights"   ON public.ai_insights FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert ai_insights" ON public.ai_insights FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));

-- dispatches
CREATE POLICY "Org members can view dispatches"   ON public.dispatches FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert dispatches" ON public.dispatches FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update dispatches" ON public.dispatches FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete dispatches" ON public.dispatches FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- dispatch_items
CREATE POLICY "Org members can view dispatch_items"   ON public.dispatch_items FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert dispatch_items" ON public.dispatch_items FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update dispatch_items" ON public.dispatch_items FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete dispatch_items" ON public.dispatch_items FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- installations
CREATE POLICY "Org members can view installations"   ON public.installations FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert installations" ON public.installations FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update installations" ON public.installations FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete installations" ON public.installations FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- print_templates
CREATE POLICY "Org members can view print_templates"   ON public.print_templates FOR SELECT USING (organization_id = ANY(public.get_user_organizations()));
CREATE POLICY "Org members can insert print_templates" ON public.print_templates FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can update print_templates" ON public.print_templates FOR UPDATE USING (organization_id = ANY(public.get_user_writable_organizations()));
CREATE POLICY "Org members can delete print_templates" ON public.print_templates FOR DELETE USING (organization_id = ANY(public.get_user_writable_organizations()));

-- ============================================
-- STEP 11: Update handle_new_user trigger
-- Creates profile + organization + owner membership atomically.
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_org_id uuid;
  org_name   text;
BEGIN
  -- Create user profile
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;

  -- Derive org name from signup metadata or email prefix
  org_name := COALESCE(
    NULLIF(new.raw_user_meta_data->>'business_name', ''),
    NULLIF(new.raw_user_meta_data->>'organization_name', ''),
    NULLIF(split_part(new.email, '@', 1), ''),
    'My Organization'
  );

  -- Create a default organization for the new user
  INSERT INTO public.organizations (name, email)
  VALUES (org_name, new.email)
  RETURNING id INTO new_org_id;

  -- Add the user as owner of that organization
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, new.id, 'owner');

  RETURN new;
END;
$$;

-- Recreate the trigger (drop + create to replace any prior version)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- STEP 12: Drop user_id columns from data tables
-- NOTE: After running this migration you must update every API route
-- to supply organization_id instead of user_id when querying/inserting.
-- ============================================

ALTER TABLE public.categories     DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.products        DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.customers       DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.invoices        DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.installments    DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.branches        DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.ai_insights     DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.dispatches      DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.dispatch_items  DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.installations   DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.print_templates DROP COLUMN IF EXISTS user_id;

-- ============================================
-- STEP 13: Add current_organization_id to profiles
-- Lets the app remember which org the user last selected.
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Seed it with the user's sole (owner) org where available
UPDATE public.profiles p
SET    current_organization_id = (
  SELECT organization_id
  FROM   public.organization_members
  WHERE  user_id = p.id
  ORDER BY joined_at ASC
  LIMIT  1
)
WHERE  current_organization_id IS NULL;

-- ============================================
-- Done.
-- Next steps for the application layer:
--   1. Replace all `eq("user_id", userId)` filters with `eq("organization_id", orgId)`.
--   2. On INSERT, pass `organization_id: orgId` instead of `user_id: userId`.
--   3. Read orgId from organization_members (server) or profiles.current_organization_id (client).
-- ============================================
