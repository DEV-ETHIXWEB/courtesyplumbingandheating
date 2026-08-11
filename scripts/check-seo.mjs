import { readdirSync, readFileSync } from 'node:fs';
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

const files = walk(DIST);
const titles = new Map();
const descs = new Map();
const missing = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const route = file.replace(DIST, '').replace(/\\/g, '/');
  const titleM = html.match(/<title>([^<]*)<\/title>/);
  const descM = html.match(/<meta name="description" content="([^"]*)"/);
  const canonM = html.match(/<link rel="canonical" href="([^"]*)"/);
  const h1Count = (html.match(/<h1[ >]/g) || []).length;

  if (!titleM) missing.push(`${route}: MISSING <title>`);
  if (!descM) missing.push(`${route}: MISSING meta description`);
  if (!canonM) missing.push(`${route}: MISSING canonical`);
  if (h1Count === 0) missing.push(`${route}: MISSING <h1> (found ${h1Count})`);
  if (h1Count > 1) missing.push(`${route}: MULTIPLE <h1> (found ${h1Count})`);

  if (titleM) {
    const t = titleM[1];
    if (!titles.has(t)) titles.set(t, []);
    titles.get(t).push(route);
  }
  if (descM) {
    const d = descM[1];
    if (!descs.has(d)) descs.set(d, []);
    descs.get(d).push(route);
  }
}

console.log(`Pages checked: ${files.length}`);
console.log(`Missing tags: ${missing.length}`);
missing.forEach((m) => console.log('  ' + m));

console.log('\nDuplicate titles:');
for (const [t, routes] of titles) {
  if (routes.length > 1) console.log(`  "${t}" used by ${routes.length}: ${routes.join(', ')}`);
}

console.log('\nDuplicate descriptions:');
for (const [d, routes] of descs) {
  if (routes.length > 1) console.log(`  "${d.slice(0, 60)}..." used by ${routes.length}: ${routes.join(', ')}`);
}
