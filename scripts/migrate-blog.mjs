import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'A:\\courtesyplumbingandheating\\courtesy-plumbing\\content-extraction\\blog';
const DEST = 'A:\\courtesyplumbingandheating\\courtesy-plumbing\\src\\content\\blog';
if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true });

const CATEGORY_RULES = [
  [/water heater|tankless|sediment/i, 'Water Heaters'],
  [/sewer|hydro.?jet|orangeburg|root/i, 'Sewer & Drains'],
  [/furnace|boiler|heat pump|heating|zoned/i, 'Heating'],
  [/air condition|\bac\b|cooling/i, 'Cooling'],
  [/winter|frozen|freez|summer|spring|season/i, 'Seasonal Tips'],
  [/plumb/i, 'Plumbing'],
  [/indoor air quality|smart home|energy efficien/i, 'Home Comfort'],
];

function inferCategory(title, body) {
  const t = title + ' ' + body.slice(0, 500);
  for (const [re, cat] of CATEGORY_RULES) if (re.test(t)) return cat;
  return 'Home Tips';
}

function parseFrontmatter(raw) {
  const norm = raw.replace(/\r\n/g, '\n');
  const m = norm.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    fm[key] = val;
  }
  return { fm, body: m[2] };
}

function slugFromUrl(url) {
  if (!url) return null;
  const m = url.match(/\/blog\/([^/?#]+)/);
  return m ? m[1] : null;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function stripCompetitorLinks(body) {
  // Strip markdown links to known competitor domains, keep link text
  return body.replace(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?(marvsplumbing|jimdandysewer)\.com[^)]*\)/gi, '$1');
}

function cleanBody(body, title) {
  let b = body;
  // Drop leading H1 duplicate of title
  b = b.replace(/^\s*#\s+.+\n+/, '');
  // Drop stray lone-underscore separator lines
  b = b.replace(/^_\s*$/gm, '');
  // Un-escape common double-escaped entities
  b = b.replace(/&amp;/g, '&');
  b = stripCompetitorLinks(b);
  // Collapse 3+ blank lines
  b = b.replace(/\n{3,}/g, '\n\n');
  return b.trim() + '\n';
}

function yamlEscape(s) {
  if (/["':#\n]|^\s|\s$/.test(s)) {
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return s;
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.md'));
const results = [];
const skipped = [];

for (const file of files) {
  const raw = readFileSync(join(SRC, file), 'utf8');
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    skipped.push({ file, reason: 'no frontmatter' });
    continue;
  }
  const { fm, body } = parsed;
  let title = fm.title || file.replace(/\.md$/, '');
  title = title.replace(/\s*[—-]\s*Courtesy Plumbing.*$/i, '').trim();
  const slug = slugFromUrl(fm.originalUrl) || slugify(file.replace(/\.md$/, ''));
  const destPath = join(DEST, `${slug}.md`);

  if (existsSync(destPath)) {
    skipped.push({ file, reason: 'destination already exists', slug });
    continue;
  }

  let dateStr = '2024-01-01';
  let dateFlagged = false;
  if (fm.publishDate) {
    const d = new Date(fm.publishDate);
    if (!isNaN(d.getTime())) dateStr = d.toISOString().slice(0, 10);
  } else {
    dateFlagged = true;
  }

  let description = fm.metaDescription;
  if (!description || description.length < 20) {
    const firstPara = body.split('\n').find((l) => l.trim().length > 40) || title;
    description = firstPara.replace(/^#+\s*/, '').replace(/[*_]/g, '').trim().slice(0, 300);
    dateFlagged = dateFlagged; // no-op, keep flag separate from description fallback
  }
  description = description.replace(/&amp;/g, '&').replace(/"/g, "'").trim();

  const category = inferCategory(title, body);
  let cleanedBody = cleanBody(body, title);
  if (dateFlagged) {
    cleanedBody = `<!-- TODO: VERIFY original publish date -->\n\n${cleanedBody}`;
  }

  const frontmatter = [
    '---',
    `title: ${yamlEscape(title.replace(/&amp;/g, '&'))}`,
    `description: ${yamlEscape(description)}`,
    `date: ${dateStr}`,
    `author: "Courtesy Plumbing & Heating"`,
    `category: ${yamlEscape(category)}`,
    `draft: false`,
    '---',
    '',
  ].join('\n');

  writeFileSync(destPath, frontmatter + cleanedBody, 'utf8');
  results.push({ slug, title, date: dateStr, category, dateFlagged });
}

console.log(`Migrated: ${results.length}`);
console.log(`Skipped: ${skipped.length}`);
writeFileSync(
  join(SRC, '..', 'BLOG-MIGRATION-REPORT.md'),
  [
    '# Blog Migration Report',
    '',
    `Migrated ${results.length} posts, skipped ${skipped.length}.`,
    '',
    '## Migrated',
    ...results.map((r) => `- [${r.date}] **${r.title}** (\`${r.slug}\`) — ${r.category}${r.dateFlagged ? ' — TODO: VERIFY date' : ''}`),
    '',
    '## Skipped',
    ...skipped.map((s) => `- ${s.file}: ${s.reason}`),
  ].join('\n'),
  'utf8'
);
