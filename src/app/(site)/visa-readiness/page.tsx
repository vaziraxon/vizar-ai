import type { Metadata } from "next";
import { ToolPage } from "@/components/site/ToolPage";
import { SITE_CONTENT } from "@/lib/i18n/site";

const tool = SITE_CONTENT.uz.tools.readiness;

export const metadata: Metadata = {
  title: `${tool.name} — ${tool.tagline}`,
  description: tool.desc,
  alternates: { canonical: "/visa-readiness" },
};

export default function Page() {
  return <ToolPage id="readiness" />;
}
