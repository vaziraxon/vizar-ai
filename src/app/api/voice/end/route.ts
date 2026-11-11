import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { endVoiceSession } from "@/lib/voice/sessions";
import { VOICE_DENIED_MESSAGE, VOICE_DENIED_STATUS, voiceUserId } from "@/lib/voice/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const count = z.number().int().min(0).max(10_000_000);
const bodySchema = z.object({
  sessionId: z.string().uuid(),
  // Used once for the evaluation and not stored
  transcript: z
    .array(z.object({ role: z.enum(["officer", "applicant"]), text: z.string().max(2000) }))
    .max(300)
    .refine((turns) => turns.reduce((n, t) => n + t.text.length, 0) <= 60_000),
  usage: z
    .object({ audio_in: count, audio_cached: count, audio_out: count, text_in: count, text_cached: count, text_out: count })
    .nullable()
    .optional(),
});

/** POST { sessionId, transcript, usage } → ends the call (server clock) and returns the evaluation */
export async function POST(request: Request) {
  const userId = await voiceUserId();
  if (!userId) return Response.json({ error: "Avval tizimga kiring." }, { status: 401 });
  const limit = await rateLimit(`voice-end:${userId}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring." }, { status: 429 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: VOICE_DENIED_MESSAGE.bad_request }, { status: 400 });
  const result = await endVoiceSession(userId, parsed.data.sessionId, {
    transcript: parsed.data.transcript,
    usage: parsed.data.usage ?? null,
  });
  if (!result.ok) {
    return Response.json({ error: VOICE_DENIED_MESSAGE[result.reason], reason: result.reason }, { status: VOICE_DENIED_STATUS[result.reason] });
  }
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
