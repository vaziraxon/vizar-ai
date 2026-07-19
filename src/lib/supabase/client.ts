"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./config";

/**
 * Creates a Supabase client for use in Client Components.
 *
 * Returns `null` when the required env vars aren't set, instead of
 * throwing — callers (hooks, components) should check for `null` and
 * render the app's demo/setup-notice fallback rather than crash the
 * page. See `src/components/dev/SupabaseSetupNotice.tsx`.
 *
 * Only `NEXT_PUBLIC_*` values are used here, which is required — the
 * service-role key must never appear in any file imported by a Client
 * Component.
 */
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  return createBrowserClient<Database>(env.url, env.anonKey);
}
