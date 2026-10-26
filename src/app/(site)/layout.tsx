import { MarketingShell } from "@/components/site/MarketingShell";

// Persistent chrome for every public page — the navbar and footer don't
// remount when moving between /, /features, /pricing, tool pages, etc.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
