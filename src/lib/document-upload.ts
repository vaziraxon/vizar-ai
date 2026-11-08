/**
 * Real document uploads (passports, bank statements …) are closed until the
 * document service runs on a protected server. Open only where
 * DOCUMENT_UPLOAD_ENABLED=true AND it isn't production — production stays
 * closed whatever the variable says. Storage and the documents table are
 * locked in the database too (supabase/document_upload_lock.sql).
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
export function documentUploadsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  if (env.VERCEL_ENV === "production") return false;
  return env.DOCUMENT_UPLOAD_ENABLED === "true";
}

/** Uzbek source text (translated in the UI) for any refused upload */
export const UPLOADS_CLOSED_MESSAGE = "Hujjat yuklash vaqtincha yopiq.";
