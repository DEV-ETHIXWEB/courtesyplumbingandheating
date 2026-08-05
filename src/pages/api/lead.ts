import type { APIRoute } from 'astro';
import { quickLeadSchema, escapeHtml } from '../../lib/schema';
import { business } from '../../data/business';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const parsed = quickLeadSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ ok: false, error: 'Please check the information provided.' }, 422);
  }

  const lead = parsed.data;

  const rows: [string, string][] = [
    ['Source', lead.source],
    ['Service needed', lead.service],
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Details', lead.message],
  ];

  const html = `
    <h2>New quick-lead form submission</h2>
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

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.LEAD_NOTIFICATION_EMAIL || business.email.display;
  const from = import.meta.env.LEAD_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn('[lead] RESEND_API_KEY or LEAD_FROM_EMAIL not set; lead not emailed.', {
      service: lead.service,
    });
    return json({ ok: true, delivered: false });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `New ${lead.service} lead: ${lead.name}`,
      html,
    });
    if (error) throw new Error(error.message);
    return json({ ok: true, delivered: true });
  } catch (err) {
    console.error('[lead] send failed', err);
    return json({ ok: false, error: 'Could not send your request. Please call us.' }, 502);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
