import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Base, { generateMetadata as baseMetadata } from "@/app/(site)/knowledge-base/countries/[code]/page";
import { setRequestLanguage } from "@/lib/i18n/request-language";
import { isUrlLang } from "@/lib/i18n/url-lang";
import { languageAlternates } from "@/lib/site/page-meta";

// A country's rules at /ru… and /en…: the same page, in the address's language
export const dynamic = "force-dynamic";

type Props = { params: { lang: string; code: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isUrlLang(params.lang)) return {};
  setRequestLanguage(params.lang);
  const meta = await baseMetadata({ params });
  const canonical = meta.alternates?.canonical;
  return typeof canonical === "string" ? { ...meta, alternates: languageAlternates(canonical, params.lang) } : meta;
}

export default function Page({ params }: Props) {
  if (!isUrlLang(params.lang)) notFound();
  setRequestLanguage(params.lang);
  return <Base params={params} />;
}
