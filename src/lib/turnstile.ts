/**
 * Server-side verification for Cloudflare Turnstile tokens.
 *
 * Reads TURNSTILE_SECRET_KEY through `process.env`, not `import.meta.env` - see
 * the comment at the top of src/lib/env.ts for why: Vite inlines
 * `import.meta.env.FOO` at build time, so an unset build-time secret would get
 * dead-code-eliminated from the deployed function and no dashboard change could
 * bring it back without a rebuild. `process.env` is read per-invocation instead.
 */

import { getClientKey } from './rate-limit';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function readEnv(name: string): string | undefined {
  const value = typeof process !== 'undefined' ? process.env?.[name] : undefined;
  return value && value.length > 0 ? value : undefined;
}

function isProduction(): boolean {
  const env = readEnv('VERCEL_ENV') ?? readEnv('NODE_ENV');
  return env !== 'development' && env !== 'preview' && env !== 'test';
}

export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'missing_token' | 'invalid_token' | 'verify_error' };

/**
 * Verifies a Cloudflare Turnstile token server-side. Fails CLOSED in
 * production: a missing secret key, missing token, or failed verification
 * all reject the request. The only bypass is for local/preview development
 * without a configured secret, so contributors aren't forced to provision a
 * Turnstile widget just to run the app - that bypass never applies when
 * isProduction() is true.
 */
export async function verifyTurnstile(token: unknown, request: Request): Promise<TurnstileResult> {
  const secret = readEnv('TURNSTILE_SECRET_KEY');

  if (!secret) {
    if (isProduction()) {
      console.error('[turnstile] TURNSTILE_SECRET_KEY is not configured in production');
      return { ok: false, reason: 'not_configured' };
    }
    return { ok: true };
  }

  if (typeof token !== 'string' || !token) {
    return { ok: false, reason: 'missing_token' };
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: getClientKey(request),
      }),
    });
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return data?.success === true ? { ok: true } : { ok: false, reason: 'invalid_token' };
  } catch (err) {
    console.error('[turnstile] verification request failed:', err);
    return { ok: false, reason: 'verify_error' };
  }
}
