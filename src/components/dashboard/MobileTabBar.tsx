"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Gauge, LayoutDashboard, Menu, Route } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", key: "tab_home", icon: LayoutDashboard },
  { href: "/dashboard/readiness", key: "tab_readiness", icon: Gauge },
  { href: "/dashboard/documents", key: "tab_docs", icon: FolderOpen },
  { href: "/dashboard/tracker", key: "tab_tracker", icon: Route },
];

/** App-style bottom navigation for phones; "Menu" opens the full sidebar. */
export function MobileTabBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const item = "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors";

  return (
    <nav
      aria-label="Mobile"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-surface-border bg-white/90 backdrop-blur-xl backdrop-saturate-150 lg:hidden dark:border-white/10 dark:bg-navy-950/90"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch px-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(item, active ? "text-ink-900 dark:text-white" : "text-ink-500 dark:text-white/50")}
            >
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-pill transition-colors duration-200",
                  active ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300" : ""
                )}
              >
                <tab.icon size={19} strokeWidth={1.9} />
              </span>
              {t(tab.key)}
            </Link>
          );
        })}
        <button type="button" onClick={onMenu} className={cn(item, "text-ink-500 dark:text-white/50")}>
          <span className="flex h-8 w-12 items-center justify-center rounded-pill">
            <Menu size={19} strokeWidth={1.9} />
          </span>
          {t("tab_menu")}
        </button>
      </div>
    </nav>
  );
}
