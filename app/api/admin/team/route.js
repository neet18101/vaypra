import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// GET /api/admin/team — list all installers
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("id, role")
    .eq("role", "installer");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Get auth user details for each profile
  const members = await Promise.all(
    (profiles || []).map(async (p) => {
      const { data } = await adminClient.auth.admin.getUserById(p.id);
      return {
        id: p.id,
        email: data?.user?.email || "—",
        name: data?.user?.user_metadata?.full_name || "",
        role: p.role,
        created_at: data?.user?.created_at,
      };
    })
  );

  return NextResponse.json({ members });
}

// DELETE /api/admin/team — delete an installer
export async function DELETE(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
