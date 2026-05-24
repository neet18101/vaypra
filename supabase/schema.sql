-- ============================================
-- BizFlow Pro — Full Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text default '',
  gstin text default '',
  phone text default '',
  email text default '',
  address text default '',
  state text default '',
  role text default 'admin',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
drop policy if exists "Users can view own categories" on public.categories;
drop policy if exists "Users can insert own categories" on public.categories;
drop policy if exists "Users can update own categories" on public.categories;
drop policy if exists "Users can delete own categories" on public.categories;
create policy "Users can view own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id);

-- 3. Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  sku text not null,
  serial_number text,
  brand text default '',
  stock integer default 0,
  price numeric(12,2) default 0,
  category text default '',
  status text default 'in-stock',
  custom_fields jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;
drop policy if exists "Users can view own products" on public.products;
drop policy if exists "Users can insert own products" on public.products;
drop policy if exists "Users can update own products" on public.products;
drop policy if exists "Users can delete own products" on public.products;
create policy "Users can view own products" on public.products for select using (auth.uid() = user_id);
create policy "Users can insert own products" on public.products for insert with check (auth.uid() = user_id);
create policy "Users can update own products" on public.products for update using (auth.uid() = user_id);
create policy "Users can delete own products" on public.products for delete using (auth.uid() = user_id);

-- 4. Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text default '',
  email text default '',
  balance numeric(12,2) default 0,
  loyalty_tier text default 'Bronze',
  total_orders integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.customers enable row level security;
drop policy if exists "Users can view own customers" on public.customers;
drop policy if exists "Users can insert own customers" on public.customers;
drop policy if exists "Users can update own customers" on public.customers;
drop policy if exists "Users can delete own customers" on public.customers;
create policy "Users can view own customers" on public.customers for select using (auth.uid() = user_id);
create policy "Users can insert own customers" on public.customers for insert with check (auth.uid() = user_id);
create policy "Users can update own customers" on public.customers for update using (auth.uid() = user_id);
create policy "Users can delete own customers" on public.customers for delete using (auth.uid() = user_id);

-- 5. Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  invoice_number text not null,
  customer_name text not null,
  amount numeric(12,2) default 0,
  gst_amount numeric(12,2) default 0,
  status text default 'pending',
  type text default 'sale',
  date timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoices enable row level security;
drop policy if exists "Users can view own invoices" on public.invoices;
drop policy if exists "Users can insert own invoices" on public.invoices;
drop policy if exists "Users can update own invoices" on public.invoices;
drop policy if exists "Users can delete own invoices" on public.invoices;
create policy "Users can view own invoices" on public.invoices for select using (auth.uid() = user_id);
create policy "Users can insert own invoices" on public.invoices for insert with check (auth.uid() = user_id);
create policy "Users can update own invoices" on public.invoices for update using (auth.uid() = user_id);
create policy "Users can delete own invoices" on public.invoices for delete using (auth.uid() = user_id);

-- 6. Installments
create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_name text not null,
  total_amount numeric(12,2) default 0,
  paid_amount numeric(12,2) default 0,
  remaining numeric(12,2) default 0,
  next_due_date date,
  total_emis integer default 0,
  paid_emis integer default 0,
  status text default 'on-track',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.installments enable row level security;
drop policy if exists "Users can view own installments" on public.installments;
drop policy if exists "Users can insert own installments" on public.installments;
drop policy if exists "Users can update own installments" on public.installments;
drop policy if exists "Users can delete own installments" on public.installments;
create policy "Users can view own installments" on public.installments for select using (auth.uid() = user_id);
create policy "Users can insert own installments" on public.installments for insert with check (auth.uid() = user_id);
create policy "Users can update own installments" on public.installments for update using (auth.uid() = user_id);
create policy "Users can delete own installments" on public.installments for delete using (auth.uid() = user_id);

-- 7. Branches
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  manager text default '',
  revenue numeric(12,2) default 0,
  orders integer default 0,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.branches enable row level security;
drop policy if exists "Users can view own branches" on public.branches;
drop policy if exists "Users can insert own branches" on public.branches;
drop policy if exists "Users can update own branches" on public.branches;
drop policy if exists "Users can delete own branches" on public.branches;
create policy "Users can view own branches" on public.branches for select using (auth.uid() = user_id);
create policy "Users can insert own branches" on public.branches for insert with check (auth.uid() = user_id);
create policy "Users can update own branches" on public.branches for update using (auth.uid() = user_id);
create policy "Users can delete own branches" on public.branches for delete using (auth.uid() = user_id);

-- 8. AI Insights (seeded/static)
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  description text not null,
  icon text not null,
  color text not null,
  created_at timestamptz default now()
);

