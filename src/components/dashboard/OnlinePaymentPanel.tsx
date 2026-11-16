"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { startPaymentAction } from "@/lib/actions/payments";
import { cn } from "@/lib/utils";

type Provider = "payme" | "click";
type Plan = "standard" | "premium" | "pro";
const PLANS: Plan[] = ["standard", "premium", "pro"];
const PROVIDER_LABEL: Record<Provider, string> = { payme: "Payme", click: "Click" };

/**
 * Online payment for a plan (shown only while payments are enabled and a
 * provider is set up). The price comes from the server; the subscription
 * opens when Payme or Click confirms the payment to our server.
 */
export function OnlinePaymentPanel({ providers, initialPlan, returned }: { providers: Provider[]; initialPlan?: string; returned: boolean }) {
  const l = useL();
  const site = useSite();
  const [plan, setPlan] = useState<Plan>(PLANS.includes(initialPlan as Plan) ? (initialPlan as Plan) : "premium");
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState("");

  async function pay(provider: Provider) {
    setError("");
    setBusy(provider);
    const res = await startPaymentAction({ plan, provider }).catch(() => ({ ok: false as const, error: "To‘lovni boshlab bo‘lmadi. Birozdan keyin qayta urinib ko‘ring." }));
    if (res.ok) {
      window.location.href = res.url;
      return;
    }
    setError(l(res.error));
    setBusy(null);
  }

  return (
    <section className="card mb-6 space-y-5 rounded-[28px] p-6 sm:p-7" aria-labelledby="online-payment">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-tint text-brand-700">
          <CreditCard size={20} strokeWidth={1.8} />
        </span>
        <div>
          <h2 id="online-payment" className="font-sans text-body-lg font-semibold text-ink-950">
            {l("Onlayn to‘lov")}
          </h2>
          <p className="text-body-sm text-ink-600">{l("Tarifni tanlang va to‘lang — obuna to‘lov tasdiqlangan zahoti ochiladi.")}</p>
        </div>
      </div>

      {returned && (
        <p role="status" className="rounded-2xl bg-surface-tint px-4 py-3 text-body-sm text-ink-700">
          {l("To‘lov tekshirilmoqda. To‘lov tizimi tasdiqlashi bilan obuna avtomatik ochiladi — sahifani bir daqiqadan keyin yangilang.")}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        {PLANS.map((id) => {
          const copy = site.pricing.plans[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPlan(id)}
              aria-pressed={plan === id}
              className={cn(
                "min-h-[64px] rounded-2xl border px-4 py-3 text-left transition-colors",
                plan === id ? "border-brand-500 bg-brand-50" : "border-surface-border bg-surface hover:bg-surface-tint"
              )}
            >
              <span className="block text-body-sm font-semibold text-ink-950">{copy.name}</span>
              <span className="block text-caption text-ink-600">
                {copy.price} {copy.period}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-body-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {providers.map((p) => (
          <Button key={p} onClick={() => pay(p)} disabled={busy !== null} className="min-w-[10rem]">
            {busy === p ? <Loader2 size={18} className="animate-spin" /> : null}
            {l("{provider} orqali to‘lash", { provider: PROVIDER_LABEL[p] })}
          </Button>
        ))}
      </div>

      <p className="flex items-start gap-2 text-caption text-ink-500">
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        {l("Karta ma’lumotlari to‘lov tizimi sahifasida kiritiladi — VIZAR AI ularni ko‘rmaydi va saqlamaydi. Obuna viza berilishini kafolatlamaydi.")}
      </p>
    </section>
  );
}
