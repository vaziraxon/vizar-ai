"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, MailCheck, ArrowLeft, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { TextField } from "@/components/forms/TextField";
import { Button, ButtonLink } from "@/components/ui/Button";
import { InlineAlert } from "@/components/states/InlineAlert";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useLanguage } from "@/lib/language-context";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("au_err_email"));
      return;
    }
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.set("email", email);
    const result = await requestPasswordResetAction(formData);
    setLoading(false);

    // Always show the "sent" state on success, and even on most
    // failures, to avoid revealing whether an email is registered.
    if (result.ok || result.error !== "Supabase sozlanmagan.") {
      setSent(true);
    } else {
      setError(result.error ?? t("au_forgot_error"));
    }
  }

  return (
    <AuthCard
      title={sent ? t("au_sent_title") : t("au_forgot_title")}
      subtitle={t("au_forgot_subtitle")}
    >
      {!configured && (
        <div className="mb-5">
          <InlineAlert variant="warning">{t("au_forgot_not_configured")}</InlineAlert>
        </div>
      )}

      {sent ? (
        <>
          <div className="rounded-3xl border border-surface-border bg-surface-tint p-6 dark:border-white/10 dark:bg-white/5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-border bg-white text-ink-900 dark:border-white/10 dark:bg-white/10 dark:text-white">
              <MailCheck size={20} strokeWidth={1.8} />
            </span>
            <p className="mt-5 text-body text-ink-700 dark:text-white/70" role="status">
              {t("au_sent_before")}
              <strong className="font-semibold text-ink-900 dark:text-white">{email}</strong>
              {t("au_sent_after")}
            </p>
          </div>
          <ButtonLink href="/login" size="lg" variant="secondary" className="mt-6 w-full">
            <ArrowLeft size={16} />
            {t("au_back_login")}
          </ButtonLink>
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <TextField
            id="email"
            label={t("au_email")}
            type="email"
            autoComplete="email"
            placeholder="email@misol.uz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            disabled={!configured}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !configured}
            aria-busy={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={17} />}
            {t("au_forgot_submit")}
          </Button>
          <p className="pt-2 text-center text-body-sm">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded font-semibold text-ink-700 transition-colors hover:text-ink-900 dark:text-white/70 dark:hover:text-white"
            >
              <ArrowLeft size={15} /> {t("au_back_login")}
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
