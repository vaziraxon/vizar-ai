import type { Metadata } from "next";
import { VisaLettersTool } from "@/components/site/VisaLettersTool";
import { SITE_CONTENT } from "@/lib/i18n/site";

const copy = SITE_CONTENT.uz.visaLetters;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.subtitle,
  alternates: { canonical: "/visa-letters" },
};

export default function Page() {
  return <VisaLettersTool />;
}
