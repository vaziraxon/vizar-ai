"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  ADMIN_STATS,
  ADMIN_NAV,
  ADMIN_RECENT_USERS,
  ADMIN_FLAGGED_DOCS,
  ADMIN_SUPPORT_REQUESTS,
} from "@/data/mockData";

const USER_GROWTH = [42, 58, 65, 80, 74, 96, 110];
const STATUS_BREAKDOWN = [
  { label: "Tayyor", value: 38, color: "bg-success" },
  { label: "Tahlil qilinmoqda", value: 29, color: "bg-brand-500" },
  { label: "Konsultatsiya kerak", value: 18, color: "bg-warning" },
  { label: "Yakunlangan", value: 15, color: "bg-ink-400" },
];

export default function AdminPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const maxGrowth = Math.max(...USER_GROWTH);

  return (
    <div className="flex min-h-screen bg-surface-tint dark:bg-navy-950">
      {/* Admin sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-border bg-white py-6 lg:flex dark:border-white/10 dark:bg-navy-900">
        <div className="px-4 pb-6">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {ADMIN_NAV.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                i === 0
                  ? "flex items-center gap-3 rounded-xl bg-brand-gradient px-3 py-2.5 text-body-sm font-medium text-white shadow-glow"
                  : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/5"
              }
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </Link>
          ))}
        </nav>
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
              <nav className="flex flex-1 flex-col gap-1 px-3">
                {ADMIN_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-ink-700 hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/5"
                  >
                    <item.icon size={18} strokeWidth={2} />
                    {item.label}
                  </Link>
                ))}
              </nav>
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
          <p className="font-display text-body-sm font-semibold text-ink-900 dark:text-white">
            Admin panel
          </p>
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-display-sm text-ink-900 dark:text-white">
              Admin panel (demo)
            </h1>
            <p className="mt-1 mb-6 text-body-sm text-ink-600 dark:text-white/60">
              Namunaviy ma&apos;lumotlar — grant va investorlar uchun demo
              ko&apos;rinish.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {ADMIN_STATS.map((stat) => (
                <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* User growth chart (mock bars) */}
              <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
                <p className="mb-5 text-body-sm font-semibold text-ink-900 dark:text-white">
                  Foydalanuvchilar o&apos;sishi (namuna)
                </p>
                <div className="flex h-40 items-end gap-3">
                  {USER_GROWTH.map((v, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-md bg-brand-gradient"
                        style={{ height: `${(v / maxGrowth) * 100}%` }}
                      />
                      <span className="text-caption text-ink-400 dark:text-white/40">
                        {i + 1}-hafta
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application status chart */}
              <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
                <p className="mb-5 text-body-sm font-semibold text-ink-900 dark:text-white">
                  Arizalar holati bo&apos;yicha taqsimot (namuna)
                </p>
                <div className="space-y-3">
                  {STATUS_BREAKDOWN.map((s) => (
                    <div key={s.label}>
                      <div className="mb-1 flex items-center justify-between text-body-sm">
                        <span className="text-ink-700 dark:text-white/70">{s.label}</span>
                        <span className="font-semibold text-ink-900 dark:text-white">{s.value}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-muted dark:bg-white/10">
                        <div className={`h-full rounded-pill ${s.color}`} style={{ width: `${s.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
                <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
                  So&apos;nggi foydalanuvchilar
                </p>
                <ul className="space-y-3">
                  {ADMIN_RECENT_USERS.map((u) => (
                    <li key={u.email} className="text-body-sm">
                      <p className="font-medium text-ink-900 dark:text-white">{u.name}</p>
                      <p className="text-caption text-ink-400 dark:text-white/40">
                        {u.email} · {u.joined}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
                <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
                  Belgilangan hujjatlar
                </p>
                <ul className="space-y-3">
                  {ADMIN_FLAGGED_DOCS.map((d) => (
                    <li key={d.user + d.doc} className="text-body-sm">
                      <p className="font-medium text-ink-900 dark:text-white">
                        {d.user} — {d.doc}
                      </p>
                      <p className="text-caption text-ink-400 dark:text-white/40">
                        {d.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
                <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
                  Qo&apos;llab-quvvatlash so&apos;rovlari
                </p>
                <ul className="space-y-3">
                  {ADMIN_SUPPORT_REQUESTS.map((r) => (
                    <li key={r.user} className="flex items-center justify-between text-body-sm">
                      <div>
                        <p className="font-medium text-ink-900 dark:text-white">{r.user}</p>
                        <p className="text-caption text-ink-400 dark:text-white/40">
                          {r.subject}
                        </p>
                      </div>
                      <span className="rounded-pill bg-warning/10 px-2.5 py-1 text-caption font-semibold text-warning">
                        {r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
