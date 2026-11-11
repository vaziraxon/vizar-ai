"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileTabBar } from "./MobileTabBar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import {
  Bell,
  BookOpen,
  Calculator,
  CalendarClock,
  Camera,
  ClipboardCheck,
  Compass,
  FilePen,
  FileWarning,
  FolderOpen,
  Gauge,
  Lightbulb,
  ListChecks,
  MessagesSquare,
  Route,
  Settings,
  UserCog,
  UserRound,
  Wrench,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { LandingFonts } from "@/components/site/LandingFonts";
import { AmbientSky } from "@/components/site/home/AmbientSky";
import { useL } from "@/components/i18n/L";
import type { SidebarNavItem } from "@/types";

// Page icon in the header banner, by route — the same line icons as the sidebar
const PAGE_ICON: Record<string, LucideIcon> = {
  "/dashboard/readiness": Gauge,
  "/dashboard/documents": FolderOpen,
  "/dashboard/documents/check": ClipboardCheck,
  "/dashboard/checklist": ListChecks,
  "/dashboard/interview": MessagesSquare,
  "/dashboard/assistant": BookOpen,
  "/dashboard/tracker": Route,
  "/dashboard/rejection-analysis": FileWarning,
  "/dashboard/experts": UserCog,
  "/dashboard/tools": Wrench,
  "/dashboard/tools/photo": Camera,
  "/dashboard/tools/letters": FilePen,
  "/dashboard/tools/timing": CalendarClock,
  "/dashboard/tools/schengen": Calculator,
  "/notifications": Bell,
  "/profile": UserRound,
  "/settings": Settings,
  "/reports": BarChart3,
  "/recommendations": Lightbulb,
  "/assessment": Compass,
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
  const PageIcon = PAGE_ICON[pathname];
  const titleText = typeof title === "string" ? l(title, titleVars) : title;
  const subtitleText = typeof subtitle === "string" ? l(subtitle) : subtitle;

  return (
    <div className="landing-lime dashboard-lime isolate flex min-h-screen bg-surface-canvas dark:bg-navy-950">
      {/* Same palette and serif as the public site (see .landing-lime and .dashboard-lime) */}
      <LandingFonts />
      <AmbientSky />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} navItems={navItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="relative flex-1 px-4 pb-28 pt-7 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {/* Soft light behind the header area */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(55%_70%_at_75%_0%,rgba(217,242,107,0.22),transparent_70%),radial-gradient(45%_60%_at_15%_0%,rgba(176,160,252,0.22),transparent_70%)] dark:bg-[radial-gradient(55%_70%_at_75%_0%,rgba(190,228,60,0.08),transparent_70%),radial-gradient(45%_60%_at_15%_0%,rgba(124,58,237,0.16),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-6xl">
            {/* Page header — the landing wash with the page mascot or a photo. The
                photo fades in from its left edge, so it meets the wash without a seam. */}
            <div className="lime-wash grain relative mb-6 overflow-hidden rounded-[28px] border border-white shadow-xs dark:border-white/10">
              {heroImage ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 hidden w-[46%] [mask-image:linear-gradient(to_right,transparent,black_55%)] md:block"
                >
                  <Image src={heroImage} alt="" fill sizes="(min-width: 1024px) 520px, 46vw" className="object-cover" priority />
                </div>
              ) : null}
              <div className="relative flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
                <div className="flex min-w-0 items-start gap-4">
                  {PageIcon && (
                    <span
                      aria-hidden="true"
                      className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-brand-700 shadow-float ring-1 ring-white sm:flex dark:ring-white/10"
                    >
                      <PageIcon size={22} strokeWidth={1.8} />
                    </span>
                  )}
                  <div className="min-w-0">
                    {eyebrow && <div className="mb-1.5 text-body-sm font-medium text-ink-700">{eyebrow}</div>}
                    <h1 className="font-display text-[clamp(1.75rem,3vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink-950">{titleText}</h1>
                    {subtitleText && <p className="mt-1.5 max-w-xl text-body text-ink-700">{subtitleText}</p>}
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
