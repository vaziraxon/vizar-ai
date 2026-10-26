// kb-embed — fills missing gte-small embeddings in public.kb_chunks.
//
// POST { limit?: number } → { processed, remaining }
//
// Takes no content from the caller: it only embeds chunks that already
// exist and have no embedding yet, so it is safe to expose (deployed with
// verify_jwt = false) and to call from the database trigger / cron job.
// When work remains it re-invokes itself in the background, a bounded
// number of times, so a large import drains without an external loop.
import { embed, json, serviceClient } from "../_shared/kb.ts";

const MAX_CHAIN = 300;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const body = await req.json().catch(() => ({}));
  // gte-small on ~1,100-character chunks: more than a few per request can
  // exceed the Edge Runtime CPU budget (HTTP 546), so batches stay small.
  const limit = Math.min(Math.max(Number(body.limit) || 3, 1), 8);
  const depth = Math.max(Number(body.depth) || 0, 0);

  const supabase = serviceClient();
  const { data: rows, error } = await supabase
    .from("kb_chunks")
    .select("id, heading_path, content")
    .is("embedding", null)
    // A second worker can drain from the other end ({ "order": "desc" }) without overlapping.
    .order("created_at", { ascending: body.order !== "desc" })
    .limit(limit);
  if (error) return json({ error: error.message }, 500);

  let processed = 0;
  for (const row of rows ?? []) {
    const vector = await embed(`${row.heading_path}\n\n${row.content}`);
    const { error: updateError } = await supabase
      .from("kb_chunks")
      .update({ embedding: JSON.stringify(vector), embedded_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updateError) return json({ error: updateError.message, processed }, 500);
    processed++;
  }

  const { count } = await supabase.from("kb_chunks").select("id", { count: "exact", head: true }).is("embedding", null);
  const remaining = count ?? 0;

  if (remaining > 0 && processed > 0 && depth < MAX_CHAIN && body.chain !== false) {
    const self = `${Deno.env.get("SUPABASE_URL")}/functions/v1/kb-embed`;
    // @ts-ignore EdgeRuntime is a global provided by the Edge Runtime.
    EdgeRuntime.waitUntil(
      fetch(self, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit, depth: depth + 1 }),
      }).catch(() => undefined)
    );
  }
  return json({ processed, remaining });
});
