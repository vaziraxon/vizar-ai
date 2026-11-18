import { getVoiceStatus } from "@/lib/voice/sessions";
import { voiceUserId } from "@/lib/voice/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → the user's voice beta status: access, minutes left this week, open session, history */
export async function GET() {
  const userId = await voiceUserId();
  if (!userId) return Response.json({ error: "Avval tizimga kiring." }, { status: 401 });
  return Response.json(await getVoiceStatus(userId), { headers: { "Cache-Control": "no-store" } });
}
