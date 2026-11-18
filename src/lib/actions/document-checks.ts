"use server";

import { revalidatePath } from "next/cache";
import { saveDocumentCheck } from "@/lib/data/document-checks";
import { adviseWithAi, documentCheckAiEnabled } from "@/lib/document-check/ai";
import { buildChecklist, type VisaKind } from "@/lib/dashboard/checklist-template";
import { buildAiPayload } from "@/lib/document-check/score";
import { DESTINATIONS, type DestinationSlug } from "@/lib/site/registry";
import { getAuthedContext } from "@/lib/data/_shared";
import { rateLimit } from "@/lib/rate-limit";
import { loadBookRules } from "@/lib/document-check/book";
import { getRequestLanguage } from "@/lib/i18n/request-language";

export async function saveDocumentCheckAction(input: {
  destination: DestinationSlug;
  visaKind: VisaKind;
  applicationId: string | null;
  answers: Record<string, string>;
}) {
  const result = await saveDocumentCheck(input);
  if (result.ok) revalidatePath("/dashboard/documents/check");
  return result;
}

/**
 * Optional AI advice for a finished test (null while AI is off — the page
 * then shows only the rule-based result). The payload is rebuilt here from
 * the document list and the visa book on the server; the browser sends nothing
 * but the destination, visa type and answers. Signed-in AI beta users only,
 * 10 requests per hour and within their 20 Claude requests a day.
 */
export async function adviseDocumentCheckAction(input: {
  destination: DestinationSlug;
  visaKind: VisaKind;
  answers: Record<string, string>;
}): Promise<{ advice: string | null }> {
  if (!documentCheckAiEnabled()) return { advice: null };
  const ctx = await getAuthedContext();
  if (!ctx.ok) return { advice: null };
  if (!DESTINATIONS.some((d) => d.slug === input.destination)) return { advice: null };
  if (!["tourist", "student", "work", "business"].includes(input.visaKind)) return { advice: null };
  const limit = await rateLimit(`doc-check-ai:${ctx.userId}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) return { advice: null };

  // Book requirements are loaded here, never taken from the browser
  const { rules } = await loadBookRules(ctx.supabase, input.destination, "uz");
  const items = buildChecklist(input.destination, input.visaKind).flatMap((g) => g.items);
  const payload = buildAiPayload({
    destination: input.destination,
    visaType: input.visaKind,
    items,
    answers: input.answers,
    bookRules: rules.map((r) => ({ topic: r.topic, text: r.text, verified: r.verified })),
  });
  return { advice: await adviseWithAi(payload, ctx.userId, getRequestLanguage()) };
}
