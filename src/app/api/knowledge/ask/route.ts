import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { AI_NOTICES, resolveAiMode } from "@/lib/ai/mode";
import { searchKnowledge } from "@/lib/knowledge/search";
import { assembleAnswer, buildContext, createAnswerStream } from "@/lib/knowledge/answer";
import { buildReferences, mockAnswer, previewAnswer, retrievalAnswer } from "@/lib/knowledge/offline";
import type { AskEvent } from "@/lib/knowledge/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bodySchema = z.object({ question: z.string().trim().min(3).max(1000) });

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * POST { question } → NDJSON stream of AskEvent:
 *   references (what was retrieved) → delta* (answer text) → final (Markdown
 *   with ⟦n⟧ citation markers + which references were cited).
 * Signed-in users only, 20 questions per 10 minutes.
 *
 * The answer generator follows resolveAiMode() (src/lib/ai/mode.ts):
 *   live — Claude; if the API fails (no credit, bad key, outage) the
 *          user still gets the book passages instead of an error
 *   mock — development-only canned answer, streamed like the real one
 *   off  — book passages and official sources only; no paid call is made
 *
 * The book itself is a paid library: without an active subscription
 * kb-search returns previews only, and the answer is the list of matching
 * sections ("preview") whatever the mode — no full text, no AI call.
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
  const mode = resolveAiMode();
  const encoder = new TextEncoder();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AskEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        const result = await searchKnowledge(question, 8, session?.access_token);

        if (result.access !== "full") {
          send({ type: "references", references: buildReferences(result) });
          send({ type: "final", mode: "preview", notice: AI_NOTICES.locked, ...previewAnswer(result) });
          return;
        }

        if (mode === "off") {
          send({ type: "references", references: buildReferences(result) });
          send({ type: "final", mode: "retrieval", notice: AI_NOTICES.off, ...retrievalAnswer(result) });
          return;
        }

        if (mode === "mock") {
          send({ type: "references", references: buildReferences(result) });
          const answer = mockAnswer(result);
          // Stream in word groups so the UI behaves as it does with the real model.
          const words = answer.markdown.split(/(?<=\s)/);
          for (let i = 0; i < words.length; i += 6) {
            send({ type: "delta", text: words.slice(i, i + 6).join("") });
            await pause(25);
          }
          send({ type: "final", mode: "mock", notice: AI_NOTICES.mock, ...answer });
          return;
        }

        const { references, blocks } = buildContext(result);
        send({ type: "references", references });
        try {
          const answer = createAnswerStream(new Anthropic(), question, blocks);
          answer.on("text", (text) => send({ type: "delta", text }));
          const message = await answer.finalMessage();
          send({ type: "final", mode: "ai", ...assembleAnswer(message, references) });
        } catch (error) {
          // No credit, revoked key, rate limit or outage: degrade to the free answer.
          if (error instanceof Anthropic.APIError) {
            console.error("[kb-ask] Anthropic API error", error.status, error.message);
          } else {
            console.error("[kb-ask] Anthropic call failed", error);
          }
          send({ type: "final", mode: "retrieval", notice: AI_NOTICES.liveFailed, ...retrievalAnswer(result) });
        }
      } catch (error) {
        console.error("[kb-ask]", error);
        send({ type: "error", message: "Qidiruvda xatolik yuz berdi. Keyinroq qayta urinib ko‘ring." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
