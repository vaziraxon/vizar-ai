import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Notice, Stat, formatDate } from "@/components/knowledge/admin-ui";
import { addBetaUserAction, removeBetaUserAction, saveAiSettingsAction } from "@/lib/actions/ai-beta";
import { adminDb, getAiSettings, monthSpend } from "@/lib/ai/beta";
import { CLAUDE_DAILY_LIMIT, VOICE_WEEKLY_SECONDS, tashkentWeekStart } from "@/lib/ai/limits";
import { VOICE_MODELS, voicePlanPerMinute } from "@/lib/ai/pricing";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI beta", robots: { index: false } };

const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;
const minutes = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/**
 * The AI beta for up to 25 users: who is in it, the monthly budget, which
 * voice model runs, and what Claude and OpenAI cost so far this month.
 */
export default async function AiBetaAdminPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const ctx = await getTestimonialEditorContext();
  const db = adminDb();

  let body: ReactNode;
  if (!ctx.isAdmin || !ctx.isEditor) {
    body = <p className="card p-5 text-body text-ink-700">Bu sahifa faqat sayt muharrirlari uchun.</p>;
  } else if (!db) {
    body = <p className="card p-5 text-body text-ink-700">Server kaliti (SUPABASE_SERVICE_ROLE_KEY) sozlanmagan.</p>;
  } else {
    const now = new Date();
    const [settings, spend, betaRes, weekRes, usageRes] = await Promise.all([
      getAiSettings(db),
      monthSpend(db, now),
      db.from("ai_beta_users").select("user_id, note, added_at").order("added_at"),
      db
        .from("voice_sessions")
        .select("user_id, seconds_used, started_at, deadline_at, ended_at")
        .gte("started_at", tashkentWeekStart(now).toISOString()),
      db.from("ai_usage").select("provider, feature, cost_usd, seconds, created_at").order("created_at", { ascending: false }).limit(30),
    ]);
    const { data: usersPage } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
    const emailOf = new Map((usersPage?.users ?? []).map((u) => [u.id, u.email ?? "—"]));
    const beta = betaRes.data ?? [];
    const weekSeconds = new Map<string, number>();
    for (const s of weekRes.data ?? []) {
      weekSeconds.set(s.user_id, (weekSeconds.get(s.user_id) ?? 0) + (s.seconds_used ?? 0));
    }
    const left = Math.max(0, settings.monthly_budget_usd - spend.total);
    const voiceRate = voicePlanPerMinute(settings.voice_model);

    body = (
      <>
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Beta foydalanuvchilar" value={`${beta.length} / 25`} />
          <Stat label="Bu oy jami" value={usd(spend.total)} hint={`Byudjet ${usd(settings.monthly_budget_usd)} · qoldi ${usd(left)}`} />
          <Stat label="Claude (Anthropic)" value={usd(spend.anthropic)} hint={`${CLAUDE_DAILY_LIMIT} so‘rov / kun / kishi`} />
          <Stat label="Ovoz (OpenAI)" value={usd(spend.openai)} hint={`${VOICE_WEEKLY_SECONDS / 60} daqiqa / hafta / kishi`} />
        </div>

        <section className="card mt-6 p-5">
          <h2 className="font-semibold text-ink-950">Sozlamalar</h2>
          <form action={saveAiSettingsAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-body-sm text-ink-700">
              Oylik byudjet ($) — yetganda yangi AI so‘rov va suhbatlar to‘xtaydi
              <input name="monthly_budget_usd" type="number" min={0} max={1000} step="0.01" defaultValue={settings.monthly_budget_usd} className="input mt-1 h-11" />
            </label>
            <label className="text-body-sm text-ink-700">
              Ovoz modeli
              <select name="voice_model" defaultValue={settings.voice_model} className="input mt-1 h-11">
                {VOICE_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m} — ~{usd(voicePlanPerMinute(m))}/daq
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-[44px] items-center gap-2 text-body-sm text-ink-800">
              <input type="checkbox" name="claude_enabled" defaultChecked={settings.claude_enabled} className="h-5 w-5" /> Claude yozma maslahatchi yoqilgan
            </label>
            <label className="flex min-h-[44px] items-center gap-2 text-body-sm text-ink-800">
              <input type="checkbox" name="voice_enabled" defaultChecked={settings.voice_enabled} className="h-5 w-5" /> Ovozli suhbat yoqilgan
            </label>
            <p className="text-caption text-ink-500 sm:col-span-2">
              Rejalashtirish: 25 kishi × 15 daqiqa × ~{usd(voiceRate)}/daq ≈ {usd(25 * 15 * voiceRate)} haftasiga (ovoz, eng yuqori taxmin).
            </p>
            <button type="submit" className="btn-primary btn-md w-fit">Saqlash</button>
          </form>
        </section>

        <section className="card mt-6 p-5">
          <h2 className="font-semibold text-ink-950">Beta foydalanuvchilar ({beta.length}/25)</h2>
          <form action={addBetaUserAction} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="min-w-[14rem] flex-1 text-body-sm text-ink-700">
              Ro‘yxatdan o‘tgan foydalanuvchi emaili
              <input name="email" type="email" required className="input mt-1 h-11" />
            </label>
            <label className="min-w-[10rem] flex-1 text-body-sm text-ink-700">
              Izoh (ixtiyoriy)
              <input name="note" maxLength={200} className="input mt-1 h-11" />
            </label>
            <button type="submit" className="btn-primary btn-md" disabled={beta.length >= 25}>
              Qo‘shish
            </button>
          </form>
          <ul className="mt-4 space-y-2">
            {beta.length === 0 ? <li className="text-body-sm text-ink-600">Hali hech kim qo‘shilmagan.</li> : null}
            {beta.map((b) => (
              <li key={b.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-tint px-4 py-2.5 text-body-sm">
                <span className="min-w-0 break-all text-ink-900">
                  {emailOf.get(b.user_id) ?? b.user_id}
                  {b.note ? <span className="text-ink-500"> · {b.note}</span> : null}
                </span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-ink-600">ovoz bu hafta: {minutes(weekSeconds.get(b.user_id) ?? 0)}</span>
                  <form action={removeBetaUserAction}>
                    <input type="hidden" name="user_id" value={b.user_id} />
                    <button type="submit" className="min-h-[44px] px-2 text-caption font-semibold text-red-600 hover:underline">
                      Chiqarish
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card mt-6 p-5">
          <h2 className="font-semibold text-ink-950">So‘nggi AI xarajatlari</h2>
          <ul className="mt-3 space-y-1.5 text-body-sm">
            {(usageRes.data ?? []).length === 0 ? <li className="text-ink-600">Hali xarajat yo‘q.</li> : null}
            {(usageRes.data ?? []).map((u, i) => (
              <li key={i} className="flex flex-wrap justify-between gap-2 rounded-xl bg-surface-tint px-4 py-2">
                <span className="text-ink-700">
                  {formatDate(u.created_at)} · {u.provider} · {u.feature}
                  {u.seconds ? ` · ${minutes(u.seconds)}` : ""}
                </span>
                <span className="font-semibold tabular-nums text-ink-950">{usd(Number(u.cost_usd) || 0)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-caption text-ink-500">Bu bizning hisobimiz (narxlar ro‘yxati bo‘yicha). Aniq hisobni Anthropic va OpenAI kabinetidan tekshiring.</p>
        </section>
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
          <h1 className="font-display text-[20px] font-bold text-ink-950">AI beta (25 kishi)</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Notice ok={searchParams.ok} error={searchParams.error} />
        <p className="mb-6 max-w-3xl text-body-sm text-ink-600">
          Claude yozma maslahatchi (kuniga 20 so‘rov) va OpenAI ovozli suhbat (haftasiga 15 daqiqa) — taklif qilingan 25 kishi uchun bepul beta.
          Pullik obuna va to‘lov yoqilmagan. Ovoz va suhbat matni saqlanmaydi; faqat vaqt, xarajat va yakuniy baho saqlanadi.
        </p>
        {body}
      </main>
    </div>
  );
}
