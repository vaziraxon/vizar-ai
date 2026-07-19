"use server";

import { revalidatePath } from "next/cache";
import * as notifications from "@/lib/data/notifications";

export async function markNotificationReadAction(notificationId: string) {
  const result = await notifications.markNotificationRead({ notificationId });
  if (result.ok) revalidatePath("/notifications");
  return result;
}

export async function markAllNotificationsReadAction() {
  const result = await notifications.markAllNotificationsRead();
  if (result.ok) revalidatePath("/notifications");
  return result;
}
