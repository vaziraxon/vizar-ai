import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { assessmentSaveSchema, assessmentCompleteSchema } from "@/lib/validation/schemas";
import { updateReadinessScore } from "./applications";
import type { Database, Json } from "@/types/database";
import type { RiskLevel } from "@/types";

export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];

export async function getAssessmentForApplication(
  applicationId: string
): Promise<DataResult<Assessment | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("assessments")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (error) return genericDbError();
  return { ok: true, data };
}

/** Saves in-progress answers so the assessment can be resumed later. */
export async function saveAssessmentProgress(
  input: unknown
): Promise<DataResult<Assessment>> {
  const parsed = assessmentSaveSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "db_error",
      error: parsed.error.issues[0]?.message ?? "Kiritilgan ma'lumotlar noto'g'ri.",
    };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const existing = await getAssessmentForApplication(parsed.data.applicationId);
  if (!existing.ok) return existing;

  if (existing.data) {
    const { data, error } = await ctx.supabase
      .from("assessments")
      .update({ answers: parsed.data.answers as Json })
      .eq("id", existing.data.id)
      .eq("user_id", ctx.userId)
      .select("*")
      .single();
    if (error) return genericDbError();
    return { ok: true, data };
  }

  const { data, error } = await ctx.supabase
    .from("assessments")
    .insert({
      user_id: ctx.userId,
      application_id: parsed.data.applicationId,
      answers: parsed.data.answers as Json,
    })
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}

/**
 * Very simple, transparent mock scoring model — NOT a real risk
 * model. It exists only to produce a plausible-looking demo score
 * from whatever demo answers were collected, entirely server-side so
 * the client can't manipulate its own score.
 */
function computeMockScore(answers: Record<string, unknown>): {
  score: number;
  riskLevel: RiskLevel;
} {
  let score = 50;
  const filledAnswers = Object.values(answers).filter(
    (v) => v !== "" && v !== null && v !== undefined
  ).length;
  score += Math.min(filledAnswers * 4, 40);

  if (answers.previouslyRefused === "Ha") score -= 10;
  if (answers.sponsor === "Ha") score += 5;
  if (answers.visitedBefore === "Ha") score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const riskLevel: RiskLevel = score >= 80 ? "Past" : score >= 60 ? "O'rta" : "Yuqori";
  return { score, riskLevel };
}

/**
 * Finalizes the assessment: computes the (simulated) score,
 * persists it, updates the parent application's readiness_score, and
 * generates a small set of demo recommendations based on the answers.
 * This score is preparation guidance only — see the disclaimer text
 * rendered alongside it in the UI; it is never presented as an
 * approval probability.
 */
export async function completeAssessment(
  input: unknown
): Promise<DataResult<{ assessment: Assessment; score: number; riskLevel: RiskLevel }>> {
  const parsed = assessmentCompleteSchema.safeParse(input);

if (!parsed.success) {
  console.log(parsed.error.flatten());
return {
    ok: false,
    reason: "db_error",
    error:
      parsed.error.issues[0]?.message ??
      "Kiritilgan ma'lumotlar noto'g'ri.",
  };
}

const ctx = await getAuthedContext();
if (!ctx.ok) return ctx;

const { score, riskLevel } = computeMockScore(parsed.data.answers);

const existing = await getAssessmentForApplication(
  parsed.data.applicationId
);
if (!existing.ok) return existing;
const resultSummary: Json = {
    generatedAt: new Date().toISOString(),
    note: "Demo baholash — haqiqiy AI xizmati emas.",
  };

  let assessment: Assessment;
  if (existing.data) {
    const { data, error } = await ctx.supabase
      .from("assessments")
      .update({
        answers: parsed.data.answers as Json,
        score,
        risk_level: riskLevel,
        result_summary: resultSummary,
      })
      .eq("id", existing.data.id)
      .eq("user_id", ctx.userId)
      .select("*")
      .single();
    if (error) return genericDbError();
    assessment = data;
  } else {
    const { data, error } = await ctx.supabase
      .from("assessments")
      .insert({
        user_id: ctx.userId,
        application_id: parsed.data.applicationId,
        answers: parsed.data.answers as Json,
        score,
        risk_level: riskLevel,
        result_summary: resultSummary,
      })
      .select("*")
      .single();
    if (error) return genericDbError();
    assessment = data;
  }

  const scoreUpdate = await updateReadinessScore(parsed.data.applicationId, score);
  if (!scoreUpdate.ok) return scoreUpdate;

  await ctx.supabase
    .from("visa_applications")
    .update({ status: "in_review" })
    .eq("id", parsed.data.applicationId)
    .eq("user_id", ctx.userId);

  // Best-effort demo recommendations — failures here shouldn't fail
  // the whole assessment-completion flow.
  const demoRecommendations = [
    { title: "Bank statementni tekshirib chiqing", priority: "Muhim" as const },
    { title: "AI Interview simulyatorida mashq qiling", priority: "O'rtacha" as const },
  ];
  await ctx.supabase.from("recommendations").insert(
    demoRecommendations.map((r) => ({
      user_id: ctx.userId,
      application_id: parsed.data.applicationId,
      title: r.title,
      priority: r.priority,
    }))
  );

  await ctx.supabase.from("notifications").insert({
    user_id: ctx.userId,
    type: "score_changed",
    title: "Visa Readiness Score yangilandi",
    message: `Yangi tayyorgarlik darajangiz: ${score}/100.`,
  });

  return { ok: true, data: { assessment, score, riskLevel } };
}
