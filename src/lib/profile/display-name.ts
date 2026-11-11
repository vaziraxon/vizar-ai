/**
 * A first name for greetings when the profile has none yet: Google sign-ups
 * arrive with `given_name` / `full_name` / `name` in the auth metadata, while
 * the signup trigger only copies `first_name` (the email form's field).
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
export function firstNameFromMetadata(meta: Record<string, unknown> | null | undefined): string {
  if (!meta) return "";
  const pick = (key: string) => (typeof meta[key] === "string" ? (meta[key] as string).trim() : "");
  const direct = pick("first_name") || pick("given_name");
  if (direct) return direct;
  const full = pick("full_name") || pick("name");
  return full.split(/\s+/)[0] ?? "";
}
