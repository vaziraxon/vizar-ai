"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import {
  COMMAND_ITEMS,
  APPLICATIONS,
  DOCUMENTS,
  RECOMMENDATION_TASKS,
  REPORTS,
} from "@/data/mockData";
import { LANGUAGES } from "@/lib/constants";
import { useLanguage } from "@/lib/language-context";

interface SearchResult {
  id: string;
  label: string;
  group: string;
  href: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpenEvent() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("vizar-open-command-palette", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("vizar-open-command-palette", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const searchResults: SearchResult[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];

    APPLICATIONS.forEach((a) => {
      if (`${a.country} ${a.visaType}`.toLowerCase().includes(q)) {
        results.push({ id: a.id, label: `${a.country} — ${a.visaType}`, group: "Arizalar", href: "/applications" });
      }
    });
    DOCUMENTS.forEach((d) => {
      if (d.title.toLowerCase().includes(q)) {
        results.push({ id: d.id, label: d.title, group: "Hujjatlar", href: "/documents" });
      }
    });
    RECOMMENDATION_TASKS.forEach((t) => {
      if (t.title.toLowerCase().includes(q)) {
        results.push({ id: t.id, label: t.title, group: "Tavsiyalar", href: "/recommendations" });
      }
    });
    REPORTS.forEach((r) => {
      if (r.title.toLowerCase().includes(q)) {
        results.push({ id: r.id, label: r.title, group: "Hisobotlar", href: "/reports" });
      }
    });
    return results;
  }, [query]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMAND_ITEMS;
    return COMMAND_ITEMS.filter((c) => c.label.toLowerCase().includes(q));
  }, [query]);

  const flatList = [
    ...searchResults.map((r) => ({ kind: "result" as const, item: r })),
    ...filteredCommands.map((c) => ({ kind: "command" as const, item: c })),
  ];

  function runCommand(entry: (typeof flatList)[number]) {
    if (entry.kind === "result") {
      router.push(entry.item.href);
    } else {
      const cmd = entry.item;
      if (cmd.action === "navigate" && cmd.href) router.push(cmd.href);
      if (cmd.action === "theme") toggleTheme();
      if (cmd.action === "language") {
        const idx = LANGUAGES.findIndex((l) => l.code === language);
        const next = LANGUAGES[(idx + 1) % LANGUAGES.length]!;
        setLanguage(next.code as "uz" | "ru" | "en");
      }
    }
    setOpen(false);
  }

  function onKeyNav(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = flatList[activeIndex];
      if (entry) runCommand(entry);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-black/50"
          />
          <div className="fixed inset-x-0 top-24 z-[81] flex justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Qidiruv va buyruqlar paneli"
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-surface-border bg-white shadow-float dark:border-white/10 dark:bg-navy-900"
            >
              <div className="flex items-center gap-3 border-b border-surface-border px-4 py-3 dark:border-white/10">
                <Search size={18} className="text-ink-400 dark:text-white/40" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onKeyNav}
                  placeholder="Qidirish yoki buyruq yozing..."
                  aria-label="Qidirish yoki buyruq yozing"
                  className="w-full bg-transparent text-body-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-white dark:placeholder:text-white/30"
                />
                <kbd className="hidden rounded-md border border-surface-border px-1.5 py-0.5 text-caption text-ink-400 dark:border-white/10 dark:text-white/40 sm:block">
                  Esc
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {flatList.length === 0 && (
                  <p className="px-3 py-6 text-center text-body-sm text-ink-400 dark:text-white/40">
                    Hech narsa topilmadi.
                  </p>
                )}

                {searchResults.length > 0 && (
                  <p className="px-3 pb-1 pt-2 text-caption font-semibold uppercase text-ink-400 dark:text-white/40">
                    Natijalar
                  </p>
                )}
                {searchResults.map((r) => {
                  const idx = flatList.findIndex((f) => f.kind === "result" && f.item.id === r.id);
                  return (
                    <button
                      key={`res-${r.id}`}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => runCommand({ kind: "result", item: r })}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-body-sm ${
                        activeIndex === idx
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                          : "text-ink-700 dark:text-white/70"
                      }`}
                    >
                      <span>{r.label}</span>
                      <span className="text-caption text-ink-400 dark:text-white/40">{r.group}</span>
                    </button>
                  );
                })}

                {filteredCommands.length > 0 && (
                  <p className="px-3 pb-1 pt-3 text-caption font-semibold uppercase text-ink-400 dark:text-white/40">
                    Buyruqlar
                  </p>
                )}
                {filteredCommands.map((c) => {
                  const idx = flatList.findIndex((f) => f.kind === "command" && f.item.id === c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => runCommand({ kind: "command", item: c })}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-body-sm ${
                        activeIndex === idx
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                          : "text-ink-700 dark:text-white/70"
                      }`}
                    >
                      <c.icon size={16} />
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-1.5 border-t border-surface-border px-4 py-2 text-caption text-ink-400 dark:border-white/10 dark:text-white/40">
                <CornerDownLeft size={12} /> tanlash
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
