import { DashboardToolPage } from "@/components/dashboard/ToolsHub";
import { VisaTimingTool } from "@/components/site/VisaTimingTool";

export default function Page() {
  return (
    <DashboardToolPage tool="visaTiming">
      <VisaTimingTool embedded />
    </DashboardToolPage>
  );
}
