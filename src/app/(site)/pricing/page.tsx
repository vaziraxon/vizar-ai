import type { Metadata } from "next";
import { PricingPage } from "@/components/site/pages/InnerPages";
import { SITE_CONTENT } from "@/lib/i18n/site";

export const metadata: Metadata = {
  title: SITE_CONTENT.uz.pricing.eyebrow,
  description: SITE_CONTENT.uz.pricing.subtitle,
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingPage />;
}
