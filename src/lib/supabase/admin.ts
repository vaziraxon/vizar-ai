import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "./config";

/**
 * Creates a server-only Supabase client using the service role key.
 * Returns `null` when the service role key isn't configured so callers
 * can fall back to non-privileged behavior.
 */
export function createAdminClient() {
  const env = getSupabaseEnv();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!env || !serviceKey) return null;

  return createClient<Database>(env.url, serviceKey, {
    auth: { persistSession: false },
  });
}
