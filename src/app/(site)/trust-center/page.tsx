import type { Metadata } from "next";
import { TrustCenterPage } from "@/components/site/pages/AboutPages";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/trust-center", "uz");

export default function Page() {
  return <TrustCenterPage />;
}
