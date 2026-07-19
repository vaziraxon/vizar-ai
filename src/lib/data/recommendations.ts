import "server-only";
import { getAuthedContext, genericDbError, type DataResult } from "./_shared";
import type { Database } from "@/types/database";

export type RecommendationRow = Database["public"]["Tables"]["recommendations"]["Row"];

export async function listMyRecommendations(limit = 20): Promise<DataResult<RecommendationRow[]>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return genericDbError();
  return { ok: true, data: data ?? [] };
}

export async function updateRecommendationStatus(
  recommendationId: string,
  status: "not_started" | "in_progress" | "done"
): Promise<DataResult<RecommendationRow>> {
  const ctx = await getAuthedContext();
  if (!ctx.ok) return ctx;

  const { data, error } = await ctx.supabase
    .from("recommendations")
    .update({ status })
    .eq("id", recommendationId)
    .eq("user_id", ctx.userId)
    .select("*")
    .single();

  if (error) return genericDbError();
  return { ok: true, data };
}
