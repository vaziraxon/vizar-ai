import { headers } from "next/headers";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 16 * 1024;

/** Origin + path only: a query string can hold a one-time sign-in code or other private data. */
function stripQuery(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  if (!/^https?:/i.test(value)) return value.slice(0, 80); // "inline", "eval", "data" …
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.slice(0, 200);
  } catch {
    return value.slice(0, 80);
  }
}

type Violation = { directive: string; blocked: string; page: string; source: string };

function toViolations(payload: unknown): Violation[] {
  // Reporting API (Chrome): [{ type: "csp-violation", body: { … } }]
  if (Array.isArray(payload)) {
    return payload
      .filter((r) => r && typeof r === "object" && (r as { type?: string }).type === "csp-violation")
      .map((r) => {
        const b = ((r as { body?: Record<string, unknown> }).body ?? {}) as Record<string, unknown>;
        return {
          directive: String(b.effectiveDirective ?? b.violatedDirective ?? ""),
          blocked: stripQuery(b.blockedURL ?? b.blockedURI),
          page: stripQuery(b.documentURL ?? b.documentURI),
          source: stripQuery(b.sourceFile),
        };
      });
  }
  // report-uri (Firefox, Safari): { "csp-report": { … } }
  const r = (payload as { "csp-report"?: Record<string, unknown> } | null)?.["csp-report"];
  if (r && typeof r === "object") {
    return [
      {
        directive: String(r["effective-directive"] ?? r["violated-directive"] ?? ""),
        blocked: stripQuery(r["blocked-uri"]),
        page: stripQuery(r["document-uri"]),
        source: stripQuery(r["source-file"]),
      },
    ];
  }
  return [];
}

/**
 * POST — browsers send Content-Security-Policy violation reports here (see
 * next.config.mjs). While the policy is report-only this shows, in the Vercel
 * runtime logs as "[csp] …", what enforcing it would block. No auth: reports
 * come from any visitor's browser; size-capped and rate-limited per address.
 */
export async function POST(request: Request) {
  const limit = await rateLimit(`csp-report:${getClientIp(headers())}`, 30, 10 * 60 * 1000);
  if (!limit.allowed) return new Response(null, { status: 429 });

  const text = await request.text().catch(() => "");
  if (!text || text.length > MAX_BODY) return new Response(null, { status: 204 });

  let payload: unknown = null;
  try {
    payload = JSON.parse(text);
  } catch {
    return new Response(null, { status: 204 });
  }

  for (const v of toViolations(payload).slice(0, 10)) {
    if (v.directive) console.warn("[csp]", JSON.stringify(v));
  }
  return new Response(null, { status: 204 });
}
