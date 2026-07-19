"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-surface-border bg-white/80 backdrop-blur-lg shadow-sm dark:border-white/10 dark:bg-navy-950/80"
          : "bg-transparent"
      )}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <a href="#home" aria-label="VIZAR AI — bosh sahifa">
          <Logo />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-pill px-3 py-2 text-body-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted hover:text-ink-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 xl:flex">
          <ThemeToggle />
          <LanguageSelector />
          <Link
            href="/login"
            className="rounded-pill px-4 py-2 text-body-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/10"
          >
            Kirish
          </Link>
          <Link href="/register">
            <Button size="md">
              Bepul tahlilni boshlash
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-900 xl:hidden dark:text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menyuni ochish"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-surface-border bg-white px-6 py-6 xl:hidden dark:border-white/10 dark:bg-navy-950">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-body font-medium text-ink-700 hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-4 dark:border-white/10">
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <LanguageSelector />
            </div>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-pill px-4 py-2 text-body-sm font-semibold text-ink-700 dark:text-white/70"
            >
              Kirish
            </Link>
          </div>
          <Link href="/register" onClick={() => setMobileOpen(false)}>
            <Button size="md" className="mt-4 w-full">
              Bepul tahlilni boshlash
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
