import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ReportsGrid } from "@/components/dashboard/ReportsGrid";
import { SupabaseSetupNotice } from "@/components/dev/SupabaseSetupNotice";
import { ErrorState } from "@/components/states/ErrorState";
import { listMyReports } from "@/lib/data/reports";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ReportsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell
        title="Hisobotlar"
        subtitle="Tayyorgarlik jarayoningiz bo'yicha hisobotlarni ko'ring va yuklab oling."
      >
        <SupabaseSetupNotice />
      </DashboardShell>
    );
  }

  const result = await listMyReports();

  return (
    <DashboardShell
      title="Hisobotlar"
      subtitle="Tayyorgarlik jarayoningiz bo'yicha hisobotlarni ko'ring va yuklab oling."
    >
      {!result.ok ? <ErrorState description={result.error} /> : <ReportsGrid reports={result.data} />}
    </DashboardShell>
  );
}
