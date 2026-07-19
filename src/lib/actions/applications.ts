"use server";

import { revalidatePath } from "next/cache";
import * as applications from "@/lib/data/applications";

export async function createApplicationAction(input: {
  destinationCountry: string;
  visaType: string;
  travelPurpose?: string;
  travelDate?: string;
}) {
  const result = await applications.createApplication(input);
  if (result.ok) {
    revalidatePath("/applications");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function updateApplicationAction(input: {
  applicationId: string;
  destinationCountry?: string;
  visaType?: string;
  travelPurpose?: string | null;
  travelDate?: string | null;
  status?: "draft" | "in_review" | "ready" | "needs_consultation" | "completed";
}) {
  const result = await applications.updateApplication(input);
  if (result.ok) {
    revalidatePath("/applications");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function deleteDraftApplicationAction(applicationId: string) {
  const result = await applications.deleteDraftApplication(applicationId);
  if (result.ok) {
    revalidatePath("/applications");
    revalidatePath("/dashboard");
  }
  return result;
}
