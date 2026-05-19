-- ============================================
-- Migration 004: Production Indexes + Views
-- Requires migrations 001–003.
-- All index creation uses IF NOT EXISTS; idempotent.
-- NOTE: On a live database with significant data, run index creation
-- outside a transaction using CREATE INDEX CONCURRENTLY to avoid
-- table locks. As a migration it runs transactionally, which is safe
-- on empty or small tables during initial setup.
-- ============================================

-- ============================================
-- STEP 1: Composite and lookup indexes
-- Single-column (organization_id) and soft-delete partial indexes
-- were created in migrations 001 and 003; they are not repeated here.
-- ============================================

-- ── products ─────────────────────────────────────────────────────────

-- SKU lookup during CSV import, barcode scan, and duplicate detection.
-- Composite with org_id so the unique scan stays within the tenant.
CREATE INDEX IF NOT EXISTS idx_products_org_sku
  ON public.products (organization_id, sku)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_products_org_sku
  IS 'Fast SKU lookup during import deduplication and product search within an org.';

-- Status filter for inventory dashboard (in-stock / low-stock / out-of-stock).
CREATE INDEX IF NOT EXISTS idx_products_org_status
  ON public.products (organization_id, status)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_products_org_status
  IS 'Filters live products by status for inventory dashboard panels.';

-- Category browse page and category-filtered product lists.
CREATE INDEX IF NOT EXISTS idx_products_org_category
  ON public.products (organization_id, category)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_products_org_category
  IS 'Category drill-down queries on the product catalogue page.';

-- Barcode scanner lookup: point-of-sale and receiving workflows scan
-- barcodes to identify products; must be near-instant.
-- Partial: skips the large fraction of products with no barcode.
CREATE INDEX IF NOT EXISTS idx_products_barcode
  ON public.products (barcode)
  WHERE deleted_at IS NULL AND barcode <> '';
COMMENT ON INDEX idx_products_barcode
  IS 'Barcode scan lookup at POS and goods receiving; partial to skip empty barcodes.';

-- ── customers ────────────────────────────────────────────────────────

-- Phone number search from invoice creation autocomplete.
CREATE INDEX IF NOT EXISTS idx_customers_org_phone
  ON public.customers (organization_id, phone)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_customers_org_phone
  IS 'Customer phone-number autocomplete on invoice and installment forms.';

-- GSTIN lookup: B2B invoice creation and GSTR-1 reconciliation.
-- Partial: most consumer (B2C) customers have no GSTIN.
CREATE INDEX IF NOT EXISTS idx_customers_org_gstin
  ON public.customers (organization_id, gstin)
  WHERE deleted_at IS NULL AND gstin <> '';
COMMENT ON INDEX idx_customers_org_gstin
  IS 'GSTIN-based customer lookup for B2B invoices and GST reconciliation.';

-- ── invoices ─────────────────────────────────────────────────────────

-- Primary sort for invoice list: most recent first, within the org.
-- Covers the default dashboard and invoice list views.
CREATE INDEX IF NOT EXISTS idx_invoices_org_date
  ON public.invoices (organization_id, date DESC)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_invoices_org_date
  IS 'Descending-date invoice list; the default sort on the invoices page.';

-- Status filter: pending / overdue / paid tabs on the invoice list.
CREATE INDEX IF NOT EXISTS idx_invoices_org_status
  ON public.invoices (organization_id, status)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_invoices_org_status
  IS 'Status-tab filtering (pending / paid / overdue) on the invoice list page.';

-- Invoice number lookup: direct search by INV-2024-001 etc.
-- Not scoped to org_id because invoice_number is globally unique in practice
-- and the org filter from RLS trims the scan anyway.
CREATE INDEX IF NOT EXISTS idx_invoices_number
  ON public.invoices (invoice_number)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_invoices_number
  IS 'Direct invoice-number search and duplicate-number check on creation.';

-- customer_id FK — added in migration 002; listed here for completeness.
CREATE INDEX IF NOT EXISTS idx_invoices_customer
  ON public.invoices (customer_id);
COMMENT ON INDEX idx_invoices_customer
  IS 'FK support for customer → invoices JOIN used in customer_metrics view.';

-- ── invoice_items ────────────────────────────────────────────────────

-- Added in migration 002; comments added here for documentation.
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice
  ON public.invoice_items (invoice_id);
