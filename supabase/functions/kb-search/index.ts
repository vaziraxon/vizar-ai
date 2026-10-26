// kb-search — hybrid retrieval over the VIZAR AI knowledge base.
//
// POST { query: string, match_count?: number, include_rules?: boolean, semantic_weight?: number }
//   → { query, terms, chunks: kb_search rows, rules: kb_search_rules rows }
//
// Read-only over published content, so it needs no caller identity
// (deployed with verify_jwt = false). The Next.js /api/knowledge/ask route
// is the rate-limited entry point for users.
import { embed, json, queryTerms, serviceClient } from "../_shared/kb.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: { query?: unknown; match_count?: unknown; include_rules?: unknown; semantic_weight?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (query.length < 2 || query.length > 1000) return json({ error: "query must be 2–1000 characters" }, 400);
  const matchCount = Math.min(Math.max(Number(body.match_count) || 8, 1), 20);
  // gte-small is English-centric: on Uzbek text its similarities bunch up
  // (≈0.88–0.92), so the vector ranking gets half the weight of full-text.
  const requestedWeight = Number(body.semantic_weight);
  const semanticWeight = Number.isFinite(requestedWeight) ? Math.min(Math.max(requestedWeight, 0), 2) : 0.5;

  const supabase = serviceClient();
  const terms = queryTerms(query);
  const embedding = await embed(query);

  const [chunks, rules] = await Promise.all([
    supabase.rpc("kb_search", {
      query_terms: terms,
      query_embedding: JSON.stringify(embedding),
      match_count: matchCount,
      semantic_weight: semanticWeight,
    }),
    body.include_rules === false
      ? Promise.resolve({ data: [], error: null })
      : supabase.rpc("kb_search_rules", { query_text: query, query_terms: terms, match_count: 6 }),
  ]);

  if (chunks.error) return json({ error: chunks.error.message }, 500);
  if (rules.error) return json({ error: rules.error.message }, 500);
  return json({ query, terms, chunks: chunks.data, rules: rules.data });
});
