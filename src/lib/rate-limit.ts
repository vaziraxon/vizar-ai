/**
 * Best-effort, in-memory rate limiting for server actions.
 *
 * IMPORTANT LIMITATIONS — read before relying on this in production:
 * - State lives in a plain in-memory Map scoped to a single server
 *   process. On serverless/edge platforms (Vercel, etc.) each
 *   invocation may land on a different instance, and instances are
 *   recycled, so a determined attacker distributed across enough
 *   requests can bypass this. It raises the bar for casual abuse
 *   (e.g. someone re-clicking "register" in a loop, or a simple
 *   script hitting one instance) but is NOT a substitute for a
 *   durable, shared rate limiter.
 * - For real production protection, use a shared store such as
 *   Upstash Redis (`@upstash/ratelimit`) or Supabase's own Auth rate
 *   limits (already partially surfaced via the 429 handling in
 *   src/lib/actions/auth.ts), and/or put this behind a WAF/CDN rule.
 *
 * This module is intentionally dependency-free so it can ship today
 * without provisioning new infrastructure.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Prevent unbounded memory growth in a long-lived process by
// periodically clearing expired buckets. This is cheap and only does
// real work once every few minutes.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweepIfDue(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait before retrying, when not allowed. */
  retryAfterSeconds?: number;
}

/**
 * Fixed-window rate limiter. `key` should already identify the action
 * plus the caller (e.g. `login:203.0.113.4:someone@example.com`).
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweepIfDue(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true };
}

/**
 * Best-effort caller IP for use as a rate-limit key. Reads the
 * standard forwarded-for header set by Vercel/most proxies. Falls
 * back to a constant so requests without the header still share a
 * (coarser) limit instead of bypassing rate limiting entirely.
 */
export function getClientIp(headerList: Headers): string {
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  const realIp = headerList.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
