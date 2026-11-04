import type { Metadata } from "next";
import { HowItWorksPage } from "@/components/site/pages/InnerPages";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/how-it-works", "uz");

export default function Page() {
  return <HowItWorksPage />;
}
