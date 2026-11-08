import { AlertTriangle, FileSearch2, ShieldCheck } from "lucide-react";
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

/** Shown instead of the upload controls while real uploads are closed */
function UploadsClosedNotice() {
  return (
    <section
      aria-labelledby="upload-closed"
      className="mb-6 flex flex-col gap-4 rounded-[28px] border border-violet-200 bg-gradient-to-br from-violet-50 via-surface to-surface p-6 shadow-xs sm:flex-row sm:items-start sm:p-7 dark:border-white/10 dark:from-violet-500/10"
    >
      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-violet-700 shadow-float ring-1 ring-violet-100 dark:text-violet-200 dark:ring-white/10">
        <ShieldCheck size={22} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-caption font-semibold uppercase tracking-[0.08em] text-violet-700 dark:text-violet-300">
          <L>Sinov bosqichida</L>
        </p>
        <h2 id="upload-closed" className="mt-1 font-display text-[1.35rem] font-semibold leading-snug text-ink-950">
          <L>AI hujjat tekshiruvi — sinov bosqichida</L>
        </h2>
        <p className="mt-2 text-body-sm text-ink-700">
          <L>{"Hujjatlaringiz xavfsizligi biz uchun birinchi o'rinda."}</L>{" "}
          <L>{"VIZAR AI hujjat tekshirish xizmatini O'zbekiston hududidagi himoyalangan serverda ishga tushirishga tayyorlamoqda."}</L>
        </p>
        <p className="mt-2 text-body-sm text-ink-700">
          <L>{"Shaxsiy ma'lumotlaringizni himoya qilish maqsadida ushbu funksiya xavfsizlik tekshiruvlari yakunlangunga qadar vaqtincha yopiq. Tez orada xizmatdan foydalanishingiz mumkin bo'ladi."}</L>
        </p>
      </div>
    </section>
  );
}

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
        <UploadsClosedNotice />
      )}

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
