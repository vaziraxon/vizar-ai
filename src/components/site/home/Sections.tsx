"use client";

import Link from "next/link";
import { Accordion } from "@/components/site/Accordion";
import { DestinationCard, DestinationStage } from "@/components/site/DestinationCards";
import { PillArrow, SectionHeader, VIOLET_PILL } from "@/components/site/primitives";
import { useSite } from "@/lib/i18n/site";
import { POPULAR } from "@/lib/site/registry";

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

        <DestinationStage className="mt-12">
          {POPULAR.map((p, i) => (
            <DestinationCard
              key={p.country}
              index={i}
              href={`/destinations/${p.slug}`}
              photo={p.photo}
              flag={p.country}
              name={site.countries[p.country]}
              region={p.slug === "schengen" ? "Schengen" : site.destinations[p.slug].region}
            />
          ))}
        </DestinationStage>
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
