# Launch Readiness Tracker

Status against the EthixWeb Full-Stack Project Ready Checklist (SOP v2). Updated as
each section is worked. **Verdict today: NOT READY** — see "What is left" at the end.

Legend: **Done** = fixed and verified · **Blocked** = needs a credential, access or a
client decision · **Not started** = section not yet worked.

---

## 01 Development & Functionality — Done (1 item blocked)

| Item | Status |
|---|---|
| Forms actually deliver the lead | **Blocked** — code path verified end to end, real send needs a Resend key |
| All routes work, no dead ends | Done — 143 pages crawled, 0 broken links |
| All buttons/links/nav/CTAs work | Done |
| Chatbot delivers through the verified path | Done — full flow driven, 1 API call, 1 conversion event |
| APIs return real data, not stubs | Done |
| No placeholder copy / TODO / lorem ipsum | Done — all shipped TODOs resolved |
| No debug logging in production | Done — only `console.error` on real failures |
| No duplicate/legacy routes | Done — legacy URLs 301 to the new architecture |
| 404 branded | Done |
| 500 branded, no stack trace | Done |
| Empty states designed | Done — added the missing blog filter empty state |

Fixed here: lead endpoints returned HTTP 200 + `{ok:true}` with mail credentials
missing while the browser showed "Request received"; the quick-lead form was dead
code no page imported; reveal animations never ran at all.

## 02 Responsive & UI QA — Done (1 item blocked)

| Item | Status |
|---|---|
| Desktop / tablet / mobile checked | Done — 8 widths x 10 routes, zero horizontal overflow |
| Cross-browser Chrome + Safari | **Blocked** — WebKit + Chromium pass scripted (`scripts/qa-browsers.mjs`); needs a clean run and ideally a real iPhone |
| Layout, spacing, typography, animation per breakpoint | Done |
| Images/assets load, no overflow or clipping | Done — 9 pages, 0 broken, all have alt + dimensions |
| Fonts load without flash or layout shift | Done — latin subset preloaded |

Fixed here: page scrolled sideways on mobile; the coupon rail covered headings below
1440px; the accessibility panel overflowed a 375px viewport; `backdrop-filter` had no
`-webkit-` prefix for Safari.

## 03 Forms, APIs & Integrations — Done (4 items blocked)

| Item | Status |
|---|---|
| Form/email/CRM verified end to end | **Blocked** — needs the Resend key |
| Analytics firing, confirmed in real time | **Blocked** — needs `PUBLIC_GTM_ID` |
| Conversions fire only after confirmed success | Done — `contact_form_submit` fires only on `delivered: true`, proven by test |
| CAPTCHA verified server-side | N/A — none installed; honeypot is checked server-side instead |
| No dev/test fallback keys reachable | Done — none exist anywhere |
| Webhooks tested with signature verification | N/A — no webhooks |
| Third-party embeds tested on the production domain | **Blocked** — needs the live domain |
| Legacy integrations fully retired | Done — no stale staging or prior-host URLs in code |
| Rate limits/quotas checked against real traffic | **Blocked** — Resend free tier is 100/day, 3k/month; confirm the client's plan |
| No tracking IDs from another client | Done — zero hardcoded IDs of any kind |

Fixed here: chatbot leads pushed no analytics event at all; the honeypot was checked
only in the browser, so a direct POST to the API bypassed it; no rate limiting existed.

## 04 Environment & Production Config — Done (3 items blocked)

| Item | Status |
|---|---|
| `.env.example` exists and is current | Done |
| No secrets hardcoded | Done — grep clean, and the build output carries no secret values |
| Required prod env vars set in the hosting dashboard | **Blocked** — needs Vercel access |
| Rotation requirements documented | Done — see "Secret rotation" below |
| Client credentials collected and confirmed working | **Blocked** — see PENDING-CLIENT-CONFIRMATIONS.md |
| Old hosting decommissioned | **Blocked** — DNS still points at Squarespace |
| One deployment config as source of truth | Done — only `vercel.json` + the adapter in `astro.config.mjs` |

**The find that mattered here:** secrets were read through `import.meta.env`, which
Vite replaces at build time. They were unset during the build, so they compiled to
`undefined` and the bundler dead-code-eliminated the entire Resend send path — the
`resend` package did not appear in the deployed function at all. Setting the keys in
the Vercel dashboard would not have fixed it. Server secrets now come from
`process.env` at runtime (`src/lib/env.ts`), verified by rebuilding and confirming
`resend` is present and no key values are baked in.

