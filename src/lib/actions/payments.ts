"use server";

import { getAuthedContext } from "@/lib/data/_shared";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestLanguage } from "@/lib/i18n/request-language";
import { resolveSiteUrl } from "@/lib/site-url";
import { PLAN_PRICE_UZS, isPayablePlan, paymentsConfig, toTiyin } from "@/lib/payments/config";
import { clickCheckoutUrl, paymeCheckoutUrl } from "@/lib/payments/checkout";
import { createPaymentOrder } from "@/lib/payments/store";

/**
 * Starts an online payment: a new order at the server's price, then the
 * provider's checkout link. The library opens only when Payme or Click calls
 * our endpoint, never because the browser returns. Off unless payments are
 * enabled and that provider's keys are set.
 */
export async function startPaymentAction(input: { plan: string; provider: string }): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const cfg = paymentsConfig();
  const provider = input.provider === "payme" ? cfg.payme : input.provider === "click" ? cfg.click : null;
  if (!provider) return { ok: false, error: "Onlayn to‘lov hozircha ulanmagan." };
  if (!isPayablePlan(input.plan)) return { ok: false, error: "Tarifni tanlang." };

  const ctx = await getAuthedContext();
  if (!ctx.ok) return { ok: false, error: "Avval tizimga kiring." };
  const limit = await rateLimit(`payment-start:${ctx.userId}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) return { ok: false, error: "Juda ko‘p urinish. Birozdan keyin qayta urinib ko‘ring." };

  const amountTiyin = toTiyin(PLAN_PRICE_UZS[input.plan]);
  let orderId: string;
  try {
    orderId = await createPaymentOrder({ userId: ctx.userId, plan: input.plan, amountTiyin, provider: input.provider as "payme" | "click" });
  } catch {
    return { ok: false, error: "To‘lovni boshlab bo‘lmadi. Birozdan keyin qayta urinib ko‘ring." };
  }

  const returnUrl = `${resolveSiteUrl(process.env)}/dashboard/subscription?paid=1`;
  const url =
    input.provider === "payme" && cfg.payme
      ? paymeCheckoutUrl(cfg.payme, { orderId, amountTiyin, returnUrl, lang: getRequestLanguage() })
      : clickCheckoutUrl(cfg.click!, { orderId, amountTiyin, returnUrl });
  return { ok: true, url };
}
