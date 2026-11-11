/**
 * Which copy of the checklist / test answers wins when a page opens: the one
 * changed last. `local` is when this browser last changed them (ms, null if
 * never), `server` is the account's saved copy (ms, null if none yet).
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
export type PrepSource = "server" | "local" | "none";

export function pickPrepSource(local: number | null, server: number | null): PrepSource {
  if (server === null) return local === null ? "none" : "local";
  if (local === null || server >= local) return "server";
  return "local";
}
