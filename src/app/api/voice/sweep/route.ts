import { adminDb } from "@/lib/ai/beta";
import { sweepStaleSessions, sweepTokenMatches } from "@/lib/voice/sessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST with header x-sweep-token (the token in ai_settings) → closes every
 * voice session whose browser went silent or whose time ran out, and hangs
 * up its OpenAI call. Called every minute by Supabase pg_cron
 * (supabase/ai_voice_cron.sql) as a backstop; every voice request also does it.
 */
export async function POST(request: Request) {
  const db = adminDb();
  if (!db) return Response.json({ error: "not configured" }, { status: 503 });
  if (!(await sweepTokenMatches(db, request.headers.get("x-sweep-token")))) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  await sweepStaleSessions(db);
  return Response.json({ ok: true });
}
