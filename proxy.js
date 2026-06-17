import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Routes inside the (dashboard) group that require an authenticated session.
// Keep in sync with the dashboard pages listed in CLAUDE.md.
const PROTECTED_PREFIXES = [
  "/dashboard", "/inventory", "/invoices", "/customers", "/dispatches",
  "/installations", "/installments", "/branches", "/reports",
  "/ai-insights", "/ecommerce", "/settings", "/team",
];

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // Optimistic auth redirect (per Next.js Proxy docs): bounce an
    // unauthenticated request to /login *before* the RSC stream starts.
    // Doing this only in the Server Component layout tears down the in-flight
    // React Flight stream mid-render, which surfaces in the browser console as
    // "Uncaught Error: Connection closed." The layout still re-checks auth, so
    // this stays defense-in-depth, not the sole authorization gate.
    if (!user && isProtectedPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const redirectResponse = NextResponse.redirect(url);
      // Preserve any session cookies refreshed above on the redirect response.
      supabaseResponse.cookies.getAll().forEach((cookie) =>
        redirectResponse.cookies.set(cookie)
      );
      return redirectResponse;
    }
  } catch (e) {
    // If Supabase is not configured/reachable, just pass through
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
