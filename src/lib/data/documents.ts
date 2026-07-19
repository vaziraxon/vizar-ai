import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { documentMetaSchema } from "@/lib/validation/schemas";
import { sanitizeFilename } from "@/lib/storage-path";
import { STORAGE_BUCKET } from "@/lib/document-constraints";
import type { Database } from "@/types/database";

export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

export async function listDocumentsForApplication(
  applicationId: string
): Promise<DataResult<DocumentRow[]>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("documents")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  if (error) return genericDbError();
  return { ok: true, data: data ?? [] };
}

/**
 * Called AFTER the browser has already uploaded the file directly to
 * Storage (see src/components/dashboard/DocumentCard.tsx) — this only
 * persists the metadata row, re-validating type/size server-side as a
 * second layer (the bucket's own limits are the first layer).
 */
export async function recordUploadedDocument(
  input: unknown
): Promise<DataResult<DocumentRow>> {
  const parsed = documentMetaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "db_error",
      error: parsed.error.issues[0]?.message ?? "Fayl ma'lumotlari noto'g'ri.",
    };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  // Defense in depth: confirm the storage path really starts with
  // this user's own folder before trusting it.
  if (!parsed.data.storagePath.startsWith(`${ctx.userId}/`)) {
    return {
      ok: false,
      reason: "db_error",
      error: "Fayl yo'li noto'g'ri.",
    };
  }

  const { data, error } = await ctx.supabase
    .from("documents")
    .insert({
      user_id: ctx.userId,
      application_id: parsed.data.applicationId,
      document_type: parsed.data.documentType,
      original_filename: sanitizeFilename(parsed.data.originalFilename),
      storage_path: parsed.data.storagePath,
      mime_type: parsed.data.mimeType,
      file_size: parsed.data.fileSize,
      status: "analyzing",
    })
    .select("*")
    .single();

  if (error) return genericDbError();

  await ctx.supabase.from("notifications").insert({
    user_id: ctx.userId,
    type: "missing_document",
    title: "Hujjat yuklandi",
    message: `${parsed.data.documentType} hujjati muvaffaqiyatli yuklandi va demo tahlildan o'tmoqda.`,
  });

  return { ok: true, data };
}

/** Marks a document with a (simulated) analysis result. */
export async function setDocumentAnalysis(
  documentId: string,
  status: DocumentRow["status"],
  analysisSummary: Record<string, unknown>
): Promise<DataResult<DocumentRow>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("documents")
    .update({ status, analysis_summary: analysisSummary })
    .eq("id", documentId)
    .eq("user_id", ctx.userId)
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}

/** Returns a short-lived signed URL — never a public URL — for temporary viewing. */
export async function getSignedDocumentUrl(
  storagePath: string,
  expiresInSeconds = 60
): Promise<DataResult<string>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  if (!storagePath.startsWith(`${ctx.userId}/`)) {
    return { ok: false, reason: "db_error", error: "Ushbu faylni ko'rishga ruxsat yo'q." };
  }

  const { data, error } = await ctx.supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data) return genericDbError();
  return { ok: true, data: data.signedUrl };
}

export async function deleteDocument(documentId: string): Promise<DataResult<null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data: doc, error: fetchError } = await ctx.supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (fetchError) return genericDbError();

  if (doc?.storage_path) {
    await ctx.supabase.storage.from(STORAGE_BUCKET).remove([doc.storage_path]);
  }

  const { error } = await ctx.supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", ctx.userId);

  if (error) return genericDbError();
  return { ok: true, data: null };
}
