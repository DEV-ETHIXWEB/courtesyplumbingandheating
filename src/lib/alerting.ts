/**
 * Failure alerting for the lead endpoints.
 *
 * A lead form that stops delivering is invisible: the site keeps serving, nothing
 * 500s for visitors browsing pages, and the first signal is the client asking why the
 * phone stopped ringing. Every failed send is logged (Vercel captures stderr), and
 * once failures cross a threshold an alert email goes out through the mail credentials
 * the site already has - no new vendor account.
 *
 * Deliberately not a monitoring product: no traces, no aggregation, no dashboard. It
 * answers one question - "are leads still being delivered?" - which is the one that
 * costs the client money.
 */
const FAILURE_THRESHOLD = 3;
const WINDOW_MS = 15 * 60 * 1000;
/** Never send more than one alert per this interval, whatever happens. */
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;

let failures: number[] = [];
let lastAlertAt = 0;

export interface AlertContext {
  route: string;
  reason: string;
  detail?: string;
}

/**
 * Records a delivery failure and, past the threshold, sends one alert.
 * Never throws and never rejects: alerting must not become its own outage.
 */
export async function reportLeadFailure(
  ctx: AlertContext,
  mail: { apiKey: string; from: string; to: string } | null
): Promise<void> {
  const now = Date.now();
  failures = failures.filter((t) => now - t < WINDOW_MS);
  failures.push(now);

  console.error(`[alert] lead delivery failed on ${ctx.route}: ${ctx.reason}`, {
    detail: ctx.detail,
    failuresInWindow: failures.length,
  });

  if (failures.length < FAILURE_THRESHOLD) return;
  if (now - lastAlertAt < ALERT_COOLDOWN_MS) return;

  // With no mail credentials there is nothing to send the alert *with*; the console
  // error above is the whole signal, and the deploy is already misconfigured.
  if (!mail) return;

  lastAlertAt = now;
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(mail.apiKey);
    // Resend returns errors rather than throwing, so the result has to be inspected -
    // otherwise a silently failing alert looks exactly like a healthy one.
    const { error } = await resend.emails.send({
      from: mail.from,
      to: mail.to,
      subject: `[Courtesy site] Lead delivery failing (${failures.length} in ${WINDOW_MS / 60000}m)`,
      html: `
        <h2>Lead delivery is failing</h2>
        <p><strong>${failures.length}</strong> failed attempts in the last ${WINDOW_MS / 60000} minutes.</p>
        <p>Most recent: <code>${ctx.route}</code> - ${ctx.reason}</p>
        ${ctx.detail ? `<p>Detail: <code>${ctx.detail}</code></p>` : ''}
        <p>Visitors are seeing the "please call us" fallback. Check RESEND_API_KEY,
        LEAD_FROM_EMAIL and the Resend dashboard for sending limits or domain issues.</p>
      `,
    });
    if (error) console.error('[alert] failure alert was not delivered:', error.message);
  } catch (err) {
    console.error('[alert] could not send failure alert', err);
  }
}
