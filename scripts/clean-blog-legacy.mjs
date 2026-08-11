/**
 * One-off cleanup of artifacts left by the Squarespace blog migration.
 *
 * The scraped posts carried four kinds of debris into production:
 *   - "## Images" blocks: prose descriptions of images that were never migrated
 *   - "## Key Facts" blocks: scraped business metadata, including a stale address
 *     ("1410 Park Street") and phone ((303) 688-0597) that contradict the NAP in
 *     src/data/business.ts, published on 27 and 30 pages respectively
 *   - trailing legacy CTAs: a bare phone link and a "Book Online" link pointing at
 *     the old site's submission form
 *   - links to old-site URLs (../*.html, tag/*.html) that all 404
 *
 * Article prose is not touched. Re-running is safe: every step is idempotent.
 *
 * Usage: node scripts/clean-blog-legacy.mjs [--dry]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = join(ROOT, 'src', 'content', 'blog');
const DRY = process.argv.includes('--dry');

/** Old-site URLs that still have a home in the new architecture. */
const LINK_MAP = {
  '../furnace-repair-castle-rock-colorado.html': '/hvac/furnace-repair',
  '../federal-heights-plumbing.html': '/service-area/federal-heights',
  '../coupons.html': '/coupons',
  '../submission-form.html': '/contact',
};

/** Drop a "## Heading" section and everything under it, up to the next h2 or EOF. */
function removeSection(text, heading) {
  const re = new RegExp(`\\n##\\s+${heading}\\s*\\n[\\s\\S]*?(?=\\n##\\s|$)`, 'g');
  return text.replace(re, '\n');
}

const stats = { files: 0, images: 0, keyFacts: 0, legacyCta: 0, tagLinks: 0, mappedLinks: 0 };

for (const file of readdirSync(BLOG).filter((f) => f.endsWith('.md'))) {
  const path = join(BLOG, file);
  const original = readFileSync(path, 'utf8');
  let out = original;

  if (/\n##\s+Images\s*\n/.test(out)) {
    out = removeSection(out, 'Images');
    stats.images += 1;
  }
  if (/\n##\s+Key Facts\s*\n/.test(out)) {
    out = removeSection(out, 'Key Facts');
    stats.keyFacts += 1;
  }

  // Legacy CTA remnants, written by the scraper across several lines:
  //   [\n720-574-2341\n](tel:+17205742341)   and   [\nBook Online\n](../submission-form.html)
  const ctaBefore = out;
  out = out.replace(/\n\[\s*\n[^\n\]]*\n\]\(tel:\+?[0-9]+\)\n?/g, '\n');
  out = out.replace(/\n\[\s*\n\s*Book Online\s*\n\]\([^)]*\)\n?/g, '\n');
  if (out !== ctaBefore) stats.legacyCta += 1;

  // Tag links point at old-site taxonomy pages that no longer exist. They only ever
  // appear as a trailing run on its own line (verified across all 73 posts), never
  // inline in prose, so the whole run goes rather than leaving orphaned words behind.
  const tagBefore = out;
  out = out.replace(/\[[^\]]*\]\(tag\/[^)]*\.html\)/g, '');
  if (out !== tagBefore) stats.tagLinks += 1;

  for (const [from, to] of Object.entries(LINK_MAP)) {
    if (out.includes(`](${from})`)) {
      out = out.split(`](${from})`).join(`](${to})`);
      stats.mappedLinks += 1;
    }
  }

  // Collapse the blank lines the removals leave behind.
  out = out.replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '\n');

  if (out !== original) {
    stats.files += 1;
    if (!DRY) writeFileSync(path, out, 'utf8');
  }
}

console.log(DRY ? 'DRY RUN - nothing written' : 'Cleaned migrated blog posts');
console.log(`  files changed:        ${stats.files}`);
console.log(`  "## Images" removed:  ${stats.images}`);
console.log(`  "## Key Facts" removed: ${stats.keyFacts}`);
console.log(`  legacy CTA blocks:    ${stats.legacyCta}`);
console.log(`  posts with tag links: ${stats.tagLinks}`);
console.log(`  old URLs repointed:   ${stats.mappedLinks}`);
