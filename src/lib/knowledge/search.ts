import "server-only";
import { getSupabaseEnv, SUPABASE_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/config";
import type { KbSearchResult } from "./types";

/**
 * Hybrid (full-text + gte-small vector) search over the knowledge base via
 * the kb-search Edge Function. The embedding model runs inside Supabase, so
 * this needs only the public URL and publishable key.
 */
export async function searchKnowledge(query: string, matchCount = 8): Promise<KbSearchResult> {
  const env = getSupabaseEnv();
  if (!env) throw new Error(SUPABASE_NOT_CONFIGURED_MESSAGE);

  const res = await fetch(`${env.url}/functions/v1/kb-search`, {
    method: "POST",
    headers: { apikey: env.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ query, match_count: matchCount }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`kb-search failed with HTTP ${res.status}`);
  }
  return (await res.json()) as KbSearchResult;
}
