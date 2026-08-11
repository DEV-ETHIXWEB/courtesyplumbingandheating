import type { APIRoute } from 'astro';
import { leadSchema, escapeHtml } from '../../lib/schema';
import { isRateLimited, getClientKey, isAllowedOrigin } from '../../lib/rate-limit';
import { getMailConfig } from '../../lib/env';
import { reportLeadFailure } from '../../lib/alerting';
import { business } from '../../data/business';

export const prerender = false;

export const POST: APIRoute = async ({ request, site }) => {
  if (!isAllowedOrigin(request, site?.href)) {
    return json({ ok: false, delivered: false, error: 'Request blocked.' }, 403);
  }

  const limit = isRateLimited(getClientKey(request), 'contact');
  if (limit.limited) {
    return json(
      { ok: false, delivered: false, error: 'Too many requests. Please call us.' },
      429,
      { 'Retry-After': String(limit.retryAfter) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ ok: false, error: 'Please check the information provided.' }, 422);
  }

  const lead = parsed.data;

  // Honeypot filled: a bot posting straight at the API. Report the same shape a
  // real send does, so it learns nothing, and send no mail.
  if (lead.company) {
    return json({ ok: true, delivered: true });
  }

  const rows: [string, string][] = [
    ['Service needed', lead.intent],
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Zip code', lead.zip],
    ['Preferred timing', lead.timing],
    ['Details', lead.details],
  ];

  const html = `
    <h2>New contact form submission</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .filter(([, v]) => v)
        .map(
          ([label, value]) =>
            `<tr><td style="border:1px solid #ddd"><strong>${escapeHtml(label)}</strong></td><td style="border:1px solid #ddd">${escapeHtml(value)}</td></tr>`
        )
        .join('')}
    </table>
  `;

  const mail = getMailConfig(business.email.display);

  // Missing mail credentials must fail loudly. Reporting success here would show the
  // visitor a confirmation for a lead that was never delivered anywhere.
  if (!mail) {
    await reportLeadFailure({ route: '/api/contact', reason: 'mail credentials missing' }, null);
    console.error('[contact] RESEND_API_KEY or LEAD_FROM_EMAIL not set; lead NOT delivered.', {
      intent: lead.intent,
    });
    return json({ ok: false, delivered: false, error: 'Could not send your request. Please call us.' }, 500);
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(mail.apiKey);
    const { error } = await resend.emails.send({
      from: mail.from,
      to: mail.to,
      subject: `New ${lead.intent} request: ${lead.name}`,
      html,
    });
    if (error) throw new Error(error.message);
    return json({ ok: true, delivered: true });
  } catch (err) {
    await reportLeadFailure(
      { route: '/api/contact', reason: 'send failed', detail: err instanceof Error ? err.message : String(err) },
      mail
    );
    console.error('[contact] send failed', err);
    return json({ ok: false, delivered: false, error: 'Could not send your request. Please call us.' }, 502);
  }
};

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}
