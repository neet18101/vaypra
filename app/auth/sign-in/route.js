import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      { status: 303 }
    );
  }

  // Send installers straight to /installations (they can't use the rest of the
  // dashboard). Routing them via /dashboard first makes DashboardShell do a
  // client-side router.replace, which swaps the route mid-hydration and throws
  // a hydration mismatch + "Connection closed".
  let destination = "/dashboard";
  const userId = signInData?.user?.id;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (profile?.role === "installer") destination = "/installations";
  }

  return NextResponse.redirect(new URL(destination, request.url), { status: 303 });
}
