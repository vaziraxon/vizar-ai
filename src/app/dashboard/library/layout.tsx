import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getRequestLanguage } from "@/lib/i18n/request-language";
import { ServerLanguageScope } from "@/lib/language-context";

// The library lives in the dashboard (signed-in users only; the public
// /knowledge-base page only promotes it). Pages render their data in the cookie
// language; render the UI strings in it too, from the very first HTML.
export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell title="Viza bazasi" subtitle="VIZAR AI kitobi va davlatlar bo‘yicha qoidalar — rasmiy manbalar bilan.">
      <ServerLanguageScope initial={getRequestLanguage()}>{children}</ServerLanguageScope>
    </DashboardShell>
  );
}
