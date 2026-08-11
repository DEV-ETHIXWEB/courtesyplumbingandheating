# Client Requirements & Missing Information

Checklist section 08. Every item that stands between this build and a launch, with a
named owner. Nothing here blocks a page from rendering — each unconfirmed value is
either omitted from the site or falls back to a safe default — but the ones marked
**BLOCKS LAUNCH** mean the site cannot be signed off as Ready.

Owner key: **Client** = Courtesy Plumbing & Heating · **Dev** = EthixWeb.

## Punch list

| Requirement | Needed | Status | Owner |
|---|---|---|---|
| **API keys** | Resend API key + a verified sending domain. Without it every lead form returns a "please call us" error — **BLOCKS LAUNCH** | Pending | Client |
| **Environment variables** | `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL`, `PUBLIC_GTM_ID` set in the Vercel dashboard. Documented in `.env.example`, set nowhere yet — **BLOCKS LAUNCH** | Pending | Dev |
| **Domain / DNS access** | Registrar login to point the domain at Vercel. Also confirm www vs apex — it drives canonicals, sitemap and OG URLs — **BLOCKS LAUNCH** | Pending | Client |
| **Analytics / GTM access** | GTM container ID belonging to this client, plus container access to configure GA4 and any ad tags. No analytics loads at all until this exists | Pending | Client / Dev |
| **Google Ads conversion ID** | Only if the client runs Google Ads. Map the conversion to the `contact_form_submit` dataLayer event (fires only on confirmed delivery) | Pending — confirm whether Ads is in use | Client |
| **CRM / email account access** | Confirm the inbox that receives leads. Currently defaults to `Contact@courtesyinc.net`. No CRM is integrated; say so if one is expected | Pending | Client |
| **reCAPTCHA / Turnstile keys** | Not needed. Spam is handled by a server-side honeypot and per-IP rate limiting, so no CAPTCHA keys exist to leak or misconfigure | N/A | Dev |
| **CMS / WordPress admin access** | No CMS — content lives in the repo as Markdown. **Squarespace admin access is still needed** to coordinate the cutover and decommission the old site | Pending (Squarespace, not a CMS) | Client |
| **Call-tracking account** | Not in use. If CallRail or similar is wanted, it needs an account and belongs in the GTM container, not in the codebase | Not requested | Client |
| **Webhook URLs / secrets** | None. No webhooks exist in this build | N/A | Dev |
| **Third-party account ownership transfer** | Decide who owns the Vercel project and the Resend account long-term, and hand over anything sitting on an EthixWeb account | Pending | Client / Dev |
| **Content / assets still owed** | See the content table below — the hero video is the significant one | Pending | Client |
| **Other project-specific access** | Google Business Profile access, to verify NAP and the profile URL against the site | Pending | Client |

## Content and facts still owed

| # | Item | Currently shipped | Needed | Owner |
|---|------|-------------------|--------|-------|
| 1 | **Hero video** | Stock footage of Cappadocia, Turkey (`hero-cappadocia.mp4`) on the homepage of a Castle Rock plumbing company | Real footage or an approved replacement. This is the most visible content issue on the site | Client |
| 2 | Business address | `385 Park Ct, Castle Rock, CO 80109` everywhere | The migrated blog content carried `1410 Park Street` on 27 pages. Those copies are removed; confirm which address the Google Business Profile uses, since a NAP mismatch hurts local ranking | Client |
| 3 | Production domain | `https://www.courtesyplumbingandheating.com` in `astro.config.mjs` | Confirm the final domain, www vs apex | Client |
| 4 | Facebook page | Not rendered — the footer icon stays hidden while `business.social.facebook` is `null` | The real page URL, or confirmation there is none | Client |
| 5 | Google Business Profile | A Maps **search** URL fallback, shown only in the reviews empty state | The profile deep link | Client |
| 6 | Secondary phone numbers | Only `(719) 679-5479` is published | The legacy site also carried `(303) 688-0597` and `(303) 429-6990`. Confirm whether either should appear | Client |
| 7 | DBA disclosure | `Affordable Plumbing, Heat & Electrical` stored in `business.dba`, displayed nowhere | Confirm whether the DBA must be disclosed on-site — the legacy privacy policy names it | Client |
| 8 | Service-area content | 24 cities, each with local copy; accuracy verified against the configured list | Client approval of the cities and the local copy | Client |
| 9 | Review snapshot | 4.4 average / 68 reviews, captured 2026-08-05 | Refresh shortly before launch; reviews accrue over time | Dev |
| 10 | Squarespace decommissioning | DNS still resolves to `ext-sq.squarespace.com`; the old site is live | Plan the cutover, then shut the old hosting down deliberately rather than leaving both running | Client |
| 12 | Second location | `9275 N Elm Ct, Federal Heights, CO 80260` is shown on `/about` and `/contact`, but the LocalBusiness schema describes only the Castle Rock address | Confirm Federal Heights is a real, staffed location. If it is, it likely deserves its own Google Business Profile and a second schema entry; if it is not, it should come off both pages | Client |
| 11 | Legal / privacy content | Privacy policy present and indexable; consent banner links to it | Confirm the policy text is current, and that the cookie/consent wording matches what the client wants | Client |

## What is already closed

No CAPTCHA keys, webhook secrets, CRM credentials or call-tracking IDs are required —
those integrations do not exist in this build, so there is nothing to collect, nothing
to misconfigure, and no other client's IDs to inherit. The repo contains no hardcoded
secrets and the build output bakes in no key values.
