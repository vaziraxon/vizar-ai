import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { SupabaseSetupNotice } from "@/components/dev/SupabaseSetupNotice";
import { ErrorState } from "@/components/states/ErrorState";
import { listMyApplications } from "@/lib/data/applications";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ApplicationsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell
        title="Arizalar tarixi"
        subtitle="Barcha viza arizalaringiz va ularning joriy holati."
      >
        <SupabaseSetupNotice />
      </DashboardShell>
    );
  }

  const result = await listMyApplications();

  return (
    <DashboardShell
      title="Arizalar tarixi"
      subtitle="Barcha viza arizalaringiz va ularning joriy holati."
    >
      {!result.ok ? (
        <ErrorState description={result.error} />
      ) : (
        <ApplicationsTable applications={result.data} />
      )}
    </DashboardShell>
  );
}
