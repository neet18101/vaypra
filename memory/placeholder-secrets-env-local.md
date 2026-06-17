---
name: placeholder-secrets-env-local
description: .env.local still has placeholder values for the service-role key and SMTP password, breaking admin/email features
metadata:
  type: project
---

As of 2026-06-17, `.env.local` status:
- `SUPABASE_SERVICE_ROLE_KEY` → NOW SET to a real, verified service_role key (admin auth API + RLS-bypass REST both return 200). Team page / installer creation work once the dev server is restarted.
- `SMTP_PASS=your_titan_email_password_here` → STILL a placeholder → breaks emailed reports (`app/api/send-report`). Installation-report emailing in InstallationModal is also commented out pending working SMTP.

The real values are secrets only the owner (naifalitaha7@gmail.com) has. Service-role key comes from Supabase Dashboard → project `zlihmktsmzucseylqnby` → Project Settings → API → service_role (secret). Don't fabricate these.

**Why:** Several "bugs" (Team page 500s, no emails) are really this missing config, not code defects.
**How to apply:** Before debugging admin/email features, check whether these are still placeholders.
