"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { Accordion } from "@/components/site/Accordion";
import { SectionHeader } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { DESTINATION_BY_SLUG, POPULAR } from "@/lib/site/registry";

// Violet pill with a soft glow, in step with the navbar sign-in button
const VIOLET_PILL =
  "group inline-flex h-12 items-center gap-3 whitespace-nowrap rounded-pill bg-gradient-to-r from-[#7138EC] to-violet-600 pl-6 pr-1.5 text-body-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_14px_30px_-12px_rgba(113,56,236,0.8)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_36px_-12px_rgba(113,56,236,0.95)] active:translate-y-0";

function PillArrow() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25 transition-colors duration-200 group-hover:bg-lemon-300 group-hover:text-night">
      <ArrowRight size={16} strokeWidth={2.2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Destinations — photo cards                                                   */
/* -------------------------------------------------------------------------- */

export function DestinationsSection() {
  const site = useSite();
  const d = site.home.destinations;

  return (
    <section aria-labelledby="dest-title" className="pb-12 pt-8 md:pb-14 md:pt-10 lg:pb-16">
      <div className="container-page">
        <SectionHeader
          id="dest-title"
          emoji="🌍"
          eyebrow={d.eyebrow}
          title={d.title}
          subtitle={d.subtitle}
          action={
            <Link href="/destinations" className={VIOLET_PILL}>
              {d.all}
              <PillArrow />
            </Link>
          }
        />

        {/* A touch narrower than the page, so the framed cards come out a little smaller */}
        <ul className="mx-auto mt-12 grid max-w-[1040px] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {POPULAR.map((p, i) => {
            const dest = DESTINATION_BY_SLUG[p.slug];
            return (
              <li key={p.country} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 50}ms` }}>
                {/* Lemon frame around each photo, with a soft golden shadow that lifts on hover */}
                <Link
                  href={`/destinations/${p.slug}`}
                  className="group block rounded-[26px] bg-lemon-300 p-1.5 shadow-[0_22px_44px_-14px_rgba(222,186,10,0.7),0_6px_16px_-6px_rgba(222,186,10,0.45)] transition-[transform,background-color,box-shadow] duration-300 ease-premium hover:-translate-y-1 hover:bg-lemon-400 hover:shadow-[0_30px_56px_-14px_rgba(222,186,10,0.85),0_8px_20px_-6px_rgba(222,186,10,0.55)] dark:shadow-[0_18px_40px_-16px_rgba(247,227,90,0.4)] dark:hover:shadow-[0_26px_52px_-16px_rgba(247,227,90,0.55)] sm:p-2"
                >
                  <span className="relative block aspect-[5/6] overflow-hidden rounded-[20px] bg-surface-muted">
                    <Image
                      src={p.photo}
                      alt={site.countries[p.country]}
                      fill
                      sizes="(min-width: 1024px) 280px, 50vw"
                      className="object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.04]"
                    />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night-950/75 via-night-950/10 to-transparent" />
                    <span className="absolute left-3 top-3 sm:left-4 sm:top-4">
                      <Flag code={p.country} size={32} className="ring-2 ring-white/80" />
                    </span>
                    <span className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                      <span className="block font-display text-body-lg font-bold tracking-[-0.01em] text-white sm:text-xl">
                        {site.countries[p.country]}
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2 text-caption font-medium text-white/85">
                        {p.slug === "schengen" ? "Schengen" : site.destinations[dest.slug].region}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors duration-200 group-hover:bg-lemon-300 group-hover:text-night">
                          <ArrowRight size={15} />
                        </span>
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ preview                                                                 */
/* -------------------------------------------------------------------------- */

export function FaqSection() {
  const site = useSite();

  return (
    <section aria-labelledby="faq-title" className="pb-12 md:pb-14 lg:pb-16">
      <div className="container-page max-w-3xl">
        <SectionHeader id="faq-title" align="center" emoji="💬" eyebrow={site.faq.eyebrow} title={site.faq.title} subtitle={site.faq.subtitle} />
        {/* Compact violet question cards, a little narrower than the heading */}
        <div data-reveal className="mx-auto mt-9 max-w-2xl">
          <Accordion items={site.faq.items.slice(0, 4)} defaultOpen={null} tone="violet" />
        </div>
        <div className="mt-8 text-center">
          <Link href="/faq" className={VIOLET_PILL}>
            {site.home.more.faq}
            <PillArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
