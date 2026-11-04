import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ToolCards } from "@/components/dashboard/ToolsHub";

export default function ToolsPage() {
  return (
    <DashboardShell title="Foto, xatlar, muddat va Shengen kunlari" subtitle="Rasmni viza o'lchamiga keltiring, xatlarni tayyorlang, ariza muddati va Shengen kunlarini hisoblang — shu yerning o'zida.">
      <ToolCards />
    </DashboardShell>
  );
}
