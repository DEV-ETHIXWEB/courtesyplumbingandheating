# Courtesy Plumbing & Heating

Marketing site for Courtesy Plumbing & Heating (Castle Rock & Denver Metro, CO) — plumbing, HVAC, and sewer service pages, a blog, and lead-capture forms. Built with [Astro](https://astro.build), deployed on [Vercel](https://vercel.com).

## Stack

- **Astro 7** (server islands, `output: 'server'` via the Vercel adapter) with **React 19** for interactive components (contact form, chatbot, service-area map)
- **Tailwind CSS v4** for styling, design tokens in `src/styles/global.css`
- **Content Collections** for the blog (`src/content/blog/*.md`)
- **SMTP2GO** for transactional email (lead delivery)
- **Google Tag Manager** for analytics (GA4/Ads/Meta Pixel are configured inside the GTM container, not in this codebase)

## Project structure

```text
src/
├── assets/            Images processed by Astro's image pipeline
├── components/
│   ├── a11y/           Accessibility controls panel
│   ├── analytics/       GTM + event tracking
│   ├── chat/            Chatbot widget
│   ├── forms/           Contact / lead forms (React)
│   ├── home/            Homepage sections
│   ├── layout/           Header, Footer, sticky bars
│   ├── location/         Service-area map (Leaflet)
│   ├── seo/              Structured data (JSON-LD) components
│   ├── services/          Service card / grid components
│   └── ui/                Shared primitives (Button, Container, Section, ...)
├── content/blog/       Blog posts (Markdown, Content Collections)
├── data/                Single source of truth for business info, services,
│                         locations, coupons, testimonials — see below
├── layouts/BaseLayout.astro   Wraps every page: SEO head, header, footer,
│                               sitewide LocalBusiness schema
├── lib/                 Zod schemas, rate limiting, chat logic
└── pages/
    ├── api/               Lead-capture endpoints (POST, server-rendered)
    ├── [family]/[service].astro   Dynamic per-service pages (35 services)
    ├── service-area/[location].astro   Dynamic per-city pages (24 cities)
    └── ...                 Static top-level pages
```

**`src/data/business.ts` is the single source of truth** for the business name, phone, address, license, and hours — every component should import from here rather than hardcoding contact info.

## Commands

| Command             | Action                                      |
| :------------------- | :------------------------------------------- |
| `npm install`         | Install dependencies                          |
| `npm run dev`          | Start the dev server at `localhost:4321`      |
| `npm run build`        | Build the production site to `./dist/`         |
| `npm run preview`      | Preview the production build locally           |
| `npm run astro check`  | Type-check the project                         |

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable                  | Required | Purpose                                                        |
| :------------------------- | :------- | :--------------------------------------------------------------- |
| `SMTP2GO_API_KEY`            | Yes       | Sends lead emails from the contact form, quick-lead form, and chatbot |
| `LEAD_FROM_EMAIL`            | Yes       | Verified sender address in SMTP2GO                                |
| `LEAD_NOTIFICATION_EMAIL`     | No        | Where leads are delivered; falls back to `business.email.display` |
| `SMTP2GO_API_URL`             | No        | Only for EU-region/dedicated-IP SMTP2GO accounts on a different host |
| `PUBLIC_GTM_ID`               | No        | Google Tag Manager container ID; if unset, no analytics loads at all |
| `PUBLIC_TURNSTILE_SITE_KEY`   | No        | Cloudflare Turnstile site key (client-exposed); renders the CAPTCHA widget on the contact and quick-lead forms |
| `TURNSTILE_SECRET_KEY`        | No*       | Cloudflare Turnstile secret key (server-only); verifies tokens before a lead is recorded or emailed |

**If `SMTP2GO_API_KEY` or `LEAD_FROM_EMAIL` is missing, the lead API routes return HTTP 500 and every form shows its "call us" error** (see `src/pages/api/*.ts`). They never report success for a lead that was not delivered — but that also means no lead arrives until both are set in the Vercel project.

**Turnstile fails closed in production**: if `TURNSTILE_SECRET_KEY` is unset (or a submitted token is missing/invalid) while running in production, `verifyTurnstile` (`src/lib/turnstile.ts`) rejects the request with a 503/403 rather than silently skipping verification. The only bypass is local dev or preview deploys with no secret configured, so `TURNSTILE_SECRET_KEY` is marked optional above but is effectively required once you deploy to production — set both keys in the Vercel project. Get both from dash.cloudflare.com -> Turnstile -> Add widget manually.

Verify delivery end to end with `npm run check:mail` (see [Mail setup](docs/MAIL-SETUP.md)). It sends one real email through the same API and success test the site uses, and names the failing step when it fails.

## Deploy notes

- Adapter: `@astrojs/vercel`. Production `site:` URL is set in `astro.config.mjs`.
- `vercel.json` sets baseline security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). No CSP is configured yet — see the inline comment in `vercel.json` before adding one, since it needs to allowlist GTM, the Google Maps embed on `/contact`, and the Leaflet tile CDN used by the service-area map.
- Legacy URL redirects (from the previous Squarespace site) live in the `redirects` map in `astro.config.mjs`.
- The three lead API routes (`src/pages/api/{contact,lead,chatbot-lead}.ts`) have basic in-memory rate limiting (`src/lib/rate-limit.ts`, 5 requests/minute per IP). This resets per serverless instance, so it caps abuse per warm function rather than globally — swap for a shared store (Redis/Upstash) if traffic justifies it.
