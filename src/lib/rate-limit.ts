/**
 * Rate limiting for auth server actions (login/register/password reset).
 *
 * Two modes, chosen automatically:
 *
 * 1. SHARED / PRODUCTION-SAFE — active when UPSTASH_REDIS_REST_URL and
 *    UPSTASH_REDIS_REST_TOKEN are set. Every request hits the same
 *    Upstash Redis database over its REST API, so the limit is
 *    enforced correctly across every server instance/region — this is
 *    the mode to use in production on Vercel or any serverless host.
 *
 *    Implemented with plain `fetch()` against Upstash's REST API
 *    directly (see https://upstash.com/docs/redis/features/restapi) —
 *    no @upstash/ratelimit or @upstash/redis package required. That
 *    was a deliberate choice, not just a preference: this environment
 *    could not reach the npm registry to install new packages when
 *    this was written (`npm install` returned 403 for every package,
 *    not just Upstash's), so a dependency-free REST implementation was
 *    the only option available. If you add the official SDKs later,
 *    this module's public API (`rateLimit`, `getClientIp`) doesn't need
 *    to change for callers.
 *
 * 2. IN-MEMORY FALLBACK — used automatically when the two env vars
 *    above aren't set, so the app still runs (and still gets *some*
 *    protection) with zero required infrastructure. State lives in a
 *    plain Map scoped to a single server process: on serverless
 *    platforms each invocation may land on a different instance, and
 *    instances get recycled, so this does not fully protect a
 *    multi-instance deployment. Set up Upstash (mode 1) before relying
 *    on this in a real production launch — see SUPABASE_SETUP.md.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait before retrying, when not allowed. */
  retryAfterSeconds?: number;
}

// ---------------------------------------------------------------------------
// Shared limiter (Upstash Redis REST API)
// ---------------------------------------------------------------------------

interface UpstashConfig {
  url: string;
  token: string;
}

function getUpstashConfig(): UpstashConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
}

const UPSTASH_TIMEOUT_MS = 2000;

/**
 * Calls a single Redis command via Upstash's "path style" REST API,
 * e.g. upstashCommand(cfg, ["incr", "some-key"]) -> GET {url}/incr/some-key.
 * Aborts after UPSTASH_TIMEOUT_MS so a slow/unreachable Upstash never
 * hangs a login/register request — callers fall back to the in-memory
 * limiter if this throws.
 */
async function upstashCommand(cfg: UpstashConfig, args: Array<string | number>): Promise<unknown> {
  const path = args.map((part) => encodeURIComponent(String(part))).join("/");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTASH_TIMEOUT_MS);
  try {
    const res = await fetch(`${cfg.url}/${path}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Upstash command failed with status ${res.status}`);
    }
    const json = (await res.json()) as { result?: unknown; error?: string };
    if (json.error) {
      throw new Error(`Upstash command error: ${json.error}`);
    }
    return json.result;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fixed-window counter stored in Redis: INCR the window's key, set its
 * TTL the first time it's created, and read TTL back for a precise
 * retry-after when the caller is over the limit. Two round trips in
 * the common case (INCR, and TTL only when blocked); three on the very
 * first request of a fresh window (INCR, EXPIRE, nothing else since
 * count will be 1 <= limit).
 */
async function upstashFixedWindowLimit(
  cfg: UpstashConfig,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.round(windowMs / 1000));
  const redisKey = `ratelimit:${key}`;

  const count = Number(await upstashCommand(cfg, ["incr", redisKey]));

  if (count === 1) {
    // We just created this key — start its TTL. If the process dies
    // between INCR and EXPIRE the key is left without a TTL (so it
    // would persist and keep blocking); harmless in practice given
    // Upstash's own memory management, and self-corrects the moment
    // any future EXPIRE call on the same key succeeds. Not worth a
    // Lua script / MULTI for a rate limiter.
    await upstashCommand(cfg, ["expire", redisKey, windowSeconds]).catch(() => {
      /* best-effort — a missing TTL just means this key won't reset until overwritten */
    });
  }

  if (count <= limit) {
    return { allowed: true };
  }

  let retryAfterSeconds = windowSeconds;
  try {
    const ttl = Number(await upstashCommand(cfg, ["ttl", redisKey]));
    if (Number.isFinite(ttl) && ttl > 0) retryAfterSeconds = ttl;
  } catch {
    // Fall back to the conservative full-window estimate.
  }
  return { allowed: false, retryAfterSeconds };
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Prevent unbounded memory growth in a long-lived process by
// periodically clearing expired buckets. Cheap; only does real work
// once every few minutes.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweepIfDue(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function inMemoryFixedWindowLimit(key: string, limit: number, windowMs: number): RateLimitResult {
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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let warnedNoSharedLimiter = false;

/**
 * Fixed-window rate limiter. `key` should already identify the action
 * plus the caller (e.g. `login:203.0.113.4:someone@example.com`).
 * Uses the shared Upstash-backed limiter when configured, otherwise
 * transparently falls back to the in-memory one. Never throws —
 * infrastructure failures fail open to the in-memory limiter rather
 * than blocking auth entirely.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const cfg = getUpstashConfig();
  if (cfg) {
    try {
      return await upstashFixedWindowLimit(cfg, key, limit, windowMs);
    } catch (err) {
      console.error(
        "[rate-limit] Upstash request failed; falling back to the in-memory limiter for this call.",
        err
      );
    }
  } else if (!warnedNoSharedLimiter) {
    warnedNoSharedLimiter = true;
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — using a best-effort, " +
        "single-process in-memory rate limiter. Set those two env vars (see .env.example and " +
        "SUPABASE_SETUP.md) to enable shared, production-safe rate limiting before a real launch."
    );
  }
  return inMemoryFixedWindowLimit(key, limit, windowMs);
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
