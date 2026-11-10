import type { Metadata } from "next";
import { AboutUsPage } from "@/components/site/pages/AboutUsPage";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/about", "uz");

export default function Page() {
  return <AboutUsPage />;
}
