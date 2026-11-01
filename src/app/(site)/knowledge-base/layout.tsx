import type { ReactNode } from "react";
import { getRequestLanguage } from "@/lib/i18n/request-language";
import { ServerLanguageScope } from "@/lib/language-context";

// Library pages render their data in the cookie language; render the UI
// strings in it too, from the very first HTML.
export default function KnowledgeBaseLayout({ children }: { children: ReactNode }) {
  return <ServerLanguageScope initial={getRequestLanguage()}>{children}</ServerLanguageScope>;
}
