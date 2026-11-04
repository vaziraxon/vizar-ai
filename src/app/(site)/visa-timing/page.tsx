import type { Metadata } from "next";
import { ToolPromo } from "@/components/site/ToolPromo";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/visa-timing", "uz");

export default function Page() {
  // The tool itself works only in the dashboard; this page promotes it.
  return <ToolPromo tool="visaTiming" />;
}
