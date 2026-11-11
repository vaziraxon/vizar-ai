import type { ReactNode } from "react";
import { LandingFonts } from "@/components/site/LandingFonts";
import { Navbar } from "@/components/site/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RevealObserver } from "@/components/site/RevealObserver";
import { MotionObserver } from "@/components/site/MotionObserver";
import { SkipLink } from "@/components/site/SkipLink";
import { SpotlightObserver } from "@/components/site/SpotlightObserver";
import { AmbientSky } from "@/components/site/home/AmbientSky";

/** Public-site chrome: floating pill navbar, page content, footer, all in the landing palette and fonts. */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="landing-lime landing-site relative isolate min-h-screen bg-surface-canvas">
      <LandingFonts />
      <AmbientSky />
      <SkipLink />
      <Navbar />
      {/* Pulls content up under the floating navbar so hero washes start at the top */}
      <main id="main" className="-mt-16 lg:-mt-[88px]">
        {children}
      </main>
      <SiteFooter />
      <RevealObserver />
      <MotionObserver />
      <SpotlightObserver />
    </div>
  );
}
