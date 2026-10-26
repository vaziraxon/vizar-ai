import type { Metadata } from "next";
import { ToolPage } from "@/components/site/ToolPage";
import { SITE_CONTENT } from "@/lib/i18n/site";

const tool = SITE_CONTENT.uz.tools.checklist;

export const metadata: Metadata = {
  title: `${tool.name} — ${tool.tagline}`,
  description: tool.desc,
  alternates: { canonical: "/checklist" },
};

export default function Page() {
  return <ToolPage id="checklist" />;
}
