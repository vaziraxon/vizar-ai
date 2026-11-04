import type { Metadata } from "next";
import { FeaturesPage } from "@/components/site/pages/InnerPages";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/features", "uz");

export default function Page() {
  return <FeaturesPage />;
}
