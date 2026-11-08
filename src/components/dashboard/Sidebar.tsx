"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpLeft, ChevronDown, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SIDEBAR_NAV, SIDEBAR_LOGOUT } from "@/data/mockData";
import { logoutAction } from "@/lib/actions/auth";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { useL } from "@/components/i18n/L";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import { useLocalState } from "@/lib/dashboard/use-local-state";

// One tip per day (Uzbek source, translated through the phrase table)

import type { SidebarNavItem } from "@/types";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  navItems?: SidebarNavItem[];
  logoutItem?: SidebarNavItem;
}

// Translation keys for the standard user navigation; any other nav
// (agency, admin) falls back to the item's own label.
export const NAV_KEY_BY_HREF: Record<string, string> = {
  "/dashboard": "dashboard_overview",
  "/dashboard/readiness": "nav_readiness",
  "/dashboard/documents": "documents",
  "/dashboard/checklist": "nav_checklist",
  "/dashboard/interview": "nav_interview",
  "/dashboard/assistant": "nav_assistant",
  "/dashboard/library": "nav_library",
  "/dashboard/tracker": "nav_tracker",
  "/dashboard/rejection-analysis": "nav_rejection",
  "/dashboard/experts": "nav_experts",
  "/dashboard/tools/photo": "nav_visa_photo",
  "/dashboard/tools/letters": "nav_visa_letters",
  "/dashboard/tools/timing": "nav_visa_timing",
  "/dashboard/tools/schengen": "nav_schengen_calc",
  "/assessment": "nav_assessment",
  "/recommendations": "recommendations",
  "/reports": "reports",
  "/notifications": "notifications",
  "/dashboard/subscription": "nav_subscription",
  "/profile": "profile",
  "/settings": "settings",
};

// Menu groups, in order; items keep this order inside their group. Anything
// not listed (agency and admin menus) lands in the first group.
// Main follows the visa journey: assess → what to do → score → what to
// gather → upload → track → results. Practice next, then the tools that
// make documents, planning tools, and the reference library last.
const NAV_GROUPS: { id: string; titleKey: string; hrefs: string[] }[] = [
  {
    id: "main",
    titleKey: "app_section_main",
    hrefs: ["/assessment", "/recommendations", "/dashboard/readiness", "/dashboard/checklist", "/dashboard/documents", "/dashboard/tracker", "/reports"],
  },
  { id: "ai", titleKey: "app_section_ai", hrefs: ["/dashboard/interview", "/dashboard/assistant", "/dashboard/rejection-analysis"] },
  {
    id: "tools",
    titleKey: "app_section_tools",
    hrefs: ["/dashboard/tools/photo", "/dashboard/tools/letters", "/dashboard/tools/timing", "/dashboard/tools/schengen", "/dashboard/library"],
  },
  { id: "help", titleKey: "app_section_help", hrefs: ["/dashboard/experts", "/notifications"] },
  { id: "account", titleKey: "app_section_account", hrefs: ["/dashboard/subscription", "/profile", "/settings"] },
];
const COLLAPSED_KEY = "vizar-sidebar-collapsed";

function NavLinks({
  navItems,
  logoutItem,
  onNavigate,
}: {
  navItems: SidebarNavItem[];
  logoutItem: SidebarNavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const label = (item: SidebarNavItem) => {
    const key = NAV_KEY_BY_HREF[item.href];
    return key ? t(key) : item.label;
  };

  const [collapsed, setCollapsed] = useLocalState<string[]>(COLLAPSED_KEY, []);
  // A plan page (/dashboard/subscription/premium) still marks "Obuna"; the readiness test marks "Hujjatlar"
  const isActive = (href: string) =>
    pathname === href || ((href === "/dashboard/subscription" || href === "/dashboard/documents") && pathname.startsWith(`${href}/`));

  const listed = new Set(NAV_GROUPS.flatMap((g) => g.hrefs));
  const groups = NAV_GROUPS.map((group, index) => ({
    ...group,
    items: [
      ...(index === 0 ? navItems.filter((i) => !listed.has(i.href)) : []),
      ...group.hrefs.flatMap((href) => navItems.filter((i) => i.href === href)),
    ],
  })).filter((g) => g.items.length > 0);

  const toggle = (id: string) => setCollapsed((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
      {groups.map((group) => {
        // The group holding the current page always stays open
        const holdsActive = group.items.some((i) => isActive(i.href));
        const open = holdsActive || !collapsed.includes(group.id);
        const listId = `nav-group-${group.id}`;
        return (
        <div key={group.id}>
          <button
            type="button"
            onClick={() => toggle(group.id)}
            aria-expanded={open}
            aria-controls={listId}
            disabled={holdsActive}
            className="group/head flex w-full items-center justify-between rounded-lg px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 transition-colors hover:text-ink-900 disabled:cursor-default disabled:hover:text-ink-500 dark:text-white/60 dark:hover:text-white"
          >
            {t(group.titleKey)}
            {!holdsActive && (
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={cn("transition-transform duration-200 motion-reduce:transition-none", !open && "-rotate-90")}
              />
            )}
          </button>
          <ul id={listId} hidden={!open} className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-pill px-3.5 text-body-sm font-medium transition-colors duration-150",
                      active
                        ? "bg-gold-300 font-semibold text-night shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_20px_-10px_rgba(180,130,20,0.7)]"
                        : "text-ink-600 hover:bg-surface-tint hover:text-ink-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    <item.icon
                      size={18}
                      strokeWidth={1.9}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-night/80" : "text-ink-400 group-hover:text-ink-700 dark:text-white/40"
                      )}
                    />
                    <span className="truncate">{label(item)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        );
      })}

      <div className="mt-auto space-y-0.5 border-t border-surface-border pt-3 dark:border-white/10">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex h-10 items-center gap-3 rounded-pill px-3.5 text-body-sm font-medium text-ink-600 transition-colors hover:bg-surface-tint hover:text-ink-900 dark:text-white/60 dark:hover:bg-white/5"
        >
          <ArrowUpLeft size={18} strokeWidth={1.9} className="text-ink-400" />
          {t("app_back_to_site")}
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            onClick={onNavigate}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-body-sm font-medium text-ink-600 transition-colors hover:bg-surface-tint hover:text-ink-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <logoutItem.icon size={18} strokeWidth={1.9} className="text-ink-400" />
            {t("logout")}
          </button>
        </form>
      </div>
    </nav>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
  navItems = SIDEBAR_NAV,
  logoutItem = SIDEBAR_LOGOUT,
}: SidebarProps) {
  const { t } = useLanguage();
  const drawerRef = useRef<HTMLElement>(null);
  useDialogFocus(mobileOpen, drawerRef);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-surface-border bg-surface lg:flex">
        <Link href="/dashboard" className="flex h-16 items-center px-6">
          <Logo />
        </Link>
        <div className="flex min-h-0 flex-1 flex-col pt-4">
          <NavLinks navItems={navItems} logoutItem={logoutItem} />
        </div>
      </aside>

      {/* Mobile slide-over */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[60] bg-night/30 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label={t("tab_menu")}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[300px] max-w-[86vw] flex-col bg-surface shadow-float lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Logo />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("nav_close_menu")}
                  className="flex h-10 w-10 items-center justify-center rounded-pill text-ink-600 hover:bg-surface-tint dark:text-white/70 dark:hover:bg-white/10"
                >
                  <X size={19} />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col pt-2">
                <NavLinks navItems={navItems} logoutItem={logoutItem} onNavigate={onClose} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
