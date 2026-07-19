"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "@/components/search/CommandPalette";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import type { SidebarNavItem } from "@/types";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  navItems?: SidebarNavItem[];
  showOnboarding?: boolean;
}

export function DashboardShell({
  title,
  subtitle,
  children,
  navItems,
  showOnboarding = true,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-tint dark:bg-navy-950">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <h1 className="font-display text-display-sm text-ink-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-body-sm text-ink-600 dark:text-white/60">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
      {showOnboarding && <OnboardingWizard />}
    </div>
  );
}
