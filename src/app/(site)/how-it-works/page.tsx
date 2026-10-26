import type { Metadata } from "next";
import { HowItWorksPage } from "@/components/site/pages/InnerPages";
import { SITE_CONTENT } from "@/lib/i18n/site";

export const metadata: Metadata = {
  title: SITE_CONTENT.uz.howPage.eyebrow,
  description: SITE_CONTENT.uz.howPage.subtitle,
  alternates: { canonical: "/how-it-works" },
};

export default function Page() {
  return <HowItWorksPage />;
}
