-- ============================================
-- Migration 002: GST / Indian Compliance Fields
-- Requires migration 001 (organizations) to have run first.
-- All new columns use IF NOT EXISTS; safe to re-run.
-- ============================================

-- ============================================
-- PART 1: Products — pricing, tax & inventory
-- ============================================

-- HSN/SAC code for GST classification (mandatory for GSTR-1)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hsn_code          text           DEFAULT '';

-- GST slab: 0 | 5 | 12 | 18 | 28 (stored as percentage)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tax_rate          numeric(5,2)   DEFAULT 18;

-- Unit of measure: PCS / KG / LTR / MTR / BOX / SET / DOZ / etc.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit_of_measure   text           DEFAULT 'PCS';

-- Maximum Retail Price (printed on packaging)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS mrp               numeric(12,2)  DEFAULT 0;

-- Cost / purchase price (used for margin calculations)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS purchase_price    numeric(12,2)  DEFAULT 0;

-- Wholesale / bulk selling price
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS wholesale_price   numeric(12,2)  DEFAULT 0;

-- Reorder point — alert when stock drops at or below this
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock         integer        DEFAULT 0;

-- EAN-13 / QR / internal barcode
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode           text           DEFAULT '';

-- true → collect batch number + expiry date on each purchase/sale
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS batch_tracking    boolean        DEFAULT false;

-- true → collect one serial number per unit on each sale
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS serial_tracking   boolean        DEFAULT false;

-- Long-form product description for catalogues / invoices
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description       text           DEFAULT '';

-- Product image (Supabase Storage URL or external CDN)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url         text;

-- ============================================
-- PART 2: Customers — GST identity & credit
-- ============================================

-- 15-character GSTIN (empty for unregistered / consumers)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gstin            text           DEFAULT '';

-- PAN (required for TDS and high-value invoices)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS pan              text           DEFAULT '';

-- Billing state name (e.g. "Maharashtra")
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS state            text           DEFAULT '';

-- 2-digit state code per GST schedule (e.g. "27" for Maharashtra)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS state_code       text           DEFAULT '';

-- Structured billing address: { line1, line2, city, state, state_code, pincode, country }
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS billing_address  jsonb;

-- Separate shipping address; null means same as billing
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS shipping_address jsonb;

-- Credit limit; 0 = no credit (pay up-front)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS credit_limit     numeric(12,2)  DEFAULT 0;

-- GST registration type of the customer
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gst_type         text           DEFAULT 'unregistered'
  CHECK (gst_type IN ('regular', 'composition', 'unregistered', 'consumer'));

-- B2B (business) vs B2C (end-consumer); drives invoice format and GSTR filing
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_type    text           DEFAULT 'b2c'
  CHECK (customer_type IN ('b2b', 'b2c'));

-- ============================================
-- PART 3: Invoices — GST breakdown & e-compliance
-- Existing columns (amount, gst_amount, status, type, date) are kept
-- for backward compatibility; new columns carry GST-compliant values.
-- ============================================

-- B2B / B2C / Export — determines GSTR-1 section and e-invoice applicability
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_type        text          DEFAULT 'b2c'
  CHECK (invoice_type IN ('b2b', 'b2c', 'export'));

-- FK to customers table (customer_name stays for denormalized display)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_id         uuid          REFERENCES public.customers(id) ON DELETE SET NULL;

-- State where goods/services are supplied (for IGST vs CGST+SGST determination)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS place_of_supply     text          DEFAULT '';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS place_of_supply_code text         DEFAULT '';

-- Taxable value = sum of line-item taxable amounts (before GST)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS taxable_value       numeric(12,2) DEFAULT 0;

