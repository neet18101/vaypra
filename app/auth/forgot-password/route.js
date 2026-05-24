import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  const formData = await request.formData();
  const email = formData.get("email");

  const origin = request.headers.get("origin") || new URL(request.url).origin;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/forgot-password?error=${encodeURIComponent(error.message)}`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL(
      `/forgot-password?message=${encodeURIComponent("Check your email for the reset link")}`,
      request.url
    ),
    { status: 303 }
  );
}
