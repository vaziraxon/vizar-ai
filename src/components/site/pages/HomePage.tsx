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
 * Homepage rhythm: sky hero + product stage → emoji marquee → facts strip →
 * tool cards → three steps → dark bento → destinations → plans → FAQ → CTA.
 */
export function HomePage() {
  return (
    <>
      <HomeHero />
      <MarqueeBand />
      <StatsBand />
      <ToolsGrid />
      <HowTimeline />
      <BentoSection />
      <DestinationsSection />
      <PricingSection />
      <FaqSection />
      <FinalCTA />
    </>
  );
}
