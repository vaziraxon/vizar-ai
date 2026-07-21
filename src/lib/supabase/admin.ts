import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "./config";

/**
 * Creates a server-only Supabase client using the service role key.
 * Returns `null` when the service role key isn't configured so callers
 * can fall back to non-privileged behavior.
 */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  if (!url || !serviceKey) return null;

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  });
}
