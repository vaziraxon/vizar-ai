/**
 * Route-level authorization helpers for /admin and /agency.
 *
 * There is no "admin" or "agency staff" role in the database schema
 * today (`profiles.account_type` is only `individual` | `agency`, and
 * nothing populates `agency_members` yet — see supabase/schema.sql).
 * Adding a proper role column would require a migration run against
 * the live Supabase project, and this codebase only ever holds the
 * anon/publishable key (by design — see src/lib/supabase/config.ts),
 * never the service-role key or a DB connection string. So it can't
 * apply that migration on your behalf.
 *
 * Until that migration is written and run (see SUPABASE_SETUP.md),
 * these helpers use what's available today:
 *  - /admin: an explicit env-var allowlist (ADMIN_EMAILS). Fails
 *    closed — if unset, nobody can reach /admin, including you,
 *    until you configure it.
 *  - /agency: the existing, already-shippable `account_type` field
 *    (self-service via Settings → src/components/dashboard/ProfileForm.tsx)
 *    plus `agency_members` if it's ever populated.
 */

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  const allowlist = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

// NOTE: the /agency check (profiles.account_type === "agency" OR an
// agency_members row) is implemented inline in middleware.ts rather
// than as a helper here. It needs the Supabase client created there,
// and re-typing that client's generic parameters in a second file
// turned out to be fragile across @supabase/ssr versions (the row
// types collapsed to `never`) — inlining it keeps the client's
// naturally-inferred type intact instead of fighting the generics.
