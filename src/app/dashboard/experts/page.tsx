import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ConsultationPageClient } from "@/components/dashboard/ConsultationPageClient";
import { ErrorState } from "@/components/states/ErrorState";
import { listMyConsultations } from "@/lib/data/consultations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ConsultationRow } from "@/lib/data/consultations";

export default async function ConsultationPage() {
  const configured = isSupabaseConfigured();
  let upcoming: ConsultationRow[] = [];

  if (configured) {
    const result = await listMyConsultations();
    if (!result.ok) {
      return (
        <DashboardShell
          title="Konsultatsiya"
          subtitle="Tajribali mutaxassis bilan konsultatsiya band qiling."
        >
          <ErrorState description={result.error} />
        </DashboardShell>
      );
    }
    upcoming = result.data.filter((c) => c.status === "booked");
  }

  return (
    <DashboardShell
      title="Konsultatsiya"
      subtitle="Tajribali mutaxassis bilan konsultatsiya band qiling."
    >
      <ConsultationPageClient upcoming={upcoming} />
    </DashboardShell>
  );
}
