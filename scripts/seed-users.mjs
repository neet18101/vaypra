// Seed the required users into Supabase.
// Run: node --env-file=.env scripts/seed-users.mjs
//
// Requires SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in .env

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "\n❌  Missing environment variables.\n" +
    "    Add SUPABASE_SERVICE_ROLE_KEY to your .env file and re-run.\n"
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertUser({ email, password, name, role }) {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);

  let userId;

  if (existing) {
    console.log(`  User ${email} already exists — updating password…`);
    const { error } = await admin.auth.admin.updateUserById(existing.id, { password });
    if (error) { console.error(`  ✗ ${email}:`, error.message); return; }
    userId = existing.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (error) { console.error(`  ✗ ${email}:`, error.message); return; }
    userId = data.user.id;
    console.log(`  ✓ Created ${email}`);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (profileError) {
    console.error(`  ✗ Could not set role for ${email}:`, profileError.message);
  } else {
    console.log(`    → role: ${role}`);
  }
}

console.log("\nSeeding users…\n");

await upsertUser({
  email: "admin@rangayancreations.com",
  password: "12345678",
  name: "Admin",
  role: "admin",
});

await upsertUser({
  email: "support@rangayancreations.com",
  password: "12345678",
  name: "Support",
  role: "user",
});

console.log("\n✅  Done!\n");
