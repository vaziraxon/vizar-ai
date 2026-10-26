import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RevealObserver } from "@/components/site/RevealObserver";
import { SkipLink } from "@/components/site/SkipLink";
import { SpotlightObserver } from "@/components/site/SpotlightObserver";

/** Public-site chrome: floating pill navbar, page content, footer. */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface-canvas">
      <SkipLink />
      <Navbar />
      {/* Pulls content up under the floating navbar so hero washes start at the top */}
      <main id="main" className="-mt-16 lg:-mt-[88px]">
        {children}
      </main>
      <SiteFooter />
      <RevealObserver />
      <SpotlightObserver />
    </div>
  );
}
