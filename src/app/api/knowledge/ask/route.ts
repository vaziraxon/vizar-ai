import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { searchKnowledge } from "@/lib/knowledge/search";
import { assembleAnswer, buildContext, createAnswerStream, retrievalOnlyAnswer } from "@/lib/knowledge/answer";
import type { AskEvent } from "@/lib/knowledge/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bodySchema = z.object({ question: z.string().trim().min(3).max(1000) });

/**
 * POST { question } → NDJSON stream of AskEvent:
 *   references (what was retrieved) → delta* (answer text) → final (Markdown
 *   with ⟦n⟧ citation markers + which references were cited).
 * Signed-in users only, 20 questions per 10 minutes.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  if (!supabase) return Response.json({ error: "Supabase sozlanmagan." }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Avval tizimga kiring." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Savol 3–1000 belgidan iborat bo‘lsin." }, { status: 400 });

  const limit = await rateLimit(`kb-ask:${user.id}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) {
    return Response.json({ error: "Juda ko‘p so‘rov. Birozdan keyin qayta urinib ko‘ring." }, { status: 429 });
  }

  const question = parsed.data.question;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AskEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        const result = await searchKnowledge(question, 8);
        const { references, blocks } = buildContext(result);
        send({ type: "references", references });

        if (!process.env.ANTHROPIC_API_KEY) {
          send({
            type: "final",
            mode: "retrieval",
            markdown: retrievalOnlyAnswer(result),
            references: references.map((r) => ({ ...r, cited: r.kind === "book" && r.n <= 3 })),
          });
          return;
        }

        const answer = createAnswerStream(new Anthropic(), question, blocks);
        answer.on("text", (text) => send({ type: "delta", text }));
        const message = await answer.finalMessage();
        send({ type: "final", mode: "ai", ...assembleAnswer(message, references) });
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          send({ type: "error", message: "AI xizmati hozir band. Birozdan keyin qayta urinib ko‘ring." });
        } else if (error instanceof Anthropic.APIError) {
          console.error("[kb-ask] Anthropic API error", error.status, error.message);
          send({ type: "error", message: "AI javobini olishda xatolik yuz berdi." });
        } else {
          console.error("[kb-ask]", error);
          send({ type: "error", message: "Qidiruvda xatolik yuz berdi. Keyinroq qayta urinib ko‘ring." });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