COMMENT ON INDEX idx_invoice_items_invoice
  IS 'Fetch all line items for an invoice in a single index scan.';

CREATE INDEX IF NOT EXISTS idx_invoice_items_product
  ON public.invoice_items (product_id)
  WHERE product_id IS NOT NULL;
COMMENT ON INDEX idx_invoice_items_product
  IS 'Find all invoices that contain a given product (product history view).';

-- ── dispatches ───────────────────────────────────────────────────────

-- Dispatch list default sort: most recent dispatches first, within the org.
CREATE INDEX IF NOT EXISTS idx_dispatches_org_date
  ON public.dispatches (organization_id, dispatch_date DESC)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_dispatches_org_date
  IS 'Descending dispatch-date sort for the dispatch tracking list.';

-- Branch filter on dispatch list and branch_metrics view JOIN.
CREATE INDEX IF NOT EXISTS idx_dispatches_branch
  ON public.dispatches (branch_id)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_dispatches_branch
  IS 'Filter dispatches by branch for the branch detail page and metrics view.';

-- ── installations ────────────────────────────────────────────────────

-- Product history: find all installation records for a given product unit.
CREATE INDEX IF NOT EXISTS idx_installations_product
  ON public.installations (product_id)
  WHERE deleted_at IS NULL;
COMMENT ON INDEX idx_installations_product
  IS 'Product lifecycle: all installation records for a serial number.';

-- Link from a dispatch item to its installation record.
-- Partial: many installations are created without a dispatch_item reference.
CREATE INDEX IF NOT EXISTS idx_installations_dispatch_item
  ON public.installations (dispatch_item_id)
  WHERE dispatch_item_id IS NOT NULL AND deleted_at IS NULL;
COMMENT ON INDEX idx_installations_dispatch_item
  IS 'Dispatch-item → installation FK lookup for lifecycle tracking.';

-- ── audit_logs ───────────────────────────────────────────────────────

-- Added in migration 003; comments added here for documentation.
CREATE INDEX IF NOT EXISTS idx_audit_org_time
  ON public.audit_logs (organization_id, created_at DESC);
COMMENT ON INDEX idx_audit_org_time
  IS 'Audit log viewer: org-scoped feed ordered newest-first.';

CREATE INDEX IF NOT EXISTS idx_audit_record
  ON public.audit_logs (table_name, record_id);
COMMENT ON INDEX idx_audit_record
  IS 'Record-level history: all audit events for a specific row.';

-- ── organization_members ─────────────────────────────────────────────

-- Added in migration 001; comments added here for documentation.
CREATE INDEX IF NOT EXISTS idx_org_members_user
  ON public.organization_members (user_id);
COMMENT ON INDEX idx_org_members_user
  IS 'get_user_organizations() helper: all orgs for a given auth.uid().';

CREATE INDEX IF NOT EXISTS idx_org_members_org
  ON public.organization_members (organization_id);
COMMENT ON INDEX idx_org_members_org
  IS 'List all members of an organization for the members management page.';

-- ============================================
-- STEP 2: Drop stale denormalized columns
-- These were manually maintained, drift from the real data over time,
-- and are replaced by the live aggregate views below.
-- WARNING: Update any application code that reads these columns before
-- running this migration on a live database.
-- ============================================

ALTER TABLE public.branches  DROP COLUMN IF EXISTS revenue;
ALTER TABLE public.branches  DROP COLUMN IF EXISTS orders;
ALTER TABLE public.customers DROP COLUMN IF EXISTS total_orders;

-- ============================================
-- STEP 3: Views
-- All views use SECURITY INVOKER (PostgreSQL default), so RLS on the
-- underlying tables is applied for the calling user automatically.
-- No separate RLS policy is needed on the views themselves.
-- ============================================

-- ── branch_metrics ───────────────────────────────────────────────────
-- Counts dispatches, dispatched items, and installations per branch.
-- Revenue per branch is omitted: invoices have no branch_id FK in the
-- current schema. Add a branch_id column to invoices to enable it.

