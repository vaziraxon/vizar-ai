"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/states/InlineAlert";
import { loginAction } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useLanguage } from "@/lib/language-context";

export default function LoginClient({ configured }: { configured: boolean }) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const callbackFailed = searchParams.get("error") === "auth_callback_failed";

  // Only ever follow a same-origin relative path from `next` — never
  // an absolute URL, to avoid an open-redirect via query params.
  const rawNext = searchParams.get("next");
  const nextPath = rawNext && rawNext.startsWith("/") ? rawNext : "/dashboard";

  function validate() {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t("au_err_email");
    if (password.length < 6) next.password = t("au_err_password");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    const result = await loginAction(formData);
    setLoading(false);

    if (!result.ok) {
      setFormError(result.error ?? t("au_login_error"));
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  return (
    <AuthCard title={t("au_login_title")} subtitle={t("au_login_subtitle")}>
      {!configured && (
        <div className="mb-5">
          <InlineAlert variant="warning">
            {t("au_login_not_configured")} <code>SUPABASE_SETUP.md</code>
          </InlineAlert>
        </div>
      )}
      {callbackFailed && (
        <div className="mb-5" role="alert">
          <InlineAlert variant="danger">{t("au_callback_error")}</InlineAlert>
        </div>
      )}

      {/* Google first — the fastest way in */}
      <div className="mb-5 space-y-5">
        <GoogleButton next={nextPath} configured={configured} />
        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-surface px-3 text-caption text-ink-500">{t("au_or")}</span>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-surface-border" />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          id="email"
          label={t("au_email")}
          type="email"
          autoComplete="email"
          placeholder="email@misol.uz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={!configured}
        />
        <TextField
          id="password"
          label={t("au_password")}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={!configured}
        />

        <div className="flex items-center justify-between gap-4 text-body-sm">
          <label className="flex cursor-pointer items-center gap-2 text-ink-700 dark:text-white/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-surface-strong accent-brand-600"
            />
            {t("au_remember")}
          </label>
          <Link
            href="/forgot-password"
            className="rounded font-medium text-ink-900 underline decoration-surface-strong underline-offset-4 transition-colors hover:decoration-ink-900 dark:text-white"
          >
            {t("au_forgot")}
          </Link>
        </div>

        {formError && (
          <div role="alert">
            <InlineAlert variant="danger">{formError}</InlineAlert>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || !configured}
          aria-busy={loading}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {t("login")}
          {!loading && <ArrowRight size={17} />}
        </Button>

        <p className="pt-2 text-center text-body-sm text-ink-600 dark:text-white/60">
          {t("au_no_account")}{" "}
          <Link
            href="/register"
            className="rounded font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("au_sign_up_link")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
