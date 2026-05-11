import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }) {
  let userEmail = "";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    userEmail = user.email || "";
  } catch (e) {
    redirect("/login");
  }

  return <DashboardShell userEmail={userEmail}>{children}</DashboardShell>;
}
