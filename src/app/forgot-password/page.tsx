"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/states/InlineAlert";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("To'g'ri email manzil kiriting.");
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
      setError(result.error ?? "Amalni bajarib bo'lmadi.");
    }
  }

  return (
    <AuthCard
      title="Parolni tiklash"
      subtitle="Email manzilingizni kiriting — tiklash havolasini yuboramiz."
    >
      {!configured && (
        <div className="mb-4">
          <InlineAlert variant="warning">
            Supabase sozlanmagan — tiklash havolasi yuborilmaydi.
          </InlineAlert>
        </div>
      )}

      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 size={24} />
          </span>
          <p className="text-body font-semibold text-ink-900 dark:text-white">
            Havola yuborildi
          </p>
          <p className="text-body-sm text-ink-600 dark:text-white/60">
            Agar <strong>{email}</strong> ro&apos;yxatdan o&apos;tgan bo&apos;lsa,
            parolni tiklash havolasi shu manzilga yuboriladi.
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft size={15} /> Kirish sahifasiga qaytish
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextField
            id="email"
            label="Email"
            type="email"
            placeholder="email@misol.uz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            disabled={!configured}
          />
          <Button type="submit" size="md" className="w-full" disabled={loading || !configured}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
            Tiklash havolasini yuborish
          </Button>
          <p className="text-center text-body-sm text-ink-600 dark:text-white/60">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700"
            >
              <ArrowLeft size={15} /> Kirish sahifasiga qaytish
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
