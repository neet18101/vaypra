# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

BizFlow is a SaaS dashboard for SMB business management — inventory, invoicing, dispatch tracking, installations, installment plans, and team management — built on Next.js 16 (App Router), React 19, Supabase (PostgreSQL + Auth), and Tailwind CSS v4. Targeted at the "Rangayan Creations" business.

## Commands

```bash
npm run dev       # Start dev server (Next.js on port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

No test runner is configured. No TypeScript — all files are `.js` / `.jsx`.

## Architecture

### Routing

- **`app/(dashboard)/`** — Protected route group. The group layout (`app/(dashboard)/layout.js`) checks Supabase auth and redirects to `/login` if unauthenticated.
- **`app/api/`** — REST API routes. Pattern: `route.js` handles `GET`/`POST`; `[id]/route.js` handles `GET`/`PATCH`/`DELETE`. Every handler calls `createClient()` and checks for a logged-in user (returns 401 otherwise).
- **`app/auth/`** — Auth callback/confirmation routes handled server-side.
- **`middleware.js`** — Runs on every request; refreshes Supabase session cookies via `updateSession()`.

Dashboard pages: `dashboard`, `inventory`, `invoices`, `customers`, `dispatches`, `installations`, `installments`, `branches`, `reports`, `ai-insights`, `ecommerce`, `settings`, `team`.

### Page Pattern

Every dashboard section follows a two-file split:
- **`page.js`** — Server Component; fetches initial data from Supabase, passes it as props.
- **`*Content.jsx`** — Client Component (`"use client"`); owns all interactivity, local state, and mutations.

Most mutations go through `/api/` routes. **Exception:** `dispatches` and `installations` Content components mutate via the Supabase browser client directly (no corresponding API routes exist for these two sections).

### Authentication

Two Supabase utility clients — use the right one:
- **`utils/supabase/client.js`** — `createBrowserClient()` for Client Components.
- **`utils/supabase/server.js`** — `createServerClient()` with async cookie handling for Server Components, Route Handlers, and middleware.

Admin routes instantiate a service-role client inline via `createAdminClient(url, SUPABASE_SERVICE_ROLE_KEY)` (imported directly from `@supabase/supabase-js`), guarded by a local `requireAdmin()` helper that checks `profiles.role === "admin"`. There is no shared `utils/supabase/admin.js` file.

Auth pages beyond login: `app/signup`, `app/forgot-password`, `app/reset-password`.

### Multi-Tenancy

Data is scoped by **`organization_id`**, not `user_id`. Migration 001 converted all data tables from `user_id` isolation to `organization_id`. Every API route must call `getOrgId()` from `utils/getOrgId.js` to get `{ user, orgId }` and filter queries by `organization_id`. The database also enforces this via RLS. Do not filter by `user_id` on data tables.

`profiles.current_organization_id` stores the active org; `organization_members` maps users to orgs with roles (`owner`/`admin`/`member`/`viewer`).

### Roles

Two role systems exist:
1. **App access role** — `profiles.role`: `admin` (full dashboard) or `installer` (restricted to `/installations` only). `DashboardShell.jsx` enforces the client-side redirect for installers. Admin-only API routes live under `app/api/admin/`.
2. **Org membership role** — `organization_members.role`: `owner`/`admin`/`member`/`viewer` (org-level permissions, separate from the above).

### Database

Schema lives in `supabase/schema.sql`. All tables have UUID PKs and RLS enabled. Incremental changes are in `supabase/migrations/` (numbered `001`–`008`, covering organizations, GST fields, audit/soft-delete, indexes/views, installation key backfill, roles, user role column, and product FK set-null).

RLS policies use three DB helper functions (defined in migration 001): `get_user_organizations()` (all orgs for user), `get_user_writable_organizations()` (orgs where role is owner/admin/member), and `current_organization_id()` (user's earliest-joined org). Do not replicate this logic in application code.

| Table | Purpose |
|---|---|
| `organizations` | Tenant orgs (business info, subscription plan) |
| `organization_members` | User↔org mapping with role (`owner`/`admin`/`member`/`viewer`) |
| `profiles` | Per-user info (GST, address, app role, `current_organization_id`) |
| `categories` | Product categories |
| `products` | Inventory (SKU, serials, stock, price, custom fields) |
| `customers` | CRM with loyalty tiers and balance |
| `invoices` | Sales/purchase invoices with GST |
| `installments` | EMI/payment plans |
| `branches` | Multi-branch with revenue tracking |
| `dispatches` / `dispatch_items` | Batch shipping headers + line items |
| `installations` | Post-sale records (Windows/Office/AV keys, custom fields) |
| `print_templates` | Customizable print layouts |

Local Supabase runs on: API `:54321`, DB `:54322`, Studio `:54323`. Apply migrations with `supabase db push` or run SQL directly in Studio.

### Styling

Tailwind CSS v4 — no `tailwind.config.js`. All theme customization is done with `@theme` inline in `app/globals.css`. CSS custom properties define the color palette:
- Primary: `#6C5CE7` (purple), Secondary: `#00CEC9` (teal), Accent: `#FD79A8` (pink)
- Semantic tokens: `--success`, `--warning`, `--danger`, and a full `--gray-50`→`--gray-900` scale.
- Fonts: DM Sans (`--font-display`), Plus Jakarta Sans (`--font-body`), JetBrains Mono (`--font-mono`).

Framer Motion is used for sidebar collapse and card transitions.

### Path Alias

`@/*` resolves to the project root (set in `jsconfig.json`). Use `@/app/components/...`, `@/utils/supabase/...`, etc.

### Key Components

- **`app/(dashboard)/DashboardShell.jsx`** — Wraps all dashboard pages; composes Sidebar + TopBar + page content. Handles mobile responsiveness and installer role redirect.
- **`app/components/Sidebar.jsx`** — Collapsible nav with Framer Motion animations.
- **`app/components/`** — Shared modals (CSV import, dispatch, installation), charts (MiniChart, RevenueChart, DonutChart), and utility components (Card, StatusBadge, ProductSelector, LifecycleTracker).
- **`app/components/BarcodeScanner.jsx`** — Uses `tesseract.js` for OCR; requires `eng.traineddata` at the project root.
- **`app/api/admin/`** — Admin-only routes (team management, role assignment). The `app/(dashboard)/team/` page and its `TeamContent.jsx` consume these.
- **`UI_Refernce.jsx`** (project root) — Design reference file with component examples; not imported anywhere, for reference only.

### Scripts

- **`scripts/seed-users.mjs`** — Seeds test users into local Supabase.

### Sample Import Files

`docs/` contains sample CSV/Excel files used for testing the CSV import modal (inventory, printers, UPS, etc.). These are data files, not documentation.

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only; required for app/api/admin/ routes
```
