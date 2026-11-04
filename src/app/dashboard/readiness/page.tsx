import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ReadinessView } from "@/components/dashboard/ReadinessView";
import { ErrorState } from "@/components/states/ErrorState";
import { REQUIRED_DOCUMENT_TITLES } from "@/data/mockData";
import { getLatestApplication } from "@/lib/data/applications";
import { getAssessmentForApplication, isAssessmentComplete } from "@/lib/data/assessments";
import { listDocumentsForApplication } from "@/lib/data/documents";
import { filledSlots } from "@/lib/dashboard/readiness";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const TITLE = "Viza tayyorgarlik bali";
const SUBTITLE = "Yuklagan hujjatlaringiz, checklist va mashqlaringiz asosida hisoblanadi.";

export default async function ReadinessScorePage() {
  let hasApplication = false;
  let assessmentDone = false;
  let uploadedTypes: string[] = [];

  if (isSupabaseConfigured()) {
    const appResult = await getLatestApplication();
    if (!appResult.ok) {
      return (
        <DashboardShell title={TITLE} subtitle={SUBTITLE}>
          <ErrorState description={appResult.error} />
        </DashboardShell>
      );
    }

    if (appResult.data) {
      const [assessmentResult, docsResult] = await Promise.all([
        getAssessmentForApplication(appResult.data.id),
        listDocumentsForApplication(appResult.data.id),
      ]);
      if (!assessmentResult.ok || !docsResult.ok) {
        const failed = !assessmentResult.ok ? assessmentResult : docsResult;
        return (
          <DashboardShell title={TITLE} subtitle={SUBTITLE}>
            <ErrorState description={failed.ok ? undefined : failed.error} />
          </DashboardShell>
        );
      }
      hasApplication = true;
      assessmentDone = isAssessmentComplete(assessmentResult.data);
      uploadedTypes = docsResult.data.map((doc) => doc.document_type);
    }
  }

  const filled = filledSlots(uploadedTypes, REQUIRED_DOCUMENT_TITLES);

  return (
    <DashboardShell title={TITLE} subtitle={SUBTITLE}>
      <ReadinessView
        facts={{
          hasApplication,
          assessmentDone,
          docsUploaded: filled.length,
          docsTotal: REQUIRED_DOCUMENT_TITLES.length,
        }}
        missingDocs={REQUIRED_DOCUMENT_TITLES.filter((title) => !filled.includes(title))}
      />
    </DashboardShell>
  );
}
