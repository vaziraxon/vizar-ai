"use client";

import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { FinalCTA } from "@/components/site/FinalCTA";
import { useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { TOOL_PROMOS, type ToolKey } from "@/lib/dashboard/tool-promos";
import { cn } from "@/lib/utils";

const DECOR: Record<ToolKey, [string, string, string]> = {
  visaPhoto: ["🛂", "🖼️", "✂️"],
  visaLetters: ["✉️", "🏢", "🤝"],
  visaTiming: ["✈️", "⏳", "📅"],
  schengenCalc: ["🇪🇺", "📅", "✈️"],
};

/**
 * The public page of a tool that works only in the dashboard: what it does,
 * three real benefits, and the way in. "Open in my account" goes to the
 * dashboard page; signed out, the middleware sends the visitor to log in first
 * and back there after.
 */
export function ToolPromo({ tool }: { tool: ToolKey }) {
  const l = useL();
  const site = useSite();
  const c = site[tool];
  const t = TOOL_PROMOS.find((x) => x.key === tool)!;

  return (
    <>
      <PageHero emoji={t.emoji} decor={DECOR[tool]} eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />

      <section className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="container-page grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div className="card overflow-hidden rounded-[28px]">
            <div className={cn("relative overflow-hidden bg-gradient-to-br px-7 pb-6 pt-7 text-white", t.tint)}>
              <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
              <span aria-hidden="true" className="relative block text-[48px] leading-none">
                {t.emoji}
              </span>
              <p className="relative mt-3 font-display text-[1.5rem] font-bold leading-tight">{l(t.tagline)}</p>
            </div>
            <ul className="space-y-3 px-7 py-6">
              {t.points.map((p) => (
                <li key={p} className="flex gap-2.5 text-body text-ink-800">
                  <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                  {l(p)}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-pill bg-brand-50 px-3 py-1 text-caption font-semibold text-brand-800 dark:text-brand-200">
              <Lock size={13} aria-hidden="true" /> {l("Bu funksiya shaxsiy kabinetda ishlaydi")}
            </p>
            <h2 className="luxe-firm font-luxe text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] text-ink-950 sm:text-[2rem]">
              {l("Kabinetingizda oching va hoziroq foydalaning")}
            </h2>
            <p className="text-body text-ink-600">{l("Ro'yxatdan o'ting yoki kiring — {name} shu zahoti ochiladi.", { name: c.title })}</p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link href={t.href} className="btn-primary btn-lg">
                {l("Kabinetda ochish")} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/register" className="btn-secondary btn-lg">
                {l("Ro'yxatdan o'tish")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