alter table public.ai_insights enable row level security;
drop policy if exists "Users can view own insights" on public.ai_insights;
drop policy if exists "Users can insert own insights" on public.ai_insights;
create policy "Users can view own insights" on public.ai_insights for select using (auth.uid() = user_id);
create policy "Users can insert own insights" on public.ai_insights for insert with check (auth.uid() = user_id);

-- 9. Dispatches (batch header)
create table if not exists public.dispatches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  dispatch_number text not null,
  branch_id uuid references public.branches(id) on delete restrict not null,
  dispatched_by text default '',
  dispatched_by_mobile text default '',
  notes text default '',
  status text default 'in-transit',
  dispatch_date timestamptz default now(),
  delivered_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.dispatches enable row level security;
drop policy if exists "Users can view own dispatches" on public.dispatches;
drop policy if exists "Users can insert own dispatches" on public.dispatches;
drop policy if exists "Users can update own dispatches" on public.dispatches;
drop policy if exists "Users can delete own dispatches" on public.dispatches;
create policy "Users can view own dispatches" on public.dispatches for select using (auth.uid() = user_id);
create policy "Users can insert own dispatches" on public.dispatches for insert with check (auth.uid() = user_id);
create policy "Users can update own dispatches" on public.dispatches for update using (auth.uid() = user_id);
create policy "Users can delete own dispatches" on public.dispatches for delete using (auth.uid() = user_id);

-- 10. Dispatch Items (line items per product)
create table if not exists public.dispatch_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  dispatch_id uuid references public.dispatches(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  status text default 'dispatched',
  created_at timestamptz default now()
);

alter table public.dispatch_items enable row level security;
drop policy if exists "Users can view own dispatch_items" on public.dispatch_items;
drop policy if exists "Users can insert own dispatch_items" on public.dispatch_items;
drop policy if exists "Users can update own dispatch_items" on public.dispatch_items;
drop policy if exists "Users can delete own dispatch_items" on public.dispatch_items;
create policy "Users can view own dispatch_items" on public.dispatch_items for select using (auth.uid() = user_id);
create policy "Users can insert own dispatch_items" on public.dispatch_items for insert with check (auth.uid() = user_id);
create policy "Users can update own dispatch_items" on public.dispatch_items for update using (auth.uid() = user_id);
create policy "Users can delete own dispatch_items" on public.dispatch_items for delete using (auth.uid() = user_id);

