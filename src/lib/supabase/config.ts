/**
 * Central place to read Supabase environment variables.
 *
 * IMPORTANT: only the URL and the anon/publishable key belong here.
 * The service-role key must NEVER be read in code that can run in the
 * browser, and this project does not use it anywhere (see
 * SUPABASE_SETUP.md for why it isn't needed for this MVP).
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function isSupabaseAnonKey(key: string | null): key is string {
  return (
    typeof key === "string" &&
    (key.startsWith("sb_publishable_") || key.startsWith("sbp_") || key.startsWith("anon_"))
  );
}

export function isSupabaseServiceRoleKey(key: string | null): key is string {
  return typeof key === "string" && key.startsWith("sb_secret_");
}

/**
 * Returns the Supabase env vars if both are present, otherwise `null`.
 * Callers should treat `null` as "Supabase isn't configured yet" and
 * fall back to the app's demo mode instead of throwing — see
 * `isSupabaseConfigured()` below and the fallback notice component at
 * `src/components/dev/SupabaseSetupNotice.tsx`.
 */
export function getSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  if (!url) {
    console.error("[supabase] NEXT_PUBLIC_SUPABASE_URL is missing.");
  }
  return url;
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = getSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;

  if (!url || !isSupabaseAnonKey(anonKey)) {
    if (anonKey && !isSupabaseAnonKey(anonKey)) {
      console.error(
        "[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is set but invalid. Use a publishable key beginning with `sb_publishable_`, `sbp_`, or `anon_`."
      );
    }
    return null;
  }
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

export function getSupabaseServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
  if (!isSupabaseServiceRoleKey(key)) {
    if (key) {
      console.error(
        "[supabase] SUPABASE_SERVICE_ROLE_KEY is set but invalid. Use a `sb_secret_...` service role key, not a legacy `service_role` JWT key."
      );
    }
    return null;
  }
  return key;
}

/**
 * Human-readable, non-sensitive message for missing configuration.
 * Never include the actual (partial) key or URL value in logs or UI —
 * this message is safe to render directly.
 */
export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Supabase sozlanmagan. .env.local faylida NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY qiymatlarini kiriting (batafsil: SUPABASE_SETUP.md).";
