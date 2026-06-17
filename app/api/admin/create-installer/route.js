import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  // Verify the caller is an admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, current_organization_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { email, password, name } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  // The installer must land in the admin's organization, otherwise data is
  // org-scoped (RLS) and they could neither see nor record installations.
  let orgId = profile?.current_organization_id ?? null;
  if (!orgId) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: true })
      .limit(1)
      .single();
    orgId = membership?.organization_id ?? null;
  }
  if (!orgId) {
    return NextResponse.json({ error: "Your admin account is not linked to an organization, so an installer can't be added." }, { status: 400 });
  }

  // Use service role client to create user without email confirmation
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || email },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Set role to installer and point them at the admin's organization.
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ role: "installer", current_organization_id: orgId })
    .eq("id", newUser.user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Add them as a writable member of the org so RLS lets them record installations.
  const { error: memberError } = await adminClient
    .from("organization_members")
    .insert({ user_id: newUser.user.id, organization_id: orgId, role: "member" });

  // Ignore "already a member" (unique violation); surface anything else.
  if (memberError && !/duplicate|unique|already/i.test(memberError.message)) {
    return NextResponse.json({ error: memberError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, userId: newUser.user.id });
}