### Secret rotation

Rotating `RESEND_API_KEY` (or either mail address) needs **no rebuild and no
redeploy** — change it in the Vercel dashboard and the next function invocation
picks it up. This only holds while server code reads `process.env`; if anyone
reintroduces `import.meta.env.SOMETHING` in a server route, rotation silently starts
requiring a full rebuild again, and an unset variable at build time will strip the
code behind it.

`PUBLIC_GTM_ID` is different: it is a client-side variable, inlined at build time by
design. **Changing it does require a redeploy.**

## 05 SEO, Local SEO & Structured Data — Done (1 item blocked)

| Item | Status |
|---|---|
| Titles + descriptions per page | Done — 143 pages, 0 missing, 0 duplicates |
| Canonical URLs | Done — now agree with the sitemap on trailing slashes |
| sitemap.xml accurate and reachable | Done — 141 URLs, error pages excluded |
| robots.txt, production indexable | Done |
| OG/Twitter cards + preview image | Done — `summary_large_image`, 1200x630 |
| Favicon + app icons + manifest | Done — added apple-touch-icon, 192/512 PNGs, webmanifest |
| Legacy-URL redirects | Done — spot-tested in section 01 |
| No broken internal/external links | Done — 0 broken, and the checker now catches relative links |
| Consent banner + privacy policy | Done — banner gates GTM, privacy policy now indexable |
| Primary location correct sitewide | Done |
| Every service page uses the correct city | Done |
| Surrounding cities accurate | Done — 24 configured cities, no out-of-area names |
| No incorrect city names from templates | Done — scanned 35 common contamination cities, zero real hits |
| Address, phone, business name correct | Done |
| NAP consistent everywhere | Done — one phone, one address, one business-name spelling |
| Service-area content client-approved | **Blocked** — accuracy verified, client sign-off outstanding |
| Location matches content/metadata/schema | Done |
| LocalBusiness / Service / FAQ / Breadcrumb schema | Done — 143/31/34/140, valid, matches visible content |
| No duplicate or misleading structured data | Done — audited every page, zero problems |
| Rich Results Test, zero errors | **Blocked** — needs a public URL; JSON validated locally |

**The find that mattered here:** the migrated blog posts were publishing a second,
contradictory NAP. 27 pages carried the address "1410 Park Street" against the site's
"385 Park Ct", 30 carried the legacy phone (303) 688-0597 and two a third number
(720) 574-2341. 50 posts ended in a scraped "## Key Facts" block, 57 in an "## Images"
block describing images that were never migrated, and 12 linked to old-site URLs that
all 404'd — which the link checker had been missing because it only matched absolute
hrefs. Cleaned by `scripts/clean-blog-legacy.mjs`; article prose untouched.

Organization/WebSite schema is deliberately absent: the LocalBusiness node already
carries the organisation identity, and a bare WebSite node with no site search adds
nothing. `aggregateRating` is also deliberately absent — self-serving review markup on
LocalBusiness is against Google's guidelines even though the rating is shown on-page.

## 06 Performance, Accessibility & Security — Done (2 items flagged)

| Item | Status |
|---|---|
| Production build, zero errors/warnings | Done |
| Console clean on key pages | Done — no errors or failed requests |
| Images optimized, Core Web Vitals measured | **Partial** — the homepage regression is fixed and CLS is clean, but absolute LCP must be confirmed on the real deploy |
| CDN/edge caching for static + dynamic | Done — immutable for `/_astro`, `no-store` for `/api` |
| Alt text, contrast, keyboard nav, focus states | Done — `npm run check:a11y`, zero findings |
| CSP, X-Frame-Options, Referrer-Policy, HSTS | Done — all present, CSP verified against real pages |
| CORS explicit and intentional | N/A — no cross-origin API; same-origin default is deliberate, plus an Origin check on POSTs |
| CSRF on state-changing routes | N/A — no session or cookie auth exists. Origin check added as anti-abuse |
| Webhook/raw-body ordering | N/A — no webhooks |
| Rate limiting on public endpoints | Done in section 03 |
| Auth/session review | N/A — no auth, no sessions, no tokens. Only `sessionStorage` for a chat teaser flag |
| Multi-tenant/role-scoped access | N/A — no database, no user data at rest |
| No internal docs in a public repo | **Flagged** — `content-extraction/` is Akash's commit; his call |
| Error monitoring in production | Done — `src/lib/alerting.ts` |

