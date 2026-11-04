import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationPage } from "@/components/site/pages/InnerPages";
import { localizedMetadata } from "@/lib/site/page-meta";
import { DESTINATIONS, type DestinationSlug } from "@/lib/site/registry";

type Params = { params: { slug: string } };

const isSlug = (slug: string): slug is DestinationSlug => DESTINATIONS.some((d) => d.slug === slug);

export const dynamicParams = false;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  return isSlug(params.slug) ? localizedMetadata(`/destinations/${params.slug}`, "uz") : {};
}

export default function Page({ params }: Params) {
  if (!isSlug(params.slug)) notFound();
  return <DestinationPage slug={params.slug} />;
}
