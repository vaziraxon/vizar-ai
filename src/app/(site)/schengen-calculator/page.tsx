import type { Metadata } from "next";
import { SchengenCalculator } from "@/components/site/SchengenCalculator";
import { SITE_CONTENT } from "@/lib/i18n/site";

const copy = SITE_CONTENT.uz.schengenCalc;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.subtitle,
  alternates: { canonical: "/schengen-calculator" },
};

export default function Page() {
  return <SchengenCalculator />;
}
