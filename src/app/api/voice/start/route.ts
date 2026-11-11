import { z } from "zod";
import { PLAYBOOK_COUNTRIES } from "@/data/interview-playbook";
import { rateLimit } from "@/lib/rate-limit";
import { startVoiceSession } from "@/lib/voice/sessions";
import { VOICE_DENIED_MESSAGE, VOICE_DENIED_STATUS, voiceUserId } from "@/lib/voice/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  sdp: z.string().min(10).max(30_000).startsWith("v=0"),
  country: z.string().refine((c) => PLAYBOOK_COUNTRIES.some((p) => p.code === c)),
  visaKind: z.enum(["tourist", "student", "work", "business"]),
  language: z.enum(["uz", "ru", "en"]),
  level: z.enum(["easy", "medium", "hard"]),
});

/**
 * POST { sdp, country, visaKind, language, level } → { sessionId, answerSdp,
 * remainingSeconds, deadlineAt }. The browser's WebRTC offer goes to OpenAI
 * from here with the server's key; the key never reaches the browser.
 */
export async function POST(request: Request) {
  const userId = await voiceUserId();
  if (!userId) return Response.json({ error: "Avval tizimga kiring." }, { status: 401 });
  const limit = await rateLimit(`voice-start:${userId}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring." }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: VOICE_DENIED_MESSAGE.bad_request }, { status: 400 });
  const result = await startVoiceSession(userId, parsed.data);
  if (!result.ok) {
    return Response.json({ error: VOICE_DENIED_MESSAGE[result.reason], reason: result.reason }, { status: VOICE_DENIED_STATUS[result.reason] });
  }
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
