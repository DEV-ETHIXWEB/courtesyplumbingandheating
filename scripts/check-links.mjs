import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'client');

function walk(dir) {
  let out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(p));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const htmlFiles = walk(DIST);
// Every href that is not external, and not a non-http scheme. Relative hrefs count:
// the migrated blog posts shipped links like "../coupons.html" and "tag/Denver.html"
// that an absolute-only pattern silently skipped, and every one of them was a 404.
const hrefRe = /href="([^"#][^"]*)"/g;
const EXTERNAL = /^(https?:|mailto:|tel:|sms:|javascript:|data:|#)/i;
const brokenByPage = {};
const allTargets = new Set();

function routeExists(pathname) {
  if (pathname === '/') return existsSync(join(DIST, 'index.html'));
  const clean = pathname.replace(/\/$/, '');
  const asDir = join(DIST, clean, 'index.html');
  const asFile = join(DIST, clean + '.html');
  const asRawFile = join(DIST, clean);
  if (existsSync(asDir)) return true;
  if (existsSync(asFile)) return true;
  if (existsSync(asRawFile) && statSync(asRawFile).isFile()) return true;
  return false;
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const pageRoute = file.replace(DIST, '').replace(/\\/g, '/').replace(/index\.html$/, '') || '/';
  let m;
  const seen = new Set();
  while ((m = hrefRe.exec(html))) {
    const raw = m[1];
    if (EXTERNAL.test(raw)) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);

    // Resolve relative hrefs against the page they appear on before checking.
    const resolved = raw.startsWith('/')
      ? raw.split('#')[0].split('?')[0]
      : new URL(raw, `http://x${pageRoute}`).pathname;

    allTargets.add(resolved);
    if (!routeExists(resolved)) {
      (brokenByPage[pageRoute] ||= []).push(`${raw} -> ${resolved}`);
    }
  }
}

const brokenCount = Object.values(brokenByPage).reduce((a, b) => a + b.length, 0);
console.log(`Pages scanned: ${htmlFiles.length}`);
console.log(`Unique internal hrefs found: ${allTargets.size}`);
console.log(`Broken link instances: ${brokenCount}`);
console.log('');
for (const [page, links] of Object.entries(brokenByPage)) {
  console.log(`${page}`);
  for (const l of links) console.log(`  -> ${l}`);
}
