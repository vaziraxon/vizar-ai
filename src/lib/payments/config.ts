/**
 * Online payment settings, all from server environment variables
 * (docs/payments-setup.md). Payments are OFF unless PAYMENTS_ENABLED=true;
 * each provider is on only when all of its keys are set.
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
import type { PayablePlan, PaymentProvider } from "./types";

/** Prices in so'm, as on /pricing (owner approved 2026-11-11). VIP is agreed one by one. */
export const PLAN_PRICE_UZS: Record<PayablePlan, number> = {
  standard: 49_000,
  premium: 179_000,
  pro: 679_000,
};
export const PAYABLE_PLANS = Object.keys(PLAN_PRICE_UZS) as PayablePlan[];
export const isPayablePlan = (v: unknown): v is PayablePlan => typeof v === "string" && v in PLAN_PRICE_UZS;

/** 1 so'm = 100 tiyin; both providers' amounts are compared in tiyin */
export const toTiyin = (uzs: number) => Math.round(uzs * 100);

export interface PaymeConfig {
  merchantId: string;
  key: string;
  testMode: boolean;
}
export interface ClickConfig {
  serviceId: string;
  merchantId: string;
  secretKey: string;
  merchantUserId: string | null;
}
export interface PaymentsConfig {
  enabled: boolean;
  payme: PaymeConfig | null;
  click: ClickConfig | null;
}

const val = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export function paymentsConfig(env: Record<string, string | undefined> = process.env): PaymentsConfig {
  const enabled = env.PAYMENTS_ENABLED === "true";
  const testMode = env.PAYME_TEST_MODE === "true";
  // In test mode Payme signs with the sandbox key (TEST_KEY)
  const paymeKey = val(testMode ? env.PAYME_TEST_KEY : env.PAYME_KEY);
  const paymeId = val(env.PAYME_MERCHANT_ID);
  const clickService = val(env.CLICK_SERVICE_ID);
  const clickMerchant = val(env.CLICK_MERCHANT_ID);
  const clickSecret = val(env.CLICK_SECRET_KEY);
  return {
    enabled,
    payme: enabled && paymeId && paymeKey ? { merchantId: paymeId, key: paymeKey, testMode } : null,
    click:
      enabled && clickService && clickMerchant && clickSecret
        ? { serviceId: clickService, merchantId: clickMerchant, secretKey: clickSecret, merchantUserId: val(env.CLICK_MERCHANT_USER_ID) }
        : null,
  };
}

export function availableProviders(cfg: PaymentsConfig): PaymentProvider[] {
  return [cfg.payme ? "payme" : null, cfg.click ? "click" : null].filter((p): p is PaymentProvider => p !== null);
}
