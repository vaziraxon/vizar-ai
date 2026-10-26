"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileTabBar } from "./MobileTabBar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { EmojiSticker } from "@/components/site/primitives";
import { useL } from "@/components/i18n/L";
import type { SidebarNavItem } from "@/types";

// Page mascot in the header banner, by route
const PAGE_EMOJI: Record<string, string> = {
  "/dashboard/readiness": "🎯",
  "/dashboard/documents": "📄",
  "/dashboard/checklist": "✅",
  "/dashboard/interview": "🎤",
  "/dashboard/tracker": "📍",
  "/dashboard/rejection-analysis": "🔍",
  "/dashboard/experts": "🤝",
  "/notifications": "🔔",
  "/profile": "👤",
  "/settings": "⚙️",
  "/reports": "📊",
  "/recommendations": "💡",
  "/assessment": "🧭",
};

interface DashboardShellProps {
  /** Uzbek strings are translated through the phrase table; nodes render as-is */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Values for `{placeholders}` in a string title */
  titleVars?: Record<string, string | number>;
  /** Small contextual line above the title, e.g. "Shengen · Turistik" */
  eyebrow?: ReactNode;
  /** Right-aligned header actions */
  actions?: ReactNode;
  /** Optional photo on the right of the header banner */
  heroImage?: string;
  children: ReactNode;
  navItems?: SidebarNavItem[];
  showOnboarding?: boolean;
}

export function DashboardShell({
  title,
  subtitle,
  titleVars,
  eyebrow,
  actions,
  heroImage,
  children,
  navItems,
  showOnboarding = true,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const l = useL();
  const emoji = PAGE_EMOJI[pathname];
  const titleText = typeof title === "string" ? l(title, titleVars) : title;
  const subtitleText = typeof subtitle === "string" ? l(subtitle) : subtitle;

  return (
    <div className="flex min-h-screen bg-surface-tint dark:bg-navy-950">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} navItems={navItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="relative flex-1 px-4 pb-28 pt-7 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {/* Soft light behind the header area */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(55%_70%_at_75%_0%,rgba(124,58,237,0.12),transparent_70%),radial-gradient(45%_60%_at_15%_0%,rgba(37,99,235,0.10),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-6xl">
            {/* Page header — a sky banner with the page mascot or a photo */}
            <div className="hero-sky-soft grain relative mb-6 overflow-hidden rounded-[28px] border border-white shadow-xs dark:border-white/10">
              {heroImage ? (
                <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[46%] md:block">
                  <Image src={heroImage} alt="" fill sizes="(min-width: 1024px) 520px, 46vw" className="object-cover" priority />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#e2e2fe] via-[#e2e2fe]/50 to-transparent dark:from-[#0d1230] dark:via-[#0d1230]/60" />
                </div>
              ) : (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
                  <EmojiSticker emoji="✈️" size="sm" tilt={12} className="absolute right-[34%] top-5" />
                  <EmojiSticker emoji="🌍" tilt={-8} delay={1200} className="absolute bottom-4 right-[24%]" />
                </div>
              )}
              <div className="relative flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-8">
                <div className="flex min-w-0 items-start gap-4">
                  {emoji && (
                    <span
                      aria-hidden="true"
                      className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-surface text-[28px] leading-none shadow-float ring-1 ring-white sm:flex dark:ring-white/10"
                    >
                      {emoji}
                    </span>
                  )}
                  <div className="min-w-0">
                    {eyebrow && <div className="mb-2 text-body-sm font-medium text-ink-600">{eyebrow}</div>}
                    <h1 className="font-display text-display-md font-extrabold tracking-[-0.035em] text-ink-950">{titleText}</h1>
                    {subtitleText && <p className="mt-2 max-w-xl text-body text-ink-600">{subtitleText}</p>}
                  </div>
                </div>
                {actions && (
                  <div
                    className={
                      heroImage
                        ? "relative flex shrink-0 flex-wrap gap-2 [&_.btn-secondary]:border-white/80 [&_.btn-secondary]:bg-surface [&_.btn-secondary]:shadow-float dark:[&_.btn-secondary]:border-white/15"
                        : "relative flex shrink-0 flex-wrap gap-2"
                    }
                  >
                    {actions}
                  </div>
                )}
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
      <MobileTabBar onMenu={() => setMobileOpen(true)} />
      <CommandPalette />
      {showOnboarding && <OnboardingWizard />}
    </div>
  );
}
