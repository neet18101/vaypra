import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

// One Supabase client per request (deduplicates cookies() calls)
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — fine, middleware handles refresh.
          }
        },
      },
    }
  );
});

// One getUser() network call per request — safe to call from layout + pages.
// React.cache() deduplicates within the same RSC render tree.
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});
