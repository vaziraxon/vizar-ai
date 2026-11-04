import type { Metadata } from "next";
import { ToolPromo } from "@/components/site/ToolPromo";
import { SITE_CONTENT } from "@/lib/i18n/site";

const copy = SITE_CONTENT.uz.visaPhoto;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.subtitle,
  alternates: { canonical: "/visa-photo" },
};

export default function Page() {
  // The tool itself works only in the dashboard; this page promotes it.
  return <ToolPromo tool="visaPhoto" />;
}
