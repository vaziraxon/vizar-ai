"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";
import { Flag } from "@/components/site/Flag";
import { useSite } from "@/lib/i18n/site";
import { DESTINATIONS, TOOLS, TOOL_BY_ID, type DestinationSlug, type ToolMeta } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

type MenuId = "tools" | "destinations";

const TOOL_ROUTES = new Set(TOOLS.map((t) => t.href).concat("/features"));
const FEATURED_TOOL = TOOL_BY_ID.readiness;
const FEATURED_DESTINATION: DestinationSlug = "schengen";

/* -------------------------------------------------------------------------- */
/* Menu rows                                                                   */
/* -------------------------------------------------------------------------- */

function ToolRow({ tool, onNavigate, tabIndex }: { tool: ToolMeta; onNavigate?: () => void; tabIndex?: number }) {
  const site = useSite();
  const pathname = usePathname();
  const selected = pathname === tool.href;
  const copy = site.tools[tool.id];
  return (
    <Link
      href={tool.href}
      onClick={onNavigate}
      tabIndex={tabIndex}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-colors duration-150",
        selected ? "bg-brand-50/70" : "hover:bg-surface-tint"
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50/60 text-[18px] leading-none transition-colors duration-150 group-hover:border-brand-200 group-hover:bg-surface"
      >
        {tool.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-body-sm font-semibold text-ink-900">{copy.name}</span>
          {tool.status !== "available" && (
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-px text-[10.5px] font-semibold",
                tool.status === "beta" ? "bg-violet-50 text-violet-700" : "bg-surface-muted text-ink-600"
              )}
            >
              {site.status[tool.status]}
            </span>
          )}
        </span>
        <span className="block truncate text-caption text-ink-500">{copy.menu}</span>
      </span>
    </Link>
  );
}

function DestinationRow({ slug, onNavigate, tabIndex }: { slug: DestinationSlug; onNavigate?: () => void; tabIndex?: number }) {
  const site = useSite();
  const pathname = usePathname();
  const d = DESTINATIONS.find((x) => x.slug === slug)!;
  const href = `/destinations/${slug}`;
  const copy = site.destinations[slug];
  return (
    <Link
      href={href}
      onClick={onNavigate}
      tabIndex={tabIndex}
      aria-current={pathname === href ? "page" : undefined}
      className={cn(
        "flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-colors duration-150",
        pathname === href ? "bg-brand-50/70" : "hover:bg-surface-tint"
      )}
    >
      <Flag code={d.flag} size={40} className="ring-2 ring-surface" />
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-body-sm font-semibold text-ink-900">{copy.name}</span>
          {!d.available && (
            <span className="shrink-0 rounded-md bg-surface-muted px-1.5 py-px text-[10.5px] font-semibold text-ink-600">
              {site.status.soon}
            </span>
          )}
        </span>
        <span className="block truncate text-caption text-ink-500">{copy.region}</span>
      </span>
    </Link>
  );
}

