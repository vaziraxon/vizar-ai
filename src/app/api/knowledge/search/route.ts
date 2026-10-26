import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { searchKnowledge } from "@/lib/knowledge/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  query: z.string().trim().min(2).max(1000),
  limit: z.number().int().min(1).max(20).optional(),
});

/**
 * POST { query, limit? } → { query, chunks, rules }
 *
 * Knowledge-base search without any answer generation: the hybrid
 * (full-text + gte-small) retrieval that /api/knowledge/ask builds on, for
 * search UIs and other features. Free — embeddings run on Supabase's
 * built-in model. Signed-in users only, 60 searches per 10 minutes.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  if (!supabase) return Response.json({ error: "Supabase sozlanmagan." }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Avval tizimga kiring." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "So‘rov 2–1000 belgidan iborat bo‘lsin." }, { status: 400 });

  const limit = await rateLimit(`kb-search:${user.id}`, 60, 10 * 60 * 1000);
  if (!limit.allowed) {
    return Response.json({ error: "Juda ko‘p so‘rov. Birozdan keyin qayta urinib ko‘ring." }, { status: 429 });
  }

  try {
    const { query, chunks, rules } = await searchKnowledge(parsed.data.query, parsed.data.limit ?? 8);
    return Response.json({ query, chunks, rules }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[kb-search]", error);
    return Response.json({ error: "Qidiruvda xatolik yuz berdi. Keyinroq qayta urinib ko‘ring." }, { status: 502 });
  }
}
