import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronRight, Lock, LogIn, Sparkles } from "lucide-react";
import { L } from "@/components/i18n/L";
import { LibraryDate } from "@/components/knowledge/library/LibraryDate";
import { buttonClasses } from "@/components/ui/Button";
import type { LibraryViewer, SubscriptionPlan } from "@/lib/knowledge/access";
import { cn } from "@/lib/utils";

export const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  standard: "Standard",
  premium: "Premium",
  pro: "Pro",
  vip: "VIP",
};

const CHAPTER_EMOJI: Record<number, string> = { 1: "🛂", 2: "📑", 3: "🗂️", 4: "🎙️", 5: "🇪🇺", 6: "🏰", 7: "🌎", 8: "🌏", 9: "🤖" };
const KIND_EMOJI: Record<string, string> = {
  front: "📖",
  intro: "✍️",
  conclusion: "🎯",
  appendix: "🧰",
  sources: "🔗",
  editorial: "📝",
};

export function chapterEmoji(chapter: { kind: string; number: number | null }) {
  return (chapter.number && CHAPTER_EMOJI[chapter.number]) || KIND_EMOJI[chapter.kind] || "📘";
}

export const loginHref = (next: string) => `/login?next=${encodeURIComponent(next)}`;

/** Header band shared by every library page (sits under the floating navbar). */
export function LibraryHero({
  breadcrumb,
  eyebrow,
  title,
  subtitle,
  aside,
  children,
}: {
  breadcrumb?: { href: string; label: ReactNode }[];
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="hero-sky-soft grain relative overflow-hidden">
      <div className="container-page relative pb-10 pt-28 sm:pb-14 sm:pt-36 lg:pt-40">
        {breadcrumb?.length ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-body-sm text-ink-500">
              {breadcrumb.map((b, i) => (
                <li key={b.href} className="flex items-center gap-1">
                  {i > 0 ? <ChevronRight size={14} aria-hidden="true" className="text-ink-300" /> : null}
                  <Link href={b.href} className="rounded transition-colors hover:text-brand-700">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className={cn("grid gap-8", aside && "lg:grid-cols-12 lg:items-end")}>
          <div className={cn("animate-fade-up", aside ? "lg:col-span-7" : "max-w-3xl")}>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1 className="mt-4 font-display text-display-lg font-extrabold tracking-[-0.035em] text-ink-950 sm:text-display-xl">{title}</h1>
            {subtitle ? <p className="mt-4 max-w-2xl text-body-lg text-ink-600">{subtitle}</p> : null}
            {children}
          </div>
          {aside ? <div className="animate-fade-up lg:col-span-5">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}

/** Where the viewer stands: subscribed until …, signed in without a plan, or signed out. */
export function AccessCard({ viewer, next }: { viewer: LibraryViewer; next: string }) {
  if (viewer.hasAccess) {
    return (
      <div className="rounded-[24px] border border-emerald-200 bg-surface/80 p-5 shadow-card backdrop-blur dark:border-emerald-400/20">
        <p className="flex items-center gap-2 text-body-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <BadgeCheck size={18} aria-hidden="true" />
          <L>To‘liq kirish ochiq</L>
        </p>
        {viewer.subscription ? (
          <p className="mt-2 text-body-sm text-ink-600">
            {PLAN_LABEL[viewer.subscription.plan]} · <L>Amal qilish muddati</L>: <LibraryDate iso={viewer.subscription.expiresAt} />
          </p>
        ) : (
          <p className="mt-2 text-body-sm text-ink-600">
            <L>Tahririyat a’zosi sifatida barcha bo‘limlar ochiq.</L>
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="rounded-[24px] border border-surface-border bg-surface/80 p-5 shadow-card backdrop-blur">
      <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-900">
        <Lock size={16} aria-hidden="true" className="text-amber-600" />
        {viewer.user ? <L>Obuna faol emas</L> : <L>To‘liq matn obunachilar uchun</L>}
      </p>
      <p className="mt-2 text-body-sm text-ink-600">
        <L>Mundarija va qisqa parchalar hamma uchun ochiq. To‘liq matn Standard (7 kun), Premium (30 kun), Pro (45 kun) va VIP obunasi davomida ochiladi.</L>
      </p>
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

/** Replaces locked content: what is behind it and how to open it. */
export function Paywall({ viewer, next, title, children }: { viewer: LibraryViewer; next: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-brand-200 bg-gradient-to-br from-brand-50 via-surface to-violet-50 p-6 text-center sm:p-10 dark:border-white/10 dark:from-white/5 dark:via-surface dark:to-white/5">
      <span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-[26px] shadow-card">
        🔒
      </span>
      <p className="mx-auto mt-5 max-w-xl font-display text-display-sm font-bold text-ink-950">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-body text-ink-600">
        {viewer.user ? (
          <L>Hisobingizda faol obuna yo‘q. Obunani faollashtiring — to‘liq matn obuna muddati davomida ochiq bo‘ladi va muddat tugaganda avtomatik yopiladi.</L>
        ) : (
          <L>To‘liq matnni o‘qish uchun hisobingizga kiring va obunani faollashtiring.</L>
        )}
      </p>
      {children}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <UnlockButtons viewer={viewer} next={next} size="lg" />
      </div>
      <p className="mt-5 text-caption text-ink-500">Standard · 7 <L>kun</L> — Premium · 30 <L>kun</L> — Pro · 45 <L>kun</L> — VIP</p>
    </div>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return <Lock size={14} aria-label="Obuna kerak" className={cn("shrink-0 text-ink-300", className)} />;
}

/** Country code as a small monogram tile (emoji flags render as letters on Windows). */
export function CountryMark({ code, size = "md" }: { code: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 font-display font-extrabold tracking-wide text-brand-700 ring-1 ring-brand-100 dark:from-white/10 dark:to-white/5 dark:text-brand-300 dark:ring-white/10",
        size === "lg" ? "h-16 w-16 rounded-2xl text-[20px]" : "h-10 w-10 text-[13px]"
      )}
    >
      {code}
    </span>
  );
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
          {tabs.map((t) => (
            <li key={t.href} className="shrink-0">
              <Link
                href={t.href}
                aria-current={active === t.key ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-body-sm font-semibold transition-colors",
                  active === t.key ? "bg-ink-950 text-white dark:bg-white dark:text-ink-950" : "text-ink-700 hover:bg-surface hover:text-brand-700"
                )}
              >
                <span aria-hidden="true">{t.emoji}</span>
                <L>{t.label}</L>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/** A row in a list of sections: number, title, reading time, lock when closed. */
export function SectionRow({
  href,
  number,
  title,
  minutes,
  locked,
}: {
  href: string;
  number: string | null;
  title: ReactNode;
  minutes?: number;
  locked: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors hover:bg-surface-tint"
      >
        <span className="w-12 shrink-0 text-body-sm font-semibold tabular-nums text-brand-700">{number ?? "•"}</span>
        <span className="min-w-0 flex-1 text-body font-medium text-ink-900 group-hover:text-brand-700">{title}</span>
        {minutes ? (
          <span className="hidden shrink-0 text-caption text-ink-500 sm:inline">
            {minutes} <L>daq</L>
          </span>
        ) : null}
        {locked ? <LockIcon /> : <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />}
      </Link>
    </li>
  );
}

export function LibraryError() {
  return (
    <div className="container-page py-24 text-center">
      <p className="font-display text-display-sm font-bold text-ink-950">
        <L>Kutubxona hozir ochilmadi</L>
      </p>
      <p className="mt-2 text-body text-ink-600">
        <L>Birozdan keyin sahifani yangilang.</L>
      </p>
    </div>
  );
}
