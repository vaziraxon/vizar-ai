import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./config";

/**
 * Creates a Supabase client for use in Server Components, Route
 * Handlers, and Server Actions. Reads/writes the session via Next.js's
 * cookie store, per Supabase's current official SSR approach (the
 * `@supabase/ssr` package — not the deprecated auth-helpers packages).
 *
 * Returns `null` when env vars are missing so callers can render the
 * app's "Supabase sozlanmagan" fallback instead of throwing a 500.
 *
 * This client uses only the anon/publishable key. It never uses the
 * service-role key — every read/write here is subject to the
 * project's Row Level Security policies (see supabase/schema.sql),
 * scoped to whichever user's session cookie is present.
 */
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll(): ReturnType<typeof cookieStore.getAll> {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` is called from a Server Component in some cases
          // (e.g. rendering), where cookies can't be written. This is
          // safe to ignore as long as middleware.ts is also
          // refreshing the session on every request.
        }
      },
    },
  });
}
