import "server-only";
import { z } from "zod";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { buildChecklist, type VisaKind } from "@/lib/dashboard/checklist-template";
import { DESTINATIONS, type DestinationSlug } from "@/lib/site/registry";
import { ANSWERS, cleanAnswers, scoreAnswers, type Answer } from "@/lib/document-check/score";

export interface DocumentCheckRow {
  id: string;
  application_id: string | null;
  destination: DestinationSlug;
  visa_kind: VisaKind;
  answers: Record<string, Answer>;
  ready_count: number;
  partial_count: number;
  preparing_count: number;
  missing_count: number;
  total_count: number;
  readiness_percent: number;
  created_at: string;
}

const saveSchema = z.object({
  destination: z.enum(DESTINATIONS.map((d) => d.slug) as [DestinationSlug, ...DestinationSlug[]]),
  visaKind: z.enum(["tourist", "student", "work", "business"]),
  applicationId: z.string().uuid().nullable(),
  answers: z.record(z.enum(ANSWERS)),
});

/** The user's latest saved test, or null */
export async function getLatestDocumentCheck(): Promise<DataResult<DocumentCheckRow | null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;
  const { data, error } = await ctx.supabase
    .from("document_checks")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DocumentCheckRow>();
  if (error) return genericDbError();
  return { ok: true, data };
}

/**
 * Saves a finished test. The document list is rebuilt on the server from the
 * destination and visa type, answers for anything else are dropped, and the
 * counts are computed here — never taken from the browser.
 */
export async function saveDocumentCheck(input: unknown): Promise<DataResult<DocumentCheckRow>> {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "db_error", error: "Javoblar noto'g'ri." };
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { destination, visaKind, applicationId } = parsed.data;
  const items = buildChecklist(destination, visaKind).flatMap((g) => g.items);
  const answers = cleanAnswers(items, parsed.data.answers);
  const result = scoreAnswers(items, answers);
  if (!result.complete) return { ok: false, reason: "db_error", error: "Avval barcha hujjatlarga javob bering." };

  const { data, error } = await ctx.supabase
    .from("document_checks")
    .insert({
      user_id: ctx.userId,
      application_id: applicationId,
      destination,
      visa_kind: visaKind,
      answers,
      ready_count: result.counts.ready,
      partial_count: result.counts.partial,
      preparing_count: result.counts.preparing,
      missing_count: result.counts.missing,
      total_count: result.total,
      readiness_percent: result.percent,
    })
    .select("*")
    .single<DocumentCheckRow>();
  if (error) return genericDbError();
  return { ok: true, data };
}
