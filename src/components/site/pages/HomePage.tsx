"use client";

import { HomeHero } from "@/components/site/home/HomeHero";
import { Testimonials } from "@/components/site/home/Testimonials";
import { ReadinessTestSection } from "@/components/site/home/ReadinessTestSection";
import { DestinationsSection, FaqSection } from "@/components/site/home/Sections";
import { FinalCTA } from "@/components/site/FinalCTA";
import type { Testimonial } from "@/lib/site/testimonials";

/**
 * Homepage rhythm: violet→lime hero with the mascot → readiness test → customer stories →
 * destinations → FAQ → CTA.
 */
export function HomePage({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <>
      <HomeHero />
      <ReadinessTestSection />
      <Testimonials items={testimonials} />
      <DestinationsSection />
      <FaqSection />
      <FinalCTA />
    </>
  );
}
