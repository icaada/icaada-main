import { ApiError } from "@/lib/api/api-error";

// Fixed-window, in-memory rate limiter. Good enough for a single Node instance;
// on serverless or multi-instance deploys each instance keeps its own counters,
// so swap the store for Redis/Upstash when traffic warrants it.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitRule {
  /** Max requests per window. */
  limit: number;
  windowMs: number;
}

export const rateLimits = {
  login: { limit: 5, windowMs: 15 * 60_000 },
  loginPerIp: { limit: 30, windowMs: 15 * 60_000 },
  contact: { limit: 5, windowMs: 10 * 60_000 },
  volunteer: { limit: 3, windowMs: 10 * 60_000 },
  newsletter: { limit: 5, windowMs: 10 * 60_000 },
  resetPerIp: { limit: 10, windowMs: 15 * 60_000 },
  resetPerEmail: { limit: 3, windowMs: 60 * 60_000 },
} satisfies Record<string, RateLimitRule>;

/** Counts a hit for `key`; throws a 429 ApiError once the limit is exceeded. */
export function enforceRateLimit(key: string, rule: RateLimitRule): void {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > rule.limit) {
    throw ApiError.rateLimited(Math.ceil((bucket.resetAt - now) / 1000));
  }
}

/** Clears a key, e.g. after a successful login. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
