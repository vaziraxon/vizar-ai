export const STORAGE_BUCKET = "visa-documents";
export const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024; // 6 MB — must match supabase/storage.sql

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return "Faqat PDF, JPG yoki PNG formatidagi fayllarni yuklash mumkin.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Fayl hajmi 6 MB dan oshmasligi kerak.";
  }
  return null;
}
