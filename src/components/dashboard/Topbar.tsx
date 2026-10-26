"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, Search, ChevronDown, UserRound, Settings, LogOut } from "lucide-react";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { LogoMark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DemoModeBadge } from "@/components/dashboard/DemoModeBadge";
import { logoutAction } from "@/lib/actions/auth";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { useDateLocale } from "@/components/i18n/L";

const iconButton =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-600 transition-colors hover:bg-surface-tint hover:text-ink-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useLanguage();
  const locale = useDateLocale();
  const [today, setToday] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  // Rendered after mount so the server and client never disagree on the date
  useEffect(() => {
    setToday(new Date().toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "long" }));
  }, [locale]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const menuItem =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-body-sm text-ink-700 transition-colors hover:bg-surface-tint hover:text-ink-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-surface-border bg-surface/80 px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t("nav_open_menu")}
          className={cn(iconButton, "-ml-1.5 lg:hidden")}
        >
          <Menu size={20} />
        </button>
        <Link href="/dashboard" aria-label="VIZAR AI" className="mr-1 rounded-lg lg:hidden">
          <LogoMark />
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("vizar-open-command-palette"))}
          aria-label={t("app_search_aria")}
          className="flex h-9 items-center gap-2 rounded-pill border border-surface-border bg-surface-tint/70 px-3 text-body-sm text-ink-400 transition-colors hover:border-surface-strong hover:text-ink-600 md:w-72 dark:border-white/10 dark:bg-white/5 dark:text-white/40"
        >
          <Search size={15} />
          <span className="hidden sm:inline">{t("app_search")}</span>
          <kbd className="ml-auto hidden rounded-md border border-surface-border bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-ink-400 md:inline dark:border-white/10 dark:bg-transparent">
            Ctrl K
          </kbd>
        </button>
        <div className="ml-1 hidden xl:block">
          <DemoModeBadge />
        </div>
        {today && (
          <span className="ml-1 hidden items-center gap-1.5 rounded-pill border border-surface-border bg-surface px-3 py-1.5 text-caption font-semibold capitalize text-ink-600 2xl:inline-flex">
            📅 {today}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <div className="hidden sm:block">
          <LanguageSelector />
        </div>
        <Link href="/notifications" aria-label={t("notifications")} className={iconButton}>
          <Bell size={17} strokeWidth={1.8} />
        </Link>

        <div className="relative ml-1" ref={ref}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-label={t("app_profile_menu")}
            className="flex items-center gap-1.5 rounded-pill p-1 pr-1.5 transition-colors hover:bg-surface-tint dark:hover:bg-white/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-button">
              <UserRound size={16} strokeWidth={2} />
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "hidden text-ink-400 transition-transform sm:block dark:text-white/50",
                profileOpen && "rotate-180"
              )}
            />
          </button>

          <div
            role="menu"
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-52 origin-top-right rounded-2xl border border-surface-border bg-white p-1.5 shadow-float transition-[opacity,transform] duration-150 ease-premium dark:border-white/10 dark:bg-navy-800",
              profileOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
            )}
          >
            <Link href="/profile" role="menuitem" tabIndex={profileOpen ? 0 : -1} className={menuItem}>
              <UserRound size={15} className="text-ink-400" /> {t("profile")}
            </Link>
            <Link href="/settings" role="menuitem" tabIndex={profileOpen ? 0 : -1} className={menuItem}>
              <Settings size={15} className="text-ink-400" /> {t("settings")}
            </Link>
            <div className="my-1 h-px bg-surface-border dark:bg-white/10" />
            <form action={logoutAction}>
              <button type="submit" role="menuitem" tabIndex={profileOpen ? 0 : -1} className={menuItem}>
                <LogOut size={15} className="text-ink-400" /> {t("logout")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
