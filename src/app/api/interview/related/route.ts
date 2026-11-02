import { PLAYBOOK_COUNTRIES } from "@/data/interview-playbook";
import { detectCountry, isInterviewQuestion, queryStems, rankPlaybook } from "@/lib/dashboard/playbook-match";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = Database["public"]["Tables"]["interview_questions"]["Row"];

/**
 * GET ?q=… → up to 3 interview-playbook questions related to an assistant
 * question, so the book-based assistant also points to practice. Only when the
 * question names a country or is about the interview; otherwise none. Signed-in
 * users only, like the questions themselves.
 */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 3 || q.length > 1000) return Response.json({ error: "Savol 3–1000 belgidan iborat bo‘lsin." }, { status: 400 });

  const supabase = createClient();
  if (!supabase) return Response.json({ error: "Supabase sozlanmagan." }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Avval tizimga kiring." }, { status: 401 });

  const limit = await rateLimit(`interview-related:${user.id}`, 30, 10 * 60 * 1000);
  if (!limit.allowed) return Response.json({ error: "Juda ko‘p so‘rov. Birozdan keyin qayta urinib ko‘ring." }, { status: 429 });

  const country = detectCountry(q, PLAYBOOK_COUNTRIES);
  const stems = queryStems(q, PLAYBOOK_COUNTRIES);
  if (!country && (!isInterviewQuestion(q) || !stems.length)) return Response.json({ country: null, matches: [] });

  let query = supabase
    .from("interview_questions")
    .select("id, country_code, level, sort_order, question_uz, question_ru, question_en, answer_uz, answer_ru, answer_en");
  // Stems are letters, digits and apostrophes only (see words()), so they are safe inside the filter.
  // The apostrophe becomes a one-letter wildcard: the stored Uzbek text writes it as ‘ (so‘ra).
  const like = (s: string) => `%${s.replace(/'/g, "_")}%`;
  query = country
    ? query.eq("country_code", country)
    : query.or(
        stems
          .slice(0, 4)
          .flatMap((s) => [`question_uz.ilike.${like(s)}`, `question_ru.ilike.${like(s)}`, `question_en.ilike.${like(s)}`])
          .join(",")
      );
  const { data, error } = await query.limit(400).returns<Omit<Row, "note">[]>();
  if (error) return Response.json({ error: "Savollarni yuklab bo‘lmadi." }, { status: 500 });

  const matches = rankPlaybook(
    stems,
    (data ?? []).map((row) => ({
      id: row.id,
      country_code: row.country_code,
      level: row.level,
      sort_order: row.sort_order,
      question: { uz: row.question_uz, ru: row.question_ru, en: row.question_en },
      answer: { uz: row.answer_uz, ru: row.answer_ru, en: row.answer_en },
    })),
    { country }
  ).map(({ sort_order: _order, ...match }) => match);

  return Response.json({ country, matches }, { headers: { "Cache-Control": "private, max-age=600" } });
}
