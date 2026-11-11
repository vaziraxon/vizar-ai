import { AlertTriangle, ArrowRight, ClipboardCheck, FileSearch2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RealDocumentCard } from "@/components/dashboard/RealDocumentCard";
import { BulkUploader } from "@/components/dashboard/BulkUploader";
import { SupabaseSetupNotice } from "@/components/dev/SupabaseSetupNotice";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { getLatestApplication } from "@/lib/data/applications";
import { listDocumentsForApplication } from "@/lib/data/documents";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { documentUploadsEnabled } from "@/lib/document-upload";
import { DOCUMENTS } from "@/data/mockData";
import Link from "next/link";
import { L } from "@/components/i18n/L";
import { DocumentUploadNotice } from "@/components/documents/DocumentUploadNotice";

const SUBTITLE = "Hujjatlaringizni bir joyda saqlang. Sayt ularning mazmunini tekshirmaydi — har birini talab bilan o'zingiz solishtiring.";

export default async function DocumentsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell
        title="Hujjatlar"
        subtitle={SUBTITLE}
      >
        <SupabaseSetupNotice />
      </DashboardShell>
    );
  }

  const appResult = await getLatestApplication();
  if (!appResult.ok) {
    return (
      <DashboardShell
        title="Hujjatlar"
        subtitle={SUBTITLE}
      >
        <ErrorState description={appResult.error} />
      </DashboardShell>
    );
  }

  if (!appResult.data) {
    return (
      <DashboardShell
        title="Hujjatlar"
        subtitle={SUBTITLE}
      >
        <EmptyState
          icon={FileSearch2}
          title="Avval viza tahlilini boshlang"
          description="Hujjat yuklash uchun avval kamida bitta viza arizasi kerak."
          action={
            <Link
              href="/assessment"
              className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-brand-600 transition-colors hover:bg-brand-deep px-5 py-2.5 text-body-sm font-semibold text-white"
            >
              <L>Yangi tahlilni boshlash</L>
            </Link>
          }
        />
      </DashboardShell>
    );
  }

  const application = appResult.data;
  const uploadsEnabled = documentUploadsEnabled();
  const docsResult = await listDocumentsForApplication(application.id);
  if (!docsResult.ok) {
    return (
      <DashboardShell
        title="Hujjatlar"
        subtitle={SUBTITLE}
      >
        <ErrorState description={docsResult.error} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Hujjatlar"
      subtitle={<L vars={{ d: application.destination_country, v: application.visa_type }}>{"{d} — {v} uchun hujjatlar."}</L>}
    >
      {uploadsEnabled ? (
        <>
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-body-sm text-amber-900 dark:text-amber-200">
              <L>Hozircha test hujjatlaridan foydalaning. Demo versiyada haqiqiy passport yoki moliyaviy hujjatlarni yuklamang.</L>
            </p>
          </div>
          <BulkUploader applicationId={application.id} documentTypes={DOCUMENTS.map((d) => d.title)} />
        </>
      ) : (
        <DocumentUploadNotice className="mb-6" />
      )}

      <Link
        href="/dashboard/documents/check"
        className="group mb-6 flex flex-col gap-4 rounded-[28px] bg-gradient-to-br from-[#5B21B6] to-[#7138EC] p-6 text-white shadow-float sm:flex-row sm:items-center sm:justify-between sm:p-7"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-white/80">
            <ClipboardCheck size={15} aria-hidden="true" /> <L>Hujjat tayyorgarligi testi</L>
          </span>
          <span className="mt-1.5 block text-body text-white/90">
            <L>Hujjatlaringiz holatini fayl yuklamasdan baholang: har bir hujjat uchun 4 variantdan birini tanlang.</L>
          </span>
        </span>
        <span className="btn btn-md shrink-0 bg-gold-300 text-night shadow-float group-hover:bg-gold-200">
          <L>Testni boshlash</L> <ArrowRight size={16} aria-hidden="true" />
        </span>
      </Link>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENTS.map((docSlot) => {
          const existing =
            docsResult.data.find((d) => d.document_type === docSlot.title) ?? null;
          return (
            <RealDocumentCard
              key={docSlot.id}
              applicationId={application.id}
              slotId={docSlot.id}
              documentType={docSlot.title}
              existingDoc={existing}
              optional={docSlot.optional}
              check={docSlot.check}
              uploadsEnabled={uploadsEnabled}
            />
          );
        })}
      </div>
    </DashboardShell>
  );
}
