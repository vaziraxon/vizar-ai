import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { assessmentSaveSchema, assessmentCompleteSchema } from "@/lib/validation/schemas";
import { reviewAssessment, type AssessmentFinding } from "@/lib/dashboard/assessment-review";
import type { Database, Json } from "@/types/database";

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

/** True once the assessment was finished. Older rows also carry a score from the removed formula. */
export function isAssessmentComplete(assessment: Assessment | null): boolean {
  if (!assessment) return false;
  const summary = assessment.result_summary;
  return (
    assessment.score !== null ||
    (typeof summary === "object" && summary !== null && !Array.isArray(summary) && "generatedAt" in summary)
  );
}

/**
 * Finalizes the assessment: turns the answers into rule-based next steps
 * (lib/dashboard/assessment-review), saves them with the assessment and as
 * recommendations, and marks the application as in review. There is no score:
 * the readiness page measures progress, and nothing here predicts the decision.
 */
export async function completeAssessment(
  input: unknown
): Promise<DataResult<{ assessment: Assessment; findings: AssessmentFinding[] }>> {
  const parsed = assessmentCompleteSchema.safeParse(input);

  if (!parsed.success) {
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

  const findings = reviewAssessment(parsed.data.answers, new Date());

  const existing = await getAssessmentForApplication(
    parsed.data.applicationId
  );
  if (!existing.ok) return existing;
  const resultSummary: Json = {
    generatedAt: new Date().toISOString(),
    findings: findings as unknown as Json,
  };

  // score and risk_level stay empty; a re-run clears the removed formula's values.
  let assessment: Assessment;
  if (existing.data) {
    const { data, error } = await ctx.supabase
      .from("assessments")
      .update({
        answers: parsed.data.answers as Json,
        score: null,
        risk_level: null,
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
        result_summary: resultSummary,
      })
      .select("*")
      .single();
    if (error) return genericDbError();
    assessment = data;
  }

  await ctx.supabase
    .from("visa_applications")
    .update({ status: "in_review" })
    .eq("id", parsed.data.applicationId)
    .eq("user_id", ctx.userId);

  // Best-effort — failures here shouldn't fail the whole assessment-completion flow.
  const recommendations = findings.flatMap((f) =>
    f.task
      ? [{ user_id: ctx.userId, application_id: parsed.data.applicationId, title: f.task, priority: f.priority ?? "O'rtacha" }]
      : []
  );
  if (recommendations.length) await ctx.supabase.from("recommendations").insert(recommendations);

  await ctx.supabase.from("notifications").insert({
    user_id: ctx.userId,
    type: "recommendation",
    title: "Viza tahlili yakunlandi",
    message: "Natija Hisobotlar bo'limida saqlandi.",
  });

  return { ok: true, data: { assessment, findings } };
}
