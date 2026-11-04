import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ToolCards } from "@/components/dashboard/ToolsHub";

export default function ToolsPage() {
  return (
    <DashboardShell title="Vositalar" subtitle="Viza tayyorgarligini tezlashtiradigan to'rt amaliy vosita — endi shaxsiy kabinetingizda.">
      <ToolCards />
    </DashboardShell>
  );
}
