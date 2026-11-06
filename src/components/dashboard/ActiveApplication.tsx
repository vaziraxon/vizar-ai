"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DestinationSlug } from "@/lib/site/registry";
import type { VisaKind } from "@/lib/dashboard/checklist-template";

/**
 * The application the dashboard is about: the user's latest one. The
 * checklist, its overview card and the readiness score all follow it, so a
 * Canada application never shows a Schengen checklist.
 */
export interface ActiveApplication {
  id: string;
  /** As saved on the application (Uzbek source text) */
  destination: string;
  visaType: string;
  /** The site destination it maps to; null when the country isn't one the site covers */
  dest: DestinationSlug | null;
  visa: VisaKind;
}

const ActiveApplicationContext = createContext<ActiveApplication | null>(null);

export function ActiveApplicationProvider({ value, children }: { value: ActiveApplication | null; children: ReactNode }) {
  return <ActiveApplicationContext.Provider value={value}>{children}</ActiveApplicationContext.Provider>;
}

export const useActiveApplication = () => useContext(ActiveApplicationContext);

/** The checklist that belongs to the active application, when its country is one the site covers. */
export function useApplicationChecklist(): { dest: DestinationSlug; visa: VisaKind } | null {
  const app = useActiveApplication();
  return app?.dest ? { dest: app.dest, visa: app.visa } : null;
}
