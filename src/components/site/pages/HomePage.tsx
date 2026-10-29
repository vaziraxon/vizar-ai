"use client";

import { HomeHero } from "@/components/site/home/HomeHero";
import { Testimonials } from "@/components/site/home/Testimonials";
import { DestinationsSection, FaqSection } from "@/components/site/home/Sections";
import { FinalCTA } from "@/components/site/FinalCTA";
import type { Testimonial } from "@/lib/site/testimonials";

/**
 * Homepage rhythm: violet→lime hero with the mascot → customer stories →
 * destinations → FAQ → CTA (the footer is trimmed here too).
 * `.landing-lime` swaps in the landing palette and the Bodoni headings (see
 * globals.css and app/(site)/landing-fonts.css).
 */
export function HomePage({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="landing-lime bg-surface-canvas">
      <HomeHero />
      <Testimonials items={testimonials} />
      <DestinationsSection />
      <FaqSection />
      <FinalCTA tone="lime" />
    </div>
  );
}
