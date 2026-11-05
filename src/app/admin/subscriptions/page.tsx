import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Notice, Pill, Stat, formatDate } from "@/components/knowledge/admin-ui";
import { approveSubscriptionRequestAction, declineSubscriptionRequestAction } from "@/lib/actions/subscription-requests";
import { PLAN_DAYS, isSubscriptionPlan } from "@/lib/dashboard/subscription-plans";
import { SITE_CONTENT } from "@/lib/i18n/site";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";
import type { SubscriptionRequestRow } from "@/lib/data/subscriptions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Obuna so‘rovlari", robots: { index: false } };

const STATUS: Record<string, { label: string; tone: "green" | "gray" | "red" | "blue" }> = {
  pending: { label: "Kutilmoqda", tone: "blue" },
  approved: { label: "Faollashtirildi", tone: "green" },
  declined: { label: "Rad etildi", tone: "red" },
  cancelled: { label: "Foydalanuvchi bekor qildi", tone: "gray" },
};

const planLabel = (plan: string) => {
  if (!isSubscriptionPlan(plan)) return plan;
  const copy = SITE_CONTENT.uz.pricing.plans[plan];
  return `${copy.name} · ${copy.price} ${copy.period}`;
};

export default async function SubscriptionRequestsPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const ctx = await getTestimonialEditorContext();

  let body: ReactNode;
  if (!ctx.supabase) {
    body = <p className="card p-5 text-body text-ink-700">Supabase sozlanmagan.</p>;
  } else {
    const { data, error } = await ctx.supabase
      .from("subscription_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<SubscriptionRequestRow[]>();
    const list = data ?? [];

    body = error ? (
      <p className="card p-5 text-body-sm text-ink-800">So‘rovlarni o‘qib bo‘lmadi: {error.message}</p>
    ) : (
      <>
        {!ctx.isEditor ? (
          <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-800 dark:border-amber-400/20 dark:bg-amber-400/10">
            Boshqa foydalanuvchilarning so‘rovlarini ko‘rish uchun Supabase SQL Editor’da:{" "}
            <code className="break-all">
              insert into public.site_editors (email) values (&apos;{ctx.email ?? "email@example.com"}&apos;);
            </code>
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Kutilmoqda" value={list.filter((r) => r.status === "pending").length} hint="To‘lov kutilmoqda" />
          <Stat label="Faollashtirildi" value={list.filter((r) => r.status === "approved").length} />
          <Stat label="Jami" value={list.length} />
        </div>

        <ul className="mt-6 space-y-4">
          {list.length === 0 ? <li className="card p-5 text-body-sm text-ink-600">Hali so‘rov yo‘q.</li> : null}
          {list.map((r) => {
            const status = STATUS[r.status] ?? { label: r.status, tone: "gray" as const };
            const days = isSubscriptionPlan(r.plan) ? PLAN_DAYS[r.plan] : null;
            return (
              <li key={r.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink-950">{planLabel(r.plan)}</p>
                  <Pill tone={status.tone}>{status.label}</Pill>
                  <span className="text-caption text-ink-500">{formatDate(r.created_at)}</span>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-1 text-body-sm sm:grid-cols-[auto_1fr]">
                  <dt className="text-ink-500">Aloqa</dt>
                  <dd className="break-all font-medium text-ink-900">{r.contact}</dd>
                  <dt className="text-ink-500">Foydalanuvchi ID</dt>
                  <dd className="break-all font-mono text-caption text-ink-700">{r.user_id}</dd>
                </dl>
                {r.message ? <p className="mt-3 whitespace-pre-line rounded-xl bg-surface-tint p-3 text-body-sm text-ink-800">{r.message}</p> : null}

                {ctx.isEditor && r.status === "pending" ? (
                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-surface-border pt-4">
                    <form action={approveSubscriptionRequestAction} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="id" value={r.id} />
                      <label className="text-caption text-ink-600">
                        Tugash sanasi {days ? `(bo‘sh qolsa — ${days} kun)` : "(VIP uchun shart)"}
                        <input type="date" name="expires_at" required={!days} className="input mt-1 h-10 py-1" />
                      </label>
                      <button type="submit" className="btn btn-primary btn-sm">
                        To‘lov olindi — faollashtirish
                      </button>
                    </form>
                    <form action={declineSubscriptionRequestAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="btn btn-secondary btn-sm">
                        Rad etish
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface-tint dark:bg-navy-950">
      <header className="border-b border-surface-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <Link href="/admin" className="inline-flex items-center gap-1 text-body-sm font-medium text-ink-600 hover:text-ink-900">
            <ArrowLeft size={16} /> Admin
          </Link>
          <span className="text-ink-300">/</span>
          <h1 className="font-display text-[20px] font-bold text-ink-950">Obuna so‘rovlari</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Notice ok={searchParams.ok} error={searchParams.error} />
        <p className="mb-6 max-w-3xl text-body-sm text-ink-600">
          Foydalanuvchilar “Obuna” bo‘limida qoldirgan so‘rovlar. Onlayn to‘lov hali ulanmagan: foydalanuvchi bilan u yozgan aloqa orqali
          bog‘laning, to‘lovni qabul qiling, keyin “faollashtirish”ni bosing — kitobning to‘liq matni shu zahoti ochiladi va
          foydalanuvchiga bildirishnoma boradi. Yangi so‘rov haqida xat kelmaydi — bu sahifani o‘zingiz tekshirib turing.
        </p>
        {body}
      </main>
    </div>
  );
}
