"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

type ProviderState = "checking" | "enabled" | "disabled";

/** Official multi-colour Google "G" mark, as required on Google sign-in buttons. */
function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/**
 * "Continue with Google" through Supabase Auth (OAuth + PKCE). The button
 * asks the project which providers are enabled, so it switches on by itself
 * once Google is turned on in Supabase — until then it shows "coming soon".
 * After Google, the user lands on /auth/callback, which exchanges the code
 * for a session and forwards to `next`.
 */
export function GoogleButton({ next = "/dashboard", configured }: { next?: string; configured: boolean }) {
  const { t } = useLanguage();
  const [provider, setProvider] = useState<ProviderState>("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const env = getSupabaseEnv();
    if (!configured || !env) {
      setProvider("disabled");
      return;
    }
    // Remember the answer for this tab session so login ↔ register is instant
    const CACHE = "vizar-google-provider";
    try {
      const cached = window.sessionStorage.getItem(CACHE);
      if (cached === "enabled" || cached === "disabled") setProvider(cached);
    } catch {
      /* ignore */
    }
    let cancelled = false;
    fetch(`${env.url}/auth/v1/settings`, { headers: { apikey: env.anonKey } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { external?: Record<string, boolean> } | null) => {
        const state: ProviderState = s?.external?.google ? "enabled" : "disabled";
        try {
          window.sessionStorage.setItem(CACHE, state);
        } catch {
          /* ignore */
        }
        if (!cancelled) setProvider(state);
      })
      .catch(() => !cancelled && setProvider("disabled"));
    return () => {
      cancelled = true;
    };
  }, [configured]);

  async function signIn() {
    setError("");
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    const safeNext = next.startsWith("/") ? next : "/dashboard";
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
        queryParams: { prompt: "select_account" },
      },
    });
    // On success the browser is already navigating to Google.
    if (oauthError) {
      setLoading(false);
      setError(t("au_google_error"));
    }
  }

  const enabled = provider === "enabled";

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={!enabled || loading}
        title={provider === "disabled" ? t("au_google_title") : undefined}
        aria-busy={loading}
        className={cn(
          "btn btn-lg w-full gap-3 border",
          enabled
            ? "border-surface-border bg-surface text-ink-900 shadow-xs hover:border-surface-strong hover:bg-surface-tint"
            : "border-surface-border bg-surface text-ink-400"
        )}
      >
        {loading || provider === "checking" ? <Loader2 size={18} className="animate-spin" /> : <GoogleMark />}
        {enabled || provider === "checking" ? t("au_google_continue") : t("au_google_soon")}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-caption font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
