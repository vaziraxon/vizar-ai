/**
 * Where to send the user after signing in: only a path on this site.
 * Rejects absolute URLs and the protocol-relative forms browsers turn into
 * another site ("//evil.com", "/\evil.com"), so `?next=` can't be used as an
 * open redirect. No runtime "@/" imports: Node runs the tests on this file.
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 512) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.includes("\\")) return fallback;
  // Control characters and whitespace (tabs/newlines are stripped by URL parsers)
  if (/[\u0000-\u001f\u007f\s]/.test(raw)) return fallback;
  return raw;
}
