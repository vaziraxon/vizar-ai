"use server";

import { revalidatePath } from "next/cache";
import { updateRecommendationStatus } from "@/lib/data/recommendations";

export async function updateRecommendationStatusAction(
  recommendationId: string,
  status: "not_started" | "in_progress" | "done"
) {
  const result = await updateRecommendationStatus(recommendationId, status);
  if (result.ok) {
    revalidatePath("/recommendations");
    revalidatePath("/dashboard");
  }
  return result;
}
