import type { ApplicationStatus } from "@/types";

const STATUS_DISPLAY_MAP: Record<string, ApplicationStatus> = {
  draft: "Qoralama",
  // Set when the assessment is saved, so the assessment is finished, not running
  in_review: "Tahlil yakunlandi",
  ready: "Tayyor",
  needs_consultation: "Konsultatsiya kerak",
  completed: "Yakunlangan",
};

export function displayApplicationStatus(dbStatus: string): ApplicationStatus {
  return STATUS_DISPLAY_MAP[dbStatus] ?? "Qoralama";
}
