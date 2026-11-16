/**
 * Where the browser goes to pay. Both providers then call our server
 * (Payme Merchant API / Click Shop API); the library opens only on that call,
 * never because the browser came back.
 *   Payme: GET <host>/<base64("m=..;ac.order_id=..;a=<tiyin>;l=..;c=<return>")>
 *          host https://checkout.paycom.uz, sandbox https://test.paycom.uz
 *   Click: https://my.click.uz/services/pay?service_id&merchant_id&amount(N.NN)&transaction_param&return_url
 * No runtime "@/" imports: Node runs the tests on this file directly.
 */
import type { ClickConfig, PaymeConfig } from "./config";

export function paymeCheckoutUrl(cfg: PaymeConfig, opts: { orderId: string; amountTiyin: number; returnUrl: string; lang: "uz" | "ru" | "en" }) {
  const params = [`m=${cfg.merchantId}`, `ac.order_id=${opts.orderId}`, `a=${opts.amountTiyin}`, `l=${opts.lang}`, `c=${opts.returnUrl}`].join(";");
  const host = cfg.testMode ? "https://test.paycom.uz" : "https://checkout.paycom.uz";
  return `${host}/${Buffer.from(params, "utf8").toString("base64")}`;
}

export function clickCheckoutUrl(cfg: ClickConfig, opts: { orderId: string; amountTiyin: number; returnUrl: string }) {
  const q = new URLSearchParams({
    service_id: cfg.serviceId,
    merchant_id: cfg.merchantId,
    amount: (opts.amountTiyin / 100).toFixed(2),
    transaction_param: opts.orderId,
    return_url: opts.returnUrl,
  });
  if (cfg.merchantUserId) q.set("merchant_user_id", cfg.merchantUserId);
  return `https://my.click.uz/services/pay?${q.toString()}`;
}
