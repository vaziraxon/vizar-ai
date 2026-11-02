import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RecommendationsBoard, type RecommendationItem } from "@/components/dashboard/RecommendationsBoard";
import { ErrorState } from "@/components/states/ErrorState";
import { RECOMMENDATION_TASKS } from "@/data/mockData";
import { listMyRecommendations } from "@/lib/data/recommendations";
import type { RecommendationStatus } from "@/lib/dashboard/recommendations";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const TITLE = "Shaxsiy tavsiyalar";
const SUBTITLE = "Viza tahlilidagi javoblaringizdan tuzilgan keyingi qadamlar.";

const DEMO_STATUS: Record<string, RecommendationStatus> = { Bajarildi: "done", Jarayonda: "in_progress" };

/** Demo mode only (no Supabase): the sample tasks, labelled as such on the page. */
const DEMO_ITEMS: RecommendationItem[] = RECOMMENDATION_TASKS.map((task) => ({
  id: task.id,
  title: task.title,
  priority: task.status === "Muhim" ? "Muhim" : "O'rtacha",
  status: DEMO_STATUS[task.status] ?? "not_started",
  created_at: "",
}));

export default async function RecommendationsPage() {
  const configured = isSupabaseConfigured();
  const result = configured ? await listMyRecommendations(50) : null;

  if (result && !result.ok) {
    return (
      <DashboardShell title={TITLE} subtitle={SUBTITLE}>
        <ErrorState description={result.error} />
      </DashboardShell>
    );
  }

  const items: RecommendationItem[] = result
    ? result.data.map((r) => ({
        id: r.id,
        title: r.title,
        priority: r.priority,
        status: r.status as RecommendationStatus,
        created_at: r.created_at,
      }))
    : DEMO_ITEMS;

  return (
    <DashboardShell title={TITLE} subtitle={SUBTITLE}>
      <RecommendationsBoard items={items} demo={!configured} />
    </DashboardShell>
  );
}
