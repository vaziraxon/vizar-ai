import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AssessmentWizard } from "@/components/dashboard/AssessmentWizard";
import { getLatestDraftApplication } from "@/lib/data/applications";
import { getAssessmentForApplication } from "@/lib/data/assessments";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Json } from "@/types/database";

export default async function AssessmentPage() {
  const configured = isSupabaseConfigured();

  let resumeApplicationId: string | null = null;
  let resumeAnswers: Record<string, unknown> | null = null;

  if (configured) {
    const draftResult = await getLatestDraftApplication();
    if (draftResult.ok && draftResult.data) {
      resumeApplicationId = draftResult.data.id;
      const assessmentResult = await getAssessmentForApplication(draftResult.data.id);
      if (assessmentResult.ok && assessmentResult.data) {
        resumeAnswers = assessmentResult.data.answers as Record<string, Json>;
      }
    }
  }

  return (
    <DashboardShell
      title="Yangi viza tahlili"
      subtitle="Aniq tavsiyalar olish uchun quyidagi savollarga javob bering."
    >
      <AssessmentWizard
        resumeApplicationId={resumeApplicationId}
        resumeAnswers={resumeAnswers}
        configured={configured}
      />
    </DashboardShell>
  );
}
