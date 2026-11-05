import type { Metadata } from "next";
import { LibraryPromo } from "@/components/site/LibraryPromo";
import { localizedMetadata } from "@/lib/site/page-meta";

export const metadata: Metadata = localizedMetadata("/knowledge-base", "uz");

export default function Page() {
  // The library itself is read in the dashboard; this page promotes it.
  return <LibraryPromo />;
}
