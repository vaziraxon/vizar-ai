"use client";

import {
  CHECKLIST_SELECTION_KEY,
  DEFAULT_SELECTION,
  checklistKey,
  checklistProgress,
  type ChecklistSaved,
  type ChecklistSelection,
} from "@/lib/dashboard/checklist-template";
import { INTERVIEW_HISTORY_KEY, type InterviewSession } from "@/lib/dashboard/interview-eval";
import { computeReadiness, type ServerReadinessFacts } from "@/lib/dashboard/readiness";
import { useLocalState } from "@/lib/dashboard/use-local-state";
import { useApplicationChecklist } from "@/components/dashboard/ActiveApplication";

/** Adds what is saved in this browser (checklist, practice) to what the server knows. */
export function useReadiness(server: ServerReadinessFacts) {
  const [stored] = useLocalState<ChecklistSelection>(CHECKLIST_SELECTION_KEY, DEFAULT_SELECTION);
  // The active application's checklist counts, not whichever one was last browsed
  const selection = useApplicationChecklist() ?? stored;
  const [saved] = useLocalState<ChecklistSaved>(checklistKey(selection.dest, selection.visa), { done: [], custom: [] });
  const [history] = useLocalState<InterviewSession[]>(INTERVIEW_HISTORY_KEY, []);
  const checklist = checklistProgress(selection, saved);

  return computeReadiness({
    ...server,
    checklistDone: checklist.done,
    checklistTotal: checklist.total,
    interviewScores: history.map((session) => session.score),
  });
}
