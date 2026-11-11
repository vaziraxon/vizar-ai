import type { Metadata } from "next";
import { LegalPage } from "@/components/site/pages/LegalPage";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/terms-of-service", "uz");

export default function Page() {
  return <LegalPage kind="terms" />;
}
