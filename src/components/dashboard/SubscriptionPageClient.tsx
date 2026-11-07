"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/forms/TextField";
import { InlineAlert } from "@/components/states/InlineAlert";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDateLocale, useL } from "@/components/i18n/L";
import { cancelSubscriptionRequestAction, requestSubscriptionAction } from "@/lib/actions/subscriptions";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_REQUEST_STATUS, isSubscriptionPlan, type SubscriptionPlanId } from "@/lib/dashboard/subscription-plans";
import { useSite } from "@/lib/i18n/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn, focusFirstInvalid } from "@/lib/utils";
import type { MySubscription, SubscriptionRequestRow } from "@/lib/data/subscriptions";

const PLAN_EMOJI: Record<SubscriptionPlanId, string> = { standard: "📄", premium: "⭐", pro: "💎", vip: "👑" };

export function SubscriptionPageClient({
  initialPlan,
  active,
  requests,
}: {
  initialPlan?: SubscriptionPlanId;
  active: MySubscription | null;
  requests: SubscriptionRequestRow[];
}) {
  const router = useRouter();
  const l = useL();
  const locale = useDateLocale();
  const site = useSite();
  const configured = isSupabaseConfigured();
  const [plan, setPlan] = useState<SubscriptionPlanId | "">(initialPlan ?? "");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ plan?: string; contact?: string }>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const planName = (id: string) => (isSubscriptionPlan(id) ? site.pricing.plans[id].name : id);
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale, { dateStyle: "medium" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next: typeof errors = {};
    if (!plan) next.plan = "Tarifni tanlang.";
    if (contact.trim().length < 5) next.contact = "Telegram yoki telefon raqamingizni yozing.";
    setErrors(next);
    if (Object.keys(next).length) return focusFirstInvalid();

    if (!configured) {
      setSent(true);
      return;
    }

    setSending(true);
    const result = await requestSubscriptionAction({ plan, contact, message });
    setSending(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSent(true);
    setContact("");
    setMessage("");
    router.refresh();
  }

  async function handleCancel(id: string) {
    setCancelError("");
    try {
      const result = await cancelSubscriptionRequestAction(id);
      if (!result.ok) {
        setCancelError(result.error);
        return;
      }
    } catch {
      setCancelError("Amalni bajarib bo'lmadi. Qayta urinib ko'ring.");
      return;
    }
    router.refresh();
  }

  return (
    <>
      {!configured && (
        <div className="mb-6">
          <InlineAlert variant="warning">{l("Supabase sozlanmagan — so'rov saqlanmaydi.")}</InlineAlert>
        </div>
      )}

      {active ? (
        <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[24px] p-5 sm:p-6">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{l("Faol obuna")}</p>
            <p className="mt-1 font-display text-body-lg font-bold text-ink-950">
              {PLAN_EMOJI[isSubscriptionPlan(active.plan) ? active.plan : "standard"]} {planName(active.plan)} ·{" "}
              {l("{date} gacha ochiq", { date: date(active.expiresAt) })}
            </p>
          </div>
          <Link href="/dashboard/library" className="btn-primary btn-md">
            <BookOpen size={16} /> {l("Kitobni ochish")}
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="card space-y-5 rounded-[28px] p-6 sm:p-7 lg:col-span-2">
          {sent && (
            <p role="status" className="flex items-start gap-2 rounded-2xl bg-success/10 px-4 py-3 text-body-sm text-ink-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
              {l("So'rovingiz yuborildi. To'lov bo'yicha siz yozgan aloqa orqali bog'lanamiz.")}
            </p>
          )}

          <fieldset>
            <legend className="mb-2 block text-body-sm font-medium text-ink-900 dark:text-white/80">{l("Tarif")}</legend>
            <div
              role="radiogroup"
              aria-label={l("Tarif")}
              aria-invalid={errors.plan ? true : undefined}
              aria-describedby={errors.plan ? "plan-error" : undefined}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {SUBSCRIPTION_PLANS.map((id) => {
                const copy = site.pricing.plans[id];
                const selected = plan === id;
                return (
                  <label
                    key={id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                      selected ? "border-violet-400 bg-violet-50/70 ring-1 ring-violet-300 dark:bg-violet-500/10" : "border-surface-border hover:border-brand-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={id}
                      checked={selected}
                      onChange={() => setPlan(id)}
                      className="mt-1 accent-violet-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-body-sm font-bold text-ink-950">
                        <span aria-hidden="true">{PLAN_EMOJI[id]}</span> {copy.name}
                      </span>
                      <span className="block text-body-sm text-ink-700">
                        {copy.price} {copy.period}
                      </span>
                      <span className="mt-1 block text-caption text-ink-500">{copy.features[0]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.plan && <p id="plan-error" className="mt-2 text-caption font-medium text-red-600 dark:text-red-300">{l(errors.plan)}</p>}
          </fieldset>

          <TextField
            id="contact"
            label="Aloqa uchun Telegram yoki telefon"
            placeholder="Masalan: @username yoki +998 90 123 45 67"
            value={contact}
            maxLength={100}
            onChange={(e) => setContact(e.target.value)}
            error={errors.contact && l(errors.contact)}
          />
          <div>
            <label htmlFor="message" className="mb-2 block text-body-sm font-medium text-ink-900 dark:text-white/80">
              {l("Izoh (ixtiyoriy)")}
            </label>
            <textarea
              id="message"
              rows={3}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={l("Masalan: qaysi davlatga va qachon topshirmoqchisiz")}
              className="input min-h-[90px] py-3"
            />
          </div>

          {formError && <p role="alert" className="text-body-sm font-medium text-red-600 dark:text-red-300">{l(formError)}</p>}

          <Button type="submit" size="md" disabled={sending}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : null}
            {l("So'rov yuborish")}
          </Button>
          <p className="text-caption text-ink-500">{l("Aloqa ma'lumotingizni faqat siz bilan bog'lanish uchun ishlatamiz.")}</p>
        </form>

        <div className="card h-fit rounded-[24px] p-6">
          <p className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-950">
            <span aria-hidden="true">🧭</span> {l("Qanday ishlaydi")}
          </p>
          <ol className="space-y-2 text-body-sm text-ink-600">
            <li>1. {l("Tarifni tanlab, aloqangizni qoldirasiz.")}</li>
            <li>2. {l("Jamoamiz bog'lanib, to'lov usulini aytadi.")}</li>
            <li>3. {l("To'lovdan so'ng obuna yoqiladi va kitob muddat tugaguncha ochiq bo'ladi.")}</li>
          </ol>
          <p className="mt-4 text-caption text-ink-500">{l("Onlayn to'lov hozircha ulanmagan.")}</p>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-body-sm font-semibold text-ink-900 dark:text-white">{l("Mening so'rovlarim")}</p>
          {cancelError && <p role="alert" className="mb-3 text-body-sm font-medium text-red-600 dark:text-red-300">{l(cancelError)}</p>}
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 rounded-[20px] p-4">
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-ink-900 dark:text-white">{planName(r.plan)}</p>
                  <p className="text-caption text-ink-500">{date(r.created_at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={SUBSCRIPTION_REQUEST_STATUS[r.status] ?? r.status} />
                  {r.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(r.id)}
                      className="flex items-center gap-1 text-caption font-semibold text-red-500 hover:text-red-600"
                    >
                      <X size={13} /> {l("Bekor qilish")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
