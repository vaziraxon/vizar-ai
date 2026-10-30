"use client";

import type { ReactNode } from "react";
import { ArrowRight, Check, Clock3 } from "lucide-react";
import type { ToolStatus } from "@/lib/site/registry";
import { useSite } from "@/lib/i18n/site";
import { cn } from "@/lib/utils";

// Violet pill with a soft glow, in step with the navbar sign-in button (landing look)
export const VIOLET_PILL =
  "group inline-flex h-12 items-center gap-3 whitespace-nowrap rounded-pill bg-gradient-to-r from-[#7138EC] to-violet-600 pl-6 pr-1.5 text-body-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_14px_30px_-12px_rgba(113,56,236,0.8)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_36px_-12px_rgba(113,56,236,0.95)] active:translate-y-0";

export function PillArrow() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25 transition-colors duration-200 group-hover:bg-lemon-300 group-hover:text-night">
      <ArrowRight size={16} strokeWidth={2.2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </span>
  );
}

/** Honest availability label: available · beta · coming soon. Text-first, no fill. */
export function StatusPill({ status, className }: { status: ToolStatus; className?: string }) {
  const site = useSite();
  const tone: Record<ToolStatus, string> = {
    available: "text-emerald-700 dark:text-emerald-300",
    beta: "text-violet-700",
    soon: "text-ink-500",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-surface-border bg-surface px-2 py-[3px] text-[11px] font-medium leading-none",
        tone[status],
        className
      )}
    >
      {status === "soon" ? (
        <Clock3 size={11} strokeWidth={2.2} />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", status === "available" ? "bg-emerald-600" : "bg-violet-600")} />
      )}
      {site.status[status]}
    </span>
  );
}

/** "Demo" label on every illustrative UI so sample data never reads as real. */
export function DemoBadge({ className }: { className?: string }) {
  const site = useSite();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-surface-tint px-1.5 py-1 text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-ink-500",
        className
      )}
    >
      {site.common.demo}
    </span>
  );
}

type DocState = "ready" | "review" | "missing";

/** Document status: coloured dot + label, no pill fill. */
export function DocStateChip({ state }: { state: DocState }) {
  const site = useSite();
  const dot: Record<DocState, string> = {
    ready: "bg-emerald-500",
    review: "bg-amber-500",
    missing: "border border-ink-300 bg-surface",
  };
  const text: Record<DocState, string> = {
    ready: "text-ink-700",
    review: "text-amber-800 dark:text-amber-300",
    missing: "text-ink-500",
  };
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-caption font-medium", text[state])}>
      <span className={cn("h-2 w-2 rounded-full", dot[state])} />
      {site.common[state]}
    </span>
  );
}

/** Section label pill: optional emoji + text. */
export function Eyebrow({ emoji, children, className }: { emoji?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow", className)}>
      {emoji && (
        <span aria-hidden="true" className="text-[14px] leading-none">
          {emoji}
        </span>
      )}
      {children}
    </p>
  );
}

/** Emoji in a soft violet tile — the identity mark for product features. */
export function EmojiTile({ emoji, size = "md", className }: { emoji: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "h-8 w-8 rounded-lg text-[16px]", md: "", lg: "h-12 w-12 rounded-2xl text-[24px]" };
  return (
    <span aria-hidden="true" className={cn("emoji-tile", sizes[size], className)}>
      {emoji}
    </span>
  );
}

/**
 * Decorative floating emoji "sticker": a white glass tile, slightly tilted,
 * drifting a few pixels. Purely visual — hidden from assistive tech and
 * still for users who prefer reduced motion.
 */
export function EmojiSticker({
  emoji,
  label,
  tilt = 0,
  delay = 0,
  size = "md",
  className,
}: {
  emoji: string;
  label?: string;
  tilt?: number;
  delay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tile = { sm: "h-11 w-11 text-[22px]", md: "h-14 w-14 text-[28px]", lg: "h-[72px] w-[72px] text-[36px]" };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none inline-flex select-none items-center rounded-[20px] border border-white/90 dark:border-white/10 bg-surface/85 shadow-float backdrop-blur-md animate-float motion-reduce:animate-none",
        label ? "gap-2.5 py-2 pl-2 pr-4" : cn("justify-center", tile[size]),
        className
      )}
      style={{ ["--tilt" as string]: `${tilt}deg`, transform: `rotate(${tilt}deg)`, animationDelay: `${delay}ms` }}
    >
      {label ? (
        <>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-[18px] leading-none">{emoji}</span>
          <span className="whitespace-nowrap text-body-sm font-semibold text-ink-900">{label}</span>
        </>
      ) : (
        <span className="leading-none">{emoji}</span>
      )}
    </span>
  );
}