### Core Web Vitals

Measured with `npm run check:perf`: production build, Pixel 7, 4x CPU throttle,
~Fast 3G, brotli — deliberately harsher than a typical real visit.

**Read these as relative, not absolute.** With 4x CPU throttling the numbers move by
seconds depending on what else the machine is doing; repeat runs on a busy laptop
produced TTFB of 600–1200ms from a *local static file server*, which is obviously the
harness and not the site. Use the script to catch regressions between builds, and
confirm real numbers from the deployed site (PageSpeed Insights / CrUX) once it is up.

What is solid across every run:

- **CLS is 0** on every route except `/contact` (0.035), well inside budget.
- The homepage carried a large **route-specific** penalty: it was ~4000ms slower than
  every other page. That penalty is now ~1000ms and the LCP element changed.

The cause was the hero video: 1.4MB, becoming the LCP element at 6.0s. It now starts
after `load` + idle, so the poster image is LCP and the video fades in afterwards. Also
deleted an unreferenced 1.5MB PNG that was being deployed from `public/map 100% same/`.

The remaining lever is the 302KB homepage document, of which **129KB is 254 inline
Lucide SVG icons**. A sprite sheet would cut that materially; it is a refactor, not a
tweak, so it is noted rather than done.

### Security notes

CSP uses `'unsafe-inline'` for `script-src`. Astro emits inline scripts for islands and
`define:vars`, and GTM injects further inline tags, so a nonce/hash policy would need a
build-time hashing step and would still break the moment someone adds a tag in the GTM
UI. Everything else is locked down: `default-src 'self'`, `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'`, and explicit allowlists for the map tiles,
Google Maps embed and analytics. Verified with `npm run check:csp` — zero violations
across six routes with the map, chatbot and consent banner all exercised.

Contrast was checked against flat backgrounds only. Text over the hero video, gradients
and photographic panels cannot be computed reliably and still wants a human eye.

## 07 Deployment & Launch — Not started

Nothing has been deployed or tested on the production URL. Rollback plan and the
24–48h post-launch check are not set up.

## 08 Client Requirements — Done (as a punch list; the items themselves are open)

The assignable punch list lives in `PENDING-CLIENT-CONFIRMATIONS.md`, covering all
thirteen requirement rows plus eleven project-specific content items.

Four of them block launch outright: **the Resend API key**, **the production
environment variables**, **domain/DNS access**, and — for anything to be measurable —
**the GTM container ID**. Four requirement rows are genuinely N/A for this build
(reCAPTCHA, webhooks, CMS, call tracking), which is worth stating explicitly rather
than leaving as an unanswered "credentials required" note.

The single most visible open content item is the **Cappadocia hero video**.

## 09 Final Handover — Not started

---

## What is left

### Blocking launch, needs someone else

1. **Resend API key + verified sending domain** (client) — until then no lead can be
   delivered and 01/03 cannot be signed off.
2. **`PUBLIC_GTM_ID`** (client) — no analytics loads without it.
3. **Vercel dashboard access** (dev) — to set and confirm the production variables.
4. **Production domain decision** (client) — `astro.config.mjs` assumes
   `https://www.courtesyplumbingandheating.com`; this drives canonicals, sitemap and
   OG URLs.
5. **DNS cutover from Squarespace** (client) — the live site is still Squarespace, so
   the old host stays up until launch, then must be decommissioned deliberately.
6. **Hero video is stock footage of Cappadocia, Turkey** (client/design) — on a
   Castle Rock plumbing site.
7. **Repo is public** and contains `content-extraction/` internal migration notes.

8. **Confirm the business address** (client) — the migrated blog content claimed
   "1410 Park Street, Castle Rock" while the site uses "385 Park Ct". The blog copies
   have been removed and 385 Park Ct is now the single source, but which one matches
   the Google Business Profile still needs confirming, since it drives local ranking.

9. **`content-extraction/` in a public repo** (Akash) — internal migration notes and
   70+ scraped source files. Left in place deliberately: it is his commit, and a history
   scrub on a shared `main` needs his agreement.

### Ours to do

10. Section 07 — production smoke test, rollback plan, post-launch check.
11. Section 09 — handover doc, ownership transfer of any EthixWeb-held accounts.
12. Finish the WebKit/Chromium QA run and attach the screenshots.
13. Optional: replace the 254 inline SVG icons on the homepage with a sprite (~129KB).
