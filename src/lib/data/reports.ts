import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { reportCreateSchema } from "@/lib/validation/schemas";
import type { Database, Json } from "@/types/database";

export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];

export async function listMyReports(): Promise<DataResult<ReportRow[]>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("reports")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  if (error) return genericDbError();
  return { ok: true, data: data ?? [] };
}

/**
 * Creates or refreshes a single report of the given type for an
 * application — e.g. re-running the readiness assessment updates the
 * same "readiness" report row rather than piling up duplicates.
 * Content stays demo JSON; there is no real PDF generation service.
 */
export async function upsertReport(input: unknown): Promise<DataResult<ReportRow>> {
  const parsed = reportCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "db_error",
      error: parsed.error.issues[0]?.message ?? "Kiritilgan ma'lumotlar noto'g'ri.",
    };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data: existing } = await ctx.supabase
    .from("reports")
    .select("id")
    .eq("application_id", parsed.data.applicationId)
    .eq("user_id", ctx.userId)
    .eq("report_type", parsed.data.reportType)
    .maybeSingle();

  if (existing) {
    const { data, error } = await ctx.supabase
      .from("reports")
      .update({
        title: parsed.data.title,
        report_data: parsed.data.reportData as Json,
      })
      .eq("id", existing.id)
      .eq("user_id", ctx.userId)
      .select("*")
      .single();
    if (error) return genericDbError();
    return { ok: true, data };
  }

  const { data, error } = await ctx.supabase
    .from("reports")
    .insert({
      user_id: ctx.userId,
      application_id: parsed.data.applicationId,
      report_type: parsed.data.reportType,
      title: parsed.data.title,
      report_data: parsed.data.reportData as Json,
    })
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}
