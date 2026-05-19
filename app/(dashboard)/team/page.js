import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TeamContent from "./TeamContent";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/installations");

  return <TeamContent />;
}
