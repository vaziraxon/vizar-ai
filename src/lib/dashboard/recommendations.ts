/**
 * Ordering and status steps for the user's recommendations (the to-dos the
 * visa assessment saves). Dependency-free so it can be unit-tested with plain Node.
 */
export type RecommendationStatus = "not_started" | "in_progress" | "done";

/** Clicking the status moves it one step on, and "done" starts over. */
export const NEXT_STATUS: Record<RecommendationStatus, RecommendationStatus> = {
  not_started: "in_progress",
  in_progress: "done",
  done: "not_started",
};

/** Uzbek source strings, as StatusBadge shows them */
export const STATUS_LABEL: Record<RecommendationStatus, string> = {
  not_started: "Boshlanmagan",
  in_progress: "Jarayonda",
  done: "Bajarildi",
};

const PRIORITY_RANK: Record<string, number> = { Muhim: 0, "O'rtacha": 1, Past: 2 };

/** Open before done, then "Muhim" first, then newest. */
export function openFirst<T extends { status: string; priority: string | null; created_at: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      Number(a.status === "done") - Number(b.status === "done") ||
      (PRIORITY_RANK[a.priority ?? ""] ?? 1) - (PRIORITY_RANK[b.priority ?? ""] ?? 1) ||
      b.created_at.localeCompare(a.created_at)
  );
}
