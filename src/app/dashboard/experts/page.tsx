import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ConsultationPageClient } from "@/components/dashboard/ConsultationPageClient";
import { ErrorState } from "@/components/states/ErrorState";
import { listMyConsultations } from "@/lib/data/consultations";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ConsultationRow } from "@/lib/data/consultations";

const TITLE = "Konsultatsiya";
const SUBTITLE = "Mutaxassisga so'rov qoldiring — siz yozgan aloqa orqali bog'lanamiz.";

export default async function ConsultationPage() {
  let requests: ConsultationRow[] = [];

  if (isSupabaseConfigured()) {
    const result = await listMyConsultations();
    if (!result.ok) {
      return (
        <DashboardShell title={TITLE} subtitle={SUBTITLE}>
          <ErrorState description={result.error} />
        </DashboardShell>
      );
    }
    requests = result.data;
  }

  return (
    <DashboardShell title={TITLE} subtitle={SUBTITLE}>
      <ConsultationPageClient requests={requests} />
    </DashboardShell>
  );
}
