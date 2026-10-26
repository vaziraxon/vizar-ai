"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useSite } from "@/lib/i18n/site";
import { useLanguage } from "@/lib/language-context";
import { DESTINATIONS, TOOLS } from "@/lib/site/registry";

export function SiteFooter() {
  const site = useSite();
  const { t } = useLanguage();

  const columns = [
    {
      title: site.nav.tools,
      links: TOOLS.map((tool) => ({ href: tool.href, label: site.tools[tool.id].name })),
    },
    {
      title: site.nav.destinations,
      links: DESTINATIONS.map((d) => ({ href: `/destinations/${d.slug}`, label: site.destinations[d.slug].name })),
    },
    {
      title: site.footer.product,
      links: [
        { href: "/how-it-works", label: site.nav.howItWorks },
        { href: "/pricing", label: site.nav.pricing },
        { href: "/faq", label: site.footer.faq },
        { href: "/roadmap", label: site.footer.roadmap },
      ],
    },
    {
      title: site.footer.company,
      links: [
        { href: "/trust-center", label: site.footer.trust },
        { href: "/trust-center#legal-disclaimer", label: site.footer.legal },
        { href: "/login", label: site.nav.signIn },
        { href: "/register", label: t("register") },
      ],
    },
  ];

  return (
    <footer className="border-t border-surface-border bg-surface">
      <div className="container-page pb-12 pt-16 sm:pt-20">
        {/* Brand block */}
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Logo />
          <p className="mt-4 text-body text-ink-600">{site.footer.tagline}</p>
          <LanguageSelector placement="top" variant="pill" className="mt-6" />
        </div>

        {/* Link groups */}
        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-surface-border pt-12 sm:grid-cols-4">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-500">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded text-body-sm text-ink-700 transition-colors duration-150 hover:text-brand-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mx-auto mt-14 max-w-3xl text-center text-caption leading-relaxed text-ink-500">{site.footer.disclaimer}</p>
      </div>

      {/* Oversized outline wordmark */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p className="container-page -mb-[0.2em] text-center font-display text-[clamp(4.5rem,17vw,15rem)] font-extrabold leading-none tracking-[-0.06em] text-[#efebfd] dark:text-white/[0.035]">
          VIZAR AI
        </p>
      </div>

      {/* Bottom bar */}
      <div className="relative bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600">
        <div className="container-page flex items-center justify-between gap-4 py-5">
          <p className="text-body-sm font-medium text-white">
            © {new Date().getFullYear()} VIZAR AI. {site.footer.rights}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={site.footer.backToTop}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors duration-200 hover:bg-white/15"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
