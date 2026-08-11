/**
 * Lead email delivery through SMTP2GO.
 *
 * Uses SMTP2GO's HTTP API rather than SMTP. On a serverless function an SMTP send
 * means opening a TCP connection on port 587 and completing a multi-step handshake
 * inside the invocation - slow on a cold start, and blocked outright on runtimes
 * that only allow HTTP. A single `fetch` has neither problem and needs no
 * dependency, so there is no mail library to keep patched.
 *
 * The one rule this file exists to enforce: a send is only "delivered" when
 * SMTP2GO says it accepted the message. HTTP 200 is not enough - the API answers
 * 200 with `data.failed: 1` for a rejected recipient or an unverified sender, and
 * treating that as success is exactly how a site ends up showing visitors a
 * confirmation for a lead that went nowhere.
 */
import type { MailConfig } from './env';

/**
 * EU-region and dedicated-IP accounts are issued a different host. Override with
 * SMTP2GO_API_URL if the SMTP2GO dashboard shows one - the API key is region-bound
 * and returns an auth error against the wrong endpoint.
 */
const DEFAULT_API_URL = 'https://api.smtp2go.com/v3/email/send';

/** A hung request must not hold the whole function open until the platform kills it. */
const TIMEOUT_MS = 10_000;

export interface SendMailOptions {
  subject: string;
  html: string;
  /** Set to the lead's own address so a reply from the inbox reaches them directly. */
  replyTo?: string;
}

export type SendMailResult = { ok: true; emailId?: string } | { ok: false; error: string };

export async function sendMail(mail: MailConfig, options: SendMailOptions): Promise<SendMailResult> {
  const body: Record<string, unknown> = {
    sender: mail.from,
    to: [mail.to],
    subject: options.subject,
    html_body: options.html,
    // A text part is not optional in practice: HTML-only mail scores worse with
    // spam filters, and the notification inbox may preview in plain text.
    text_body: htmlToText(options.html),
  };

  if (options.replyTo) {
    body.custom_headers = [{ header: 'Reply-To', value: options.replyTo }];
  }

  let response: Response;
  try {
    response = await fetch(mail.apiUrl ?? DEFAULT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The key also travels in the body as `api_key`; the header keeps it out of
        // anything that logs request payloads.
        'X-Smtp2go-Api-Key': mail.apiKey,
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError'
      ? `no response within ${TIMEOUT_MS / 1000}s`
      : err instanceof Error
        ? err.message
        : String(err);
    return { ok: false, error: `SMTP2GO request failed: ${reason}` };
  }

  let payload: Smtp2goResponse;
  try {
    payload = (await response.json()) as Smtp2goResponse;
  } catch {
    return { ok: false, error: `SMTP2GO returned HTTP ${response.status} with an unreadable body` };
  }

  // Auth failures, a malformed payload and a bad endpoint all land here.
  if (payload.data?.error) {
    const code = payload.data.error_code ? ` (${payload.data.error_code})` : '';
    return { ok: false, error: `SMTP2GO rejected the request${code}: ${payload.data.error}` };
  }

  if (!response.ok) {
    return { ok: false, error: `SMTP2GO returned HTTP ${response.status}` };
  }

  // The API accepted the call but refused the message - unverified sender, blocked
  // recipient, exhausted quota. This is the case that must never read as success.
  if (!payload.data || payload.data.succeeded !== 1) {
    const failure = payload.data?.failures?.[0];
    const detail = failure
      ? `${failure.email ?? 'recipient'}: ${failure.error_message ?? failure.error_code ?? 'rejected'}`
      : 'no recipient was accepted';
    return { ok: false, error: `SMTP2GO accepted 0 recipients - ${detail}` };
  }

  return { ok: true, emailId: payload.data.email_id };
}

interface Smtp2goResponse {
  data?: {
    succeeded?: number;
    failed?: number;
    failures?: { email?: string; error_code?: string; error_message?: string }[];
    email_id?: string;
    error?: string;
    error_code?: string;
  };
}

/**
 * The lead emails are small tables built in this codebase, not arbitrary markup, so
 * stripping tags and collapsing whitespace produces a readable plain-text part
 * without pulling in an HTML parser.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<\/(tr|h2|p|div)>/gi, '\n')
    .replace(/<\/td>/gi, ': ')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
