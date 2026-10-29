"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Flag } from "@/components/site/Flag";
import { Accordion } from "@/components/site/Accordion";
import { PricingPlans } from "@/components/site/PricingPlans";
import { ArrowLink, SectionHeader } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { DESTINATION_BY_SLUG, POPULAR } from "@/lib/site/registry";

/* -------------------------------------------------------------------------- */
/* Destinations — photo cards                                                   */
/* -------------------------------------------------------------------------- */

export function DestinationsSection() {
  const site = useSite();
  const d = site.home.destinations;

  return (
    <section aria-labelledby="dest-title" className="section">
      <div className="container-page">
        <SectionHeader
          id="dest-title"
          emoji="🌍"
          eyebrow={d.eyebrow}
          title={d.title}
          subtitle={d.subtitle}
          action={
            <Link href="/destinations" className="rounded">
              <ArrowLink>{d.all}</ArrowLink>
            </Link>
          }
        />

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {POPULAR.map((p, i) => {
            const dest = DESTINATION_BY_SLUG[p.slug];
            return (
              <li key={p.country} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 50}ms` }}>
                <Link
                  href={`/destinations/${p.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-surface-muted"
                >
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
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors duration-200 group-hover:bg-citron-300 group-hover:text-night">
                        <ArrowRight size={15} />
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
/* Pricing + FAQ previews                                                      */
/* -------------------------------------------------------------------------- */

export function PricingSection() {
  const site = useSite();
  const p = site.pricing;

  return (
    <section aria-labelledby="pricing-title" className="section border-y border-surface-border bg-surface">
      <div className="container-page">
        <SectionHeader id="pricing-title" align="center" emoji="💎" eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-14 lg:mt-16">
          <PricingPlans tone="lime" />
        </div>
        <div className="mt-10 text-center">
          <Link href="/pricing" className="rounded">
            <ArrowLink>{site.home.more.pricing}</ArrowLink>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const site = useSite();

  return (
    <section aria-labelledby="faq-title" className="section">
      <div className="container-page max-w-3xl">
        <SectionHeader id="faq-title" align="center" emoji="💬" eyebrow={site.faq.eyebrow} title={site.faq.title} subtitle={site.faq.subtitle} />
        <div data-reveal className="mt-12">
          <Accordion items={site.faq.items.slice(0, 4)} defaultOpen={null} />
        </div>
        <div className="mt-10 text-center">
          <Link href="/faq" className="rounded">
            <ArrowLink>{site.home.more.faq}</ArrowLink>
          </Link>
        </div>
      </div>
    </section>
  );
}
