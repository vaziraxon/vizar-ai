import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Pill, Stat, formatDate } from "@/components/knowledge/admin-ui";
import { availableProviders, paymentsConfig } from "@/lib/payments/config";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "To‘lovlar", robots: { index: false } };

const STATUS: Record<string, { label: string; tone: "green" | "gray" | "red" | "blue" }> = {
  pending: { label: "Kutilmoqda", tone: "blue" },
  paid: { label: "To‘langan", tone: "green" },
  cancelled: { label: "Bekor qilingan", tone: "gray" },
  refunded: { label: "Qaytarilgan", tone: "red" },
};
const som = (tiyin: number) => `${(tiyin / 100).toLocaleString("ru-RU").replace(/,/g, " ")} so‘m`;

type OrderRow = { id: string; user_id: string; plan: string; amount_tiyin: number; provider: string; status: string; created_at: string; paid_at: string | null };

/** Read-only list of online payment orders (supabase/payments.sql). */
export default async function PaymentsAdminPage() {
  const ctx = await getTestimonialEditorContext();
  const cfg = paymentsConfig();
  const providers = availableProviders(cfg);

  let body: ReactNode;
  if (!ctx.supabase || !ctx.isAdmin || !ctx.isEditor) {
    body = <p className="card p-5 text-body text-ink-700">Bu sahifa faqat sayt muharrirlari uchun.</p>;
  } else {
    const { data, error } = await ctx.supabase
      .from("payment_orders")
      .select("id, user_id, plan, amount_tiyin, provider, status, created_at, paid_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<OrderRow[]>();
    const list = data ?? [];
    const paid = list.filter((o) => o.status === "paid");
    body = error ? (
      <p className="card p-5 text-body-sm text-ink-800">
        To‘lov jadvallari hali bazada yo‘q (supabase/payments.sql qo‘llanmagan) yoki o‘qib bo‘lmadi.
      </p>
    ) : (
      <>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="To‘langan" value={paid.length} hint={som(paid.reduce((n, o) => n + Number(o.amount_tiyin), 0))} />
          <Stat label="Kutilmoqda" value={list.filter((o) => o.status === "pending").length} />
          <Stat label="Jami buyurtmalar" value={list.length} />
        </div>
        <ul className="mt-6 space-y-3">
          {list.length === 0 ? <li className="card p-5 text-body-sm text-ink-600">Hali buyurtma yo‘q.</li> : null}
          {list.map((o) => {
            const s = STATUS[o.status] ?? { label: o.status, tone: "gray" as const };
            return (
              <li key={o.id} className="card flex flex-wrap items-center justify-between gap-3 p-4 text-body-sm">
                <span className="min-w-0">
                  <span className="font-semibold text-ink-950">{o.plan}</span> · {som(Number(o.amount_tiyin))} · {o.provider}
                  <span className="block break-all font-mono text-caption text-ink-500">{o.id}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-caption text-ink-500">{formatDate(o.paid_at ?? o.created_at)}</span>
                  <Pill tone={s.tone}>{s.label}</Pill>
                </span>
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
          <h1 className="font-display text-[20px] font-bold text-ink-950">To‘lovlar (Payme / Click)</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-6 max-w-3xl text-body-sm text-ink-600">
          Holat:{" "}
          <strong>{cfg.enabled ? (providers.length ? `yoqilgan — ${providers.join(", ")}` : "yoqilgan, lekin kalitlar yo‘q") : "o‘chiq (PAYMENTS_ENABLED)"}</strong>.
          Obuna to‘lov tizimi serverimizga tasdiq yuborganda avtomatik ochiladi; qaytarish (refund) Payme/Click kabinetidan qilinadi va obunani yopadi.
          Sozlash: docs/payments-setup.md.
        </p>
        {body}
      </main>
    </div>
  );
}
