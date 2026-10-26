"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Crown,
  FileText,
  Gauge,
  GraduationCap,
  Headphones,
  NotebookTabs,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useSite } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";

type PlanId = "standard" | "premium" | "pro" | "vip";

const PLANS: {
  id: PlanId;
  href: string;
  icon: LucideIcon;
  /** Icon disc + bottom bar gradient */
  accent: string;
  price: string;
  check: string;
}[] = [
  { id: "standard", href: "/register", icon: FileText, accent: "from-violet-500 to-violet-700", price: "text-violet-700 dark:text-violet-300", check: "bg-violet-600" },
  { id: "premium", href: "/register", icon: Gauge, accent: "from-brand-500 to-brand-700", price: "text-brand-400", check: "bg-brand-500" },
  { id: "pro", href: "/register", icon: Headphones, accent: "from-brand-500 to-brand-700", price: "text-brand-600 dark:text-brand-400", check: "bg-brand-600" },
  { id: "vip", href: "/experts", icon: Crown, accent: "from-amber-400 to-orange-600", price: "text-orange-600 dark:text-orange-400", check: "bg-orange-500" },
];

/** The four B2C plans with their published prices, plus the B2B strip. */
export function PricingPlans({ showB2B = true }: { showB2B?: boolean }) {
  const site = useSite();
  const p = site.pricing;

  return (
    <div>
      <div className="grid grid-cols-1 items-stretch gap-5 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan, i) => {
          const copy = p.plans[plan.id];
          const featured = plan.id === "premium";
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
              className={cn(
                "spotlight relative flex flex-col rounded-[28px] border px-6 pt-9 text-center transition-[transform,box-shadow] duration-300 ease-premium hover:-translate-y-1",
                featured
                  ? "spotlight-dark border-brand-500/60 bg-night-950 text-white shadow-[0_0_0_1px_rgba(59,123,246,0.35),0_24px_60px_-20px_rgba(37,99,235,0.65)]"
                  : "border-surface-border bg-surface shadow-card hover:shadow-card-hover"
              )}
            >
              {featured && (
                <span className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-pill bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-1.5 text-body-sm font-bold uppercase tracking-[0.06em] text-white shadow-button">
                  <Star size={14} className="fill-white" /> {p.popular}
                </span>
              )}

              {/* Icon disc */}
              <span
                aria-hidden="true"
                className={cn(
                  "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-[0_14px_30px_-12px_rgba(37,99,235,0.6)] ring-4",
                  plan.accent,
                  featured ? "ring-white/10" : "ring-surface"
                )}
              >
                <Icon size={34} strokeWidth={2.1} />
              </span>

              <p className={cn("mt-5 font-display text-[22px] font-extrabold uppercase tracking-[0.02em]", featured ? "text-white" : "text-ink-950")}>
                {copy.name}
              </p>
              <span aria-hidden="true" className="mx-auto mt-2 flex items-center gap-1">
                <span className={cn("h-px w-5", featured ? "bg-brand-400/60" : "bg-brand-300")} />
                <span className={cn("h-1.5 w-1.5 rounded-full", featured ? "bg-brand-400" : "bg-brand-600")} />
                <span className={cn("h-px w-5", featured ? "bg-brand-400/60" : "bg-brand-300")} />
              </span>

              <p
                className={cn(
                  "mt-3 font-display font-extrabold leading-none tracking-[-0.03em] tabular-nums",
                  plan.price,
                  plan.id === "vip" ? "text-[clamp(1.9rem,3vw,2.4rem)]" : "text-[44px]"
                )}
              >
                {copy.price}
              </p>
              <p
                className={cn(
                  "mx-auto mt-3 rounded-pill px-3.5 py-1 text-body-sm font-semibold",
                  featured
                    ? "bg-white/10 text-white/85"
                    : plan.id === "vip"
                      ? "bg-orange-500/10 text-orange-700 dark:text-orange-300"
                      : "bg-brand-50 text-brand-800"
                )}
              >
                {copy.period}
              </p>

              <span aria-hidden="true" className={cn("mt-6 h-px", featured ? "bg-white/10" : "bg-surface-border")} />

              <ul className="mt-6 flex-1 space-y-3 text-left">
                {copy.features.map((f) => (
                  <li key={f} className={cn("flex items-start gap-3 text-body-sm font-medium", featured ? "text-white/90" : "text-ink-800")}>
                    <span className={cn("mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white", plan.check)}>
                      <Check size={12} strokeWidth={3.2} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  "group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-body-sm font-bold transition-colors",
                  featured
                    ? "bg-white text-brand-deep hover:bg-[#eff5ff]"
                    : plan.id === "vip"
                      ? "bg-orange-500/10 text-orange-700 hover:bg-orange-500/15 dark:text-orange-300"
                      : "bg-surface-tint text-ink-900 hover:bg-surface-muted"
                )}
              >
                {copy.cta}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              {/* Accent bar */}
              <span aria-hidden="true" className={cn("-mx-6 mt-6 h-2 rounded-b-[27px] bg-gradient-to-r", plan.accent)} />
            </div>
          );
        })}
      </div>

      {showB2B && <B2BStrip />}
    </div>
  );
}

const B2B_ICONS = [Building2, GraduationCap, NotebookTabs];

/** Next stage — B2B SaaS for agencies, education centres and consultants. */
export function B2BStrip() {
  const site = useSite();
  const b = site.pricing.b2b;
  return (
    <div data-reveal className="card mt-6 flex flex-col gap-5 rounded-[24px] p-5 sm:p-6 lg:flex-row lg:items-center">
      <div className="flex shrink-0 items-center gap-4">
        <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-button">
          <Briefcase size={24} />
        </span>
        <div>
          <p className="font-display text-body-lg font-bold text-ink-950">{b.label}</p>
          <span className="mt-1 inline-flex rounded-pill bg-surface-tint px-2.5 py-0.5 text-caption font-semibold text-ink-600">⏳ {b.soon}</span>
        </div>
      </div>
      <ul className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 lg:border-l lg:border-surface-border lg:pl-6">
        {b.items.map((item, i) => {
          const Icon = B2B_ICONS[i] ?? Building2;
          return (
            <li key={item} className="flex items-center gap-3 rounded-2xl bg-surface-tint px-4 py-3 text-body-sm font-semibold text-ink-900">
              <Icon size={20} className="shrink-0 text-brand-600" />
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
