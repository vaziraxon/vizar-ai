"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/states/InlineAlert";
import { loginAction } from "@/lib/actions/auth";

export default function LoginClient({ configured }: { configured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Only ever follow a same-origin relative path from `next` — never
  // an absolute URL, to avoid an open-redirect via query params.
  const rawNext = searchParams.get("next");
  const nextPath = rawNext && rawNext.startsWith("/") ? rawNext : "/dashboard";

  function validate() {
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "To'g'ri email manzil kiriting.";
    if (password.length < 6) next.password = "Parol kamida 6 belgidan iborat bo'lishi kerak.";
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
      setFormError(result.error ?? "Kirishda xatolik yuz berdi.");
      return;
    }
    router.push(nextPath);
    router.refresh();
  }

  return (
    <AuthCard
      title="Hisobingizga kiring"
      subtitle="VIZAR AI platformasiga xush kelibsiz."
    >
      {!configured && (
        <div className="mb-4">
          <InlineAlert variant="warning">
            Supabase sozlanmagan — kirish demo rejimda ishlamaydi.
            Batafsil: <code>SUPABASE_SETUP.md</code>.
          </InlineAlert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="email@misol.uz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={!configured}
        />
        <TextField
          id="password"
          label="Parol"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={!configured}
        />

        {formError && (
          <p className="text-body-sm font-medium text-red-600">{formError}</p>
        )}

        <div className="flex items-center justify-between text-body-sm">
          <label className="flex items-center gap-2 text-ink-700 dark:text-white/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-400"
            />
            Meni eslab qolish
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Parolni unutdingizmi?
          </Link>
        </div>

        <Button type="submit" size="md" className="w-full" disabled={loading || !configured}>
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LogIn size={18} />
          )}
          Kirish
        </Button>

        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-white px-3 text-caption text-ink-400 dark:bg-navy-900 dark:text-white/40">
            yoki
          </span>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-surface-border dark:bg-white/10" />
        </div>

        <button
          type="button"
          disabled
          title="Google orqali kirish hozircha sozlanmagan"
          className="flex w-full items-center justify-center gap-2 rounded-pill border border-surface-border bg-white px-6 py-3.5 text-body-sm font-semibold text-ink-400 opacity-60 dark:border-white/10 dark:bg-navy-800 dark:text-white/40"
        >
          Google orqali kirish — Tez orada
        </button>

        <p className="text-center text-body-sm text-ink-600 dark:text-white/60">
          Hisobingiz yo&apos;qmi?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
