"use server";

import { revalidatePath } from "next/cache";
import * as reports from "@/lib/data/reports";

export async function upsertReportAction(input: {
  applicationId: string;
  reportType: "readiness" | "documents" | "interview" | "refusal" | "summary";
  title: string;
  reportData: Record<string, unknown>;
}) {
  const result = await reports.upsertReport(input);
  if (result.ok) revalidatePath("/reports");
  return result;
}