-- 11. Installations (per-product installation record)
create table if not exists public.installations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  dispatch_item_id uuid references public.dispatch_items(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  customer_name text default '',
  installer_name text default '',
  installation_date timestamptz default now(),
  windows_key text default '',
  ms_office_key text default '',
  antivirus_key text default '',
  custom_fields jsonb,
  notes text default '',
  status text default 'completed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.installations enable row level security;
drop policy if exists "Users can view own installations" on public.installations;
drop policy if exists "Users can insert own installations" on public.installations;
drop policy if exists "Users can update own installations" on public.installations;
drop policy if exists "Users can delete own installations" on public.installations;
create policy "Users can view own installations" on public.installations for select using (auth.uid() = user_id);
create policy "Users can insert own installations" on public.installations for insert with check (auth.uid() = user_id);
create policy "Users can update own installations" on public.installations for update using (auth.uid() = user_id);
create policy "Users can delete own installations" on public.installations for delete using (auth.uid() = user_id);

-- 12. Print Templates
create table if not exists public.print_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  brand text default '',
  base_layout text default 'brand',
  company_name text default 'BizFlowPro',
  header_subtitle text default 'Installation Certificate',
  footer_text text default '',
  accent_color text default '',
  show_keys boolean default true,
  show_custom_fields boolean default true,
  show_notes boolean default true,
  show_signatures boolean default true,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.print_templates enable row level security;
drop policy if exists "Users can view own print_templates" on public.print_templates;
drop policy if exists "Users can insert own print_templates" on public.print_templates;
drop policy if exists "Users can update own print_templates" on public.print_templates;
drop policy if exists "Users can delete own print_templates" on public.print_templates;
create policy "Users can view own print_templates" on public.print_templates for select using (auth.uid() = user_id);
create policy "Users can insert own print_templates" on public.print_templates for insert with check (auth.uid() = user_id);
create policy "Users can update own print_templates" on public.print_templates for update using (auth.uid() = user_id);
create policy "Users can delete own print_templates" on public.print_templates for delete using (auth.uid() = user_id);

-- ============================================
-- SEED DATA
-- After signing up, replace YOUR_USER_ID with your auth.users id
-- Find it via: select id from auth.users limit 1;
-- ============================================

/*
insert into public.products (user_id, name, sku, stock, price, category, status) values
  ('YOUR_USER_ID', 'Samsung Galaxy M14', 'SAM-M14', 45, 12999, 'Mobile', 'in-stock'),
  ('YOUR_USER_ID', 'JBL Flip 6 Speaker', 'JBL-F6', 12, 9999, 'Audio', 'low-stock'),
  ('YOUR_USER_ID', 'HP DeskJet 2820', 'HP-DJ28', 0, 4499, 'Printer', 'out-of-stock'),
  ('YOUR_USER_ID', 'Boat Rockerz 450', 'BOT-R450', 89, 1499, 'Audio', 'in-stock'),
  ('YOUR_USER_ID', 'Canon PIXMA G3000', 'CAN-PX3', 8, 12500, 'Printer', 'low-stock'),
  ('YOUR_USER_ID', 'Realme Narzo 60x', 'RLM-N60', 34, 8999, 'Mobile', 'in-stock');

insert into public.customers (user_id, name, phone, email, balance, loyalty_tier, total_orders) values
  ('YOUR_USER_ID', 'Rajesh Electronics', '+91 98765 43210', 'rajesh@electronics.in', 24500, 'Gold', 47),
  ('YOUR_USER_ID', 'Sharma General Store', '+91 87654 32109', 'sharma@store.in', 8750, 'Silver', 23),
  ('YOUR_USER_ID', 'Patel Traders', '+91 76543 21098', 'patel@traders.in', 15200, 'Gold', 65),
  ('YOUR_USER_ID', 'City Mart', '+91 65432 10987', 'info@citymart.in', 0, 'Platinum', 112),
  ('YOUR_USER_ID', 'Metro Supplies', '+91 54321 09876', 'metro@supplies.in', 67800, 'Bronze', 15);

insert into public.invoices (user_id, invoice_number, customer_name, amount, gst_amount, status, type, date) values
  ('YOUR_USER_ID', 'INV-2024-001', 'Rajesh Electronics', 24500, 4410, 'paid', 'sale', now()),
  ('YOUR_USER_ID', 'INV-2024-002', 'Sharma General Store', 8750, 1575, 'pending', 'sale', now()),
  ('YOUR_USER_ID', 'PUR-2024-015', 'ABC Wholesalers', 125000, 22500, 'paid', 'purchase', now() - interval '1 day'),
  ('YOUR_USER_ID', 'INV-2024-003', 'Patel Traders', 15200, 2736, 'overdue', 'sale', now() - interval '2 days'),
  ('YOUR_USER_ID', 'INV-2024-004', 'City Mart', 42300, 7614, 'paid', 'sale', now() - interval '3 days'),
  ('YOUR_USER_ID', 'PUR-2024-016', 'Metro Supplies', 67800, 12204, 'pending', 'purchase', now() - interval '3 days');

insert into public.installments (user_id, customer_name, total_amount, paid_amount, remaining, next_due_date, total_emis, paid_emis, status) values
  ('YOUR_USER_ID', 'Rajesh Electronics', 120000, 80000, 40000, '2026-05-15', 6, 4, 'on-track'),
  ('YOUR_USER_ID', 'Patel Traders', 250000, 50000, 200000, '2026-05-20', 10, 2, 'on-track'),
  ('YOUR_USER_ID', 'Sharma General Store', 45000, 30000, 15000, '2026-05-10', 3, 2, 'overdue'),
  ('YOUR_USER_ID', 'Metro Supplies', 300000, 75000, 225000, '2026-06-01', 12, 3, 'on-track');

insert into public.branches (user_id, name, manager, revenue, orders, status) values
  ('YOUR_USER_ID', 'Main Branch - Delhi', 'Amit Kumar', 845000, 892, 'active'),
  ('YOUR_USER_ID', 'Mumbai Outlet', 'Priya Singh', 623000, 654, 'active'),
  ('YOUR_USER_ID', 'Bangalore Store', 'Ravi Reddy', 412000, 423, 'active'),
  ('YOUR_USER_ID', 'Kolkata Branch', 'Suman Das', 287000, 298, 'maintenance');

insert into public.ai_insights (user_id, type, title, description, icon, color) values
  ('YOUR_USER_ID', 'revenue', 'Revenue Prediction', 'Expected 18% growth next month based on seasonal trends and current order pipeline.', 'TrendingUp', '#6C5CE7'),
  ('YOUR_USER_ID', 'stock', 'Stock Alert', 'JBL Flip 6 and Canon PIXMA G3000 will run out in ~5 days. Reorder recommended.', 'AlertCircle', '#E17055'),
  ('YOUR_USER_ID', 'customer', 'Churn Risk', '3 Gold customers haven''t ordered in 30+ days. Send re-engagement offers.', 'Users', '#FDCB6E'),
  ('YOUR_USER_ID', 'pricing', 'Price Optimization', 'Boat Rockerz 450 can be priced ₹200 higher based on market demand analysis.', 'Target', '#00CEC9');
*/