/**
 * Boarding-pass perforation: a dashed rule with two half-circle notches cut
 * into the card edges. The parent card must clip (overflow-hidden); `notch`
 * paints the cut-outs in the colour of the surface behind the card, and the
 * negative margin must match the card's horizontal padding.
 */
export function TicketDivider({
  notch = "bg-surface-canvas",
  edge = "border-surface-border",
  className,
}: {
  notch?: string;
  edge?: string;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      <div className="mx-6 border-t-2 border-dashed border-surface-border" />
      <span className={cn("absolute -left-3.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border", notch, edge)} />
      <span className={cn("absolute -right-3.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border", notch, edge)} />
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  emoji,
  title,
  subtitle,
  align = "left",
  action,
  id,
  className,
}: {
  eyebrow?: string;
  emoji?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center" | "split";
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  if (align === "split") {
    // Editorial: title left, supporting copy right, aligned on the baseline.
    return (
      <div data-reveal className={cn("grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10", className)}>
        <div className="lg:col-span-7">
          {eyebrow && <Eyebrow emoji={emoji}>{eyebrow}</Eyebrow>}
          <h2 id={id} className="mt-5 max-w-2xl font-display text-display-lg font-extrabold tracking-[-0.035em] text-ink-950">
            {title}
          </h2>
        </div>
        <div className="lg:col-span-5">
          {subtitle && <p className="text-body-lg text-ink-600">{subtitle}</p>}
          {action && <div className="mt-5">{action}</div>}
        </div>
      </div>
    );
  }
  return (
    <div
      data-reveal
      className={cn(
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={align === "left" ? "max-w-2xl" : undefined}>
        {eyebrow && <Eyebrow emoji={emoji}>{eyebrow}</Eyebrow>}
        <h2 id={id} className="mt-5 font-display text-display-lg font-extrabold tracking-[-0.035em] text-ink-950">
          {title}
        </h2>
        {subtitle && <p className="mt-4 text-body-lg text-ink-600">{subtitle}</p>}
      </div>
      {action && <div className={align === "center" ? "mt-8 flex justify-center" : "shrink-0"}>{action}</div>}
    </div>
  );
}

export function CheckLine({ children, className, iconClassName }: { children: ReactNode; className?: string; iconClassName?: string }) {
  return (
    <li className={cn("flex items-start gap-3 text-body-sm text-ink-700", className)}>
      <Check size={16} strokeWidth={2.4} className={cn("mt-[3px] shrink-0 text-brand-600", iconClassName)} />
      <span>{children}</span>
    </li>
  );
}

/** Thin progress bar (grows in on mount). Pass `label` to expose it to
 *  assistive tech; without one it is treated as decoration. */
export function ProgressBar({
  value,
  label,
  tone = "violet",
  className,
}: {
  value: number;
  label?: string;
  tone?: "violet" | "gold" | "ink";
  className?: string;
}) {
  const fill = { violet: "bg-violet-600", gold: "bg-gold-400", ink: "bg-night" }[tone];
  const a11y = label
    ? { role: "progressbar" as const, "aria-label": label, "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": 100 }
    : { "aria-hidden": true as const };
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-surface-muted", className)} {...a11y}>
      <div className={cn("h-full origin-left animate-fill-x rounded-full", fill)} style={{ width: `${value}%` }} />
    </div>
  );
}

/** Link with a trailing arrow that nudges on hover (200ms). */
export function ArrowLink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("group/al inline-flex items-center gap-1.5 text-body-sm font-semibold text-ink-900", className)}>
      <span className="underline decoration-surface-strong underline-offset-[5px] transition-colors duration-200 group-hover/al:decoration-ink-900">
        {children}
      </span>
      <span aria-hidden="true" className="transition-transform duration-200 group-hover/al:translate-x-0.5">
        →
      </span>
    </span>
  );
}
