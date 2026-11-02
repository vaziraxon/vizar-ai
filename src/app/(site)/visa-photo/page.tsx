import type { Metadata } from "next";
import { VisaPhotoTool } from "@/components/site/VisaPhotoTool";
import { SITE_CONTENT } from "@/lib/i18n/site";

const copy = SITE_CONTENT.uz.visaPhoto;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.subtitle,
  alternates: { canonical: "/visa-photo" },
};

export default function Page() {
  return <VisaPhotoTool />;
}
