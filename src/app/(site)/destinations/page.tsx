import type { Metadata } from "next";
import { DestinationsIndexPage } from "@/components/site/pages/InnerPages";
import { SITE_CONTENT } from "@/lib/i18n/site";

export const metadata: Metadata = {
  title: SITE_CONTENT.uz.destinationsPage.title,
  description: SITE_CONTENT.uz.destinationsPage.subtitle,
  alternates: { canonical: "/destinations" },
};

export default function Page() {
  return <DestinationsIndexPage />;
}
