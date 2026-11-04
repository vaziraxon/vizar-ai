import { DashboardToolPage } from "@/components/dashboard/ToolsHub";
import { VisaLettersTool } from "@/components/site/VisaLettersTool";

export default function Page() {
  return (
    <DashboardToolPage tool="visaLetters">
      <VisaLettersTool embedded />
    </DashboardToolPage>
  );
}
