/**
 * Core Web Vitals + payload measurement against the production build.
 *
 * Serves dist/client over a local static server (so the numbers come from built,
 * minified output rather than the dev server) and drives Chromium with CPU and
 * network throttling roughly matching a mid-range phone, which is the traffic that
 * actually matters for a home-services site.
 *
 * Usage: npm run build, then node scripts/check-perf.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync } from 'node:zlib';
import { chromium, devices } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'client');
const PORT = 4399;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const candidates = [join(DIST, url), join(DIST, url, 'index.html'), join(DIST, `${url}.html`)];
  const file = candidates.find((p) => existsSync(p) && statSync(p).isFile());
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(existsSync(join(DIST, '404.html')) ? readFileSync(join(DIST, '404.html')) : 'Not found');
    return;
  }
  const type = MIME[extname(file)] ?? 'application/octet-stream';
  let body = readFileSync(file);

  // Compress text the way the CDN will, otherwise the measurement punishes the build
  // for bytes that never travel: uncompressed HTML/CSS/JS roughly quadruples LCP cost.
  const compressible = /^(text\/|application\/(javascript|json|xml|manifest))/.test(type) || type === 'image/svg+xml';
  const headers = { 'Content-Type': type };
  if (compressible && (req.headers['accept-encoding'] || '').includes('br')) {
    body = brotliCompressSync(body);
    headers['Content-Encoding'] = 'br';
  }
  headers['Content-Length'] = body.length;

  res.writeHead(200, headers);
  res.end(body);
});

await new Promise((r) => server.listen(PORT, r));

const ROUTES = ['/', '/hvac', '/plumbing/drain-cleaning', '/service-area/castle-rock', '/blog', '/contact'];
const BUDGET = { lcp: 2500, cls: 0.1, transferKb: 1600 };

const browser = await chromium.launch();
const results = [];

for (const route of ROUTES) {
  const context = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await context.newPage();

  let transferred = 0;
  page.on('response', async (res) => {
    const len = Number(res.headers()['content-length'] ?? 0);
    transferred += len;
  });

  const client = await context.newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    // Roughly "Fast 3G": what a technician-hunting homeowner on mobile data gets.
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'load', timeout: 60000 });

  const vitals = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let lcp = 0;
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) lcp = Math.max(lcp, entry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          resolve({
            lcp: Math.round(lcp),
            cls: Math.round(cls * 1000) / 1000,
            ttfb: Math.round(nav?.responseStart ?? 0),
            domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
            resources: performance.getEntriesByType('resource').length,
          });
        }, 3500);
      })
  );

  // INP has no meaningful value without real interaction; drive one click and time it.
  const interaction = await page.evaluate(async () => {
    const target = document.querySelector('a[href], button');
    if (!target) return null;
    const start = performance.now();
    target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return Math.round(performance.now() - start);
  });

  results.push({ route, ...vitals, interactionMs: interaction, transferKb: Math.round(transferred / 1024) });
  await context.close();
}

await browser.close();
server.close();

console.log('Core Web Vitals - Pixel 7, 4x CPU throttle, ~Fast 3G, production build\n');
console.log('route'.padEnd(30), 'LCP'.padStart(7), 'CLS'.padStart(7), 'TTFB'.padStart(7), 'transfer'.padStart(10));
let failures = 0;
for (const r of results) {
  const flag = r.lcp > BUDGET.lcp || r.cls > BUDGET.cls ? '  <-- over budget' : '';
  if (flag) failures += 1;
  console.log(
    r.route.padEnd(30),
    `${r.lcp}ms`.padStart(7),
    String(r.cls).padStart(7),
    `${r.ttfb}ms`.padStart(7),
    `${r.transferKb}KB`.padStart(10),
    flag
  );
}
console.log(`\nBudget: LCP <= ${BUDGET.lcp}ms, CLS <= ${BUDGET.cls}`);
console.log(failures ? `${failures} route(s) over budget` : 'All routes within budget');
process.exit(failures ? 1 : 0);
