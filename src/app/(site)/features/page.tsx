import type { Metadata } from "next";
import { FeaturesPage } from "@/components/site/pages/InnerPages";
import { SITE_CONTENT } from "@/lib/i18n/site";

export const metadata: Metadata = {
  title: SITE_CONTENT.uz.toolsPage.title,
  description: SITE_CONTENT.uz.toolsPage.subtitle,
  alternates: { canonical: "/features" },
};

export default function Page() {
  return <FeaturesPage />;
}
