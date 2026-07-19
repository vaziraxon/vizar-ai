import type { ApplicationStatus } from "@/types";

const STATUS_DISPLAY_MAP: Record<string, ApplicationStatus> = {
  draft: "Draft",
  in_review: "Tahlil qilinmoqda",
  ready: "Tayyor",
  needs_consultation: "Konsultatsiya kerak",
  completed: "Yakunlangan",
};

export function displayApplicationStatus(dbStatus: string): ApplicationStatus {
  return STATUS_DISPLAY_MAP[dbStatus] ?? "Draft";
}
