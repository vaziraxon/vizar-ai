import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Base, { generateMetadata as baseMetadata } from "@/app/(site)/knowledge-base/search/page";
import { setRequestLanguage } from "@/lib/i18n/request-language";
import { isUrlLang } from "@/lib/i18n/url-lang";

// Library search at /ru… and /en…: the same page, in the address's language
export const dynamic = "force-dynamic";

type Props = { params: { lang: string }; searchParams: { q?: string | string[] } };

export function generateMetadata({ params }: Props): Metadata {
  if (!isUrlLang(params.lang)) return {};
  setRequestLanguage(params.lang);
  return baseMetadata();
}

export default function Page({ params, searchParams }: Props) {
  if (!isUrlLang(params.lang)) notFound();
  setRequestLanguage(params.lang);
  return <Base searchParams={searchParams} />;
}
