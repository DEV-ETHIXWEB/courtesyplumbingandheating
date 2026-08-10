/**
 * Minimal in-memory rate limiter for the lead-capture API routes.
 *
 * Serverless caveat: each Vercel function instance has its own memory, so
 * this caps abuse per warm instance rather than globally across the fleet.
 * That's a real gap for a high-traffic target, but it stops the common
 * case (a script hammering one endpoint) without requiring an external
 * store (Redis/Upstash) the client hasn't provisioned. Swap for a shared
 * store if traffic or abuse patterns justify it later.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded under sustained traffic.
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return false;
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}
