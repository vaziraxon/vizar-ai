"use client";

import { createClient } from "@/lib/supabase/client";
import { buildStoragePath } from "@/lib/storage-path";
import { STORAGE_BUCKET, validateFile, type AllowedMimeType } from "@/lib/document-constraints";
import { recordUploadedDocumentAction, setDocumentAnalysisAction } from "@/lib/actions/documents";

/**
 * Browser-side upload of one visa document — the same flow the document
 * cards always used, shared so a multi-file upload goes through the exact
 * same path: validate → Storage upload (RLS-checked path) → metadata row
 * via the existing server action → clearly-labelled demo analysis.
 *
 * Error strings are Uzbek source text (translated in the UI).
 */

const DEMO_ANALYSIS: Record<string, { issue?: string; summary: string }> = {
  Passport: { summary: "Passport ma'lumotlari to'liq va aniq ko'rinmoqda (demo)." },
  "Bank statement": {
    issue: "Hisob egasining to'liq ismi ko'rsatilmagan.",
    summary: "Bank ma'lumotnomasida hisob egasining to'liq ismi ko'rsatilmagan (demo).",
  },
  "Ish joyidan ma'lumotnoma": { summary: "Hujjat talablarga mos keladi (demo)." },
  "Sug'urta": {
    issue: "Sug'urta muddati safar sanasidan oldin tugaydi.",
    summary: "Sug'urta muddatini tekshirib chiqing (demo).",
  },
};

export type UploadResult = { ok: true; documentId: string } | { ok: false; error: string };

export async function uploadDocumentFile(opts: {
  file: File;
  applicationId: string;
  documentType: string;
  onProgress?: (percent: number) => void;
}): Promise<UploadResult> {
  const { file, applicationId, documentType, onProgress } = opts;

  const validationError = validateFile(file);
  if (validationError) return { ok: false, error: validationError };

  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Supabase sozlanmagan — fayl yuklanmadi." };

  onProgress?.(15);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tizimga kirmagansiz." };

  const path = buildStoragePath(user.id, applicationId, file.name);
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: "Faylni yuklab bo'lmadi. Qayta urinib ko'ring." };

  onProgress?.(70);
  const meta = await recordUploadedDocumentAction({
    applicationId,
    documentType,
    originalFilename: file.name,
    storagePath: path,
    mimeType: file.type as AllowedMimeType,
    fileSize: file.size,
  });
  if (!meta.ok) return { ok: false, error: meta.error };

  onProgress?.(100);
  return { ok: true, documentId: meta.data.id };
}

/** Simulated, clearly-labelled demo analysis — not a real document check. */
export async function runDemoAnalysis(documentId: string, documentType: string) {
  const demo = DEMO_ANALYSIS[documentType] ?? { summary: "Tahlil yakunlandi (demo)." };
  await setDocumentAnalysisAction(documentId, demo.issue ? "issue_found" : "verified", {
    summary: demo.summary,
    issue: demo.issue ?? null,
  });
}

/** Best guess of the document slot from a file name (any language). */
const GUESS: [RegExp, string][] = [
  [/pass|pasport|паспорт/i, "Passport"],
  [/bank|statement|ko.?chirma|выписк|счет|счёт/i, "Bank statement"],
  [/employ|work|job|ish.?joy|ma.?lumotnoma|справк|работ/i, "Ish joyidan ma'lumotnoma"],
  [/invit|taklif|приглаш/i, "Taklifnoma"],
  [/hotel|booking|mehmonxona|отел|брон/i, "Mehmonxona bron"],
  [/flight|ticket|avia|chipta|билет|рейс/i, "Aviachipta bron"],
  [/insur|sug.?urta|страхов/i, "Sug'urta"],
];
export function guessDocumentType(filename: string, fallback = "Qo'shimcha hujjatlar") {
  return GUESS.find(([re]) => re.test(filename))?.[1] ?? fallback;
}
