import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }) {
  let userEmail = "";
  let userRole = "admin";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    userEmail = user.email || "";

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = profile?.role || "admin";
  } catch (e) {
    redirect("/login");
  }

  return (
    <DashboardShell userEmail={userEmail} userRole={userRole}>
      {children}
    </DashboardShell>
  );
}
