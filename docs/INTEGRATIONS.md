# Integrations, Analytics & Lead Delivery

Reference for whoever wires up GTM and hands the site over. Covers what the site
sends, what it depends on, and what is deliberately not installed.

## Lead delivery

Three endpoints, all `POST`, all JSON, all server-rendered (`prerender = false`):

| Endpoint | Used by | Schema |
|----------|---------|--------|
| `/api/contact` | Contact page form | `leadSchema` |
| `/api/lead` | Home page quick-lead form | `quickLeadSchema` |
| `/api/chatbot-lead` | Chatbot lead capture | `leadSchema` |

All three send through **SMTP2GO** to `LEAD_NOTIFICATION_EMAIL` (see
[MAIL-SETUP.md](MAIL-SETUP.md)), and all three behave identically:

- Missing `SMTP2GO_API_KEY` or `LEAD_FROM_EMAIL` -> **HTTP 500**, `{ok:false, delivered:false}`.
  There is no silent degrade and no mailto fallback.
- Send failure -> **HTTP 502**, `{ok:false, delivered:false}`.
- Success -> **HTTP 200**, `{ok:true, delivered:true}`.

The browser treats anything other than `delivered === true` as a failure and shows
the "call us" message. A visitor never sees a confirmation for a lead that was not
delivered.

## Analytics

Google Tag Manager is the only vendor script in the site. It loads **only** when
`PUBLIC_GTM_ID` is set; GA4, Google Ads, and any pixels are configured inside the
container, not in the codebase. There are no hardcoded GTM/GA4/Ads/Pixel/CallRail
IDs anywhere in the repo.

### dataLayer events available as GTM triggers

| Event | Fires when | Extra keys |
|-------|-----------|------------|
| `contact_form_submit` | Lead delivery **confirmed** by the server | `form`: `contact_page` \| `quick_lead` \| `chatbot`; `service_needed` |
| `phone_click` | Any tel: link or phone button clicked | `link_location` (header, footer, hero, 404_page, …) |
| `schedule_service_click` | Mobile action bar "Book" tapped | `link_location` |
| `chatbot_open` | Chat panel opened (launcher or mobile bar) | `link_location` |

**Conversion rule:** map Google Ads / GA4 conversions to `contact_form_submit`.
It is pushed only after the API confirms `delivered: true`, never on click and
never on a failed send. `phone_click` is an interaction signal, not a delivered
lead — treat it as a separate (call) conversion if the client wants call tracking.

Declarative click tracking: any element carrying `data-analytics-event` (plus an
optional `data-analytics-location`) is picked up by the delegated listener in
`src/components/analytics/Analytics.astro`. No per-component wiring needed.

## Spam / abuse controls

- **Honeypot** — every lead form renders a visually-hidden `company` field. It is
  submitted with the payload and checked **server-side**, so a bot posting straight
  at the API is caught too. A tripped honeypot returns a normal-looking success and
  sends no mail.
- **Rate limiting** — 5 requests per IP per 10 minutes, per endpoint
  (`src/lib/rate-limit.ts`). Over the limit returns HTTP 429 with `Retry-After`.
  The counter is in-memory, so on a serverless host it is per warm instance; swap
  the store for a shared one if the site ever sees real abuse.
- **No CAPTCHA** — reCAPTCHA/Turnstile are not installed, so there are no CAPTCHA
  keys (and no risk of Google's public test secret reaching production). If one is
  added later it must be verified server-side, not just rendered.

## Third-party services and quotas

| Service | Used for | Key needed | Quota notes |
|---------|----------|-----------|-------------|
| SMTP2GO | All lead notification email | `SMTP2GO_API_KEY` | Free tier is 1,000 emails/month; paid plans start around 10k. Lead volume plus failure alerts should sit well inside that — confirm the client's plan. The sender must be verified or every send is refused. |
| Google Tag Manager | Analytics/ads container | `PUBLIC_GTM_ID` | None |
| CARTO basemap tiles | Service-area map background (`basemaps.cartocdn.com`) | None | Free basemap usage is subject to CARTO's terms; heavy traffic may need a paid plan or a self-hosted tile source. |
| OpenStreetMap data | Map attribution | None | Attribution rendered in the map component; do not remove. |
| Google Maps embed | Static location iframe on `/contact` | None | Keyless `output=embed` iframe. No API billing attached. |

No integration points at a staging or previous-host URL: the only absolute
third-party URLs in the codebase are the four above.

## Environment variables

See `.env.example`. Summary:

| Variable | Required | Effect if missing |
|----------|----------|-------------------|
| `SMTP2GO_API_KEY` | Yes | All lead endpoints return 500; forms show the "call us" error |
| `LEAD_FROM_EMAIL` | Yes | Same as above |
| `LEAD_NOTIFICATION_EMAIL` | Recommended | Falls back to the address in `src/data/business.ts` |
| `SMTP2GO_API_URL` | No | Standard accounts need no override; EU-region keys fail against the default host |
| `PUBLIC_GTM_ID` | Before launch | No analytics script loads at all |

Server secrets are read from `process.env` at runtime via `src/lib/env.ts`, so
rotating one takes effect on the next invocation with no rebuild. Do not read them
through `import.meta.env` in server code: Vite replaces that at build time, which
both bakes build-machine values into the bundle and dead-code-eliminates anything
behind a variable that was unset during the build. `PUBLIC_GTM_ID` is the exception
— it is a client variable, inlined by design, and changing it needs a redeploy.

## Not installed (deliberately)

GA4 direct tag, Meta Pixel, CallRail, any CRM integration, reCAPTCHA/Turnstile,
webhooks. If the client wants any of these, they belong in the GTM container
(tracking) or a new server route (webhooks) — not as extra `<head>` scripts.
