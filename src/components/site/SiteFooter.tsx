"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useSite } from "@/lib/i18n/site";
import { useLanguage } from "@/lib/language-context";
import { DESTINATIONS, TOOLS } from "@/lib/site/registry";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  const site = useSite();
  const { t } = useLanguage();
  // The landing page has its own palette (violet→lime wordmark, charcoal bar)
  // and a short footer: no link columns, just the legal note
  const lime = usePathname() === "/";

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
      {lime ? (
        // The landing page keeps its footer short: the legal note and where to read more
        <div className="container-page pb-1 pt-8 text-center">
          <p className="mx-auto max-w-3xl text-caption leading-relaxed text-ink-500">{site.footer.disclaimer}</p>
          <p className="mt-3 flex justify-center gap-5 text-caption font-medium">
            <Link href="/trust-center" className="rounded text-ink-700 underline-offset-4 hover:text-ink-950 hover:underline">
              {site.footer.trust}
            </Link>
            <Link href="/trust-center#legal-disclaimer" className="rounded text-ink-700 underline-offset-4 hover:text-ink-950 hover:underline">
              {site.footer.legal}
            </Link>
          </p>
        </div>
      ) : (
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
      )}

      {/* Oversized outline wordmark */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p
          className={cn(
            "container-page -mb-[0.2em] text-center font-display font-extrabold leading-none tracking-[-0.06em]",
            // Smaller on the landing page, which is kept short
            lime ? "text-[clamp(3.5rem,11vw,9rem)]" : "text-[clamp(4.5rem,17vw,15rem)]",
            lime
              ? "bg-gradient-to-r from-[#e9e4fd] to-[#ecf5c8] bg-clip-text text-transparent dark:from-white/[0.035] dark:to-citron-300/[0.06]"
              : "text-[#efebfd] dark:text-white/[0.035]"
          )}
        >
          VIZAR AI
        </p>
      </div>

      {/* Bottom bar */}
      <div className={cn("relative", lime ? "bg-charcoal" : "bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600")}>
        {lime && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 to-citron-300" />}
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
