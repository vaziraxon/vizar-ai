"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, MailCheck, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { TextField } from "@/components/forms/TextField";
import { Button, ButtonLink } from "@/components/ui/Button";
import { InlineAlert } from "@/components/states/InlineAlert";
import { registerAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useLanguage } from "@/lib/language-context";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormState | "terms", string>>;

export default function RegisterPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const configured = isSupabaseConfigured();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const next: FormErrors = {};
    if (form.firstName.trim().length < 2) next.firstName = t("au_err_first_name");
    if (form.lastName.trim().length < 2) next.lastName = t("au_err_last_name");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = t("au_err_email");
    if (!/^\+?\d{9,15}$/.test(form.phone.replace(/\s/g, "")))
      next.phone = t("au_err_phone");
    if (form.password.length < 6)
      next.password = t("au_err_password");
    if (form.confirmPassword !== form.password)
      next.confirmPassword = t("au_err_confirm");
    if (!terms) next.terms = t("au_err_terms");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (loading || !configured) {
      return;
    }

    setFormError("");
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    formData.set("firstName", form.firstName);
    formData.set("lastName", form.lastName);
    formData.set("email", form.email);
    formData.set("phone", form.phone);
    formData.set("password", form.password);
    formData.set("confirmPassword", form.confirmPassword);
    formData.set("termsAccepted", String(terms));

    const result = await registerAction(formData);
    setLoading(false);

    if (!result.ok) {
      setFormError(result.error ?? t("au_register_error"));
      return;
    }
    setRegistered(true);
  }

  if (registered) {
    return (
      <AuthCard title={t("au_verify_title")} subtitle={t("au_verify_subtitle")}>
        <div className="rounded-3xl border border-surface-border bg-surface-tint p-6 dark:border-white/10 dark:bg-white/5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-border bg-white text-ink-900 dark:border-white/10 dark:bg-white/10 dark:text-white">
            <MailCheck size={20} strokeWidth={1.8} />
          </span>
          <p className="mt-5 text-body text-ink-700 dark:text-white/70" role="status">
            {t("au_verify_before")}
            <strong className="font-semibold text-ink-900 dark:text-white">{form.email}</strong>
            {t("au_verify_after")}
          </p>
        </div>
        <ButtonLink href="/login" size="lg" variant="secondary" className="mt-6 w-full">
          {t("au_go_login")}
        </ButtonLink>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("au_register_title")} subtitle={t("au_register_subtitle")}>
      {!configured && (
        <div className="mb-5">
          <InlineAlert variant="warning">
            {t("au_register_not_configured")} <code>SUPABASE_SETUP.md</code>
          </InlineAlert>
        </div>
      )}

      <div className="mb-5 space-y-5">
        <GoogleButton next="/dashboard" configured={configured} />
        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-surface px-3 text-caption text-ink-500">{t("au_or")}</span>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-surface-border" />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="firstName"
            label={t("au_first_name")}
            autoComplete="given-name"
            placeholder="Vazira"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            error={errors.firstName}
            disabled={!configured}
          />
          <TextField
            id="lastName"
            label={t("au_last_name")}
            autoComplete="family-name"
            placeholder="Zokirova"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            error={errors.lastName}
            disabled={!configured}
          />
        </div>
        <TextField
          id="email"
          label={t("au_email")}
          type="email"
          autoComplete="email"
          placeholder="email@misol.uz"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          disabled={!configured}
        />
        <TextField
          id="phone"
          label={t("au_phone")}
          type="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
          disabled={!configured}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="password"
            label={t("au_password")}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
            disabled={!configured}
          />
          <TextField
            id="confirmPassword"
            label={t("au_confirm_password")}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            disabled={!configured}
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-body-sm text-ink-700 dark:text-white/70">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              disabled={!configured}
              aria-invalid={errors.terms ? true : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-strong accent-brand-600"
            />
            {t("au_terms")}
          </label>
          {errors.terms && (
            <p className="mt-1.5 text-caption font-medium text-red-600">
              {errors.terms}
            </p>
          )}
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
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t("au_submitting")}
            </>
          ) : (
            <>
              {t("register")}
              <ArrowRight size={17} />
            </>
          )}
        </Button>

        <p className="pt-2 text-center text-body-sm text-ink-600 dark:text-white/60">
          {t("au_have_account")}{" "}
          <Link
            href="/login"
            className="rounded font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("au_log_in_link")}
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
