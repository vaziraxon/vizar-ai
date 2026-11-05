"use client";

import { CheckCircle2, Circle, Loader2, Rocket, Route, ScrollText } from "lucide-react";
import { Accordion } from "@/components/site/Accordion";
import { FinalCTA } from "@/components/site/FinalCTA";
import { VIOLET_LEMON_STAGE } from "@/components/site/landing-styles";
import { PageHero } from "@/components/site/PageHero";
import { useSite } from "@/lib/i18n/site";
import { ROADMAP, ROADMAP_STAGES, SECURITY_ITEMS, TRUST_PRINCIPLES, type RoadmapStage } from "@/lib/site/about";

const STAGE_STYLE: Record<RoadmapStage, { icon: typeof CheckCircle2; accent: string; iconClass: string }> = {
  completed: { icon: CheckCircle2, accent: "border border-success/30 bg-success/5", iconClass: "text-success" },
  in_progress: { icon: Loader2, accent: VIOLET_LEMON_STAGE, iconClass: "text-violet-600 dark:text-citron-300" },
  future: { icon: Rocket, accent: "border border-surface-border bg-surface-tint", iconClass: "text-ink-400" },
};

/** /roadmap — what is ready, in progress and planned */
export function RoadmapPage() {
  const copy = useSite().roadmapPage;
  return (
    <>
      <PageHero emoji="🗺️" decor={["✅", "🚧", "🚀"]} eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

      <div className="container-page pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {ROADMAP_STAGES.map((stage) => {
            const style = STAGE_STYLE[stage];
            return (
              <div key={stage} className={`rounded-[28px] p-5 ${style.accent}`}>
                <p className="luxe-firm mb-4 flex items-center gap-2 font-luxe text-[1.4rem] font-semibold leading-tight text-ink-950">
                  <style.icon size={18} className={style.iconClass} />
                  {copy.stages[stage]}
                </p>
                <div className="space-y-3">
                  {ROADMAP.filter((item) => item.stage === stage).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-surface-border bg-surface p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:text-violet-400">
                          <item.icon size={15} />
                        </span>
                        <p className="text-body-sm font-semibold text-ink-900">{copy.items[item.id].title}</p>
                      </div>
                      <p className="mt-2 text-caption text-ink-600">{copy.items[item.id].desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-caption text-ink-500">{copy.note}</p>
      </div>

      <FinalCTA />
    </>
  );
}

/** /trust-center — how data is stored and protected, said plainly */
export function TrustCenterPage() {
  const copy = useSite().trustPage;
  return (
    <>
      <PageHero emoji="🛡️" decor={["🔒", "🗂️", "📜"]} eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />

      <div className="container-page space-y-5 pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_PRINCIPLES.map((p) => (
            <div key={p.id} className="rounded-[24px] border border-surface-border bg-surface p-6 shadow-card sm:last:col-span-2 lg:last:col-span-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:text-violet-400">
                <p.icon size={19} />
              </span>
              <p className="luxe-firm mt-4 font-luxe text-[1.3rem] font-semibold leading-tight tracking-[-0.01em] text-ink-950">{copy.principles[p.id].title}</p>
              <p className="mt-1.5 text-body-sm text-ink-600">{copy.principles[p.id].desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[24px] border border-surface-border bg-surface p-6 shadow-card">
          <p className="luxe-firm mb-4 flex items-center gap-2 font-luxe text-[1.3rem] font-semibold leading-tight tracking-[-0.01em] text-ink-950">
            <Route size={18} className="text-violet-600 dark:text-citron-300" /> {copy.securityTitle}
          </p>
          <ul className="space-y-2.5">
            {SECURITY_ITEMS.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-body-sm text-ink-600">
                {item.done ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
                ) : (
                  <Circle size={16} className="mt-0.5 shrink-0 text-ink-300" />
                )}
                <span>
                  {copy.security[item.id]}
                  <span className="ml-2 text-caption text-ink-400">· {item.done ? copy.done : copy.planned}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-caption text-ink-500">{copy.certNote}</p>
        </div>

        <div id="legal-disclaimer" className="scroll-mt-24 rounded-[24px] border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-400/20 dark:bg-amber-400/10">
          <p className="luxe-firm flex items-center gap-2 font-luxe text-[1.3rem] font-semibold leading-tight tracking-[-0.01em] text-amber-900 dark:text-amber-200">
            <ScrollText size={18} /> {copy.legalTitle}
          </p>
          <p className="mt-2 text-body-sm text-amber-900 dark:text-amber-200">{copy.legal}</p>
        </div>

        <div className="pt-7">
          <h2 className="luxe-firm mb-6 text-center font-display text-ink-950">{copy.faqTitle}</h2>
          <Accordion items={copy.faq} className="mx-auto max-w-2xl" />
        </div>
      </div>

      <FinalCTA />
    </>
  );
}
