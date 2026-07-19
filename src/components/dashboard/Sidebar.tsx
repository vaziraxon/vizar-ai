"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SIDEBAR_NAV, SIDEBAR_LOGOUT } from "@/data/mockData";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { SidebarNavItem } from "@/types";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  navItems?: SidebarNavItem[];
  logoutItem?: SidebarNavItem;
}

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
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium transition-colors",
              active
                ? "bg-brand-gradient text-white shadow-glow"
                : "text-ink-700 hover:bg-surface-muted dark:text-white/70 dark:hover:bg-white/5"
            )}
          >
            <item.icon size={18} strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
      <form action={logoutAction}>
        <button
          type="submit"
          onClick={onNavigate}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-body-sm font-medium text-ink-400 transition-colors hover:bg-surface-muted dark:text-white/40 dark:hover:bg-white/5"
        >
          <logoutItem.icon size={18} strokeWidth={2} />
          {logoutItem.label}
        </button>
      </form>
    </nav>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
  navItems = SIDEBAR_NAV,
  logoutItem = SIDEBAR_LOGOUT,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-border bg-white py-6 lg:flex dark:border-white/10 dark:bg-navy-900">
        <div className="px-4 pb-6">
          <Logo />
        </div>
        <NavLinks navItems={navItems} logoutItem={logoutItem} />
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
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white py-6 lg:hidden dark:bg-navy-900"
            >
              <div className="flex items-center justify-between px-4 pb-6">
                <Logo />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Menyuni yopish"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 dark:text-white/70"
                >
                  <X size={20} />
                </button>
              </div>
              <NavLinks navItems={navItems} logoutItem={logoutItem} onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
