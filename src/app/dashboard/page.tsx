import Link from "next/link";
import { ArrowRight, FileSearch2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { L } from "@/components/i18n/L";
import { matchDestination } from "@/lib/site/destination-match";
import { SupabaseSetupNotice } from "@/components/dev/SupabaseSetupNotice";
import { EmptyState } from "@/components/states/EmptyState";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getMyProfile } from "@/lib/data/profiles";
import { getLatestApplication } from "@/lib/data/applications";
import { listDocumentsForApplication } from "@/lib/data/documents";
import { listMyNotifications } from "@/lib/data/notifications";
import { listMyRecommendations } from "@/lib/data/recommendations";
import { getUpcomingConsultation } from "@/lib/data/consultations";
import { displayApplicationStatus } from "@/lib/status-map";
import { DOCUMENTS as DOCUMENT_SLOTS } from "@/data/mockData";
import {
  CURRENT_USER,
  CURRENT_APPLICATION,
  UPCOMING_CONSULTATION,
  RECENT_ACTIVITY,
  NOTIFICATIONS,
  RECOMMENDATION_TASKS,
} from "@/data/mockData";

const APP_STEPS = ["draft", "in_review", "ready", "completed"];

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();

  const [profileResult, appResult] = configured
    ? await Promise.all([getMyProfile(), getLatestApplication()])
    : [null, null];

  const application = appResult?.ok ? appResult.data : null;
  const firstName = configured
    ? (profileResult?.ok && profileResult.data?.first_name) || ""
    : CURRENT_USER.firstName;

  const [docsResult, notificationsResult, recommendationsResult, consultationResult] =
    configured && application
      ? await Promise.all([
          listDocumentsForApplication(application.id),
          listMyNotifications(),
          listMyRecommendations(5),
          getUpcomingConsultation(),
        ])
      : [null, null, null, null];

  const live = configured && application;
  const uploadedCount = live ? (docsResult?.ok ? docsResult.data.length : 0) : CURRENT_APPLICATION.uploadedDocs;
  const totalSlots = live ? DOCUMENT_SLOTS.length : CURRENT_APPLICATION.uploadedDocs + CURRENT_APPLICATION.missingDocs;
  const missingCount = Math.max(0, totalSlots - uploadedCount);
  const docsPercent = totalSlots > 0 ? Math.min(100, Math.round((uploadedCount / totalSlots) * 100)) : 0;

  const destination = live ? application.destination_country : CURRENT_APPLICATION.destination;
  const visaType = live ? application.visa_type : CURRENT_APPLICATION.visaType;
  const status = live ? displayApplicationStatus(application.status) : CURRENT_APPLICATION.status;
  const score = live ? application.readiness_score ?? 0 : CURRENT_APPLICATION.readinessScore;

  const steps = live
    ? APP_STEPS.map((s, i) => ({
        label: displayApplicationStatus(s),
        done: APP_STEPS.indexOf(application.status) >= i,
      }))
    : CURRENT_APPLICATION.progressSteps;

  // Tasks: real recommendations when available, otherwise the demo list.
  const tasks =
    live && recommendationsResult?.ok && recommendationsResult.data.length > 0
      ? recommendationsResult.data.map((r) => ({ id: r.id, title: r.title, chip: r.priority ?? "O'rtacha" }))
      : live
        ? []
        : RECOMMENDATION_TASKS.filter((t) => t.status !== "Bajarildi").map((t) => ({ id: t.id, title: t.title, chip: t.status }));

  const nextAction = tasks[0]?.title ?? "Yangi viza tahlilini boshlang";

  // Activity: real notifications are actual account events; demo mode uses samples.
  const activity = live
    ? notificationsResult?.ok
      ? notificationsResult.data.slice(0, 4).map((n) => ({
          id: n.id,
          text: n.title,
          time: new Date(n.created_at).toLocaleDateString("uz-UZ"),
          unread: !n.is_read,
        }))
      : []
    : RECENT_ACTIVITY.map((a, i) => ({ id: String(i), text: a.text, time: a.time, unread: i === 0 }));

  const unreadCount = live
    ? notificationsResult?.ok
      ? notificationsResult.data.filter((n) => !n.is_read).length
      : 0
    : NOTIFICATIONS.filter((n) => !n.read).length;

  const consultation = live
    ? consultationResult?.ok && consultationResult.data
      ? {
          name: consultationResult.data.specialist_name,
          when: consultationResult.data.scheduled_at
            ? new Date(consultationResult.data.scheduled_at).toLocaleString("uz-UZ", { dateStyle: "long", timeStyle: "short" })
            : "—",
        }
      : null
    : { name: UPCOMING_CONSULTATION.specialistName, when: `${UPCOMING_CONSULTATION.date}, ${UPCOMING_CONSULTATION.time}` };

  return (
    <DashboardShell
      title={firstName ? "Xush kelibsiz, {name} 👋" : "Xush kelibsiz 👋"}
      titleVars={{ name: firstName }}
      subtitle="Viza tayyorgarligingiz — bir qarashda."
      heroImage={configured && !application ? undefined : matchDestination(destination)?.photo ?? "/images/travel/passports.webp"}
      eyebrow={
        configured && !application ? undefined : (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            <L>{String(destination ?? "")}</L> · <L>{String(visaType ?? "")}</L>
            <StatusBadge status={status} />
          </span>
        )
      }
      actions={
        <Link href="/assessment" className="btn-secondary btn-md">
          <FileSearch2 size={16} />
          <L>Yangi tahlil</L>
        </Link>
      }
    >
      {!configured && (
        <div className="mb-6">
          <SupabaseSetupNotice compact />
        </div>
      )}

      {configured && !application ? (
        <EmptyState
          icon={FileSearch2}
          title="Hali arizangiz yo'q"
          description="Yangi viza tahlilini boshlab, tayyorgarlik darajangizni bilib oling."
          action={
            <Link href="/assessment" className="btn-primary btn-md mt-2">
              <L>Yangi tahlilni boshlash</L> <ArrowRight size={15} />
            </Link>
          }
        />
      ) : (
        <DashboardOverview
          data={{
            destination: String(destination ?? ""),
            visaType: String(visaType ?? ""),
            status,
            score,
            steps,
            tasks,
            nextAction,
            uploadedCount,
            totalSlots,
            missingCount,
            docsPercent,
            unreadCount,
            activity,
            consultation,
          }}
        />
      )}
    </DashboardShell>
  );
}
