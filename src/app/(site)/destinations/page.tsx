import type { Metadata } from "next";
import { DestinationsIndexPage } from "@/components/site/pages/InnerPages";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/destinations", "uz");

export default function Page() {
  return <DestinationsIndexPage />;
}
