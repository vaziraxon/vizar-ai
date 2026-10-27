import "server-only";
import { getSupabaseEnv, SUPABASE_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/config";
import type { KbSearchResult } from "./types";

/**
 * Hybrid (full-text + gte-small vector) search over the knowledge base via
 * the kb-search Edge Function. The embedding model runs inside Supabase, so
 * this needs only the public URL and publishable key.
 *
 * Pass the signed-in user's access token: kb-search returns full passages
 * only when that JWT passes public.kb_has_access() (active subscription),
 * and short previews otherwise (`result.access`).
 */
export async function searchKnowledge(query: string, matchCount = 8, accessToken?: string | null): Promise<KbSearchResult> {
  const env = getSupabaseEnv();
  if (!env) throw new Error(SUPABASE_NOT_CONFIGURED_MESSAGE);

  const headers: Record<string, string> = { apikey: env.anonKey, "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${env.url}/functions/v1/kb-search`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, match_count: matchCount }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`kb-search failed with HTTP ${res.status}`);
  }
  const result = (await res.json()) as KbSearchResult;
  // Anything but an explicit "full" (e.g. an older kb-search) is treated as a preview.
  return { ...result, access: result.access === "full" ? "full" : "preview" };
}
