import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationPage } from "@/components/site/pages/InnerPages";
import { SITE_CONTENT } from "@/lib/i18n/site";
import { DESTINATIONS, type DestinationSlug } from "@/lib/site/registry";

type Params = { params: { slug: string } };

const isSlug = (slug: string): slug is DestinationSlug => DESTINATIONS.some((d) => d.slug === slug);

export const dynamicParams = false;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  if (!isSlug(params.slug)) return {};
  const copy = SITE_CONTENT.uz.destinations[params.slug];
  return {
    title: `${copy.name} — viza tayyorgarligi`,
    description: copy.intro,
    alternates: { canonical: `/destinations/${params.slug}` },
  };
}

export default function Page({ params }: Params) {
  if (!isSlug(params.slug)) notFound();
  return <DestinationPage slug={params.slug} />;
}
