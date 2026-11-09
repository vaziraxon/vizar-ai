import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DocumentReadinessTest } from "@/components/dashboard/DocumentReadinessTest";
import { SupabaseSetupNotice } from "@/components/dev/SupabaseSetupNotice";
import { getLatestApplication } from "@/lib/data/applications";
import { getLatestDocumentCheck } from "@/lib/data/document-checks";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getRequestLanguage } from "@/lib/i18n/request-language";
import { BOOK_COUNTRY, loadBookRules } from "@/lib/document-check/book";
import { documentCheckAiEnabled } from "@/lib/document-check/ai";
import { matchDestinationSlug } from "@/lib/site/destination-match";
import { visaKindFromType } from "@/lib/dashboard/checklist-template";
import type { DestinationSlug } from "@/lib/site/registry";
import { CURRENT_APPLICATION } from "@/data/mockData";

const TITLE = "Hujjat tayyorgarligi testi";
const SUBTITLE = "Fayl yuklamasdan: har bir hujjatning holatini tanlang va keyingi qadamlarni ko'ring.";

export default async function DocumentCheckPage() {
  if (!isSupabaseConfigured()) {
    // Demo mode: the test works on the sample application, saving needs the database
    return (
      <DashboardShell title={TITLE} subtitle={SUBTITLE}>
        <div className="mb-6">
          <SupabaseSetupNotice compact />
        </div>
        <DocumentReadinessTest initialDest={matchDestinationSlug(CURRENT_APPLICATION.destination) ?? "schengen"} initialVisa={visaKindFromType(CURRENT_APPLICATION.visaType)} applicationId={null} latest={null} bookRules={{}} aiEnabled={false} canSave={false} />
      </DashboardShell>
    );
  }

  const [appResult, latestResult] = await Promise.all([getLatestApplication(), getLatestDocumentCheck()]);
  const application = appResult.ok ? appResult.data : null;
  const initialDest = matchDestinationSlug(application?.destination_country) ?? "schengen";
  const initialVisa = visaKindFromType(application?.visa_type);

  // The visa book's rules for every one-country destination (Schengen links to the library)
  const supabase = createClient();
  const lang = getRequestLanguage();
  const bookRules: Partial<Record<DestinationSlug, Awaited<ReturnType<typeof loadBookRules>>>> = {};
  if (supabase) {
    const dests = Object.keys(BOOK_COUNTRY) as DestinationSlug[];
    const loaded = await Promise.all(dests.map((d) => loadBookRules(supabase, d, lang)));
    dests.forEach((d, i) => (bookRules[d] = loaded[i]));
  }

  return (
    <DashboardShell title={TITLE} subtitle={SUBTITLE}>
      <DocumentReadinessTest
        initialDest={initialDest}
        initialVisa={initialVisa}
        applicationId={application?.id ?? null}
        latest={latestResult.ok ? latestResult.data : null}
        bookRules={bookRules}
        aiEnabled={documentCheckAiEnabled()}
        canSave
      />
    </DashboardShell>
  );
}
