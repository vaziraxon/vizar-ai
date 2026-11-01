import { PLAYBOOK_COUNTRIES, PLAYBOOK_LEVELS, type PlaybookEntry } from "@/data/interview-playbook";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET ?country=us&level=easy → the playbook's questions for one country and level.
 * They live in Supabase (supabase/interview_questions.sql), not in this public
 * repository, and only signed-in users can read them. No paid API is involved.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("country");
  const level = PLAYBOOK_LEVELS.find((l) => l.key === searchParams.get("level"))?.key;
  if (!code || !level || !PLAYBOOK_COUNTRIES.some((c) => c.code === code)) {
    return Response.json({ error: "Davlat yoki daraja noto‘g‘ri." }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) return Response.json({ error: "Supabase sozlanmagan." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Avval tizimga kiring." }, { status: 401 });

  const limit = await rateLimit(`interview-questions:${user.id}`, 60, 10 * 60 * 1000);
  if (!limit.allowed) {
    return Response.json({ error: "Juda ko‘p so‘rov. Birozdan keyin qayta urinib ko‘ring." }, { status: 429 });
  }

  const { data, error } = await supabase
    .from("interview_questions")
    .select("id, question_uz, question_ru, question_en, answer_uz, answer_ru, answer_en, note")
    .eq("country_code", code)
    .eq("level", level)
    .order("sort_order")
    .returns<Omit<Tables["interview_questions"]["Row"], "country_code" | "level" | "sort_order">[]>();
  if (error || !data?.length) {
    return Response.json({ error: "Savollarni yuklab bo‘lmadi." }, { status: 500 });
  }

  const questions: PlaybookEntry[] = data.map((row) => ({
    id: row.id,
    question: { uz: row.question_uz, ru: row.question_ru, en: row.question_en },
    answer: { uz: row.answer_uz, ru: row.answer_ru, en: row.answer_en },
    note: row.note,
  }));
  return Response.json({ questions }, { headers: { "Cache-Control": "private, max-age=3600" } });
}
