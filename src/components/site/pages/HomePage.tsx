"use client";

import { HomeHero } from "@/components/site/home/HomeHero";
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

/**
 * Homepage rhythm: violet→lime hero + product stage → emoji marquee → facts
 * strip → tool cards → three steps → dark bento → destinations → plans → FAQ
 * → CTA. `.landing-lime` swaps in the landing palette (see globals.css).
 */
export function HomePage() {
  return (
    <div className="landing-lime bg-surface-canvas">
      <HomeHero />
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