-- GST breakdown (CGST + SGST for intra-state; IGST for inter-state/export)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS cgst_amount         numeric(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sgst_amount         numeric(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS igst_amount         numeric(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS cess_amount         numeric(12,2) DEFAULT 0;

-- Invoice-level discount (over and above line-item discounts)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS discount_amount     numeric(12,2) DEFAULT 0;

-- Round-off adjustment (±0.99) to reach a whole-rupee total
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS round_off           numeric(5,2)  DEFAULT 0;

-- Grand total (taxable_value + all GST + cess - discount + round_off)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total_amount        numeric(12,2) DEFAULT 0;

-- Payments received against this invoice
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_amount         numeric(12,2) DEFAULT 0;

-- total_amount - paid_amount (maintained by trigger or app)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS balance_amount      numeric(12,2) DEFAULT 0;

-- When payment is due
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_date            date;

-- e.g. "Net 30", "Immediate", "45 days"
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_terms       text          DEFAULT '';

-- Free-form notes printed at bottom of invoice
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes               text          DEFAULT '';

-- GST E-Way Bill (mandatory for goods movement > ₹50,000)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS e_way_bill_number   text          DEFAULT '';

-- GSTN e-Invoice fields (mandatory for turnover > ₹5 cr)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS irn_number          text          DEFAULT '';  -- Invoice Reference Number
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS ack_number          text          DEFAULT '';  -- Acknowledgement number from IRP
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS ack_date            timestamptz;               -- Acknowledgement timestamp
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS qr_code_url         text;                      -- QR code image URL from IRP

-- Reverse charge (Section 9(3)/(4) of CGST Act)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS reverse_charge      boolean       DEFAULT false;

-- Generation status flags
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_einvoice_generated boolean     DEFAULT false;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_eway_generated     boolean     DEFAULT false;

-- Backfill total_amount from existing amount column (best-effort)
UPDATE public.invoices
SET    total_amount = amount
WHERE  total_amount = 0 AND amount > 0;

-- Index for customer FK (common filter and JOIN)
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices (customer_id);

-- ============================================
-- PART 4: invoice_items — line items per invoice
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id               uuid           PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tenancy
  organization_id  uuid           NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Parent invoice (cascade delete keeps items and invoice in sync)
  invoice_id       uuid           NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,

  -- Product reference; SET NULL so items survive product deletion (historical record)
  product_id       uuid           REFERENCES public.products(id) ON DELETE SET NULL,

  -- Denormalized at time of sale (survives product edits/deletion)
  product_name     text           NOT NULL DEFAULT '',
  hsn_code         text           DEFAULT '',
  unit             text           DEFAULT 'PCS',

  -- Quantity: numeric to support fractional units (e.g. 1.5 KG, 2.5 MTR)
  quantity         numeric(12,3)  DEFAULT 1 CHECK (quantity > 0),

  -- Unit selling price (excl. tax)
  rate             numeric(12,2)  DEFAULT 0,

  -- Line-level discount
  discount_percent numeric(5,2)   DEFAULT 0,
  discount_amount  numeric(12,2)  DEFAULT 0,

  -- Taxable value = (quantity × rate) - discount_amount
  taxable_value    numeric(12,2)  DEFAULT 0,

  -- GST rate and split amounts for this line
  tax_rate         numeric(5,2)   DEFAULT 0,
  cgst_amount      numeric(12,2)  DEFAULT 0,
  sgst_amount      numeric(12,2)  DEFAULT 0,
  igst_amount      numeric(12,2)  DEFAULT 0,

  -- Line total = taxable_value + cgst + sgst + igst
  total            numeric(12,2)  DEFAULT 0,

  -- Serial & batch tracking (populated at point of sale when tracking is enabled)
  serial_numbers   text[]         DEFAULT '{}',
  batch_number     text           DEFAULT '',
  expiry_date      date,

  -- Display order on the printed invoice
  position         integer        DEFAULT 0,

  created_at       timestamptz    DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: RLS for invoice_items
-- Matches organization-based pattern from migration 001.
-- ============================================

CREATE POLICY "Org members can view invoice_items"
  ON public.invoice_items FOR SELECT
  USING (organization_id = ANY(public.get_user_organizations()));

CREATE POLICY "Org members can insert invoice_items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (organization_id = ANY(public.get_user_writable_organizations()));

CREATE POLICY "Org members can update invoice_items"
  ON public.invoice_items FOR UPDATE
  USING (organization_id = ANY(public.get_user_writable_organizations()));

CREATE POLICY "Org members can delete invoice_items"
  ON public.invoice_items FOR DELETE
  USING (organization_id = ANY(public.get_user_writable_organizations()));

-- ============================================
-- PART 6: Indexes for invoice_items
-- ============================================

-- Primary access pattern: fetch all items for an invoice
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice  ON public.invoice_items (invoice_id);

-- Org filter (RLS and explicit queries)
CREATE INDEX IF NOT EXISTS idx_invoice_items_org      ON public.invoice_items (organization_id);

-- Product lookup (find invoices for a given product)
CREATE INDEX IF NOT EXISTS idx_invoice_items_product  ON public.invoice_items (product_id) WHERE product_id IS NOT NULL;

-- ============================================
-- Done.
-- Application layer changes needed:
--   • Invoice create/edit: compute taxable_value, cgst/sgst/igst per line,
--     roll up to invoice totals; persist items in invoice_items.
--   • Product form: expose hsn_code, tax_rate, mrp, purchase_price, uom,
--     serial_tracking, batch_tracking.
--   • Customer form: expose gstin, pan, state_code, gst_type, customer_type.
--   • Invoice PDF: use cgst_amount + sgst_amount (intra-state) or igst_amount
--     (inter-state) based on place_of_supply vs org state.
-- ============================================
