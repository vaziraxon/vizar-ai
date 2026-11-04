"use client";

import { HomeHero } from "@/components/site/home/HomeHero";
import { Testimonials } from "@/components/site/home/Testimonials";
import { DestinationsSection, FaqSection, HowSection, ToolsSection } from "@/components/site/home/Sections";
import { FinalCTA } from "@/components/site/FinalCTA";
import type { Testimonial } from "@/lib/site/testimonials";

/**
 * Homepage rhythm: violet→lime hero with the mascot → the tools → how it
 * works → customer stories → destinations → FAQ → CTA.
 */
export function HomePage({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <>
      <HomeHero />
      <ToolsSection />
      <HowSection />
      <Testimonials items={testimonials} />
      <DestinationsSection />
      <FaqSection />
      <FinalCTA />
    </>
  );
}
