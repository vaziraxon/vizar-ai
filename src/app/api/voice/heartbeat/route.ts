import { z } from "zod";
import { heartbeatVoiceSession } from "@/lib/voice/sessions";
import { VOICE_DENIED_MESSAGE, VOICE_DENIED_STATUS, voiceUserId } from "@/lib/voice/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ sessionId: z.string().uuid() });

/** POST { sessionId } every 10 s while talking → { ended, reason, remainingSeconds } (server clock) */
export async function POST(request: Request) {
  const userId = await voiceUserId();
  if (!userId) return Response.json({ error: "Avval tizimga kiring." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: VOICE_DENIED_MESSAGE.bad_request }, { status: 400 });
  const result = await heartbeatVoiceSession(userId, parsed.data.sessionId);
  if (!result.ok) {
    return Response.json({ error: VOICE_DENIED_MESSAGE[result.reason], reason: result.reason }, { status: VOICE_DENIED_STATUS[result.reason] });
  }
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
