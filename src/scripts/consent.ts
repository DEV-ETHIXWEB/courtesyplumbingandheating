/**
 * Consent state and the gated GTM loader.
 *
 * Shared by Analytics.astro (loads the container on repeat visits where consent was
 * already granted) and ConsentBanner.astro (loads it the moment consent is given).
 * Both go through loadGtm() so the container can never be injected twice.
 */
export type ConsentChoice = 'granted' | 'declined';

export const CONSENT_KEY = 'courtesy:analytics-consent';

export function readConsent(): ConsentChoice | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === 'granted' || stored === 'declined' ? stored : null;
  } catch {
    // Storage blocked: treat as undecided, which means no tags load.
    return null;
  }
}

export function loadGtm(): void {
  const w = window as unknown as {
    dataLayer?: Record<string, unknown>[];
    __gtmLoaded?: boolean;
  };
  if (w.__gtmLoaded) return;

  const id = document.documentElement.dataset.gtmId;
  if (!id) return;

  w.__gtmLoaded = true;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}