CREATE OR REPLACE VIEW public.branch_metrics AS
WITH dispatch_agg AS (
  SELECT
    d.branch_id,
    COUNT(DISTINCT d.id)    AS total_dispatches,
    COUNT(di.id)            AS total_items_dispatched,
    COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.id END) AS delivered_dispatches,
    COUNT(DISTINCT CASE WHEN d.status = 'in-transit' THEN d.id END) AS in_transit_dispatches
  FROM public.dispatches d
  LEFT JOIN public.dispatch_items di ON di.dispatch_id = d.id
  WHERE d.deleted_at IS NULL
  GROUP BY d.branch_id
),
installation_agg AS (
  SELECT
    inst.branch_id,
    COUNT(*)                AS total_installations,
    MAX(inst.installation_date) AS last_installation_date
  FROM public.installations inst
  WHERE inst.deleted_at IS NULL
  GROUP BY inst.branch_id
)
SELECT
  b.id                                                AS branch_id,
  b.organization_id,
  b.name                                              AS branch_name,
  b.manager,
  b.status,
  COALESCE(da.total_dispatches,        0)             AS total_dispatches,
  COALESCE(da.total_items_dispatched,  0)             AS total_items_dispatched,
  COALESCE(da.delivered_dispatches,    0)             AS delivered_dispatches,
  COALESCE(da.in_transit_dispatches,   0)             AS in_transit_dispatches,
  COALESCE(ia.total_installations,     0)             AS total_installations,
  ia.last_installation_date
FROM public.branches b
LEFT JOIN dispatch_agg    da ON da.branch_id    = b.id
LEFT JOIN installation_agg ia ON ia.branch_id   = b.id
WHERE b.deleted_at IS NULL;

COMMENT ON VIEW public.branch_metrics
  IS 'Live branch performance: dispatch and installation counts. Replaces the stale branches.orders column.';

-- ── customer_metrics ─────────────────────────────────────────────────
-- Total orders, revenue, and outstanding balance per customer.
-- Joins through customer_id FK added in migration 002.

CREATE OR REPLACE VIEW public.customer_metrics AS
SELECT
  c.id                                                AS customer_id,
  c.organization_id,
  c.name                                              AS customer_name,
  c.phone,
  c.email,
  c.gstin,
  c.customer_type,
  c.gst_type,
  c.loyalty_tier,
  c.credit_limit,
  c.balance                                           AS ledger_balance,
  COUNT(inv.id)                                       AS total_orders,
  COALESCE(SUM(inv.total_amount),     0)              AS total_revenue,
  COALESCE(SUM(inv.paid_amount),      0)              AS total_paid,
  COALESCE(SUM(inv.balance_amount),   0)              AS outstanding_balance,
  COUNT(DISTINCT CASE WHEN inv.status = 'overdue' THEN inv.id END) AS overdue_invoice_count,
  MAX(inv.date)                                       AS last_order_date,
  MIN(inv.date)                                       AS first_order_date
FROM public.customers c
LEFT JOIN public.invoices inv
       ON inv.customer_id   = c.id
      AND inv.deleted_at    IS NULL
WHERE c.deleted_at IS NULL
GROUP BY
  c.id, c.organization_id, c.name, c.phone, c.email,
  c.gstin, c.customer_type, c.gst_type, c.loyalty_tier,
  c.credit_limit, c.balance;

COMMENT ON VIEW public.customer_metrics
  IS 'Live customer KPIs: orders, revenue, and balance. Replaces the stale customers.total_orders column.';

-- ── product_metrics ───────────────────────────────────────────────────
-- Units sold, revenue, and installation count per product.
-- Uses CTEs to avoid cross-multiplication between invoice_items and
-- installations when both are LEFT JOINed to the same product row.

CREATE OR REPLACE VIEW public.product_metrics AS
WITH sales_agg AS (
  SELECT
    ii.product_id,
    COUNT(DISTINCT ii.invoice_id)           AS invoice_count,
    COALESCE(SUM(ii.quantity),          0)  AS total_quantity_sold,
    COALESCE(SUM(ii.total),             0)  AS total_revenue,
    COALESCE(SUM(ii.taxable_value),     0)  AS total_taxable_value,
    MAX(inv.date)                           AS last_sold_date
  FROM public.invoice_items ii
  JOIN public.invoices inv ON inv.id = ii.invoice_id AND inv.deleted_at IS NULL
  WHERE ii.deleted_at IS NULL AND ii.product_id IS NOT NULL
  GROUP BY ii.product_id
),
install_agg AS (
  SELECT
    inst.product_id,
    COUNT(*)                                AS installation_count,
    MAX(inst.installation_date)             AS last_installation_date
  FROM public.installations inst
  WHERE inst.deleted_at IS NULL
  GROUP BY inst.product_id
)
SELECT
  p.id                                                AS product_id,
  p.organization_id,
  p.name                                              AS product_name,
  p.sku,
  p.brand,
  p.category,
  p.hsn_code,
  p.tax_rate,
  p.stock,
  p.min_stock,
  p.status,
  p.price,
  p.mrp,
  p.purchase_price,
  -- Derived margin (null when purchase_price is zero to avoid divide-by-zero display issues)
  CASE
    WHEN p.purchase_price > 0
    THEN ROUND(((p.price - p.purchase_price) / p.purchase_price) * 100, 2)
  END                                                 AS margin_percent,
  COALESCE(sa.invoice_count,          0)              AS invoice_count,
  COALESCE(sa.total_quantity_sold,    0)              AS total_quantity_sold,
  COALESCE(sa.total_revenue,          0)              AS total_revenue,
  COALESCE(sa.total_taxable_value,    0)              AS total_taxable_value,
  sa.last_sold_date,
  COALESCE(ia.installation_count,     0)              AS installation_count,
  ia.last_installation_date
