"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";

/** The free public tools, offered inside the dashboard. Taglines and points are Uzbek source for the phrase table. */
type ToolKey = "visaPhoto" | "visaLetters" | "visaTiming" | "schengenCalc";

const DASHBOARD_TOOLS: { key: ToolKey; href: string; emoji: string; tint: string; tagline: string; points: [string, string, string] }[] = [
  {
    key: "visaPhoto",
    href: "/dashboard/tools/photo",
    emoji: "📸",
    tint: "from-brand-500 to-violet-600",
    tagline: "Rasmingizni bir daqiqada viza o'lchamiga keltiring",
    points: [
      "Shengen, AQSH, Kanada, Yaponiya va Koreya o'lchamlari",
      "10×15 varaqda 8 tagacha rasm — chop etish arzonroq",
      "Rasm serverga yuklanmaydi",
    ],
  },
  {
    key: "visaLetters",
    href: "/dashboard/tools/letters",
    emoji: "📝",
    tint: "from-violet-500 to-fuchsia-500",
    tagline: "Qo'shimcha xat, ma'lumotnoma va homiylik xati — bir necha daqiqada",
    points: ["Ingliz, nemis yoki rus tilida", "Germaniya elchixonasi ro'yxatidagi maydonlar bilan", "Chop eting yoki PDF qilib saqlang"],
  },
  {
    key: "visaTiming",
    href: "/dashboard/tools/timing",
    emoji: "🗓️",
    tint: "from-emerald-500 to-teal-600",
    tagline: "Ariza topshirish muddatini o'tkazib yubormang",
    points: ["Qachondan topshirish mumkinligi va oxirgi tavsiya etilgan kun", "Pasport muddatini tekshirish", "Eslatmalar kalendaringizga"],
  },
  {
    key: "schengenCalc",
    href: "/dashboard/tools/schengen",
    emoji: "🧮",
    tint: "from-amber-400 to-orange-500",
    tagline: "Shengen hududida qancha kun qolganini aniq biling",
    points: ["Barcha safarlaringizni kiriting", "Qolgan kunlar va yangi safar uchun eng uzoq muddat", "Safarlar shu brauzerda saqlanadi"],
  },
];

/** /dashboard/tools: one promo card per tool */
export function ToolCards() {
  const l = useL();
  const site = useSite();
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {DASHBOARD_TOOLS.map((t) => (
        <Link key={t.key} href={t.href} className="card group overflow-hidden rounded-[28px] transition-shadow duration-200 hover:shadow-float">
          <div className={cn("relative overflow-hidden bg-gradient-to-br px-6 pb-5 pt-6 text-white", t.tint)}>
            <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <span aria-hidden="true" className="relative block text-[40px] leading-none">
              {t.emoji}
            </span>
            <p className="relative mt-3 font-display text-[1.35rem] font-bold leading-tight">{site[t.key].title}</p>
            <p className="relative mt-1 text-body-sm font-medium text-white/90">{l(t.tagline)}</p>
          </div>
          <div className="px-6 pb-6 pt-4">
            <ul className="space-y-2">
              {t.points.map((p) => (
                <li key={p} className="flex gap-2 text-body-sm text-ink-700">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                  {l(p)}
                </li>
              ))}
            </ul>
            <span className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-700 transition-[gap] duration-200 group-hover:gap-2.5">
              {l("Ochish")} <ArrowRight size={15} aria-hidden="true" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Banner on the dashboard overview that leads to the tools */
export function ToolsPromo() {
  const l = useL();
  return (
    <Link
      href="/dashboard/tools"
      className="group relative mt-6 flex flex-col gap-4 overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-600 to-violet-600 p-6 text-white shadow-float sm:flex-row sm:items-center sm:p-7"
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="relative min-w-0 flex-1">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]">
          <Sparkles size={12} aria-hidden="true" /> {l("Yangilik")}
        </span>
        <p className="mt-3 font-display text-[1.4rem] font-bold leading-tight">{l("4 ta vosita endi kabinetingizda")}</p>
        <p className="mt-1 text-body-sm text-white/85">{l("Viza foto, xatlar, muddat rejalashtiruvchi va Shengen kalkulyatori — hammasi bir joyda.")}</p>
        <p aria-hidden="true" className="mt-3 text-[22px] tracking-[0.3em]">
          📸📝🗓️🧮
        </p>
      </div>
      <span className="relative inline-flex shrink-0 items-center gap-1.5 self-start rounded-pill bg-white px-4 py-2 text-body-sm font-semibold text-brand-700 transition-[gap] duration-200 group-hover:gap-2.5 sm:self-center">
        {l("Vositalarni ko'rish")} <ArrowRight size={15} aria-hidden="true" />
      </span>
    </Link>
  );
}

/** A free tool inside the dashboard frame, with a way back to the list */
export function DashboardToolPage({ tool, children }: { tool: ToolKey; children: ReactNode }) {
  const l = useL();
  const site = useSite();
  return (
    <DashboardShell
      title={<>{site[tool].title}</>}
      subtitle={<>{site[tool].subtitle}</>}
      actions={
        <Link href="/dashboard/tools" className="btn-secondary btn-md">
          <ArrowLeft size={16} aria-hidden="true" /> {l("Barcha vositalar")}
        </Link>
      }
    >
      {children}
    </DashboardShell>
  );
}
