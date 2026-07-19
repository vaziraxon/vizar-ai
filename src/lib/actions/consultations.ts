"use server";

import { revalidatePath } from "next/cache";
import * as consultations from "@/lib/data/consultations";

export async function bookConsultationAction(input: {
  applicationId?: string | null;
  specialistName: string;
  scheduledAt: string;
  notes?: string | null;
}) {
  const result = await consultations.bookConsultation(input);
  if (result.ok) {
    revalidatePath("/consultation");
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
  }
  return result;
}

export async function cancelConsultationAction(consultationId: string) {
  const result = await consultations.cancelConsultation({ consultationId });
  if (result.ok) {
    revalidatePath("/consultation");
    revalidatePath("/dashboard");
  }
  return result;
}
