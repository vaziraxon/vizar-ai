"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";
import { useLanguage } from "@/lib/language-context";
import type { LangCode } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Flag } from "@/components/site/Flag";
import type { FlagCode } from "@/lib/site/registry";

const LANG_FLAG: Record<string, FlagCode> = { uz: "uz", ru: "ru", en: "gb" };

export function LanguageSelector({
  align = "right",
  placement = "bottom",
  variant = "ghost",
  className,
}: {
  align?: "left" | "right";
  placement?: "top" | "bottom";
  /** ghost — quiet text button (app chrome); pill — bordered pill with a flag (public site) */
  variant?: "ghost" | "pill";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const active = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]!;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          variant === "pill"
            ? "flex h-12 items-center gap-2 rounded-pill border border-surface-border/80 bg-surface/80 pl-2 pr-3.5 text-body-sm font-semibold text-ink-900 shadow-xs backdrop-blur transition-colors hover:bg-surface"
            : "flex h-9 items-center gap-1.5 rounded-pill px-3 text-body-sm font-medium text-ink-700 transition-colors hover:bg-surface-tint hover:text-ink-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
        )}
      >
        {variant === "pill" ? <Flag code={LANG_FLAG[active.code] ?? "gb"} size={30} /> : <Globe size={15} strokeWidth={1.8} />}
        <span className="sr-only">{t("nav_language")}: </span>
        <span className="uppercase">{active.code}</span>
        <ChevronDown
          size={14}
          className={cn("text-ink-400 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <ul
        role="listbox"
        aria-label={t("nav_language")}
        className={cn(
          "absolute z-50 w-44 overflow-hidden rounded-2xl border border-surface-border bg-surface p-1.5 shadow-float transition-[opacity,transform] duration-150 ease-premium dark:border-white/10 dark:bg-navy-800",
          align === "right" ? "right-0" : "left-0",
          placement === "bottom" ? "top-full mt-2 origin-top" : "bottom-full mb-2 origin-bottom",
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        )}
      >
        {LANGUAGES.map((lang) => {
          const selected = active.code === lang.code;
          return (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  setLanguage(lang.code as LangCode);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-body-sm transition-colors hover:bg-surface-tint dark:hover:bg-white/10",
                  selected
                    ? "font-semibold text-ink-900 dark:text-white"
                    : "text-ink-600 dark:text-white/70"
                )}
              >
                <span className="flex items-center gap-2.5">
                  {variant === "pill" && <Flag code={LANG_FLAG[lang.code] ?? "gb"} size={20} />}
                  {lang.label}
                </span>
                {selected && <Check size={15} className="text-brand-600" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
