import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Pill, Stat, formatDate } from "@/components/knowledge/admin-ui";
import { getTestimonialEditorContext } from "@/lib/testimonials/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Foydalanuvchilar", robots: { index: false } };

/** One row of public.admin_list_users() (supabase/admin_users.sql) */
interface AdminUserRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  applications: number;
  latest_destination: string | null;
  latest_visa_type: string | null;
  assessments: number;
  documents: number;
  interview_sessions: number;
  tasks_done: number;
  tasks_total: number;
  consultations: number;
  active_plan: string | null;
}

const DAY = 24 * 60 * 60 * 1000;

/** How far a user got, from what they actually did */
function stage(u: AdminUserRow): { label: string; tone: "green" | "gray" | "red" | "blue" } {
  if (u.documents > 0 || u.interview_sessions > 0 || u.tasks_done > 0) return { label: "Faol tayyorlanmoqda", tone: "green" };
  if (u.assessments > 0 || u.applications > 0) return { label: "Tahlil qilgan", tone: "blue" };
  if (!u.email_confirmed) return { label: "Email tasdiqlanmagan", tone: "red" };
  return { label: "Faqat ro‘yxatdan o‘tgan", tone: "gray" };
}

export default async function AdminUsersPage() {
  // Site editors read this list like the other admin pages.
  const ctx = await getTestimonialEditorContext();

  let body: ReactNode;
  if (!ctx.supabase) {
    body = <p className="card p-5 text-body text-ink-700">Supabase sozlanmagan.</p>;
  } else if (!ctx.isEditor) {
    body = (
      <p className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-800 dark:border-amber-400/20 dark:bg-amber-400/10">
        Foydalanuvchilarni ko‘rish uchun emailingiz public.site_editors jadvalida bo‘lishi kerak.
      </p>
    );
  } else {
    const { data, error } = await ctx.supabase.rpc("admin_list_users", { p_limit: 500 });
    const list = (data ?? []) as AdminUserRow[];
    const now = Date.now();
    const signedInWeek = list.filter((u) => u.last_sign_in_at && now - new Date(u.last_sign_in_at).getTime() < 7 * DAY).length;
    const joinedWeek = list.filter((u) => now - new Date(u.created_at).getTime() < 7 * DAY).length;
    const active = list.filter((u) => stage(u).tone === "green").length;

    body = error ? (
      <p className="card p-5 text-body-sm text-ink-800">
        Ro‘yxatni o‘qib bo‘lmadi: Supabase SQL Editor’da supabase/admin_users.sql ni qo‘llang. ({error.message})
      </p>
    ) : (
      <>
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Jami" value={list.length} />
          <Stat label="7 kunda qo‘shilgan" value={joinedWeek} />
          <Stat label="7 kunda kirgan" value={signedInWeek} />
          <Stat label="Faol tayyorlanmoqda" value={active} hint="Hujjat, mashq yoki vazifa bor" />
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-surface">
          <table className="w-full min-w-[920px] text-left text-body-sm">
            <thead className="border-b border-surface-border bg-surface-tint text-caption font-semibold uppercase tracking-[0.06em] text-ink-500">
              <tr>
                <th className="px-4 py-3">Foydalanuvchi</th>
                <th className="px-3 py-3">Ro‘yxatdan o‘tgan</th>
                <th className="px-3 py-3">Oxirgi kirish</th>
                <th className="px-3 py-3">Holat</th>
                <th className="px-3 py-3">Ariza</th>
                <th className="px-3 py-3 text-center">Tahlil</th>
                <th className="px-3 py-3 text-center">Hujjat</th>
                <th className="px-3 py-3 text-center">Suhbat</th>
                <th className="px-3 py-3 text-center">Vazifalar</th>
                <th className="px-3 py-3 text-center">Konsult.</th>
                <th className="px-3 py-3">Obuna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-5 text-ink-600">
                    Hali foydalanuvchi yo‘q.
                  </td>
                </tr>
              ) : null}
              {list.map((u) => {
                const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
                const st = stage(u);
                return (
                  <tr key={u.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-950">{name || "—"}</p>
                      <p className="break-all text-caption text-ink-500">{u.email ?? "—"}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-700">{formatDate(u.created_at)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-700">{u.last_sign_in_at ? formatDate(u.last_sign_in_at) : "—"}</td>
                    <td className="px-3 py-3">
                      <Pill tone={st.tone}>{st.label}</Pill>
                    </td>
                    <td className="px-3 py-3 text-ink-800">
                      {u.applications > 0 ? (
                        <>
                          {u.latest_destination ?? "—"}
                          <span className="block text-caption text-ink-500">
                            {u.latest_visa_type ?? ""}
                            {u.applications > 1 ? ` · ${u.applications} ta` : ""}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">{u.assessments}</td>
                    <td className="px-3 py-3 text-center">{u.documents}</td>
                    <td className="px-3 py-3 text-center">{u.interview_sessions}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-center">{u.tasks_total > 0 ? `${u.tasks_done}/${u.tasks_total}` : "—"}</td>
                    <td className="px-3 py-3 text-center">{u.consultations}</td>
                    <td className="px-3 py-3 text-ink-800">{u.active_plan ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-caption text-ink-500">
          Saralash: oxirgi kirgan birinchi. Checklist belgilari va ba’zi mashq natijalari foydalanuvchining brauzerida saqlanadi — ular bu yerda
          ko‘rinmaydi.
        </p>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface-tint dark:bg-navy-950">
      <header className="border-b border-surface-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <Link href="/admin" className="inline-flex items-center gap-1 text-body-sm font-medium text-ink-600 hover:text-ink-900">
            <ArrowLeft size={16} /> Admin
          </Link>
          <span className="text-ink-300">/</span>
          <h1 className="font-display text-[20px] font-bold text-ink-950">Foydalanuvchilar</h1>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="mb-6 max-w-3xl text-body-sm text-ink-600">
          Kim ro‘yxatdan o‘tgan va qay darajada ishlayapti: arizalar, tahlillar, yuklangan hujjatlar, suhbat mashqlari va vazifalar soni. Hujjat
          matnlari, javoblar va aloqa ma’lumotlari bu yerda ko‘rsatilmaydi.
        </p>
        {body}
      </main>
    </div>
  );
}
