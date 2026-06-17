---
name: remote-db-migration-drift
description: The remote Supabase DB is behind the migrations/ folder — at least 003-008 are not applied (no installations.deleted_at)
metadata:
  type: project
---

As of 2026-06-17, the remote Supabase project `zlihmktsmzucseylqnby` is OUT OF SYNC with `supabase/migrations/`. Confirmed via REST probe: `installations.deleted_at` returns HTTP 400 (does not exist), but it's added by `003_audit_softdelete.sql`. So migrations 003–008 were likely never applied to this remote DB.

Implications:
- Don't assume a column/policy/view exists just because it's in schema.sql or a migration. Probe the live DB first (REST `?select=<col>&limit=1` with the anon key → 400 means missing).
- Soft-delete is NOT active on installations remotely; the app hard-deletes (`.delete()`).
- This drift likely contributes to some runtime errors (code referencing columns that don't exist, e.g. the `products.branch_id` 400).

**Why:** Several "bugs" trace to schema the app expects but the remote DB lacks.
**How to apply:** Before writing SQL/queries against this DB, verify the column actually exists remotely. Consider getting the owner to apply migrations 003–008 (and 009) in order. Relates to [[placeholder-secrets-env-local]].
