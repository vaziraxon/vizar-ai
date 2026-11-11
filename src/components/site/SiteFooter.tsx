"use client";

import { LocalLink as Link } from "@/components/site/LocalLink";
import { ArrowUp } from "lucide-react";
import { useSite } from "@/lib/i18n/site";
import { COMPANY } from "@/lib/site/about";

/** Short footer: the legal note, the pages that have no place in the navbar, the wordmark and the bar. */
export function SiteFooter() {
  const site = useSite();
  const links = [
    { href: "/about", label: site.footer.about },
    { href: "/faq", label: site.footer.faq },
    { href: "/roadmap", label: site.footer.roadmap },
    { href: "/trust-center", label: site.footer.trust },
    { href: "/trust-center#legal-disclaimer", label: site.footer.legal },
    { href: "/privacy-policy", label: site.footer.privacy },
    { href: "/terms-of-service", label: site.footer.terms },
  ];

  return (
    <footer className="border-t border-surface-border bg-surface">
      <div className="container-page pb-1 pt-8 text-center">
        <p className="text-body-sm font-semibold text-ink-900">
          {site.footer.official} ·{" "}
          <a href={`tel:${COMPANY.phone}`} className="whitespace-nowrap underline-offset-4 hover:underline">
            {site.footer.phone}: {COMPANY.phoneDisplay}
          </a>
        </p>
        <p className="mx-auto max-w-3xl mt-2 text-caption leading-relaxed text-ink-500">{site.footer.disclaimer}</p>
        <p className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-0 text-caption font-medium sm:gap-y-1.5">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="link-draw inline-flex min-h-[44px] items-center rounded px-1 text-ink-700 transition-colors hover:text-ink-950 sm:min-h-0 sm:px-0">
              {link.label}
            </Link>
          ))}
        </p>
      </div>

      {/* Oversized wordmark */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <p className="container-page -mb-[0.2em] bg-gradient-to-r from-[#e9e4fd] to-[#ecf5c8] bg-clip-text text-center font-display text-[clamp(3.5rem,11vw,9rem)] font-extrabold tracking-[-0.06em] text-transparent dark:from-white/[0.035] dark:to-citron-300/[0.06]">
          VIZAR AI
        </p>
      </div>

      {/* Bottom bar */}
      <div className="relative bg-charcoal">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-400 to-citron-300" />
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
