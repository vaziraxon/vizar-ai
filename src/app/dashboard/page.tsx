import Link from "next/link";
import {
  FileCheck2,
  FileWarning,
  MessagesSquare,
  CalendarClock,
  ArrowRight,
  Check,
  Bell,
  Sparkles,
  ListChecks,
  FileSearch2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ScoreRing } from "@/components/dashboard/ScoreRing";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TrendChartCard } from "@/components/charts/TrendChartCard";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
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
  NEXT_STEPS,
  READINESS_TREND,
  DOC_COMPLETION_DATA,
  INTERVIEW_PROGRESS_TREND,
  ACTIVITY_TIMELINE,
  RISK_DISTRIBUTION,
  COUNTRY_INTEREST,
  RECENT_SCORE_CHANGES,
  WEEKLY_SUMMARY,
  SMART_RECOMMENDATIONS,
  NOTIFICATIONS,
  RECOMMENDATION_TASKS,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

const APP_STEPS = ["draft", "in_review", "ready", "completed"];

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();

  const [profileResult, appResult] = configured
    ? await Promise.all([getMyProfile(), getLatestApplication()])
    : [null, null];

  const application = appResult?.ok ? appResult.data : null;
  const firstName =
    (profileResult?.ok && profileResult.data?.first_name) || CURRENT_USER.firstName;

  const [docsResult, notificationsResult, recommendationsResult, consultationResult] =
    configured && application
      ? await Promise.all([
          listDocumentsForApplication(application.id),
          listMyNotifications(),
          listMyRecommendations(5),
          getUpcomingConsultation(),
        ])
      : [null, null, null, null];

  const uploadedCount = docsResult?.ok ? docsResult.data.length : 0;
  const missingCount = DOCUMENT_SLOTS.length - uploadedCount;

  return (
    <DashboardShell
      title={`Xush kelibsiz, ${firstName}`}
      subtitle="Joriy viza tayyorgarligingiz haqida umumiy ma'lumot."
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
            <Link
              href="/assessment"
              className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-brand-gradient px-5 py-2.5 text-body-sm font-semibold text-white shadow-glow"
            >
              Yangi tahlilni boshlash <ArrowRight size={15} />
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current application card */}
          <div className="card p-6 dark:border-white/10 dark:bg-navy-800 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-wide text-ink-400 dark:text-white/40">
                  Joriy ariza
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink-900 dark:text-white">
                  {configured && application ? application.destination_country : CURRENT_APPLICATION.destination}
                </h2>
                <p className="text-body-sm text-ink-600 dark:text-white/60">
                  {configured && application ? application.visa_type : CURRENT_APPLICATION.visaType}
                </p>
              </div>
              <StatusBadge
                status={
                  configured && application
                    ? displayApplicationStatus(application.status)
                    : CURRENT_APPLICATION.status
                }
              />
            </div>

            <div className="mt-6 flex items-center gap-6">
              <ScoreRing
                score={
                  configured && application
                    ? application.readiness_score ?? 0
                    : CURRENT_APPLICATION.readinessScore
                }
                size={96}
                strokeWidth={8}
              />
              <div className="flex-1">
                <p className="text-body-sm font-medium text-ink-700 dark:text-white/70">
                  Umumiy tayyorgarlik darajasi
                </p>
                <p className="mt-1 text-body-sm text-ink-600 dark:text-white/60">
                  Hujjatlaringiz va ma&apos;lumotlaringiz asosida hisoblangan.
                </p>
                <Link
                  href="/readiness-score"
                  className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  To&apos;liq natijani ko&apos;rish <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Progress tracker */}
            <div className="mt-6 border-t border-surface-border pt-5 dark:border-white/10">
              <p className="mb-3 text-body-sm font-medium text-ink-700 dark:text-white/70">
                Ariza jarayoni
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
                {(configured && application
                  ? APP_STEPS.map((s, i) => ({
                      label: displayApplicationStatus(s),
                      done: APP_STEPS.indexOf(application.status) >= i,
                    }))
                  : CURRENT_APPLICATION.progressSteps
                ).map((step, i, arr) => (
                  <div
                    key={step.label}
                    className="flex flex-1 items-center gap-2 sm:flex-col sm:items-center sm:text-center"
                  >
                    <div className="flex items-center gap-2 sm:flex-col">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold",
                          step.done
                            ? "bg-success text-white"
                            : "bg-surface-muted text-ink-400 dark:bg-white/10 dark:text-white/40"
                        )}
                      >
                        {step.done ? <Check size={13} /> : i + 1}
                      </span>
                      <span className="text-caption font-medium text-ink-600 dark:text-white/50 sm:mt-1">
                        {step.label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        className={cn(
                          "hidden h-px flex-1 sm:block",
                          step.done ? "bg-success" : "bg-surface-border dark:bg-white/10"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming consultation */}
          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="text-caption font-semibold uppercase tracking-wide text-ink-400 dark:text-white/40">
              Yaqinlashayotgan konsultatsiya
            </p>
            {configured && consultationResult?.ok && consultationResult.data ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
                    <CalendarClock size={19} />
                  </span>
                  <div>
                    <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
                      {consultationResult.data.specialist_name}
                    </p>
                    <p className="text-caption text-ink-400 dark:text-white/50">
                      {consultationResult.data.scheduled_at
                        ? new Date(consultationResult.data.scheduled_at).toLocaleString("uz-UZ", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </>
            ) : configured ? (
              <p className="mt-3 text-body-sm text-ink-600 dark:text-white/60">
                Hozircha rejalashtirilgan konsultatsiya yo&apos;q.
              </p>
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
                  <CalendarClock size={19} />
                </span>
                <div>
                  <p className="text-body-sm font-semibold text-ink-900 dark:text-white">
                    {UPCOMING_CONSULTATION.specialistName}
                  </p>
                  <p className="text-caption text-ink-400 dark:text-white/50">
                    {UPCOMING_CONSULTATION.date}, {UPCOMING_CONSULTATION.time}
                  </p>
                </div>
              </div>
            )}
            <Link
              href="/consultation"
              className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Barcha konsultatsiyalar <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {(!configured || application) && (
        <>
          {/* Stat cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={FileCheck2}
              label="Yuklangan hujjatlar"
              value={String(configured && application ? uploadedCount : CURRENT_APPLICATION.uploadedDocs)}
            />
            <StatCard
              icon={FileWarning}
              label="Yetishmayotgan hujjatlar"
              value={String(configured && application ? missingCount : CURRENT_APPLICATION.missingDocs)}
            />
            <StatCard
              icon={MessagesSquare}
              label="Intervyu tayyorgarligi"
              value={`${CURRENT_APPLICATION.interviewScore}/100`}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Recent activity */}
            <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
              <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
                So&apos;nggi faoliyat
              </p>
              <ul className="space-y-4">
                {RECENT_ACTIVITY.map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-brand-600 dark:bg-white/10">
                      <item.icon size={15} />
                    </span>
                    <div>
                      <p className="text-body-sm text-ink-700 dark:text-white/70">{item.text}</p>
                      <p className="text-caption text-ink-400 dark:text-white/40">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended next steps */}
            <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
              <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
                Tavsiya etilgan keyingi qadamlar
              </p>
              <ul className="space-y-3">
                {(configured && recommendationsResult?.ok && recommendationsResult.data.length > 0
                  ? recommendationsResult.data.map((r) => r.title)
                  : NEXT_STEPS
                ).map((step) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                      <ArrowRight size={11} />
                    </span>
                    <span className="text-body-sm text-ink-700 dark:text-white/70">{step}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/recommendations"
                className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Barcha tavsiyalar <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Analytics section — investor/demo analytics, always mock */}
      <div className="mt-10 border-t border-surface-border pt-8 dark:border-white/10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-display-sm text-ink-900 dark:text-white">
            Analitika
          </h2>
          <span className="rounded-pill bg-surface-muted px-3 py-1 text-caption font-semibold text-ink-500 dark:bg-white/10 dark:text-white/50">
            Demo ko&apos;rsatkichlar
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TrendChartCard title="Visa Readiness Score dinamikasi" data={READINESS_TREND} />
          <TrendChartCard
            title="Intervyu mashqlari progressi"
            data={INTERVIEW_PROGRESS_TREND}
            color="#22D3EE"
          />
          <DonutChartCard title="Hujjatlar to'liqligi" data={DOC_COMPLETION_DATA} />
          <DonutChartCard title="Xavf darajasi taqsimoti" data={RISK_DISTRIBUTION} />
          <BarChartCard title="Qiziqish bildirilgan davlatlar" data={COUNTRY_INTEREST} horizontal />

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
              Haftalik xulosa
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-display text-xl font-bold text-ink-900 dark:text-white">
                  {WEEKLY_SUMMARY.tasksCompleted}
                </p>
                <p className="text-caption text-ink-400 dark:text-white/40">Vazifalar bajarildi</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-ink-900 dark:text-white">
                  {WEEKLY_SUMMARY.docsUploaded}
                </p>
                <p className="text-caption text-ink-400 dark:text-white/40">Hujjat yuklandi</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-ink-900 dark:text-white">
                  {WEEKLY_SUMMARY.interviewSessions}
                </p>
                <p className="text-caption text-ink-400 dark:text-white/40">Intervyu mashqi</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-success">
                  {WEEKLY_SUMMARY.scoreChange}
                </p>
                <p className="text-caption text-ink-400 dark:text-white/40">Ball o&apos;zgarishi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
              Ariza faoliyati jadvali
            </p>
            <ul className="space-y-3 border-l border-surface-border pl-4 dark:border-white/10">
              {ACTIVITY_TIMELINE.map((item) => (
                <li key={item.title} className="relative text-body-sm">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-500" />
                  <span className="text-ink-700 dark:text-white/70">{item.title}</span>
                  <p className="text-caption text-ink-400 dark:text-white/40">{item.time}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
              So&apos;nggi ball o&apos;zgarishlari
            </p>
            <ul className="space-y-3">
              {RECENT_SCORE_CHANGES.map((c) => (
                <li key={c.label} className="flex items-center justify-between text-body-sm">
                  <div>
                    <p className="text-ink-700 dark:text-white/70">{c.label}</p>
                    <p className="text-caption text-ink-400 dark:text-white/40">{c.date}</p>
                  </div>
                  <span className="font-semibold text-success">{c.delta}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notifications preview */}
          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
                <Bell size={15} className="text-brand-600" /> Bildirishnomalar
              </p>
              <Link href="/notifications" className="text-caption font-semibold text-brand-600">
                Barchasi
              </Link>
            </div>
            <ul className="space-y-3">
              {(configured && notificationsResult?.ok && notificationsResult.data.length > 0
                ? notificationsResult.data.slice(0, 3).map((n) => ({
                    id: n.id,
                    title: n.title,
                    read: n.is_read,
                    time: new Date(n.created_at).toLocaleDateString("uz-UZ"),
                  }))
                : NOTIFICATIONS.slice(0, 3)
              ).map((n) => (
                <li key={n.id} className="text-body-sm">
                  <p
                    className={cn(
                      "font-medium",
                      n.read ? "text-ink-500 dark:text-white/50" : "text-ink-900 dark:text-white"
                    )}
                  >
                    {n.title}
                  </p>
                  <p className="text-caption text-ink-400 dark:text-white/40">{n.time}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <ListChecks size={15} className="text-brand-600" /> Yaqinlashayotgan vazifalar
            </p>
            <ul className="space-y-3">
              {RECOMMENDATION_TASKS.slice(0, 3).map((t) => (
                <li key={t.id} className="flex items-center justify-between text-body-sm">
                  <span className="text-ink-700 dark:text-white/70">{t.title}</span>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
            <p className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-900 dark:text-white">
              <Sparkles size={15} className="text-brand-600" /> Aqlli tavsiyalar
            </p>
            <ul className="space-y-2.5">
              {SMART_RECOMMENDATIONS.map((r) => (
                <li key={r} className="flex items-start gap-2 text-body-sm text-ink-700 dark:text-white/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
