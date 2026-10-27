// kb-search — hybrid retrieval over the VIZAR AI knowledge base.
//
// POST { query: string, match_count?: number, include_rules?: boolean, semantic_weight?: number }
//   → { query, terms, access, chunks: kb_search rows, rules: kb_search_rules rows }
//
// Deployed with verify_jwt = false so the public library can search too, but
// the full text is a paid feature: only callers whose JWT passes
// public.kb_has_access() (active subscription or knowledge-base editor) get
// passages and rule texts in full ("access": "full"). Everyone else gets the
// same hits with short previews and empty rule texts ("access": "preview").
// The decision is made by Postgres from the caller's own JWT, never from the
// request body.
import { callerClient, embed, json, queryTerms, serviceClient } from "../_shared/kb.ts";

const PREVIEW_CHARS = 180;

/** Plain-text start of a passage: no table rows, heading marks or emphasis. */
function preview(markdown: string): string {
  const text = markdown
    .split("\n")
    .filter((line) => !line.startsWith("|") && !line.startsWith("#"))
    .join(" ")
    .replace(/[*>]/g, "")
    .replace(/<br>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= PREVIEW_CHARS) return text;
  const cut = text.slice(0, PREVIEW_CHARS);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : PREVIEW_CHARS)}…`;
}

async function hasFullAccess(authorization: string | null): Promise<boolean> {
  if (!authorization || !/^Bearer\s+\S+\.\S+\.\S+$/.test(authorization)) return false;
  const { data, error } = await callerClient(authorization).rpc("kb_has_access");
  return !error && data === true;
}

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
  const [full, embedding] = await Promise.all([hasFullAccess(req.headers.get("Authorization")), embed(query)]);

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
  if (full) return json({ query, terms, access: "full", chunks: chunks.data, rules: rules.data });

  return json({
    query,
    terms,
    access: "preview",
    chunks: (chunks.data ?? []).map((c: { content: string }) => ({ ...c, content: preview(c.content) })),
    rules: (rules.data ?? []).map((r: Record<string, unknown>) => ({ ...r, rule_text: "" })),
  });
});
