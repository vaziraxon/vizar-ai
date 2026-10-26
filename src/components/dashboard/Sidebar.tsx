"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpLeft, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SIDEBAR_NAV, SIDEBAR_LOGOUT } from "@/data/mockData";
import { logoutAction } from "@/lib/actions/auth";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";
import { useL } from "@/components/i18n/L";

// One tip per day (Uzbek source, translated through the phrase table)
const DAILY_TIPS = [
  "Pasportingiz safar tugaganidan keyin ham kamida 3–6 oy amal qilishi kerak.",
  "Bank ko'chirmasi so'nggi oylardagi barqaror harakatni ko'rsatsin.",
  "Suhbatda qisqa, aniq va hujjatlaringizga mos javob bering.",
  "Barcha hujjatlarning nusxasini alohida papkada saqlang.",
  "Ariza topshirishdan oldin rasmiy elchixona saytidagi talablarni tekshiring.",
  "Safar marshrutingiz mehmonxona va chipta bronlariga mos bo'lsin.",
];

function DailyTip() {
  const l = useL();
  const tip = DAILY_TIPS[Math.floor(Date.now() / 86_400_000) % DAILY_TIPS.length]!;
  return (
    <div className="grain relative mx-1 mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 p-4 text-white shadow-float">
      <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">💡 {l("Kun maslahati")}</p>
      <p className="relative mt-1.5 text-body-sm font-medium leading-snug" suppressHydrationWarning>
        {l(tip)}
      </p>
    </div>
  );
}
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
  "/dashboard/tracker": "nav_tracker",
  "/dashboard/rejection-analysis": "nav_rejection",
  "/dashboard/experts": "nav_experts",
  "/assessment": "nav_assessment",
  "/recommendations": "recommendations",
  "/reports": "reports",
  "/notifications": "notifications",
  "/profile": "profile",
  "/settings": "settings",
};

const MORE_HREFS = new Set(["/assessment", "/recommendations", "/reports", "/notifications"]);
const ACCOUNT_HREFS = new Set(["/profile", "/settings"]);

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

  const groups = [
    { title: t("app_section_main"), items: navItems.filter((i) => !MORE_HREFS.has(i.href) && !ACCOUNT_HREFS.has(i.href)) },
    { title: t("app_section_more"), items: navItems.filter((i) => MORE_HREFS.has(i.href)) },
    { title: t("app_section_account"), items: navItems.filter((i) => ACCOUNT_HREFS.has(i.href)) },
  ].filter((g) => g.items.length > 0);

  return (
    <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-white/40">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-pill px-3.5 text-body-sm font-medium transition-colors duration-150",
                      active
                        ? "bg-gradient-to-r from-brand-600 to-violet-600 font-semibold text-white shadow-button dark:text-white"
                        : "text-ink-600 hover:bg-surface-tint hover:text-ink-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    <item.icon
                      size={18}
                      strokeWidth={1.9}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-white" : "text-ink-400 group-hover:text-ink-700 dark:text-white/40"
                      )}
                    />
                    <span className="truncate">{label(item)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-auto space-y-0.5 border-t border-surface-border pt-3 dark:border-white/10">
        <DailyTip />
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
