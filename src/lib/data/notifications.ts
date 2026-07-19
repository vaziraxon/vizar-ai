import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import { notificationMarkReadSchema } from "@/lib/validation/schemas";
import type { Database } from "@/types/database";

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export async function listMyNotifications(): Promise<DataResult<NotificationRow[]>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("notifications")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return genericDbError();
  return { ok: true, data: data ?? [] };
}

export async function markNotificationRead(input: unknown): Promise<DataResult<NotificationRow>> {
  const parsed = notificationMarkReadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "db_error", error: "Noto'g'ri so'rov." };
  }

  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", parsed.data.notificationId)
    .eq("user_id", ctx.userId)
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}

export async function markAllNotificationsRead(): Promise<DataResult<null>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", ctx.userId)
    .eq("is_read", false);

  if (error) return genericDbError();
  return { ok: true, data: null };
}

export async function createNotification(
  title: string,
  message: string,
  type: string
): Promise<DataResult<NotificationRow>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("notifications")
    .insert({ user_id: ctx.userId, title, message, type })
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}
