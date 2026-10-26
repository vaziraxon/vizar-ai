"use client";

import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/lib/language-context";
import { EmojiSticker } from "@/components/site/primitives";

/**
 * Shared shell for login / register / password reset: one centred card on
 * the sky wash with a few decorative emoji stickers around it.
 */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="hero-sky grain relative flex min-h-screen flex-col overflow-hidden dark:bg-navy-950 dark:bg-none">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block dark:hidden">
        <EmojiSticker emoji="🛂" size="lg" tilt={-10} className="absolute left-[12%] top-[22%]" />
        <EmojiSticker emoji="✈️" tilt={12} delay={900} className="absolute bottom-[22%] left-[17%]" />
        <EmojiSticker emoji="🌍" size="lg" tilt={8} delay={1700} className="absolute right-[12%] top-[26%]" />
        <EmojiSticker emoji="📄" size="sm" tilt={-8} delay={2500} className="absolute bottom-[26%] right-[18%]" />
      </div>
      <header className="relative flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <Link href="/" aria-label={t("nav_home_aria")} className="rounded-lg">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="hidden h-9 items-center gap-1.5 rounded-pill px-3 text-body-sm font-medium text-ink-600 transition-colors hover:bg-surface/70 hover:text-ink-900 sm:inline-flex dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <ArrowLeft size={15} />
            {t("au_back_home")}
          </Link>
          <LanguageSelector variant="pill" />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:pt-8">
        <div className="w-full max-w-[440px] animate-fade-up">
          <div className="panel rounded-[28px] p-7 sm:p-10 dark:border-white/10 dark:bg-navy-900">
            <LogoMark className="h-10 w-10 rounded-xl [&_svg]:h-6 [&_svg]:w-6" />
            <h1 className="mt-6 font-display text-display-sm text-ink-900 sm:text-[28px] dark:text-white">{title}</h1>
            <p className="mt-2 text-body text-ink-600 dark:text-white/60">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-caption font-medium text-ink-600 dark:text-white/50">
            <LockKeyhole size={13} className="shrink-0 text-ink-500" />
            {t("au_panel_disclaimer")}
          </p>
        </div>
      </main>

      <p className="relative pb-6 text-center text-caption text-ink-500">
        © {new Date().getFullYear()} VIZAR AI. {t("ft_rights")}
      </p>
    </div>
  );
}
