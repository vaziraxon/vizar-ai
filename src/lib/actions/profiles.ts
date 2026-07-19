"use server";

import { revalidatePath } from "next/cache";
import * as profiles from "@/lib/data/profiles";

export async function updateMyProfileAction(input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferredLanguage?: "uz" | "ru" | "en";
  accountType?: "individual" | "agency";
}) {
  const result = await profiles.updateMyProfile(input);
  if (result.ok) {
    revalidatePath("/profile");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function markOnboardingCompleteAction() {
  return profiles.markOnboardingComplete();
}
