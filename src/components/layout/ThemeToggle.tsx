"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  variant = "ghost",
  labels = { toDark: "Tungi rejimga o'tish", toLight: "Kunduzgi rejimga o'tish" },
  className,
}: {
  /** ghost — quiet icon button (app chrome); pill — bordered round button (public site) */
  variant?: "ghost" | "pill";
  labels?: { toDark: string; toLight: string };
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? labels.toLight : labels.toDark}
      aria-pressed={dark}
      className={cn(
        variant === "pill"
          ? "group flex h-12 w-12 items-center justify-center rounded-full border border-surface-border/80 bg-surface/80 text-ink-800 shadow-xs backdrop-blur transition-colors duration-200 hover:bg-surface"
          : "flex h-9 w-9 items-center justify-center rounded-pill text-ink-600 transition-colors hover:bg-surface-tint hover:text-ink-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white",
        className
      )}
    >
      {dark ? (
        <Sun size={variant === "pill" ? 19 : 17} strokeWidth={1.9} className="text-amber-300 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon size={variant === "pill" ? 19 : 17} strokeWidth={1.9} className="transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
