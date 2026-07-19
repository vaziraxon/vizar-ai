/**
 * Pure helpers for the visa-documents storage path convention:
 *   {user_id}/{application_id}/{timestamp}-{sanitized_filename}
 *
 * These contain no auth or database calls, so they're safe to import
 * from Client Components (to build the path before uploading) AND
 * from the server data layer (to validate a path afterwards). The
 * actual security boundary is enforced by the Storage RLS policies in
 * supabase/storage.sql, which check the path's first segment against
 * auth.uid() at write time — this file only produces a conventional
 * path string, it does not grant access to anything.
 */

export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "file";
}

export function buildStoragePath(
  userId: string,
  applicationId: string,
  filename: string
): string {
  const safeName = sanitizeFilename(filename);
  return `${userId}/${applicationId}/${Date.now()}-${safeName}`;
}
