# Mail setup (SMTP2GO)

Everything in the codebase is done. What is left is account setup: create a key,
verify a sender, set four values, run one command. Budget 15 minutes, most of it
waiting for DNS.

The site sends mail in exactly two places, both through the same credentials:

- **Lead notifications** from `/api/contact`, `/api/lead` and `/api/chatbot-lead`
- **Failure alerts** from `src/lib/alerting.ts`, when lead delivery starts failing

## 1. Create the SMTP2GO account and API key

1. Sign up at [smtp2go.com](https://www.smtp2go.com). The free tier is 1,000
   emails/month, which is comfortably above expected lead volume.
2. **Sending > API Keys > Add API Key**. Give it the **`Email: Send`** permission —
   a key without it authenticates fine and then refuses every send.
3. Copy the key. It is shown once.

If the dashboard puts you on a region-specific host (EU accounts, dedicated IPs),
note the API base URL — you will need `SMTP2GO_API_URL` in step 3.

## 2. Verify the sender

**Sending > Verified Senders.** Two options:

- **Verify a whole domain** (recommended): add the CNAME records SMTP2GO gives you
  to the DNS for `courtesyplumbingandheating.com`. This enables DKIM, so mail is
  signed and far less likely to land in spam. Then any address on that domain can
  send — e.g. `noreply@courtesyplumbingandheating.com`.
- **Verify a single address**: faster, click a confirmation link, no DNS. Fine for
  testing, weaker deliverability for production.

This step is the one that silently bites. An unverified sender does **not** produce
an auth error — SMTP2GO returns HTTP 200 and then refuses the message. `src/lib/mail.ts`
treats that as a failure (as it must), so the symptom is forms showing "please call
us" with a healthy-looking API response behind them.

Note the domain being verified is the **From** domain, not the inbox that receives
leads. Leads can be delivered to any address, including Gmail.

## 3. Set the environment variables

Local, in `.env` (copy from `.env.example`):

```
SMTP2GO_API_KEY=api-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
LEAD_FROM_EMAIL=Courtesy Plumbing <noreply@courtesyplumbingandheating.com>
LEAD_NOTIFICATION_EMAIL=Contact@courtesyinc.net
```

Production, in **Vercel > Project > Settings > Environment Variables**, same names,
for the Production environment (and Preview if you want previews to send).

Only add `SMTP2GO_API_URL` if step 1 gave you a region-specific host.

`LEAD_NOTIFICATION_EMAIL` is optional — without it, leads go to
`business.email.display` from `src/data/business.ts`. Set it explicitly anyway, so
the destination is not buried in a source file.

## 4. Verify it actually delivers

```bash
npm run check:mail
```

Reads `.env` (real environment variables win, so it can be run against production
values), sends one real email, and applies the same success test as the site:
SMTP2GO must report exactly one accepted recipient. Pass a recipient as an argument
to override the destination:

```bash
npm run check:mail -- you@example.com
```

Then **check the inbox**. Accepted by SMTP2GO is not the same as delivered — the
script says so on success for a reason. Check spam too; if it lands there, verify
the domain rather than a single address (step 2) so DKIM signs the mail.

Finally, submit the real contact form once on the deployed site and confirm the
lead arrives. Section 07 of the launch checklist requires this on the production
URL specifically — a passing staging test does not count.

## Rotating the key

Change it in the Vercel dashboard; the next function invocation picks it up. **No
rebuild, no redeploy.** Server secrets are read from `process.env` at runtime via
`src/lib/env.ts` — see the comment at the top of that file for why that matters and
what breaks if someone reintroduces `import.meta.env` in a server route.

## When something goes wrong

`npm run check:mail` names the failing step. The mapping:

| Symptom | Cause |
|---|---|
| `missing configuration` | The variable is not in `.env`, or not exported in the shell |
| `SMTP2GO rejected the request` | Bad/revoked key, missing `Email: Send` permission, or wrong region host |
| `accepted the request but delivered to 0 recipients` | Sender not verified (step 2), or quota exhausted |
| `could not reach SMTP2GO` | Network or DNS problem from the machine running the check |
| Script passes, nothing in the inbox | Check spam; verify the domain for DKIM instead of a single address |

In production, failures are visible without a client reporting them: every failed
send is logged to stderr (captured by Vercel), and after 3 failures in 15 minutes
an alert email goes out — through these same credentials, so a credentials failure
logs but cannot alert. That is deliberate: if the key is wrong there is nothing to
send the alert *with*, and the deploy is already misconfigured.

## Why the HTTP API and not SMTP

SMTP2GO offers both. The site uses the HTTP API because an SMTP send on a
serverless function means opening a TCP connection on port 587 and completing a
multi-step handshake inside the invocation — slow on a cold start, and blocked
outright on runtimes that only allow HTTP. A single `fetch` has neither problem and
needs no mail dependency. If you ever do need SMTP, the credentials live under
**Sending > SMTP Users** and `src/lib/mail.ts` is the only file that would change.
