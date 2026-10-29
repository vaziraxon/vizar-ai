"use client";

import { HomeHero } from "@/components/site/home/HomeHero";
import { Testimonials } from "@/components/site/home/Testimonials";
import {
  BentoSection,
  DestinationsSection,
  FaqSection,
  HowTimeline,
  MarqueeBand,
  PricingSection,
  StatsBand,
  ToolsGrid,
} from "@/components/site/home/Sections";
import { FinalCTA } from "@/components/site/FinalCTA";
import type { Testimonial } from "@/lib/site/testimonials";
import { cn } from "@/lib/utils";

/**
 * Homepage rhythm: violet→lime hero with the mascot → customer stories →
 * emoji marquee → facts strip → tool cards → three steps → dark bento →
 * destinations → plans → FAQ → CTA. `.landing-lime` swaps in the landing
 * palette and the Bodoni headings (see globals.css); `fontClassName` carries
 * the route-only serif font variables.
 */
export function HomePage({ fontClassName, testimonials }: { fontClassName?: string; testimonials: Testimonial[] }) {
  return (
    <div className={cn("landing-lime bg-surface-canvas", fontClassName)}>
      <HomeHero />
      <Testimonials items={testimonials} />
      <MarqueeBand />
      <StatsBand />
      <ToolsGrid />
      <HowTimeline />
      <BentoSection />
      <DestinationsSection />
      <PricingSection />
      <FaqSection />
      <FinalCTA tone="lime" />
    </div>
  );
}
