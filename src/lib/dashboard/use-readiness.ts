"use client";

import {
  CHECKLIST_SELECTION_KEY,
  DEFAULT_SELECTION,
  buildChecklist,
  checklistKey,
  checklistProgress,
  type ChecklistSaved,
  type ChecklistSelection,
} from "@/lib/dashboard/checklist-template";
import { INTERVIEW_HISTORY_KEY, type InterviewSession } from "@/lib/dashboard/interview-eval";
import { computeReadiness, type ServerReadinessFacts } from "@/lib/dashboard/readiness";
import { useLocalState } from "@/lib/dashboard/use-local-state";
import { WEIGHTS, docCheckKey, scoreAnswers, type Answer } from "@/lib/document-check/score";
import { useApplicationChecklist } from "@/components/dashboard/ActiveApplication";

/** Adds what is saved in this browser (checklist, practice) to what the server knows. */
export function useReadiness(server: ServerReadinessFacts) {
  const [stored] = useLocalState<ChecklistSelection>(CHECKLIST_SELECTION_KEY, DEFAULT_SELECTION);
  // The active application's checklist counts, not whichever one was last browsed
  const selection = useApplicationChecklist() ?? stored;
  const [saved] = useLocalState<ChecklistSaved>(checklistKey(selection.dest, selection.visa), { done: [], custom: [] });
  const [history] = useLocalState<InterviewSession[]>(INTERVIEW_HISTORY_KEY, []);
  const [answers] = useLocalState<Record<string, Answer>>(docCheckKey(selection.dest, selection.visa), {});
  const checklist = checklistProgress(selection, saved);

  // The 4-option readiness test for the same destination and visa type
  const test = scoreAnswers(
    buildChecklist(selection.dest, selection.visa).flatMap((g) => g.items),
    answers
  );
  const docTest = {
    points: (Object.keys(test.counts) as Answer[]).reduce((sum, a) => sum + test.counts[a] * WEIGHTS[a], 0),
    answered: test.answered,
    total: test.total,
  };

  return {
    ...computeReadiness({
      ...server,
      checklistDone: checklist.done,
      checklistTotal: checklist.total,
      interviewScores: history.map((session) => session.score),
      docTest,
    }),
    /** Documents the test says are not ready yet, most urgent first (missing, problems, in progress) */
    notReady: test.priorities.map((p) => p.item.title),
    testAnswered: test.answered,
  };
}
