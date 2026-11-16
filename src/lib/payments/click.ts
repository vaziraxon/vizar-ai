/**
 * Click Shop API, as documented at docs.click.uz/shop-api (checked
 * 2026-11-16): Click POSTs form data (application/x-www-form-urlencoded) in
 * two steps and we answer in JSON.
 *   Prepare  (action 0): sign = md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
 *   Complete (action 1): sign = md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
 * merchant_trans_id is our order id; merchant_prepare_id / merchant_confirm_id
 * is our transaction id. Amounts arrive in so'm ("49000.00").
 * Errors: 0 ok, -1 sign, -2 amount, -3 action, -4 already paid, -5 order not
 * found, -6 transaction not found, -7 update failed, -8 bad request, -9 cancelled.
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import type { ClickConfig } from "./config";
import type { PaymentStore } from "./types";

export const CLICK_ERRORS = {
  OK: 0,
  SIGN: -1,
  AMOUNT: -2,
  ACTION: -3,
  ALREADY_PAID: -4,
  ORDER_NOT_FOUND: -5,
  TXN_NOT_FOUND: -6,
  UPDATE_FAILED: -7,
  BAD_REQUEST: -8,
  CANCELLED: -9,
} as const;

const NOTE: Record<number, string> = {
  0: "Success",
  [-1]: "SIGN CHECK FAILED!",
  [-2]: "Incorrect parameter amount",
  [-3]: "Action not found",
  [-4]: "Already paid",
  [-5]: "User does not exist",
  [-6]: "Transaction does not exist",
  [-7]: "Failed to update user",
  [-8]: "Error in request from click",
  [-9]: "Transaction cancelled",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REQUIRED = ["click_trans_id", "service_id", "merchant_trans_id", "amount", "action", "sign_time", "sign_string"] as const;

export function clickSign(p: Record<string, string>, secretKey: string): string {
  const prepareId = p.action === "1" ? (p.merchant_prepare_id ?? "") : "";
  return createHash("md5")
    .update(`${p.click_trans_id}${p.service_id}${secretKey}${p.merchant_trans_id}${prepareId}${p.amount}${p.action}${p.sign_time}`)
    .digest("hex");
}

function signOk(p: Record<string, string>, secretKey: string) {
  const expected = Buffer.from(clickSign(p, secretKey));
  const given = Buffer.from(String(p.sign_string ?? "").toLowerCase());
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function handleClick(
  p: Record<string, string>,
  cfg: ClickConfig | null,
  store: PaymentStore,
  now: number = Date.now()
): Promise<Record<string, string | number>> {
  const reply = (error: number, extra: Record<string, string | number> = {}) => ({
    click_trans_id: p.click_trans_id ?? "",
    merchant_trans_id: p.merchant_trans_id ?? "",
    ...extra,
    error,
    error_note: NOTE[error] ?? "Error",
  });

  if (!cfg) return reply(CLICK_ERRORS.BAD_REQUEST);
  if (REQUIRED.some((k) => !p[k])) return reply(CLICK_ERRORS.BAD_REQUEST);
  if (p.action !== "0" && p.action !== "1") return reply(CLICK_ERRORS.ACTION);
  if (p.action === "1" && !p.merchant_prepare_id) return reply(CLICK_ERRORS.BAD_REQUEST);
  if (!signOk(p, cfg.secretKey)) return reply(CLICK_ERRORS.SIGN);
  if (p.service_id !== cfg.serviceId) return reply(CLICK_ERRORS.BAD_REQUEST);

  // Present after the REQUIRED check above
  const clickTransId = p.click_trans_id!;
  const orderId = p.merchant_trans_id!;
  const order = UUID.test(orderId) ? await store.getOrder(orderId) : null;
  if (!order || order.provider !== "click") return reply(CLICK_ERRORS.ORDER_NOT_FOUND);
  const amountTiyin = Math.round(Number.parseFloat(p.amount!) * 100);
  if (!Number.isFinite(amountTiyin) || amountTiyin !== order.amount_tiyin) return reply(CLICK_ERRORS.AMOUNT);
  const clickError = Number(p.error ?? 0);

  try {
    if (p.action === "0") {
      const existing = await store.getTxn("click", clickTransId);
      if (existing) {
        if (existing.state === 2) return reply(CLICK_ERRORS.ALREADY_PAID);
        if (existing.state < 0) return reply(CLICK_ERRORS.CANCELLED);
        return reply(CLICK_ERRORS.OK, { merchant_prepare_id: existing.id });
      }
      if (order.status === "paid") return reply(CLICK_ERRORS.ALREADY_PAID);
      if (order.status !== "pending") return reply(CLICK_ERRORS.CANCELLED);
      if (clickError < 0) return reply(CLICK_ERRORS.CANCELLED);
      const live = await store.getLiveTxn(order.id);
      if (live?.state === 2) return reply(CLICK_ERRORS.ALREADY_PAID);
      // An earlier attempt that never completed is replaced by this one
      if (live) await store.updateTxn(live.id, { state: -1, reason: 10, cancel_time: now });
      const t = await store.createTxn({
        provider: "click",
        provider_txn_id: clickTransId,
        order_id: order.id,
        amount_tiyin: order.amount_tiyin,
        state: 1,
        reason: null,
        provider_time: now,
        create_time: now,
        perform_time: 0,
        cancel_time: 0,
      });
      return reply(CLICK_ERRORS.OK, { merchant_prepare_id: t.id });
    }

    // Complete
    const t = await store.getTxnById(Number(p.merchant_prepare_id));
    if (!t || t.provider !== "click" || t.order_id !== order.id || t.provider_txn_id !== p.click_trans_id) {
      return reply(CLICK_ERRORS.TXN_NOT_FOUND);
    }
    if (t.state === 2) return reply(CLICK_ERRORS.ALREADY_PAID);
    if (t.state < 0) return reply(CLICK_ERRORS.CANCELLED);
    if (clickError < 0) {
      // Click could not take the money: cancel in our billing and answer -9
      await store.updateTxn(t.id, { state: -1, reason: 10, cancel_time: now });
      return reply(CLICK_ERRORS.CANCELLED);
    }
    await store.markPaid(order.id, `click:${p.click_trans_id}`);
    await store.updateTxn(t.id, { state: 2, perform_time: now });
    return reply(CLICK_ERRORS.OK, { merchant_confirm_id: t.id });
  } catch {
    return reply(CLICK_ERRORS.UPDATE_FAILED);
  }
}
