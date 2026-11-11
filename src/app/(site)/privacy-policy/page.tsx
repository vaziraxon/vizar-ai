import type { Metadata } from "next";
import { LegalPage } from "@/components/site/pages/LegalPage";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/privacy-policy", "uz");

export default function Page() {
  return <LegalPage kind="privacy" />;
}
