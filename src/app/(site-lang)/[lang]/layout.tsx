import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/site/MarketingShell";
import { isUrlLang } from "@/lib/i18n/url-lang";
import { UrlLanguageScope } from "@/lib/language-context";

// /ru/… and /en/…: the public pages with the language in the address. The
// scope wraps the navbar and footer too, so the whole page is in that language.
export default function LangLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  if (!isUrlLang(params.lang)) notFound();
  return (
    <UrlLanguageScope lang={params.lang}>
      <MarketingShell>{children}</MarketingShell>
    </UrlLanguageScope>
  );
}
