# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

BizFlow is a SaaS dashboard for SMB business management — inventory, invoicing, dispatch tracking, installations, and installment plans — built on Next.js 16 (App Router), React 19, Supabase (PostgreSQL + Auth), and Tailwind CSS v4.

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

### Authentication

Two Supabase clients — use the right one:
- **`utils/supabase/client.js`** — `createBrowserClient()` for Client Components.
- **`utils/supabase/server.js`** — `createServerClient()` with async cookie handling for Server Components, Route Handlers, and middleware.

User isolation is enforced at two levels: API routes filter by `user_id`, and the database enforces the same via RLS policies on every table.

### Database

Schema lives in `supabase/schema.sql`. 11 tables, all with UUID PKs, RLS enabled, and `user_id` foreign-keyed to `auth.users`:

| Table | Purpose |
|---|---|
| `profiles` | User business info (GST, address, role) |
| `categories` | Product categories |
| `products` | Inventory (SKU, serials, stock, price, custom fields) |
| `customers` | CRM with loyalty tiers and balance |
| `invoices` | Sales/purchase invoices with GST |
| `installments` | EMI/payment plans |
| `branches` | Multi-branch with revenue tracking |
| `dispatches` / `dispatch_items` | Batch shipping headers + line items |
| `installations` | Post-sale records (Windows/Office/AV keys, custom fields) |
| `print_templates` | Customizable print layouts |

Local Supabase runs on: API `:54321`, DB `:54322`, Studio `:54323`.

### Styling

Tailwind CSS v4 — no `tailwind.config.js`. All theme customization is done with `@theme` inline in `app/globals.css`. CSS custom properties define the color palette:
- Primary: `#6C5CE7` (purple), Secondary: `#00CEC9` (teal), Accent: `#FD79A8` (pink)

Framer Motion is used for sidebar collapse and card transitions.

### Path Alias

`@/*` resolves to the project root (set in `jsconfig.json`). Use `@/app/components/...`, `@/utils/supabase/...`, etc.

### Key Components

- **`app/(dashboard)/DashboardShell.jsx`** — Wraps all dashboard pages; composes Sidebar + TopBar + page content.
- **`app/components/Sidebar.jsx`** — Collapsible nav with Framer Motion animations.
- **`app/components/`** — Shared modals (CSV import, dispatch, installation), charts (MiniChart, RevenueChart, DonutChart), and utility components (Card, StatusBadge, ProductSelector, LifecycleTracker).

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