FROM public.products p
LEFT JOIN sales_agg   sa ON sa.product_id = p.id
LEFT JOIN install_agg ia ON ia.product_id = p.id
WHERE p.deleted_at IS NULL;

COMMENT ON VIEW public.product_metrics
  IS 'Live product performance: units sold, revenue, margin, and installation count per product.';

-- ── dashboard_metrics ─────────────────────────────────────────────────
-- One row per organization with KPIs for the main dashboard.
-- Uses correlated subqueries (not JOINs) to keep each metric isolated
-- and avoid any risk of row-count inflation.
-- CURRENT_DATE uses the database server timezone (UTC in Supabase).

CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT
  o.id                                                AS organization_id,

  -- ── Revenue ──────────────────────────────────────────────────────
  (SELECT COALESCE(SUM(total_amount), 0)
   FROM public.invoices
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND date::date = CURRENT_DATE)                   AS revenue_today,

  (SELECT COALESCE(SUM(total_amount), 0)
   FROM public.invoices
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND date >= date_trunc('month', CURRENT_DATE))   AS revenue_this_month,

  -- ── Order counts ──────────────────────────────────────────────────
  (SELECT COUNT(*)
   FROM public.invoices
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND date::date = CURRENT_DATE)                   AS orders_today,

  -- ── Receivables ───────────────────────────────────────────────────
  (SELECT COUNT(*)
   FROM public.invoices
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND status = 'pending')                          AS pending_invoice_count,

  (SELECT COUNT(*)
   FROM public.invoices
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND status = 'overdue')                          AS overdue_invoice_count,

  (SELECT COALESCE(SUM(balance_amount), 0)
   FROM public.invoices
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND status IN ('pending', 'overdue'))            AS total_outstanding,

  -- ── Inventory ─────────────────────────────────────────────────────
  -- Low stock: stock > 0 but at or below the reorder point
  (SELECT COUNT(*)
   FROM public.products
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND stock > 0
     AND stock <= min_stock)                          AS low_stock_count,

  (SELECT COUNT(*)
   FROM public.products
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND stock = 0)                                   AS out_of_stock_count,

  -- ── Installments ──────────────────────────────────────────────────
  (SELECT COUNT(*)
   FROM public.installments
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND status = 'overdue')                          AS overdue_installment_count,

  (SELECT COALESCE(SUM(remaining), 0)
   FROM public.installments
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND status IN ('on-track', 'overdue'))           AS total_installment_outstanding,

  -- ── Logistics ─────────────────────────────────────────────────────
  (SELECT COUNT(*)
   FROM public.dispatches
   WHERE organization_id = o.id
     AND deleted_at IS NULL
     AND status = 'in-transit')                       AS in_transit_dispatch_count

FROM public.organizations o;

COMMENT ON VIEW public.dashboard_metrics
  IS 'Per-org dashboard KPIs: revenue, receivables, inventory alerts, installments, logistics. Query with .eq("organization_id", orgId).';

-- ============================================
-- Done.
-- Application layer checklist:
--   • Replace branches.revenue / branches.orders reads with branch_metrics view.
--   • Replace customers.total_orders reads with customer_metrics.total_orders.
--   • Dashboard: query dashboard_metrics filtered by organization_id.
--   • All views are RLS-transparent: query them with the authenticated
--     Supabase client and they will automatically scope to the user's orgs.
-- ============================================
