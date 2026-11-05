"use server";

import { revalidatePath } from "next/cache";
import * as subscriptions from "@/lib/data/subscriptions";

export async function requestSubscriptionAction(input: { plan: string; contact: string; message: string }) {
  const result = await subscriptions.requestSubscription(input);
  if (result.ok) {
    revalidatePath("/dashboard/subscription", "layout");
    revalidatePath("/notifications");
  }
  return result;
}

export async function cancelSubscriptionRequestAction(requestId: string) {
  const result = await subscriptions.cancelSubscriptionRequest({ requestId });
  if (result.ok) revalidatePath("/dashboard/subscription", "layout");
  return result;
}
