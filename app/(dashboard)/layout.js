import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient, getAuthUser } from "@/utils/supabase/server";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }) {
  let userEmail = "";
  let userRole  = "admin";

  try {
    // getAuthUser() is cached per request — if any page.js also calls it,
    // they share this one network call instead of each making their own.
    const { data: { user }, error: authError } = await getAuthUser();

    if (authError || !user) redirect("/login");

    userEmail = user.email || "";

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = profile?.role || "admin";
  } catch (e) {
    // Re-throw Next.js redirect signals — their digest starts with NEXT_REDIRECT
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    // Any real error (network, DB) → send to login
    redirect("/login");
  }

  return (
    <DashboardShell userEmail={userEmail} userRole={userRole}>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </DashboardShell>
  );
}
