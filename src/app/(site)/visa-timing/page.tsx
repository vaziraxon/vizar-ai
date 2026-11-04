import type { Metadata } from "next";
import { VisaTimingTool } from "@/components/site/VisaTimingTool";
import { SITE_CONTENT } from "@/lib/i18n/site";

const copy = SITE_CONTENT.uz.visaTiming;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.subtitle,
  alternates: { canonical: "/visa-timing" },
};

export default function Page() {
  return <VisaTimingTool />;
}
