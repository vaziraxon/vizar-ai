import type { Metadata } from "next";
import { ToolPage } from "@/components/site/ToolPage";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/experts", "uz");

export default function Page() {
  return <ToolPage id="experts" />;
}
