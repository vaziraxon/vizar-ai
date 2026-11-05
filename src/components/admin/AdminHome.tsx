"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Crown, FileText, FolderOpen, Menu, MessageSquareQuote, UserCog, UserPlus, Users, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { StatCard } from "@/components/dashboard/StatCard";
import { ADMIN_NAV } from "@/data/mockData";

/** Live counts from public.admin_site_stats() (supabase/admin_stats.sql) */
export interface AdminStats {
  users: number;
  users_7d: number;
  applications: number;
  documents: number;
  consultations_open: number;
  subscription_requests_pending: number;
  subscriptions_active: number;
  testimonials_published: number;
  testimonials_total: number;
}

/** Why there are no numbers: Supabase missing, not a site editor, or the SQL not applied yet */
export type AdminStatsState = { ok: true; stats: AdminStats } | { ok: false; reason: "not_configured" | "not_editor" | "unavailable" };

const NOTICE: Record<Exclude<AdminStatsState, { ok: true }>["reason"], string> = {
  not_configured: "Supabase sozlanmagan — raqamlar yo‘q.",
  not_editor: "Raqamlarni ko‘rish uchun emailingiz public.site_editors jadvalida bo‘lishi kerak.",
  unavailable: "Raqamlarni o‘qib bo‘lmadi: Supabase SQL Editor’da supabase/admin_stats.sql ni qo‘llang.",
};

export function AdminHome({ state }: { state: AdminStatsState }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const s = state.ok ? state.stats : null;
  const n = (v: number | undefined) => (v === undefined ? "—" : v.toLocaleString("uz-UZ"));

  const sections = [
    { href: "/admin/users", icon: Users, title: "Foydalanuvchilar", note: s ? `${n(s.users)} ta, oxirgi 7 kunda +${n(s.users_7d)}` : "Kim ro‘yxatdan o‘tgan va qay darajada ishlayapti" },
    { href: "/admin/consultations", icon: UserCog, title: "Konsultatsiya so‘rovlari", note: s ? `${n(s.consultations_open)} ta javob kutmoqda` : "" },
    { href: "/admin/subscriptions", icon: Crown, title: "Obuna so‘rovlari", note: s ? `${n(s.subscription_requests_pending)} ta kutilmoqda` : "" },
    {
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
      title: "Mijozlar sharhlari",
      note: s ? `${n(s.testimonials_published)} ta saytda, jami ${n(s.testimonials_total)}` : "",
    },
    { href: "/admin/knowledge", icon: BookOpen, title: "Kitob (bilimlar bazasi)", note: "Boblar, bo‘limlar, davlat qoidalari" },
  ];

  const nav = (onNavigate?: () => void) =>
    ADMIN_NAV.map((item, i) => (
      <Link
        key={item.label}
        href={item.href}
        onClick={onNavigate}
        className={
          i === 0
            ? "flex items-center gap-3 rounded-xl bg-night px-3 py-2.5 text-body-sm font-medium text-white"
            : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/5"
        }
      >
        <item.icon size={18} strokeWidth={2} />
        {item.label}
      </Link>
    ));

  return (
    <div className="flex min-h-screen bg-surface-tint dark:bg-navy-950">
      {/* Admin sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-border bg-white py-6 lg:flex dark:border-white/10 dark:bg-navy-900">
        <div className="px-4 pb-6">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">{nav()}</nav>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white py-6 lg:hidden dark:bg-navy-900"
            >
              <div className="flex items-center justify-between px-4 pb-6">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Yopish"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 dark:text-white/70"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 px-3">{nav(() => setMobileOpen(false))}</nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-surface-border bg-white px-4 dark:border-white/10 dark:bg-navy-900 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menyuni ochish"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 dark:text-white/70"
          >
            <Menu size={20} />
          </button>
          <p className="font-display text-body-sm font-semibold text-ink-900 dark:text-white">Admin panel</p>
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-display-sm text-ink-900 dark:text-white">Admin panel</h1>
            <p className="mb-6 mt-1 text-body-sm text-ink-600 dark:text-white/60">Saytning hozirgi holati — bazadagi haqiqiy sonlar.</p>

            {!state.ok ? (
              <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-body-sm text-ink-800 dark:border-amber-400/20 dark:bg-amber-400/10">
                {NOTICE[state.reason]}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Foydalanuvchilar" value={n(s?.users)} />
              <StatCard icon={UserPlus} label="Oxirgi 7 kunda qo‘shilgan" value={n(s?.users_7d)} />
              <StatCard icon={FileText} label="Arizalar" value={n(s?.applications)} />
              <StatCard icon={FolderOpen} label="Yuklangan hujjatlar" value={n(s?.documents)} />
              <StatCard icon={UserCog} label="Ochiq konsultatsiya so‘rovlari" value={n(s?.consultations_open)} />
              <StatCard icon={Crown} label="Kutilayotgan obuna so‘rovlari" value={n(s?.subscription_requests_pending)} />
              <StatCard icon={BookOpen} label="Faol obunalar" value={n(s?.subscriptions_active)} />
              <StatCard icon={MessageSquareQuote} label="Saytdagi sharhlar" value={n(s?.testimonials_published)} />
            </div>

            <h2 className="mb-4 mt-10 font-display text-body-lg font-bold text-ink-950 dark:text-white">Bo‘limlar</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {sections.map((sec) => (
                <Link
                  key={sec.href}
                  href={sec.href}
                  className="card group flex items-center gap-4 p-5 transition-shadow hover:shadow-card-hover dark:border-white/10 dark:bg-navy-800"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-white/10 dark:text-violet-300">
                    <sec.icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink-950 dark:text-white">{sec.title}</span>
                    {sec.note ? <span className="block text-body-sm text-ink-600 dark:text-white/60">{sec.note}</span> : null}
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
