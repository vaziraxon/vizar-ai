import type { ReactNode } from "react";
import { LandingFonts } from "@/components/site/LandingFonts";
import { getRequestLanguage } from "@/lib/i18n/request-language";
import { ServerLanguageScope } from "@/lib/language-context";

// Library pages render their data in the cookie language; render the UI
// strings in it too, from the very first HTML. Every library page is in the landing look.
export default function KnowledgeBaseLayout({ children }: { children: ReactNode }) {
  return (
    <ServerLanguageScope initial={getRequestLanguage()}>
      <div className="landing-lime bg-surface-canvas">
        <LandingFonts />
        {children}
      </div>
    </ServerLanguageScope>
  );
}
