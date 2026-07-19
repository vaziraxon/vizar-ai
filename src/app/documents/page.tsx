import { AlertTriangle, FileSearch2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RealDocumentCard } from "@/components/dashboard/RealDocumentCard";
import { SupabaseSetupNotice } from "@/components/dev/SupabaseSetupNotice";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { getLatestApplication } from "@/lib/data/applications";
import { listDocumentsForApplication } from "@/lib/data/documents";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DOCUMENTS } from "@/data/mockData";
import Link from "next/link";

export default async function DocumentsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell
        title="Hujjatlar"
        subtitle="Barcha kerakli hujjatlarni yuklang — sun'iy intellekt ularni avtomatik tahlil qiladi."
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
        subtitle="Barcha kerakli hujjatlarni yuklang — sun'iy intellekt ularni avtomatik tahlil qiladi."
      >
        <ErrorState description={appResult.error} />
      </DashboardShell>
    );
  }

  if (!appResult.data) {
    return (
      <DashboardShell
        title="Hujjatlar"
        subtitle="Barcha kerakli hujjatlarni yuklang — sun'iy intellekt ularni avtomatik tahlil qiladi."
      >
        <EmptyState
          icon={FileSearch2}
          title="Avval viza tahlilini boshlang"
          description="Hujjat yuklash uchun avval kamida bitta viza arizasi kerak."
          action={
            <Link
              href="/assessment"
              className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-brand-gradient px-5 py-2.5 text-body-sm font-semibold text-white shadow-glow"
            >
              Yangi tahlilni boshlash
            </Link>
          }
        />
      </DashboardShell>
    );
  }

  const application = appResult.data;
  const docsResult = await listDocumentsForApplication(application.id);
  if (!docsResult.ok) {
    return (
      <DashboardShell
        title="Hujjatlar"
        subtitle="Barcha kerakli hujjatlarni yuklang — sun'iy intellekt ularni avtomatik tahlil qiladi."
      >
        <ErrorState description={docsResult.error} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Hujjatlar"
      subtitle={`${application.destination_country} — ${application.visa_type} uchun hujjatlar.`}
    >
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-body-sm text-amber-900 dark:text-amber-200">
          Hozircha test hujjatlaridan foydalaning. Demo versiyada haqiqiy
          passport yoki moliyaviy hujjatlarni yuklamang.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENTS.map((docSlot) => {
          const existing =
            docsResult.data.find((d) => d.document_type === docSlot.title) ?? null;
          return (
            <RealDocumentCard
              key={docSlot.id}
              applicationId={application.id}
              documentType={docSlot.title}
              icon={docSlot.icon}
              existingDoc={existing}
            />
          );
        })}
      </div>
    </DashboardShell>
  );
}
