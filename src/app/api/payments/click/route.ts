import { paymentsConfig } from "@/lib/payments/config";
import { CLICK_ERRORS, handleClick } from "@/lib/payments/click";
import { supabasePaymentStore } from "@/lib/payments/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Click Shop API endpoint — the same URL for Prepare (action=0) and
 * Complete (action=1). Click sends application/x-www-form-urlencoded and
 * gets JSON back. While payments are off every call gets -8.
 */
export async function POST(request: Request) {
  const params: Record<string, string> = {};
  try {
    const form = await request.formData();
    form.forEach((value, key) => {
      if (typeof value === "string") params[key] = value;
    });
  } catch {
    return Response.json({ error: CLICK_ERRORS.BAD_REQUEST, error_note: "Error in request from click" });
  }
  const cfg = paymentsConfig().click;
  const store = cfg ? supabasePaymentStore() : null;
  if (!store) return Response.json({ error: CLICK_ERRORS.BAD_REQUEST, error_note: "Error in request from click" });
  return Response.json(await handleClick(params, cfg, store));
}
