import { DashboardToolPage } from "@/components/dashboard/ToolsHub";
import { SchengenCalculator } from "@/components/site/SchengenCalculator";

export default function Page() {
  return (
    <DashboardToolPage tool="schengenCalc">
      <SchengenCalculator embedded />
    </DashboardToolPage>
  );
}