/** The highlighted first entry of a dropdown — a tinted card with a solid tile. */
function FeaturedRow({
  href,
  visual,
  title,
  text,
  onNavigate,
}: {
  href: string;
  visual: ReactNode;
  title: string;
  text: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-3.5 transition-colors duration-150 hover:border-brand-200 hover:bg-brand-50"
    >
      {visual}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-semibold text-brand-700">{title}</span>
        <span className="block truncate text-caption text-ink-600">{text}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-400 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Navbar                                                                      */
/* -------------------------------------------------------------------------- */

export function Navbar() {
  const site = useSite();
  const pathname = usePathname();
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const activeKey =
    pathname === "/"
      ? "home"
      : TOOL_ROUTES.has(pathname)
        ? "tools"
        : pathname.startsWith("/destinations")
          ? "destinations"
          : pathname === "/how-it-works"
            ? "how"
            : pathname === "/pricing"
              ? "pricing"
              : pathname.startsWith("/knowledge-base")
                ? "library"
                : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setMobileOpen(false);
    mq.addEventListener("change", onChange);
    document.body.style.overflow = "hidden";
    return () => {
      mq.removeEventListener("change", onChange);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openMenu = (id: MenuId) => {
    clearTimeout(closeTimer.current);
    setMenu(id);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };
  const close = () => setMenu(null);

  // The landing page has its own palette: charcoal + lime instead of blue
  const lime = pathname === "/";
  const activeFill = lime
    ? "bg-charcoal text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_20px_-10px_rgba(17,19,24,0.6)] dark:bg-citron-300 dark:text-night"
    : "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_-10px_rgba(79,70,229,0.8)]";

  // lg–xl (1024–1279px) is the tight range: items and edges sit a little closer
  // so the bar still fits next to a scrollbar in every language
  const itemClass = (key: string) =>
    cn(
      "flex h-11 items-center gap-1 whitespace-nowrap rounded-pill px-3 text-body-sm font-medium transition-[background-color,color,box-shadow] duration-200 xl:px-4",
      activeKey === key
        ? cn(activeFill, "font-semibold")
        : menu === key
          ? "bg-surface text-ink-900 shadow-xs"
          : "text-ink-700 hover:bg-surface/80 hover:text-ink-900"
    );

  const solid = scrolled || mobileOpen;
  const mobileTab = mobileOpen ? 0 : -1;

  return (
    <>
      {/* Mobile: a full-width bar. Desktop: transparent on top, then the whole
          header condenses into one floating glass capsule. Height stays 88px. */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200 lg:border-b-0 lg:py-2",
          solid ? "border-surface-border bg-surface/90 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none" : "border-transparent"
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 transition-[max-width,background-color,border-color,box-shadow,padding] duration-300 ease-premium sm:px-6 lg:h-[72px] lg:gap-3 lg:rounded-[26px] lg:border lg:px-6 xl:gap-4 xl:px-8",
            scrolled
              ? "lg:max-w-[1240px] lg:border-white/80 dark:border-white/10 lg:bg-surface/75 lg:pl-5 lg:pr-2.5 lg:shadow-float xl:pl-5 xl:pr-2.5 lg:backdrop-blur-xl lg:backdrop-saturate-150"
              : "lg:border-transparent",
            // Landing: a touch more glass once the page scrolls
            scrolled &&
              lime &&
              "lg:bg-surface/60 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_48px_-24px_rgba(16,24,40,0.28)] lg:backdrop-blur-2xl lg:backdrop-saturate-[1.8] dark:lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_-24px_rgba(0,0,0,0.6)]"
          )}
          onMouseLeave={scheduleClose}
        >
          <Link href="/" aria-label={site.nav.homeAria} className="shrink-0 rounded-lg">
            <Logo />
          </Link>

          {/* Desktop navigation — one pill, the current section filled blue */}
          <nav aria-label="Primary" className="hidden lg:block">
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-pill border p-1.5 transition-colors duration-200",
                solid ? "border-surface-border bg-surface-tint/70" : "border-white/70 dark:border-white/10 bg-surface/45 backdrop-blur-xl"
              )}
            >
              <Link
                href="/"
                onMouseEnter={scheduleClose}
                aria-current={activeKey === "home" ? "page" : undefined}
                className={cn(itemClass("home"), "hidden xl:flex")}
              >
                {site.nav.home}
              </Link>
              {(["tools", "destinations"] as MenuId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-expanded={menu === id}
                  aria-haspopup="true"
                  aria-controls={`menu-${id}`}
                  onMouseEnter={() => openMenu(id)}
                  onClick={() => (menu === id ? close() : openMenu(id))}
                  className={itemClass(id)}
                >
                  {id === "tools" ? site.nav.tools : site.nav.destinations}
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      activeKey === id ? "text-white/80" : "text-ink-400",
                      menu === id && "rotate-180"
                    )}
                  />
                </button>
              ))}
              {[
                { key: "how", href: "/how-it-works", label: site.nav.howItWorks },
                { key: "library", href: "/knowledge-base", label: site.nav.library },
                { key: "pricing", href: "/pricing", label: site.nav.pricing },
              ].map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onMouseEnter={scheduleClose}
                  aria-current={activeKey === item.key ? "page" : undefined}
                  className={itemClass(item.key)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Highlighted entry point, like a "special event" pill (the landing
                page keeps its header to theme · language · sign in) */}
            {!lime && (
              <Link
                href="/visa-readiness"
                title={site.nav.featuredCta}
                className="hidden h-12 w-12 items-center justify-center gap-2 whitespace-nowrap rounded-pill border border-brand-200 bg-brand-50/90 text-body-sm font-semibold text-brand-700 shadow-xs backdrop-blur transition-colors duration-200 hover:border-brand-300 hover:bg-brand-100 xl:flex 2xl:w-auto 2xl:px-4"
              >
                <span aria-hidden="true" className="text-[17px] leading-none">
                  🎯
                </span>
                <span className="sr-only 2xl:not-sr-only">{site.nav.featuredCta}</span>
              </Link>
            )}
            <ThemeToggle variant="pill" labels={{ toDark: site.nav.themeToDark, toLight: site.nav.themeToLight }} />
            <LanguageSelector variant="pill" />
            {lime ? (
              <Link
                href="/login"
                className="group flex h-12 items-center gap-2.5 whitespace-nowrap rounded-pill bg-gradient-to-r from-[#7138EC] to-violet-600 px-6 text-body-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_28px_-12px_rgba(113,56,236,0.8)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_32px_-12px_rgba(113,56,236,0.9)]"
              >
                {site.nav.signIn}
                <ArrowRight size={17} strokeWidth={2.2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="group flex h-12 items-center gap-3 whitespace-nowrap rounded-pill border border-surface-border/80 bg-surface/80 pl-5 pr-1.5 text-body-sm font-semibold text-ink-900 shadow-xs backdrop-blur transition-colors duration-200 hover:bg-surface"
              >
                {site.nav.signIn}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-button transition-transform duration-200 group-hover:rotate-45">
                  <ArrowUpRight size={17} strokeWidth={2.2} />
                </span>
              </Link>
            )}
          </div>

          {/* Mobile: theme + menu */}
          <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle variant="pill" className="h-11 w-11" labels={{ toDark: site.nav.themeToDark, toLight: site.nav.themeToLight }} />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? site.nav.closeMenu : site.nav.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-border/80 bg-surface/80 text-ink-900 shadow-xs backdrop-blur transition-colors duration-200 hover:bg-surface lg:hidden"
          >
            {mobileOpen ? <X size={20} strokeWidth={1.9} /> : <Menu size={20} strokeWidth={1.9} />}
          </button>
          </div>

          {/* Desktop dropdown */}
          {menu && (
            <div
              id={`menu-${menu}`}
              onMouseEnter={() => clearTimeout(closeTimer.current)}
              className="absolute left-1/2 top-[68px] z-50 hidden w-[680px] -translate-x-1/2 pt-2 lg:block"
            >
              <div key={menu} className="animate-menu-in rounded-[24px] border border-surface-border bg-surface p-3 shadow-float">
                {menu === "tools" ? (
                  <>
                    <FeaturedRow
                      href={FEATURED_TOOL.href}
                      onNavigate={close}
                      title={site.nav.featuredTitle}
                      text={site.nav.featuredText}
                      visual={
                        <span
                          aria-hidden="true"
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-[22px] leading-none shadow-button"
                        >
                          {FEATURED_TOOL.emoji}
                        </span>
                      }
                    />
                    <div className="mt-2 grid grid-cols-2 gap-0.5">
                      {TOOLS.filter((t) => t.id !== FEATURED_TOOL.id).map((tool) => (
                        <ToolRow key={tool.id} tool={tool} onNavigate={close} />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <FeaturedRow
                      href={`/destinations/${FEATURED_DESTINATION}`}
                      onNavigate={close}
                      title={site.destinations[FEATURED_DESTINATION].name}
                      text={site.destinations[FEATURED_DESTINATION].menu}
                      visual={<Flag code="eu" size={48} className="ring-2 ring-surface" />}
                    />
                    <div className="mt-2 grid grid-cols-2 gap-0.5">
                      {DESTINATIONS.filter((d) => d.slug !== FEATURED_DESTINATION).map((d) => (
                        <DestinationRow key={d.slug} slug={d.slug} onNavigate={close} />
                      ))}
                    </div>
                  </>
                )}
                <div className="mt-2 flex items-center justify-between gap-4 border-t border-surface-border px-3 pb-1 pt-3">
                  <Link
                    href={menu === "tools" ? "/features" : "/destinations"}
                    onClick={close}
                    className="inline-flex shrink-0 items-center gap-2 text-body-sm font-semibold text-brand-700 hover:text-brand-600"
                  >
                    <span aria-hidden="true">{menu === "tools" ? "🧰" : "🌍"}</span>
                    {menu === "tools" ? site.nav.allTools : site.nav.allDestinations}
                    <ArrowRight size={14} />
                  </Link>
                  {menu === "destinations" && (
                    <p className="truncate text-caption text-ink-500">{site.nav.destinationsNote}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu — full-width sheet under the bar; a sibling of <header>
          so the bar's backdrop-filter can't become its containing block. */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-surface transition-[opacity,visibility] duration-200 lg:hidden",
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
          <ul className="flex flex-wrap gap-2">
            {[
              { key: "home", href: "/", label: site.nav.home },
              { key: "how", href: "/how-it-works", label: site.nav.howItWorks },
              { key: "library", href: "/knowledge-base", label: site.nav.library },
              { key: "pricing", href: "/pricing", label: site.nav.pricing },
              { key: "faq", href: "/faq", label: site.footer.faq },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  tabIndex={mobileTab}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center rounded-pill px-5 text-body-sm font-semibold transition-colors",
                    activeKey === item.key || pathname === item.href
                      ? lime
                        ? "bg-charcoal text-white shadow-button dark:bg-citron-300 dark:text-night"
                        : "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-button"
                      : "border border-surface-border bg-surface-tint text-ink-800"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{site.nav.tools}</p>
          <div className="-mx-3 mt-2 grid gap-0.5 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <ToolRow key={tool.id} tool={tool} tabIndex={mobileTab} />
            ))}
          </div>

          <p className="mt-8 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{site.nav.destinations}</p>
          <div className="-mx-3 mt-2 grid gap-0.5 sm:grid-cols-2">
            {DESTINATIONS.map((d) => (
              <DestinationRow key={d.slug} slug={d.slug} tabIndex={mobileTab} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-surface-border pt-5">
            <span className="text-body-sm text-ink-600">{site.nav.language}</span>
            <div className="flex items-center gap-2">
              <ThemeToggle variant="pill" labels={{ toDark: site.nav.themeToDark, toLight: site.nav.themeToLight }} />
              <LanguageSelector placement="top" variant="pill" />
            </div>
          </div>
        </nav>

        <div className="pb-safe border-t border-surface-border bg-surface px-5 pt-4">
          <div className="grid grid-cols-2 gap-3 pb-4">
            <ButtonLink href="/login" variant="secondary" size="lg" tabIndex={mobileTab}>
              {site.nav.signIn}
            </ButtonLink>
            <ButtonLink href="/register" size="lg" tabIndex={mobileTab}>
              {site.nav.getStarted}
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
