"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const active = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]!;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-pill px-3 py-2 text-body-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/10"
      >
        <Globe size={16} className="text-brand-600" />
        {active.label}
        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-surface-border bg-white py-1 shadow-float dark:border-white/10 dark:bg-navy-800"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={active.code === lang.code}
                onClick={() => {
                  setLanguage(lang.code as "uz" | "ru" | "en");
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-4 py-2 text-left text-body-sm transition-colors hover:bg-surface-muted dark:hover:bg-white/10",
                  active.code === lang.code
                    ? "font-semibold text-brand-600"
                    : "text-ink-700 dark:text-white/70"
                )}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
