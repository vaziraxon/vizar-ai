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

/**
 * Returns the Supabase env vars if both are present, otherwise `null`.
 * Callers should treat `null` as "Supabase isn't configured yet" and
 * fall back to the app's demo mode instead of throwing — see
 * `isSupabaseConfigured()` below and the fallback notice component at
 * `src/components/dev/SupabaseSetupNotice.tsx`.
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/**
 * Human-readable, non-sensitive message for missing configuration.
 * Never include the actual (partial) key or URL value in logs or UI —
 * this message is safe to render directly.
 */
export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Supabase sozlanmagan. .env.local faylida NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY qiymatlarini kiriting (batafsil: SUPABASE_SETUP.md).";
