import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Lock, LogIn, Sparkles } from "lucide-react";
import { L } from "@/components/i18n/L";
import { LibraryDate } from "@/components/knowledge/library/LibraryDate";
import { PlanStrip } from "@/components/knowledge/library/PlanStrip";
import { CountryFlag } from "@/components/knowledge/library/visuals";
import { EmojiSticker } from "@/components/site/primitives";
import { buttonClasses } from "@/components/ui/Button";
import type { LibraryViewer, SubscriptionPlan } from "@/lib/knowledge/access";
import { PLAN_EMOJI } from "@/lib/knowledge/visuals";
import { cn } from "@/lib/utils";

export { chapterEmoji } from "@/lib/knowledge/visuals";

export const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  standard: "Standard",
  premium: "Premium",
  pro: "Pro",
  vip: "VIP",
};

export const loginHref = (next: string) => `/login?next=${encodeURIComponent(next)}`;

/**
 * Header band shared by every library page (sits under the floating navbar).
 * With `photo` it becomes a full-bleed photo header with light text.
 */
export function LibraryHero({
  breadcrumb,
  eyebrow,
  title,
  subtitle,
  aside,
  photo,
  photoAlt = "",
  stickers,
  children,
}: {
  breadcrumb?: { href: string; label: ReactNode }[];
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
  photo?: string;
  photoAlt?: string;
  /** Three floating emoji around the header (desktop only) */
  stickers?: [string, string, string];
  children?: ReactNode;
}) {
  const onPhoto = Boolean(photo);
  const body = (
    <>
        {breadcrumb?.length ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className={cn("flex flex-wrap items-center gap-1 text-body-sm", onPhoto ? "text-white/70" : "text-ink-500")}>
              {breadcrumb.map((b, i) => (
                <li key={b.href} className="flex items-center gap-1">
                  {i > 0 ? <ChevronRight size={14} aria-hidden="true" className={onPhoto ? "text-white/40" : "text-ink-300"} /> : null}
                  <Link href={b.href} className={cn("rounded transition-colors", onPhoto ? "hover:text-white" : "hover:text-brand-700")}>
                    {b.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className={cn("grid gap-8", aside && "lg:grid-cols-12 lg:items-end")}>
          <div className={cn("animate-fade-up", aside ? "lg:col-span-7" : "max-w-3xl")}>
            {eyebrow ? (
              <p className={cn("eyebrow", onPhoto && "border-white/25 bg-white/10 text-white backdrop-blur")}>{eyebrow}</p>
            ) : null}
            <h1
              className={cn(
                "mt-4 font-display text-display-lg font-extrabold tracking-[-0.035em] sm:text-display-xl",
                onPhoto ? "text-white" : "text-ink-950"
              )}
            >
              {title}
            </h1>
            {subtitle ? <p className={cn("mt-4 max-w-2xl text-body-lg", onPhoto ? "text-white/80" : "text-ink-600")}>{subtitle}</p> : null}
            {children}
          </div>
          {aside ? <div className="animate-fade-up lg:col-span-5">{aside}</div> : null}
        </div>
    </>
  );

  // Photo headers sit in a rounded panel on the light sky, so the floating
  // navbar always stays on a light background.
  if (photo) {
    return (
      <section className="hero-sky-soft grain relative overflow-hidden">
        <div className="container-page relative pb-8 pt-24 sm:pb-10 sm:pt-28 lg:pt-32">
          <div className="relative overflow-hidden rounded-[32px] bg-night-950 px-5 pb-8 pt-7 text-white shadow-float sm:rounded-[40px] sm:px-10 sm:pb-12 sm:pt-10">
            <Image src={photo} alt={photoAlt} fill priority sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night-950/90 via-night-950/60 to-night-950/20" />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-night-950/60 to-transparent" />
            <div className="relative">{body}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-sky-soft grain relative overflow-hidden">
      {stickers ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
          <EmojiSticker emoji={stickers[0]} tilt={-10} className="absolute right-[38%] top-[132px]" />
          <EmojiSticker emoji={stickers[1]} size="lg" tilt={8} delay={900} className="absolute bottom-10 right-[44%]" />
          <EmojiSticker emoji={stickers[2]} size="sm" tilt={-4} delay={1800} className="absolute bottom-20 right-[33%]" />
        </div>
      ) : null}
      <div className="container-page relative pb-10 pt-28 sm:pb-14 sm:pt-36 lg:pt-40">{body}</div>
    </section>
  );
}

/** Small "⚡ 7 kun · ⭐ 30 kun …" row — what each plan unlocks. */
function PlanChips({ className }: { className?: string }) {
  const chips: [SubscriptionPlan, string][] = [
    ["standard", "7"],
    ["premium", "30"],
    ["pro", "45"],
  ];
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {chips.map(([plan, days]) => (
        <li key={plan} className="inline-flex items-center gap-1 rounded-pill bg-surface-tint px-2.5 py-1 text-caption font-semibold text-ink-700">
          <span aria-hidden="true">{PLAN_EMOJI[plan]}</span>
          {PLAN_LABEL[plan]} · {days} <L>kun</L>
        </li>
      ))}
      <li className="inline-flex items-center gap-1 rounded-pill bg-surface-tint px-2.5 py-1 text-caption font-semibold text-ink-700">
        <span aria-hidden="true">{PLAN_EMOJI.vip}</span>
        VIP
      </li>
    </ul>
  );
}

/** Where the viewer stands: subscribed until …, signed in without a plan, or signed out. */
export function AccessCard({ viewer, next }: { viewer: LibraryViewer; next: string }) {
  if (viewer.hasAccess) {
    const plan = viewer.subscription?.plan;
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-600 via-violet-600 to-violet-700 p-[1.5px] shadow-float">
        <div className="relative rounded-[26.5px] bg-surface/95 p-5 backdrop-blur dark:bg-night-950/90">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-violet-100 text-[24px] dark:from-white/10 dark:to-white/5">
              {plan ? PLAN_EMOJI[plan] : "🖋️"}
            </span>
            <div>
              <p className="text-body font-bold text-ink-950">
                <L>To‘liq kirish ochiq</L>
              </p>
              <p className="text-body-sm text-ink-600">
                {viewer.subscription ? (
                  <>
                    {PLAN_LABEL[viewer.subscription.plan]} · <L>Amal qilish muddati</L>: <LibraryDate iso={viewer.subscription.expiresAt} />
                  </>
                ) : (
                  <L>Tahririyat a’zosi sifatida barcha bo‘limlar ochiq.</L>
                )}
              </p>
            </div>
          </div>
          <p className="mt-4 flex flex-wrap gap-1.5 text-caption font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="rounded-pill bg-emerald-50 px-2.5 py-1 dark:bg-emerald-400/10">📚 <L>9 bob to‘liq</L></span>
            <span className="rounded-pill bg-emerald-50 px-2.5 py-1 dark:bg-emerald-400/10">🌍 <L>Davlat qoidalari</L></span>
            <span className="rounded-pill bg-emerald-50 px-2.5 py-1 dark:bg-emerald-400/10">🔗 <L>Rasmiy manbalar</L></span>
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-[28px] border border-white/80 bg-surface/85 p-5 shadow-float backdrop-blur-md dark:border-white/10">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-violet-100 text-[22px] dark:from-white/10 dark:to-white/5">
          🔐
        </span>
        <div>
          <p className="text-body font-bold text-ink-950">{viewer.user ? <L>Obuna faol emas</L> : <L>To‘liq matn obunachilar uchun</L>}</p>
          <p className="mt-1 text-body-sm text-ink-600">
            <L>Mundarija va qisqa parchalar hamma uchun ochiq. To‘liq matn obuna davomida ochiladi.</L>
          </p>
        </div>
      </div>
      <PlanChips className="mt-4" />
      <div className="mt-4 flex flex-wrap gap-2">
        <UnlockButtons viewer={viewer} next={next} />
      </div>
    </div>
  );
}

function UnlockButtons({ viewer, next, size = "md" }: { viewer: LibraryViewer; next: string; size?: "md" | "lg" }) {
  return (
    <>
      <Link href="/pricing" className={buttonClasses({ size })}>
        <Sparkles size={16} aria-hidden="true" />
        <L>Obunani faollashtirish</L>
      </Link>
      {!viewer.user ? (
        <Link href={loginHref(next)} className={buttonClasses({ variant: "secondary", size })}>
          <LogIn size={16} aria-hidden="true" />
          <L>Kirish</L>
        </Link>
      ) : null}
    </>
  );
}

/** Replaces locked content: what is behind it, the plans and how to open it. */
export function Paywall({ viewer, next, title, children }: { viewer: LibraryViewer; next: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="hero-backdrop relative overflow-hidden rounded-[32px] border border-violet-200/70 px-5 py-8 text-center sm:px-10 sm:py-12 dark:border-white/10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
        <EmojiSticker emoji="📚" size="sm" tilt={-10} className="absolute left-[6%] top-8" />
        <EmojiSticker emoji="🌍" size="sm" tilt={8} delay={900} className="absolute right-[7%] top-10" />
        <EmojiSticker emoji="✨" size="sm" tilt={-4} delay={1800} className="absolute bottom-10 left-[10%]" />
      </div>
      <span aria-hidden="true" className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-surface text-[30px] shadow-float ring-1 ring-white">
        🔐
      </span>
      <p className="relative mx-auto mt-5 max-w-xl font-display text-display-sm font-extrabold tracking-[-0.02em] text-ink-950">{title}</p>
      <p className="relative mx-auto mt-2 max-w-xl text-body text-ink-600">
        {viewer.user ? (
          <L>Hisobingizda faol obuna yo‘q. Obunani faollashtiring — to‘liq matn obuna muddati davomida ochiq bo‘ladi va muddat tugaganda avtomatik yopiladi.</L>
        ) : (
          <L>To‘liq matnni o‘qish uchun hisobingizga kiring va obunani faollashtiring.</L>
        )}
      </p>
      {children}
      <PlanStrip className="relative mx-auto mt-7 max-w-3xl" />
      <div className="relative mt-6 flex flex-wrap justify-center gap-3">
        <UnlockButtons viewer={viewer} next={next} size="lg" />
      </div>
    </div>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return <Lock size={14} aria-label="Obuna kerak" className={cn("shrink-0 text-ink-300", className)} />;
}

/** Sub-navigation between the library's parts. */
export function LibraryTabs({ active }: { active?: "home" | "search" }) {
  const tabs = [
    { href: "/knowledge-base#boblar", label: "Boblar", emoji: "📚" },
    { href: "/knowledge-base#davlatlar", label: "Davlatlar", emoji: "🌍" },
    { href: "/knowledge-base#viza-turlari", label: "Viza turlari", emoji: "🛂" },
    { href: "/knowledge-base#hujjatlar", label: "Hujjatlar", emoji: "📑" },
    { href: "/knowledge-base/search", label: "Qidiruv", emoji: "🔎", key: "search" as const },
  ];
  return (
    <nav aria-label="Kutubxona bo‘limlari" className="sticky top-16 z-20 border-b border-surface-border bg-surface-canvas/85 backdrop-blur-xl lg:top-[88px]">
      <div className="container-page">
        <ul className="-mx-1 flex gap-1 overflow-x-auto py-2.5 [scrollbar-width:none]">
          {tabs.map((t) => {
            const current = Boolean(t.key) && active === t.key;
            return (
            <li key={t.href} className="shrink-0">
              <Link
                href={t.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-body-sm font-semibold transition-colors",
                  current ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-button" : "text-ink-700 hover:bg-surface hover:text-brand-700"
                )}
              >
                <span aria-hidden="true">{t.emoji}</span>
                <L>{t.label}</L>
              </Link>
            </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/** A row in a list of sections: emoji tile, number, title, reading time, lock when closed. */
export function SectionRow({
  href,
  number,
  title,
  emoji,
  flag,
  minutes,
  locked,
}: {
  href: string;
  number: string | null;
  title: ReactNode;
  emoji?: string;
  /** Country code: shows that flag instead of the emoji */
  flag?: string | null;
  minutes?: number;
  locked: boolean;
}) {
  return (
    <li>
      <Link href={href} className="group flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors hover:bg-surface-tint sm:px-4">
        {flag ? (
          <span aria-hidden="true" className="emoji-tile h-10 w-10 transition-transform duration-200 group-hover:-rotate-6">
            <CountryFlag code={flag} size="sm" />
          </span>
        ) : emoji ? (
          <span aria-hidden="true" className="emoji-tile h-10 w-10 text-[18px] transition-transform duration-200 group-hover:-rotate-6">
            {emoji}
          </span>
        ) : null}
        <span className="w-11 shrink-0 text-body-sm font-semibold tabular-nums text-brand-700">{number ?? "•"}</span>
        <span className="min-w-0 flex-1 text-body font-medium text-ink-900 group-hover:text-brand-700">{title}</span>
        {minutes ? (
          <span className="hidden shrink-0 text-caption text-ink-500 sm:inline">
            ⏱ {minutes} <L>daq</L>
          </span>
        ) : null}
        {locked ? (
          <LockIcon />
        ) : (
          <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
        )}
      </Link>
    </li>
  );
}

export function LibraryError() {
  return (
    <div className="container-page py-24 text-center">
      <p aria-hidden="true" className="text-[40px]">
        🛠️
      </p>
      <p className="mt-3 font-display text-display-sm font-bold text-ink-950">
        <L>Kutubxona hozir ochilmadi</L>
      </p>
      <p className="mt-2 text-body text-ink-600">
        <L>Birozdan keyin sahifani yangilang.</L>
      </p>
    </div>
  );
}
