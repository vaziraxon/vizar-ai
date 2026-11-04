import { DashboardToolPage } from "@/components/dashboard/ToolsHub";
import { VisaPhotoTool } from "@/components/site/VisaPhotoTool";

export default function Page() {
  return (
    <DashboardToolPage tool="visaPhoto">
      <VisaPhotoTool embedded />
    </DashboardToolPage>
  );
}
