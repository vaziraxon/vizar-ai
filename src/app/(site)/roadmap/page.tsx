import type { Metadata } from "next";
import { RoadmapPage } from "@/components/site/pages/AboutPages";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/roadmap", "uz");

export default function Page() {
  return <RoadmapPage />;
}
