"use server";

import { revalidatePath } from "next/cache";
import * as documents from "@/lib/data/documents";

export async function recordUploadedDocumentAction(input: {
  applicationId: string;
  documentType: string;
  originalFilename: string;
  storagePath: string;
  mimeType: "application/pdf" | "image/jpeg" | "image/jpg" | "image/png";
  fileSize: number;
}) {
  const result = await documents.recordUploadedDocument(input);
  if (result.ok) {
    revalidatePath("/documents");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
  }
  return result;
}

export async function setDocumentAnalysisAction(
  documentId: string,
  status: "uploaded" | "analyzing" | "issue_found" | "verified" | "expired",
  analysisSummary: Record<string, unknown>
) {
  const result = await documents.setDocumentAnalysis(documentId, status, analysisSummary);
  if (result.ok) revalidatePath("/documents");
  return result;
}

export async function getSignedDocumentUrlAction(storagePath: string) {
  return documents.getSignedDocumentUrl(storagePath);
}

export async function deleteDocumentAction(documentId: string) {
  const result = await documents.deleteDocument(documentId);
  if (result.ok) revalidatePath("/documents");
  return result;
}
