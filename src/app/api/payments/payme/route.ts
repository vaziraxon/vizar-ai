import { paymentsConfig } from "@/lib/payments/config";
import { handlePayme, rpcError, PAYME_ERRORS, PAYME_MESSAGES } from "@/lib/payments/payme";
import { supabasePaymentStore } from "@/lib/payments/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Payme Merchant API endpoint (give this URL to Payme as the web cash
 * register's "Endpoint URL"). Always HTTP 200 with a JSON-RPC body; while
 * payments are off every call gets -32504.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(rpcError(null, PAYME_ERRORS.PARSE, { ru: "Ошибка парсинга JSON", uz: "JSON xatosi", en: "Parse error" }));
  }
  const cfg = paymentsConfig().payme;
  const store = cfg ? supabasePaymentStore() : null;
  if (!store) {
    const id = body && typeof body === "object" && "id" in body ? ((body as { id: number | string }).id ?? null) : null;
    return Response.json(rpcError(id, PAYME_ERRORS.AUTH, PAYME_MESSAGES.auth));
  }
  return Response.json(await handlePayme(body, request.headers.get("authorization"), cfg, store));
}

/** Payme only POSTs; anything else is -32300 */
export async function GET() {
  return Response.json(rpcError(null, -32300, { ru: "Метод запроса не POST", uz: "So‘rov POST emas", en: "Request method is not POST" }));
}
