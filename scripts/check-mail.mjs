/**
 * End-to-end check of SMTP2GO lead delivery. Sends one real email through the same
 * API, credentials and success test the site uses, and reports exactly which step
 * failed when it does.
 *
 * This exists because "the key is set" is not the same as "leads arrive". The three
 * ways this setup breaks in practice - a key without send permission, an unverified
 * From address, and a region-specific API host - all look identical from the outside:
 * the form shows "please call us" and nothing says why.
 *
 * Usage: node scripts/check-mail.mjs [recipient@example.com]
 *
 * Mirrors the success test in src/lib/mail.ts: accepted means SMTP2GO reported
 * exactly one succeeded recipient, not merely HTTP 200.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_API_URL = 'https://api.smtp2go.com/v3/email/send';

// Load .env the same way astro.config.mjs does: real environment variables win, so
// this can also be run against production values without a local file.
if (existsSync(join(ROOT, '.env'))) {
  for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const value = match[2].replace(/^["']|["']$/g, '');
    if (process.env[match[1]] === undefined && value) process.env[match[1]] = value;
  }
}

const apiKey = process.env.SMTP2GO_API_KEY;
const from = process.env.LEAD_FROM_EMAIL;
const to = process.argv[2] || process.env.LEAD_NOTIFICATION_EMAIL;
const apiUrl = process.env.SMTP2GO_API_URL || DEFAULT_API_URL;

const missing = [];
if (!apiKey) missing.push('SMTP2GO_API_KEY');
if (!from) missing.push('LEAD_FROM_EMAIL');
if (!to) missing.push('LEAD_NOTIFICATION_EMAIL (or pass a recipient as an argument)');

if (missing.length) {
  console.error('FAIL  missing configuration:');
  for (const name of missing) console.error(`      - ${name}`);
  console.error('\n      Set these in .env for a local check, or in the hosting');
  console.error('      dashboard and re-run with them exported. See .env.example.');
  process.exit(1);
}

console.log(`Sending through ${apiUrl}`);
console.log(`  from: ${from}`);
console.log(`  to:   ${to}\n`);

const stamp = new Date().toISOString();
let response;
try {
  response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': apiKey,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: from,
      to: [to],
      subject: `[Courtesy site] SMTP2GO delivery check ${stamp}`,
      html_body: `<h2>SMTP2GO delivery check</h2><p>Sent by <code>scripts/check-mail.mjs</code> at ${stamp}.</p><p>If this arrived, lead delivery is configured correctly.</p>`,
      text_body: `SMTP2GO delivery check\n\nSent by scripts/check-mail.mjs at ${stamp}.\nIf this arrived, lead delivery is configured correctly.`,
    }),
    signal: AbortSignal.timeout(15_000),
  });
} catch (err) {
  console.error(`FAIL  could not reach SMTP2GO: ${err.message}`);
  process.exit(1);
}

const payload = await response.json().catch(() => null);

if (!payload) {
  console.error(`FAIL  HTTP ${response.status} with an unreadable body`);
  process.exit(1);
}

if (payload.data?.error) {
  console.error(`FAIL  SMTP2GO rejected the request: ${payload.data.error}`);
  if (payload.data.error_code) console.error(`      error_code: ${payload.data.error_code}`);
  console.error('\n      Common causes:');
  console.error('      - the API key is wrong, revoked, or lacks the "Email: Send" permission');
  console.error('      - the account is on a different region host; set SMTP2GO_API_URL');
  process.exit(1);
}

if (payload.data?.succeeded !== 1) {
  const failure = payload.data?.failures?.[0];
  console.error('FAIL  SMTP2GO accepted the request but delivered to 0 recipients.');
  if (failure) console.error(`      ${failure.email ?? to}: ${failure.error_message ?? failure.error_code ?? 'rejected'}`);
  console.error('\n      Most often the From address is not a verified sender:');
  console.error('      SMTP2GO dashboard > Sending > Verified Senders.');
  console.error('      This is the exact case that must never read as a delivered lead.');
  process.exit(1);
}

console.log('PASS  SMTP2GO accepted 1 recipient.');
if (payload.data.email_id) console.log(`      email_id: ${payload.data.email_id}`);
console.log(`\n      Now confirm it actually landed in ${to} (check spam too).`);
console.log('      Accepted by SMTP2GO is not the same as delivered to the inbox.');
