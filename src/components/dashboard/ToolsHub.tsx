"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calculator, CalendarClock, Camera, Check, FilePen, type LucideIcon } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { TOOL_PROMOS, type ToolKey } from "@/lib/dashboard/tool-promos";
import { cn } from "@/lib/utils";

const TOOL_ICON: Record<ToolKey, LucideIcon> = { visaPhoto: Camera, visaLetters: FilePen, visaTiming: CalendarClock, schengenCalc: Calculator };

function ToolIcon({ tool }: { tool: ToolKey }) {
  const Icon = TOOL_ICON[tool];
  return <Icon aria-hidden="true" size={32} strokeWidth={1.6} className="relative" />;
}

/** /dashboard/tools: one promo card per tool */
export function ToolCards() {
  const l = useL();
  const site = useSite();
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {TOOL_PROMOS.map((t) => (
        <Link key={t.key} href={t.href} className="card group overflow-hidden rounded-[28px] transition-shadow duration-200 hover:shadow-float">
          <div className={cn("relative overflow-hidden bg-gradient-to-br px-6 pb-5 pt-6 text-white", t.tint)}>
            <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <ToolIcon tool={t.key} />
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
          <ArrowLeft size={16} aria-hidden="true" /> {l("Ro'yxatga qaytish")}
        </Link>
      }
    >
      {children}
    </DashboardShell>
  );
}
