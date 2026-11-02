"use server";

import { revalidatePath } from "next/cache";
import * as consultations from "@/lib/data/consultations";

export async function requestConsultationAction(input: {
  topic: string;
  contact: string;
  preferredTime: string;
  message: string;
}) {
  const result = await consultations.requestConsultation(input);
  if (result.ok) {
    revalidatePath("/dashboard/experts");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
  }
  return result;
}

export async function cancelConsultationAction(consultationId: string) {
  const result = await consultations.cancelConsultation({ consultationId });
  if (result.ok) {
    revalidatePath("/dashboard/experts");
    revalidatePath("/dashboard");
  }
  return result;
}
