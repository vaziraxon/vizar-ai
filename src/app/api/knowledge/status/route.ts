import { AI_NOTICES, ANSWER_MODEL, resolveAiMode } from "@/lib/ai/mode";
import { getSupabaseEnv } from "@/lib/supabase/config";
import type { KbStatus } from "@/lib/knowledge/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET → which answer generator is active and how much of the knowledge base
 * is loaded. Public and free: it never calls an AI provider and exposes no
 * secrets (only whether a generator is configured, not the key).
 */
export async function GET() {
  const mode = resolveAiMode();
  const status: KbStatus = {
    ai: {
      mode,
      model: mode === "live" ? ANSWER_MODEL : null,
      notice: mode === "off" ? AI_NOTICES.off : mode === "mock" ? AI_NOTICES.mock : null,
    },
    knowledge: null,
  };

  const env = getSupabaseEnv();
  if (env) {
    try {
      const res = await fetch(`${env.url}/rest/v1/rpc/kb_stats`, {
        method: "POST",
        headers: { apikey: env.anonKey, "Content-Type": "application/json" },
        body: "{}",
        cache: "no-store",
      });
      if (res.ok) {
        const s = await res.json();
        status.knowledge = {
          chapters: s.chapters,
          sections: s.sections,
          chunks: s.chunks,
          chunksEmbedded: s.chunks_embedded,
          countryRules: s.country_rules,
          countries: s.countries,
        };
      }
    } catch (error) {
      console.error("[kb-status] kb_stats failed", error);
    }
  }

  return Response.json(status, { headers: { "Cache-Control": "no-store" } });
}
