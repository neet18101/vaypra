import { createClient } from "@/utils/supabase/server";

/**
 * Returns { user, orgId, error } for the current request.
 * Use in every API route instead of direct user_id comparisons.
 * Migration 001 replaced user_id with organization_id on all data tables.
 */
export async function getOrgId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, orgId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_organization_id")
    .eq("id", user.id)
    .single();

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

  return { user, orgId };
}
