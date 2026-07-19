"use server";

import { revalidatePath } from "next/cache";
import * as assessments from "@/lib/data/assessments";

export async function saveAssessmentProgressAction(input: {
  applicationId: string;
  step: number;
  answers: Record<string, string | number | boolean | null>;
}) {
  return assessments.saveAssessmentProgress(input);
}

export async function completeAssessmentAction(input: {
  applicationId: string;
  answers: Record<string, string | number | boolean | null>;
}) {
  const result = await assessments.completeAssessment(input);
  if (result.ok) {
    revalidatePath("/readiness-score");
    revalidatePath("/dashboard");
    revalidatePath("/recommendations");
    revalidatePath("/notifications");
  }
  return result;
}
