"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { UserPlus, Loader2, MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/states/InlineAlert";
import { registerAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
    if (form.firstName.trim().length < 2) next.firstName = "Ismingizni kiriting.";
    if (form.lastName.trim().length < 2) next.lastName = "Familiyangizni kiriting.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "To'g'ri email manzil kiriting.";
    if (!/^\+?\d{9,15}$/.test(form.phone.replace(/\s/g, "")))
      next.phone = "To'g'ri telefon raqami kiriting.";
    if (form.password.length < 6)
      next.password = "Parol kamida 6 belgidan iborat bo'lishi kerak.";
    if (form.confirmPassword !== form.password)
      next.confirmPassword = "Parollar mos kelmadi.";
    if (!terms) next.terms = "Davom etish uchun shartlarga rozilik bildiring.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      setFormError(result.error ?? "Ro'yxatdan o'tishda xatolik yuz berdi.");
      return;
    }
    setRegistered(true);
  }

  if (registered) {
    return (
      <AuthCard
        title="Emailingizni tasdiqlang"
        subtitle="Ro'yxatdan o'tish deyarli tayyor."
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <MailCheck size={24} />
          </span>
          <p className="text-body-sm text-ink-600 dark:text-white/60">
            <strong>{form.email}</strong> manziliga tasdiqlash havolasi
            yuborildi. Havolani bosib, hisobingizni faollashtiring, so&apos;ng
            tizimga kiring.
          </p>
          <Link
            href="/login"
            className="mt-2 font-semibold text-brand-600 hover:text-brand-700"
          >
            Kirish sahifasiga o&apos;tish
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Ro'yxatdan o'ting"
      subtitle="Bir necha daqiqada VIZAR AI hisobingizni yarating."
    >
      {!configured && (
        <div className="mb-4">
          <InlineAlert variant="warning">
            Supabase sozlanmagan — ro&apos;yxatdan o&apos;tish demo rejimda
            ishlamaydi. Batafsil: <code>SUPABASE_SETUP.md</code>.
          </InlineAlert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="firstName"
            label="Ism"
            placeholder="Vazira"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            error={errors.firstName}
            disabled={!configured}
          />
          <TextField
            id="lastName"
            label="Familiya"
            placeholder="Zokirova"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            error={errors.lastName}
            disabled={!configured}
          />
        </div>
        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="email@misol.uz"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          disabled={!configured}
        />
        <TextField
          id="phone"
          label="Telefon raqami"
          type="tel"
          placeholder="+998 90 123 45 67"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
          disabled={!configured}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="password"
            label="Parol"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
            disabled={!configured}
          />
          <TextField
            id="confirmPassword"
            label="Parolni tasdiqlash"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            disabled={!configured}
          />
        </div>

        <div>
          <label className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              disabled={!configured}
              className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-400"
            />
            Men xizmat ko&apos;rsatish shartlari va maxfiylik siyosatiga roziman.
          </label>
          {errors.terms && (
            <p className="mt-1.5 text-caption font-medium text-red-600">
              {errors.terms}
            </p>
          )}
        </div>

        {formError && (
          <p className="text-body-sm font-medium text-red-600">{formError}</p>
        )}

        <Button type="submit" size="md" className="w-full" disabled={loading || !configured}>
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <UserPlus size={18} />
          )}
          Ro&apos;yxatdan o&apos;tish
        </Button>

        <p className="text-center text-body-sm text-ink-600 dark:text-white/60">
          Hisobingiz bormi?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Kiring
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
