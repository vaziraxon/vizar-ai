"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LocalLink as Link, useSitePath } from "@/components/site/LocalLink";
import { ArrowRight, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";
import { Flag } from "@/components/site/Flag";
import { useSite } from "@/lib/i18n/site";
import { chapterSlugEmoji } from "@/lib/knowledge/visuals";
import { DESTINATIONS, TOOLS, TOOL_BY_ID, type DestinationSlug, type ToolMeta } from "@/lib/site/registry";
import { cn } from "@/lib/utils";
import { EmojiIcon } from "@/components/site/EmojiIcon";

type MenuId = "tools" | "destinations" | "library";

const SCHENGEN_CALC = "/schengen-calculator";
const VISA_PHOTO = "/visa-photo";
const VISA_LETTERS = "/visa-letters";
const VISA_TIMING = "/visa-timing";
const TOOL_ROUTES = new Set(TOOLS.map((t) => t.href).concat("/features", SCHENGEN_CALC, VISA_PHOTO, VISA_LETTERS, VISA_TIMING));
const FEATURED_TOOL = TOOL_BY_ID.readiness;
const FEATURED_DESTINATION: DestinationSlug = "schengen";

/* -------------------------------------------------------------------------- */
/* Menu rows                                                                   */
/* -------------------------------------------------------------------------- */

function ToolRow({ tool, onNavigate, tabIndex }: { tool: ToolMeta; onNavigate?: () => void; tabIndex?: number }) {
  const site = useSite();
  const pathname = useSitePath();
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
        selected ? "bg-gold-200/70 dark:bg-gold-300/30" : "hover:bg-gold-200/50 dark:hover:bg-gold-300/20"
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50/60 text-[18px] leading-none transition-colors duration-150 group-hover:border-brand-200 group-hover:bg-surface"
      >
        <EmojiIcon emoji={tool.emoji} />
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

/** 90/180 calculator, visa photo, visa letters, timing: promo pages here, working tools in the dashboard. */
function FreeToolRows({ onNavigate, tabIndex }: { onNavigate?: () => void; tabIndex?: number }) {
  const site = useSite();
  return (
    <>
      <FreeToolRow href={SCHENGEN_CALC} emoji="🧮" title={site.schengenCalc.title} menu={site.schengenCalc.menu} onNavigate={onNavigate} tabIndex={tabIndex} />
      <FreeToolRow href={VISA_PHOTO} emoji="📸" title={site.visaPhoto.title} menu={site.visaPhoto.menu} onNavigate={onNavigate} tabIndex={tabIndex} />
      <FreeToolRow href={VISA_LETTERS} emoji="📝" title={site.visaLetters.title} menu={site.visaLetters.menu} onNavigate={onNavigate} tabIndex={tabIndex} />
      <FreeToolRow href={VISA_TIMING} emoji="🗓️" title={site.visaTiming.title} menu={site.visaTiming.menu} onNavigate={onNavigate} tabIndex={tabIndex} />
    </>
  );
}

function FreeToolRow({
  href,
  emoji,
  title,
  menu,
  onNavigate,
  tabIndex,
}: {
  href: string;
  emoji: string;
  title: string;
  menu: string;
  onNavigate?: () => void;
  tabIndex?: number;
}) {
  const pathname = useSitePath();
  const selected = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      tabIndex={tabIndex}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-colors duration-150",
        selected ? "bg-gold-200/70 dark:bg-gold-300/30" : "hover:bg-gold-200/50 dark:hover:bg-gold-300/20"
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50/60 text-[18px] leading-none"
      >
        <EmojiIcon emoji={emoji} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-sm font-semibold text-ink-900">{title}</span>
        <span className="block truncate text-caption text-ink-500">{menu}</span>
      </span>
    </Link>
  );
}

function DestinationRow({ slug, onNavigate, tabIndex }: { slug: DestinationSlug; onNavigate?: () => void; tabIndex?: number }) {
  const site = useSite();
  const pathname = useSitePath();
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
        pathname === href ? "bg-gold-200/70 dark:bg-gold-300/30" : "hover:bg-gold-200/50 dark:hover:bg-gold-300/20"
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

function ChapterRow({ index, onNavigate, tabIndex }: { index: number; onNavigate?: () => void; tabIndex?: number }) {
  const site = useSite();
  const pathname = useSitePath();
  const slug = `bob-${index + 1}`;
  const href = `/dashboard/library/book/${slug}`;
  const selected = pathname === href || pathname.startsWith(`${href}/`);
  const chapter = site.nav.libraryChapters[index]!;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      tabIndex={tabIndex}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-150",
        selected ? "bg-gold-200/70 dark:bg-gold-300/30" : "hover:bg-gold-200/50 dark:hover:bg-gold-300/20"
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50/60 text-[18px] leading-none transition-colors duration-150 group-hover:border-brand-200 group-hover:bg-surface"
      >
        <EmojiIcon emoji={chapterSlugEmoji(slug)} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-500">{chapter.label}</span>
        <span className="line-clamp-2 text-body-sm font-semibold leading-snug text-ink-900">{chapter.title}</span>
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
  const pathname = useSitePath();
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const focusPanel = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);

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
      if (e.key !== "Escape") return;
      // Hand focus back to the button that opened what is closing, so
      // keyboard users keep their place instead of landing on <body>
      const active = document.activeElement;
      const panel = active?.closest<HTMLElement>("[data-nav-panel]");
      if (panel) document.querySelector<HTMLElement>(`[aria-controls="${panel.id}"]`)?.focus();
      else if (active?.closest("#mobile-menu")) mobileToggle.current?.focus();
      setMenu(null);
      setMobileOpen(false);
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
    // The open sheet covers the page, so Tab stays in the bar and the sheet
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Node;
      if (!headerRef.current?.contains(target) && !sheetRef.current?.contains(target)) mobileToggle.current?.focus();
    };
    document.addEventListener("focusin", onFocusIn);
    return () => {
      mq.removeEventListener("change", onChange);
      document.removeEventListener("focusin", onFocusIn);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // A dropdown opened from the keyboard moves focus to its first link
  useEffect(() => {
    if (!menu || !focusPanel.current) return;
    focusPanel.current = false;
    document.getElementById(`menu-${menu}`)?.querySelector<HTMLElement>("a, button")?.focus();
  }, [menu]);

  const openMenu = (id: MenuId) => {
    clearTimeout(closeTimer.current);
    setMenu(id);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };
  const close = () => setMenu(null);

  // The current page is a deeper gold than an open or hovered item, on every page and theme
  const activeFill =
    "bg-gold-300 text-night shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_20px_-10px_rgba(180,130,20,0.7)]";

  // lg–xl (1024–1279px) is the tight range: items and edges sit a little closer
  // so the bar still fits next to a scrollbar in every language. An open,
  // hovered or pressed item lights up soft gold; the current page keeps its fill.
  const itemClass = (key: string) =>
    cn(
      "flex h-11 items-center gap-1 whitespace-nowrap rounded-pill px-2.5 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200 xl:px-3 xl:text-body-sm min-[1400px]:px-4",
      activeKey === key
        ? cn(activeFill, "font-semibold")
        : menu === key
          ? "bg-gold-200 text-night shadow-xs"
          : "text-ink-700 hover:bg-gold-200/70 hover:text-night active:bg-gold-200 active:text-night"
    );

  const menuButton = (id: MenuId, label: string) => (
    <button
      key={id}
      type="button"
      aria-expanded={menu === id}
      aria-haspopup="true"
      aria-controls={`menu-${id}`}
      onMouseEnter={() => openMenu(id)}
      onClick={(e) => {
        if (menu === id) return close();
        // detail is 0 for Enter/Space, so only the keyboard moves focus into the panel
        focusPanel.current = e.detail === 0;
        openMenu(id);
      }}
      className={cn(itemClass(id), "group")}
    >
      {label}
      <ChevronDown
        size={14}
        className={cn(
          "transition-transform duration-200",
          activeKey === id || menu === id ? "text-night/70" : "text-ink-400 group-hover:text-night/70",
          menu === id && "rotate-180"
        )}
      />
    </button>
  );
  const navLink = (key: string, href: string, label: string) => (
    <Link
      key={key}
      href={href}
      onMouseEnter={scheduleClose}
      aria-current={activeKey === key ? "page" : undefined}
      className={itemClass(key)}
    >
      {label}
    </Link>
  );

  const solid = scrolled || mobileOpen;
  const mobileTab = mobileOpen ? 0 : -1;

  return (
    <>
      {/* Mobile: a full-width bar. Desktop: transparent on top, then the whole
          header condenses into one floating glass capsule. Height stays 88px. */}
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200 lg:border-b-0 lg:py-2",
          solid ? "border-surface-border bg-surface/90 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none" : "border-transparent"
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 transition-[max-width,background-color,border-color,box-shadow,padding] duration-300 ease-premium sm:px-6 lg:h-[72px] lg:gap-2 lg:rounded-[26px] lg:border lg:px-4 xl:gap-4 xl:px-8",
            scrolled
              ? "lg:max-w-[1240px] lg:border-white/80 dark:border-white/10 lg:bg-surface/75 lg:pl-5 lg:pr-2.5 lg:shadow-float xl:pl-5 xl:pr-2.5 lg:backdrop-blur-xl lg:backdrop-saturate-150"
              : "lg:border-transparent",
            // A touch more glass once the page scrolls
            scrolled &&
              "lg:bg-surface/60 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_48px_-24px_rgba(16,24,40,0.28)] lg:backdrop-blur-2xl lg:backdrop-saturate-[1.8] dark:lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_-24px_rgba(0,0,0,0.6)]"
          )}
          onMouseLeave={scheduleClose}
          // Moving focus to anything but the open dropdown or its button closes it
          onFocus={(e) => {
            if (menu && !e.target.closest(`#menu-${menu}`) && e.target.getAttribute("aria-controls") !== `menu-${menu}`) close();
          }}
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
              {menuButton("tools", site.nav.tools)}
              {menuButton("destinations", site.nav.destinations)}
              {navLink("how", "/how-it-works", site.nav.howItWorks)}
              {menuButton("library", site.nav.library)}
              {navLink("pricing", "/pricing", site.nav.pricing)}
            </div>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle variant="pill" labels={{ toDark: site.nav.themeToDark, toLight: site.nav.themeToLight }} />
            <LanguageSelector variant="pill" />
            <Link
              href="/login"
              className="group flex h-12 items-center gap-2.5 whitespace-nowrap rounded-pill bg-gradient-to-r from-[#7138EC] to-violet-600 px-6 text-body-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_28px_-12px_rgba(113,56,236,0.8)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_32px_-12px_rgba(113,56,236,0.9)]"
            >
              {site.nav.signIn}
              <ArrowRight size={17} strokeWidth={2.2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile: theme + menu */}
          <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle variant="pill" className="h-11 w-11" labels={{ toDark: site.nav.themeToDark, toLight: site.nav.themeToLight }} />
          <button
            ref={mobileToggle}
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
              data-nav-panel
              onMouseEnter={() => clearTimeout(closeTimer.current)}
              // The panel sits after the bar in the DOM: Shift+Tab off its first
              // link goes back to its button, Tab off its last link closes it
              onKeyDown={(e) => {
                if (e.key !== "Tab") return;
                const links = e.currentTarget.querySelectorAll<HTMLElement>("a, button");
                const trigger = document.querySelector<HTMLElement>(`[aria-controls="menu-${menu}"]`);
                if (e.shiftKey ? document.activeElement === links[0] : document.activeElement === links[links.length - 1]) {
                  e.preventDefault();
                  if (!e.shiftKey) close();
                  trigger?.focus();
                }
              }}
              className={cn(
                "absolute left-1/2 top-[68px] z-50 hidden -translate-x-1/2 pt-2 lg:block",
                menu === "library" ? "w-[min(940px,calc(100vw-40px))]" : "w-[680px]"
              )}
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
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-[22px] leading-none shadow-button"
                        >
                          <EmojiIcon emoji={FEATURED_TOOL.emoji} className="text-white" />
                        </span>
                      }
                    />
                    <div className="mt-2 grid grid-cols-2 gap-0.5">
                      {TOOLS.filter((t) => t.id !== FEATURED_TOOL.id).map((tool) => (
                        <ToolRow key={tool.id} tool={tool} onNavigate={close} />
                      ))}
                      <FreeToolRows onNavigate={close} />
                    </div>
                  </>
                ) : menu === "library" ? (
                  <div className="grid grid-cols-3 gap-0.5">
                    {site.nav.libraryChapters.map((_, i) => (
                      <ChapterRow key={i} index={i} onNavigate={close} />
                    ))}
                  </div>
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
                    href={menu === "tools" ? "/features" : menu === "library" ? "/knowledge-base" : "/destinations"}
                    onClick={close}
                    className="inline-flex shrink-0 items-center gap-2 text-body-sm font-semibold text-brand-700 hover:text-violet-600 dark:hover:text-violet-400"
                  >
                    <EmojiIcon emoji={menu === "tools" ? "🧰" : menu === "library" ? "📚" : "🌍"} />
                    {menu === "tools" ? site.nav.allTools : menu === "library" ? site.nav.libraryAll : site.nav.allDestinations}
                    <ArrowRight size={14} />
                  </Link>
                  {menu !== "tools" && (
                    <p className="truncate text-caption text-ink-500">{menu === "library" ? site.nav.libraryNote : site.nav.destinationsNote}</p>
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
        ref={sheetRef}
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
                      ? cn(activeFill, "shadow-button")
                      : "border border-surface-border bg-surface-tint text-ink-800 active:bg-gold-200 active:text-night"
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
            <FreeToolRows tabIndex={mobileTab} />
          </div>

          <p className="mt-8 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{site.nav.destinations}</p>
          <div className="-mx-3 mt-2 grid gap-0.5 sm:grid-cols-2">
            {DESTINATIONS.map((d) => (
              <DestinationRow key={d.slug} slug={d.slug} tabIndex={mobileTab} />
            ))}
          </div>

          <p className="mt-8 text-caption font-semibold uppercase tracking-[0.08em] text-ink-500">{site.nav.library}</p>
          <div className="-mx-3 mt-2 grid gap-0.5 sm:grid-cols-2">
            {site.nav.libraryChapters.map((_, i) => (
              <ChapterRow key={i} index={i} tabIndex={mobileTab} />
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
            <ButtonLink href="/register" variant="dark" size="lg" tabIndex={mobileTab}>
              {site.nav.getStarted}
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
