"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "light" ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"
      }
      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/10"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
