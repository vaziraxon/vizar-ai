/**
 * The site's public origin for links in auth emails (password reset, sign-up
 * confirmation). NEXT_PUBLIC_SITE_URL wins; without it, Vercel's own system
 * variables give the production domain (or a preview's URL), so a missing
 * setting no longer sends users to http://localhost:3000.
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
export function resolveSiteUrl(env: Record<string, string | undefined>): string {
  const clean = (v: string) => v.trim().replace(/\/+$/, "");
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim() || env.SITE_URL?.trim();
  if (explicit) return clean(explicit);
  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${clean(env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }
  if (env.VERCEL_URL) return `https://${clean(env.VERCEL_URL)}`;
  return "http://localhost:3000";
}
