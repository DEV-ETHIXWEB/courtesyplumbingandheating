/**
 * Accessibility basics over the production build: contrast, focus visibility,
 * keyboard reachability, alt text, heading order and landmark structure.
 *
 * Deliberately dependency-free rather than pulling in axe: these are the checks the
 * launch checklist actually names, and running them against the built HTML keeps the
 * script usable in CI without a browser download beyond the one Playwright already has.
 *
 * Usage: npm run build, then node scripts/check-a11y.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'client');
const PORT = 4397;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.webmanifest': 'application/manifest+json', '.json': 'application/json',
};

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = [join(DIST, url), join(DIST, url, 'index.html'), join(DIST, `${url}.html`)].find(
    (p) => existsSync(p) && statSync(p).isFile()
  );
  if (!file) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const ROUTES = ['/', '/hvac', '/plumbing/drain-cleaning', '/service-area/castle-rock', '/blog', '/contact', '/coupons', '/404'];

const browser = await chromium.launch();
const findings = [];

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(500);

  const issues = await page.evaluate(() => {
    const out = [];

    // --- contrast -----------------------------------------------------------
    const toRgb = (value) => {
      const m = value.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const [r, g, b, a = '1'] = m[1].split(',').map((v) => parseFloat(v));
      return { r, g, b, a: parseFloat(a) };
    };
    const luminance = ({ r, g, b }) => {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    // Returns null when the backdrop cannot be resolved to a flat colour - a gradient,
    // photo or video behind the text. Those need a human eye, and guessing "white"
    // reports every white-on-navy hero as a failure.
    const effectiveBg = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const cs = getComputedStyle(node);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
        const bg = toRgb(cs.backgroundColor);
        if (bg && bg.a > 0.9) return bg;
        node = node.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    };

    const textNodes = [...document.querySelectorAll('p, h1, h2, h3, h4, a, button, span, li, label, dt, dd, figcaption, time')];
    for (const el of textNodes) {
      if (!el.textContent?.trim()) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.5) continue;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      // Only leaf-ish elements, so a wrapper's text is not measured twice.
      if ([...el.children].some((c) => c.textContent?.trim())) continue;

      const fg = toRgb(cs.color);
      const bg = effectiveBg(el);
      if (!fg || fg.a < 0.9 || !bg) continue;

      const l1 = luminance(fg);
      const l2 = luminance(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const large = size >= 24 || (size >= 18.66 && bold);
      const required = large ? 3 : 4.5;

      if (ratio < required) {
        out.push({
          kind: 'contrast',
          detail: `${ratio.toFixed(2)}:1 (needs ${required}) - "${el.textContent.trim().slice(0, 40)}" ${cs.color} on rgb(${bg.r},${bg.g},${bg.b})`,
        });
      }
    }

    // --- images -------------------------------------------------------------
    for (const img of document.querySelectorAll('img')) {
      if (!img.hasAttribute('alt')) out.push({ kind: 'alt', detail: img.getAttribute('src') ?? '(no src)' });
    }

    // --- landmarks and headings --------------------------------------------
    if (!document.querySelector('main')) out.push({ kind: 'landmark', detail: 'no <main>' });
    const h1s = document.querySelectorAll('h1');
    if (h1s.length !== 1) out.push({ kind: 'heading', detail: `${h1s.length} <h1> elements` });

    let previous = 0;
    for (const h of document.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
      const level = Number(h.tagName[1]);
      if (previous && level > previous + 1) {
        out.push({ kind: 'heading-order', detail: `h${previous} -> h${level} at "${h.textContent.trim().slice(0, 40)}"` });
      }
      previous = level;
    }

    // --- controls without an accessible name -------------------------------
    for (const el of document.querySelectorAll('a[href], button, input, select, textarea')) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const name =
        el.getAttribute('aria-label') ||
        el.textContent?.trim() ||
        el.getAttribute('title') ||
        (el.labels && el.labels.length ? [...el.labels].map((l) => l.textContent).join(' ').trim() : '') ||
        el.getAttribute('placeholder');
      if (!name) out.push({ kind: 'unnamed-control', detail: `${el.tagName}${el.className ? '.' + String(el.className).slice(0, 40) : ''}` });
    }

    return out;
  });

  // --- focus visibility ----------------------------------------------------
  // Driven with real Tab presses, not el.focus(): :focus-visible styling depends on
  // the browser's heuristic about *how* focus arrived, and programmatic focus does
  // not qualify - checking that way reports every control as unstyled.
  const focusIssues = [];
  await page.evaluate(() => document.body.focus());
  const seenFocus = new Set();
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const id = `${el.tagName}.${String(el.className).slice(0, 40)}`;
      const label = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30);
      const r = el.getBoundingClientRect();
      return {
        id,
        label,
        offscreen: r.width === 0 || r.height === 0,
        // Any of these counts as a visible focus indicator.
        indicated:
          (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
          cs.boxShadow !== 'none' ||
          cs.textDecorationLine.includes('underline'),
      };
    });
    if (!stop) break;
    if (seenFocus.has(stop.id + stop.label)) continue;
    seenFocus.add(stop.id + stop.label);
    if (!stop.indicated && !stop.offscreen) {
      focusIssues.push({ kind: 'focus-invisible', detail: `${stop.id} "${stop.label}"` });
    }
  }

  for (const issue of [...issues, ...focusIssues]) findings.push({ route, ...issue });
  await page.close();
}

await browser.close();
server.close();

const byKind = {};
for (const f of findings) (byKind[f.kind] ||= []).push(f);

console.log('Accessibility check over the production build\n');
if (!findings.length) {
  console.log('No issues found.');
} else {
  for (const [kind, items] of Object.entries(byKind)) {
    console.log(`${kind}: ${items.length}`);
    const seen = new Set();
    for (const i of items) {
      const key = i.detail;
      if (seen.has(key)) continue;
      seen.add(key);
      if (seen.size > 6) break;
      console.log(`    [${i.route}] ${i.detail}`);
    }
    if (items.length > seen.size) console.log(`    ... ${items.length - seen.size} more`);
    console.log('');
  }
}
process.exit(findings.length ? 1 : 0);
