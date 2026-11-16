/**
 * Payme Merchant API (JSON-RPC), as documented at developer.help.paycom.uz
 * (checked 2026-11-16). Payme calls our endpoint; we answer with `result` or
 * `error`, always HTTP 200. Amounts are in tiyin. One order = one one-time
 * account (`account.order_id`). Payme repeats Create/Perform/Cancel: a repeat
 * must get the same answer as the first call.
 *
 * States: 1 created, 2 performed, -1 cancelled, -2 cancelled after perform.
 * A created transaction not performed within 12 hours is cancelled (reason 4).
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
import { timingSafeEqual } from "node:crypto";
import type { PaymeConfig } from "./config";
import type { PaymentStore, PaymentTxn } from "./types";

export const PAYME_TIMEOUT_MS = 43_200_000;

type Msg = { ru: string; uz: string; en: string };
export interface RpcError {
  code: number;
  message: Msg;
  data?: string;
}
export interface RpcResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: RpcError;
}

const M = {
  auth: { ru: "Недостаточно привилегий для выполнения метода", uz: "Usulni bajarish uchun ruxsat yo‘q", en: "Insufficient privileges to perform the method" },
  request: { ru: "Неверный JSON-RPC запрос", uz: "JSON-RPC so‘rovi noto‘g‘ri", en: "Invalid JSON-RPC request" },
  method: { ru: "Метод не найден", uz: "Usul topilmadi", en: "Method not found" },
  amount: { ru: "Неверная сумма", uz: "Noto‘g‘ri summa", en: "Invalid amount" },
  order: { ru: "Заказ не найден", uz: "Buyurtma topilmadi", en: "Order not found" },
  orderClosed: { ru: "Заказ уже оплачен или отменён", uz: "Buyurtma allaqachon to‘langan yoki bekor qilingan", en: "Order is already paid or cancelled" },
  orderBusy: { ru: "По заказу уже есть транзакция", uz: "Buyurtma bo‘yicha tranzaksiya allaqachon mavjud", en: "The order already has a transaction" },
  notFound: { ru: "Транзакция не найдена", uz: "Tranzaksiya topilmadi", en: "Transaction not found" },
  cannot: { ru: "Невозможно выполнить данную операцию", uz: "Bu amalni bajarib bo‘lmaydi", en: "Unable to perform this operation" },
  system: { ru: "Системная ошибка", uz: "Tizim xatosi", en: "System error" },
} satisfies Record<string, Msg>;

export const PAYME_ERRORS = {
  AUTH: -32504,
  REQUEST: -32600,
  METHOD: -32601,
  PARSE: -32700,
  SYSTEM: -32400,
  AMOUNT: -31001,
  NOT_FOUND: -31003,
  CANNOT_PERFORM: -31008,
  ORDER_NOT_FOUND: -31050,
  ORDER_CLOSED: -31051,
  ORDER_BUSY: -31052,
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class RpcFail extends Error {
  rpc: RpcError;
  constructor(rpc: RpcError) {
    super(rpc.message.en);
    this.rpc = rpc;
  }
}
const fail = (code: number, message: Msg, data?: string): never => {
  throw new RpcFail(data ? { code, message, data } : { code, message });
};

export const rpcError = (id: RpcResponse["id"], code: number, message: Msg = M.system, data?: string): RpcResponse => ({
  jsonrpc: "2.0",
  id,
  error: data ? { code, message, data } : { code, message },
});
export const PAYME_MESSAGES = M;

/** `Authorization: Basic base64("Paycom:<key>")`, compared in constant time */
export function paymeAuthorized(header: string | null, key: string): boolean {
  if (!header?.startsWith("Basic ")) return false;
  let decoded = "";
  try {
    decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep < 0 || decoded.slice(0, sep) !== "Paycom") return false;
  const given = Buffer.from(decoded.slice(sep + 1));
  const expected = Buffer.from(key);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const num = (v: unknown, name: string) => {
  if (typeof v !== "number" || !Number.isFinite(v)) fail(PAYME_ERRORS.REQUEST, M.request, name);
  return v as number;
};
const str = (v: unknown, name: string) => {
  if (typeof v !== "string" || !v) fail(PAYME_ERRORS.REQUEST, M.request, name);
  return v as string;
};

export async function handlePayme(
  body: unknown,
  authHeader: string | null,
  cfg: PaymeConfig | null,
  store: PaymentStore,
  now: number = Date.now()
): Promise<RpcResponse> {
  const req = (body && typeof body === "object" ? body : {}) as { id?: unknown; method?: unknown; params?: unknown };
  const id = typeof req.id === "number" || typeof req.id === "string" ? req.id : null;
  // Payments off or wrong key: Payme sees "insufficient privileges"
  if (!cfg || !paymeAuthorized(authHeader, cfg.key)) return rpcError(id, PAYME_ERRORS.AUTH, M.auth);
  if (typeof req.method !== "string" || !req.params || typeof req.params !== "object") {
    return rpcError(id, PAYME_ERRORS.REQUEST, M.request);
  }
  const p = req.params as Record<string, unknown>;
  try {
    const result = await dispatch(req.method, p, store, now);
    return { jsonrpc: "2.0", id, result };
  } catch (e) {
    if (e instanceof RpcFail) return { jsonrpc: "2.0", id, error: e.rpc };
    return rpcError(id, PAYME_ERRORS.SYSTEM, M.system);
  }
}

async function payableOrder(p: Record<string, unknown>, store: PaymentStore) {
  const amount = num(p.amount, "amount");
  const account = (p.account && typeof p.account === "object" ? p.account : {}) as Record<string, unknown>;
  const orderId = typeof account.order_id === "string" ? account.order_id : "";
  if (!UUID.test(orderId)) fail(PAYME_ERRORS.ORDER_NOT_FOUND, M.order, "order_id");
  const order = await store.getOrder(orderId);
  if (!order || order.provider !== "payme") return fail(PAYME_ERRORS.ORDER_NOT_FOUND, M.order, "order_id");
  if (amount !== order.amount_tiyin) fail(PAYME_ERRORS.AMOUNT, M.amount);
  if (order.status !== "pending") fail(PAYME_ERRORS.ORDER_CLOSED, M.orderClosed, "order_id");
  return order;
}

/** A created transaction past its 12 hours: cancelled with reason 4 */
async function expire(store: PaymentStore, t: PaymentTxn, now: number) {
  await store.updateTxn(t.id, { state: -1, reason: 4, cancel_time: now });
  await store.markCancelled(t.order_id);
}

async function dispatch(method: string, p: Record<string, unknown>, store: PaymentStore, now: number) {
  switch (method) {
    case "CheckPerformTransaction": {
      const order = await payableOrder(p, store);
      if (await store.getLiveTxn(order.id)) fail(PAYME_ERRORS.ORDER_BUSY, M.orderBusy, "order_id");
      return { allow: true };
    }

    case "CreateTransaction": {
      const txnId = str(p.id, "id");
      const time = num(p.time, "time");
      const existing = await store.getTxn("payme", txnId);
      if (existing) {
        if (existing.state !== 1) fail(PAYME_ERRORS.CANNOT_PERFORM, M.cannot);
        if (now - existing.create_time > PAYME_TIMEOUT_MS) {
          await expire(store, existing, now);
          fail(PAYME_ERRORS.CANNOT_PERFORM, M.cannot);
        }
        return { create_time: existing.create_time, transaction: String(existing.id), state: existing.state };
      }
      const order = await payableOrder(p, store);
      if (await store.getLiveTxn(order.id)) fail(PAYME_ERRORS.ORDER_BUSY, M.orderBusy, "order_id");
      if (now - time > PAYME_TIMEOUT_MS) fail(PAYME_ERRORS.CANNOT_PERFORM, M.cannot);
      const t = await store.createTxn({
        provider: "payme",
        provider_txn_id: txnId,
        order_id: order.id,
        amount_tiyin: order.amount_tiyin,
        state: 1,
        reason: null,
        provider_time: time,
        create_time: now,
        perform_time: 0,
        cancel_time: 0,
      });
      return { create_time: t.create_time, transaction: String(t.id), state: 1 };
    }

    case "PerformTransaction": {
      const t = await store.getTxn("payme", str(p.id, "id"));
      if (!t) return fail(PAYME_ERRORS.NOT_FOUND, M.notFound);
      if (t.state === 2) return { transaction: String(t.id), perform_time: t.perform_time, state: 2 };
      if (t.state !== 1) fail(PAYME_ERRORS.CANNOT_PERFORM, M.cannot);
      if (now - t.create_time > PAYME_TIMEOUT_MS) {
        await expire(store, t, now);
        fail(PAYME_ERRORS.CANNOT_PERFORM, M.cannot);
      }
      // Open the library first; only then report the transaction as performed
      await store.markPaid(t.order_id, `payme:${t.provider_txn_id}`);
      await store.updateTxn(t.id, { state: 2, perform_time: now });
      return { transaction: String(t.id), perform_time: now, state: 2 };
    }

    case "CancelTransaction": {
      const t = await store.getTxn("payme", str(p.id, "id"));
      if (!t) return fail(PAYME_ERRORS.NOT_FOUND, M.notFound);
      const reason = typeof p.reason === "number" ? p.reason : null;
      if (t.state === 1 || t.state === 2) {
        const state = t.state === 1 ? -1 : -2;
        await store.updateTxn(t.id, { state, reason, cancel_time: now });
        // Before payment: the order is closed. After payment (refund): access is withdrawn.
        await store.markCancelled(t.order_id);
        return { transaction: String(t.id), cancel_time: now, state };
      }
      return { transaction: String(t.id), cancel_time: t.cancel_time, state: t.state };
    }

    case "CheckTransaction": {
      const t = await store.getTxn("payme", str(p.id, "id"));
      if (!t) return fail(PAYME_ERRORS.NOT_FOUND, M.notFound);
      return {
        create_time: t.create_time,
        perform_time: t.perform_time,
        cancel_time: t.cancel_time,
        transaction: String(t.id),
        state: t.state,
        reason: t.reason,
      };
    }

    case "GetStatement": {
      const list = await store.listTxns("payme", num(p.from, "from"), num(p.to, "to"));
      return {
        transactions: list.map((t) => ({
          id: t.provider_txn_id,
          time: t.provider_time,
          amount: t.amount_tiyin,
          account: { order_id: t.order_id },
          create_time: t.create_time,
          perform_time: t.perform_time,
          cancel_time: t.cancel_time,
          transaction: String(t.id),
          state: t.state,
          reason: t.reason,
        })),
      };
    }

    // Keys live in server settings, not in a database the API could change
    case "ChangePassword":
      return fail(PAYME_ERRORS.AUTH, M.auth);

    default:
      return fail(PAYME_ERRORS.METHOD, M.method, method);
  }
}
