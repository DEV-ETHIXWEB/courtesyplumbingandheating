import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'A:\\courtesyplumbingandheating\\courtesy-plumbing\\dist\\client';

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
const hrefRe = /href="(\/[^"#?]*)/g;
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
    const href = m[1];
    if (seen.has(href)) continue;
    seen.add(href);
    allTargets.add(href);
    if (!routeExists(href)) {
      (brokenByPage[pageRoute] ||= []).push(href);
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
