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

export interface RateLimitResult {
  limited: boolean;
  /** Seconds until the oldest hit ages out; used for the Retry-After header. */
  retryAfter: number;
}

/**
 * `scope` keeps each endpoint's budget separate, so someone who just used the
 * contact form is not locked out of the chatbot as well.
 */
export function isRateLimited(key: string, scope: string): RateLimitResult {
  const now = Date.now();
  const id = `${scope}:${key}`;
  const timestamps = (hits.get(id) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    hits.set(id, timestamps);
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000)),
    };
  }

  timestamps.push(now);
  hits.set(id, timestamps);

  // Opportunistic cleanup so the map doesn't grow unbounded under sustained traffic.
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return { limited: false, retryAfter: 0 };
}

/**
 * Rejects cross-site POSTs to the lead endpoints.
 *
 * Not CSRF protection in the classic sense - there is no session or cookie auth here,
 * so there is nothing for an attacker to ride. This is anti-abuse: it stops another
 * origin from scripting our endpoints to spam the client's inbox, which is the
 * realistic threat for a public form. Requests with no Origin header (curl, server to
 * server, some older browsers) are allowed through, since rejecting them would break
 * legitimate non-browser callers while stopping no real attack.
 */
export function isAllowedOrigin(request: Request, siteUrl: string | undefined): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    const requestHost = new URL(origin).host;
    if (requestHost === new URL(request.url).host) return true;
    if (siteUrl && requestHost === new URL(siteUrl).host) return true;
    return false;
  } catch {
    return false;
  }
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}
