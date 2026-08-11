/**
 * Serves the production build with the exact headers from vercel.json and reports any
 * Content-Security-Policy violations. A CSP that blocks your own map tiles or fonts is
 * worse than no CSP, and the only honest way to know is to load the pages under it.
 *
 * Usage: npm run build, then node scripts/check-csp.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'client');
const PORT = 4396;

const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
const globalHeaders = Object.fromEntries(
  (vercel.headers.find((h) => h.source === '/(.*)')?.headers ?? []).map((h) => [h.key, h.value])
);

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
    res.writeHead(404, globalHeaders);
    res.end('not found');
    return;
  }
  // HSTS is dropped here only because this harness runs over plain http.
  const { 'Strict-Transport-Security': _hsts, ...headers } = globalHeaders;
  res.writeHead(200, { ...headers, 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const ROUTES = ['/', '/contact', '/service-area', '/blog', '/coupons', '/hvac/ac-repair'];

const browser = await chromium.launch();
const violations = [];

for (const route of ROUTES) {
  const page = await browser.newPage();
  page.on('console', (msg) => {
    const text = msg.text();
    if (/Content Security Policy|Refused to/i.test(text)) {
      violations.push({ route, text: text.slice(0, 200) });
    }
  });
  page.on('pageerror', (err) => violations.push({ route, text: `PAGEERROR ${String(err).slice(0, 160)}` }));

  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'load', timeout: 60000 });
  // Exercise the things most likely to trip a policy: map tiles, chat island, consent.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);
  await page.close();
}

await browser.close();
server.close();

console.log('CSP check against the headers in vercel.json\n');
console.log('Policy under test:');
console.log(`  ${(globalHeaders['Content-Security-Policy'] ?? '(none)').slice(0, 400)}\n`);

if (!violations.length) {
  console.log('No CSP violations or page errors on any route.');
} else {
  console.log(`${violations.length} violation(s):`);
  for (const v of violations.slice(0, 25)) console.log(`  [${v.route}] ${v.text}`);
}
process.exit(violations.length ? 1 : 0);
