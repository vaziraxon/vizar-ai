"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, Search, ChevronDown, UserRound, Settings, LogOut } from "lucide-react";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DemoModeBadge } from "@/components/dashboard/DemoModeBadge";
import { logoutAction } from "@/lib/actions/auth";
import { CURRENT_USER, NOTIFICATIONS } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-surface-border bg-white px-4 sm:px-6 dark:border-white/10 dark:bg-navy-900">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Menyuni ochish"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-700 lg:hidden dark:text-white/70"
        >
          <Menu size={20} />
        </button>
        <p className="hidden truncate text-body-sm font-medium text-ink-700 sm:block dark:text-white/70">
          Xush kelibsiz,{" "}
          <span className="font-semibold text-ink-900 dark:text-white">
            {CURRENT_USER.firstName}
          </span>
        </p>
        <div className="hidden md:block">
          <DemoModeBadge />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("vizar-open-command-palette"))}
          aria-label="Qidirish (Ctrl+K)"
          className="flex items-center gap-2 rounded-pill border border-surface-border px-3 py-1.5 text-caption text-ink-400 transition-colors hover:bg-surface-muted dark:border-white/10 dark:text-white/40 dark:hover:bg-white/10"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Qidirish...</span>
          <kbd className="hidden rounded border border-surface-border px-1 text-[10px] dark:border-white/10 sm:inline">
            ⌘K
          </kbd>
        </button>
        <ThemeToggle />
        <div className="hidden sm:block">
          <LanguageSelector />
        </div>
        <Link
          href="/notifications"
          aria-label="Bildirishnomalar"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/10"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Link>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-pill py-1 pl-1 pr-2 hover:bg-surface-muted dark:hover:bg-white/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-caption font-semibold text-white">
              {CURRENT_USER.initials}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "hidden text-ink-400 transition-transform sm:block dark:text-white/50",
                profileOpen && "rotate-180"
              )}
            />
          </button>

          {profileOpen && (
            <ul
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-surface-border bg-white py-1 shadow-float dark:border-white/10 dark:bg-navy-800"
            >
              <li>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-body-sm text-ink-700 hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/10"
                >
                  <UserRound size={15} /> Profil
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-body-sm text-ink-700 hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/10"
                >
                  <Settings size={15} /> Sozlamalar
                </Link>
              </li>
              <li>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-body-sm text-ink-400 hover:bg-surface-muted dark:text-white/40 dark:hover:bg-white/10"
                  >
                    <LogOut size={15} /> Chiqish
                  </button>
                </form>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
