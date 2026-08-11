import { readdirSync, readFileSync, existsSync } from 'node:fs';
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
const srcRe = /\s(?:src|srcset)="([^"]+)"/g;
let broken = 0;
let total = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = srcRe.exec(html))) {
    const raw = m[1];
    for (const candidate of raw.split(',').map((s) => s.trim().split(' ')[0])) {
      if (!candidate.startsWith('/')) continue;
      total++;
      const p = join(DIST, candidate.split('?')[0]);
      if (!existsSync(p)) {
        broken++;
        console.log(`${file.replace(DIST, '')}: ${candidate}`);
      }
    }
  }
}
console.log(`\nTotal asset refs: ${total}, broken: ${broken}`);
