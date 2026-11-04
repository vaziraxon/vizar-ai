import type { Metadata } from "next";
import { PricingPage } from "@/components/site/pages/InnerPages";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/pricing", "uz");

export default function Page() {
  return <PricingPage />;
}
