"use client";

import Link from "next/link";
import { useL } from "@/components/i18n/L";
import { useSite } from "@/lib/i18n/site";
import { PLAN_EMOJI } from "@/lib/knowledge/visuals";
import { cn } from "@/lib/utils";

const ORDER = ["standard", "premium", "pro", "vip"] as const;

/** The four plans with their real prices from /pricing; every one opens the library. */
export function PlanStrip({ className }: { className?: string }) {
  const site = useSite();
  const l = useL();
  return (
    <ul className={cn("grid grid-cols-2 gap-2.5 lg:grid-cols-4", className)}>
      {ORDER.map((id) => {
        const plan = site.pricing.plans[id];
        const popular = id === "premium";
        return (
          <li key={id}>
            <Link
              href="/pricing"
              className={cn(
                "group relative flex h-full flex-col rounded-2xl border bg-surface p-4 text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
                popular ? "border-violet-300 ring-1 ring-violet-200 dark:border-violet-400/40 dark:ring-violet-400/20" : "border-surface-border hover:border-brand-200"
              )}
            >
              {popular ? (
                <span className="absolute -top-2.5 right-3 rounded-pill bg-gradient-to-r from-brand-600 to-violet-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  ✨ {site.pricing.popular}
                </span>
              ) : null}
              <span className="flex items-center gap-2 text-body-sm font-bold text-ink-950">
                <span aria-hidden="true" className="text-[18px] leading-none">
                  {PLAN_EMOJI[id]}
                </span>
                {plan.name}
              </span>
              <span className="mt-2 font-accent text-[22px] italic leading-none text-ink-950">{plan.price}</span>
              <span className="mt-1 text-caption text-ink-500">{plan.period}</span>
              <span className="mt-3 text-caption font-semibold text-brand-700 group-hover:underline">{l("Kutubxona ochiladi")} →</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
