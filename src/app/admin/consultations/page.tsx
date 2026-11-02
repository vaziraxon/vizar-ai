import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Notice, Pill, Stat, formatDate } from "@/components/knowledge/admin-ui";
import { setConsultationRequestStatusAction } from "@/lib/actions/consultation-requests";
import { readRequest } from "@/lib/dashboard/consultation-request";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";
import type { ConsultationRow } from "@/lib/data/consultations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Konsultatsiya so‘rovlari", robots: { index: false } };

const STATUS: Record<string, { label: string; tone: "green" | "gray" | "red" | "blue" }> = {
  booked: { label: "Kutilmoqda", tone: "blue" },
  completed: { label: "Bog‘lanildi", tone: "green" },
  cancelled: { label: "Foydalanuvchi bekor qildi", tone: "gray" },
};

export default async function ConsultationRequestsPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  // Site editors manage testimonials and consultation requests alike.
  const ctx = await getTestimonialEditorContext();

  let body: ReactNode;
  if (!ctx.supabase) {
    body = <p className="card p-5 text-body text-ink-700">Supabase sozlanmagan.</p>;
  } else {
    const { data, error } = await ctx.supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .returns<ConsultationRow[]>();
    const list = data ?? [];
    const open = list.filter((r) => r.status === "booked").length;

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
          <Stat label="Kutilmoqda" value={open} hint="Javob berilmagan" />
          <Stat label="Bog‘lanildi" value={list.filter((r) => r.status === "completed").length} />
          <Stat label="Jami" value={list.length} />
        </div>

        <ul className="mt-6 space-y-4">
          {list.length === 0 ? <li className="card p-5 text-body-sm text-ink-600">Hali so‘rov yo‘q.</li> : null}
          {list.map((r) => {
            const request = readRequest(r.notes, r.specialist_name);
            const status = STATUS[r.status] ?? { label: r.status, tone: "gray" as const };
            return (
              <li key={r.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink-950">{request.topic}</p>
                  <Pill tone={status.tone}>{status.label}</Pill>
                  <span className="text-caption text-ink-500">{formatDate(r.created_at)}</span>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-1 text-body-sm sm:grid-cols-[auto_1fr]">
                  <dt className="text-ink-500">Aloqa</dt>
                  <dd className="break-all font-medium text-ink-900">{request.contact || "—"}</dd>
                  <dt className="text-ink-500">Qulay vaqt</dt>
                  <dd className="text-ink-800">{request.preferredTime || "—"}</dd>
                </dl>
                {request.message ? (
                  <p className="mt-3 whitespace-pre-line rounded-xl bg-surface-tint p-3 text-body-sm text-ink-800">{request.message}</p>
                ) : null}

                {ctx.isEditor && r.status !== "cancelled" ? (
                  <form action={setConsultationRequestStatusAction} className="mt-4 border-t border-surface-border pt-4">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value={r.status === "booked" ? "completed" : "booked"} />
                    <button type="submit" className="btn btn-secondary btn-sm">
                      {r.status === "booked" ? "Bog‘lanildi deb belgilash" : "Qayta ochish"}
                    </button>
                  </form>
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
          <h1 className="font-display text-[20px] font-bold text-ink-950">Konsultatsiya so‘rovlari</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Notice ok={searchParams.ok} error={searchParams.error} />
        <p className="mb-6 max-w-3xl text-body-sm text-ink-600">
          Foydalanuvchilar “Mutaxassislar” bo‘limida qoldirgan so‘rovlar. Ular bilan o‘zlari yozgan aloqa orqali bog‘laning, keyin
          “Bog‘lanildi” deb belgilang. Yangi so‘rov haqida xat kelmaydi — bu sahifani o‘zingiz tekshirib turing.
        </p>
        {body}
      </main>
    </div>
  );
}
