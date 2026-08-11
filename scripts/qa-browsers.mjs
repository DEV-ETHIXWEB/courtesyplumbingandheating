/**
 * Cross-browser responsive QA pass (checklist section 02).
 *
 * Drives WebKit (the engine Safari ships) and Chromium over every route family at
 * mobile / tablet / desktop, and reports anything that would fail QA: horizontal
 * overflow, console or page errors, broken images, fonts that never loaded, and
 * interactive components that don't respond.
 *
 * Usage: start the site first (npm run dev, or npm run preview against a build),
 * then: node scripts/qa-browsers.mjs [baseUrl]
 */
import { webkit, chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://127.0.0.1:4321';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = resolve(ROOT, 'qa-screenshots');

const ROUTES = [
  '/',
  '/hvac',
  '/plumbing/drain-cleaning',
  '/sewer',
  '/service-area',
  '/service-area/castle-rock',
  '/blog',
  '/about',
  '/contact',
  '/coupons',
  '/careers',
  '/404',
];

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const findings = [];
function report(browser, viewport, route, kind, detail) {
  findings.push({ browser, viewport, route, kind, detail });
}

/** Page-level measurements that must hold on every route and every viewport. */
async function auditPage(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const de = document.documentElement;

    const imgs = [...document.querySelectorAll('img')];
    const brokenImgs = imgs
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.getAttribute('src'));

    // Which element is actually widening the page, if any.
    let widest = null;
    if (de.scrollWidth > de.clientWidth + 1) {
      let best = 0;
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.opacity === '0') return;
        if (r.right > best) {
          best = r.right;
          widest = el.tagName + '.' + String(el.className).slice(0, 60);
        }
      });
    }

    const fontLoaded = [...document.fonts].some(
      (f) => f.family.includes('Inter') && f.status === 'loaded'
    );

    // Anything still invisible inside the viewport means the reveal gate got stuck.
    const stuckHidden = [...document.querySelectorAll('[data-reveal]')].filter((el) => {
      const r = el.getBoundingClientRect();
      const inView = r.top < innerHeight && r.bottom > 0;
      return inView && getComputedStyle(el).opacity === '0';
    }).length;

    return {
      clientWidth: de.clientWidth,
      scrollWidth: de.scrollWidth,
      overflow: de.scrollWidth > de.clientWidth + 1,
      widest,
      brokenImgs,
      imgCount: imgs.length,
      fontLoaded,
      stuckHidden,
      title: document.title,
    };
  });
}

/** Interactive components, exercised with real input events. */
async function auditInteractions(page, viewport) {
  const out = {};

  if (viewport.width >= 1024) {
    const mega = page.locator('header button:has-text("Heating & Cooling")').first();
    if (await mega.count()) {
      await mega.click();
      out.megaMenuOpens = (await mega.getAttribute('aria-expanded')) === 'true';
      await page.keyboard.press('Escape');
    }
  } else {
    const burger = page.locator('button[aria-label="Open menu"]').first();
    if (await burger.count()) {
      await burger.click();
      await page.waitForTimeout(300);
      out.mobileMenuOpens = await page.locator('[role="dialog"][aria-label="Main menu"]').isVisible();
      const close = page.locator('button[aria-label="Close menu"]').first();
      if (await close.count()) await close.click();
    }
  }

  const a11y = page.locator('button[aria-label="Accessibility options"]').first();
  if (await a11y.count()) {
    await a11y.click();
    await page.waitForTimeout(300);
    const panel = page.locator('.a11y-panel').first();
    out.a11yPanelOpens = await panel.isVisible();
    if (out.a11yPanelOpens) {
      const box = await panel.boundingBox();
      out.a11yPanelFits = box.x >= 0 && box.x + box.width <= viewport.width + 1;
    }
    const close = page.locator('button[aria-label="Close accessibility options"]').first();
    if (await close.count()) await close.click();
  }

  const chat = page.locator('button[aria-label="Open chat"]').first();
  if (await chat.count()) {
    await chat.click();
    await page.waitForTimeout(600);
    out.chatOpens = await page.locator('[role="dialog"][aria-label*="Chat"]').isVisible();
    const closeChat = page.locator('button[aria-label="Close chat"]').first();
    if (await closeChat.count()) await closeChat.click();
  }

  return out;
}

async function runBrowser(engine, name) {
  const browser = await engine.launch();

  for (const viewport of VIEWPORTS) {
    // The mobile pass runs as a real iPhone profile (touch, device scale, UA).
    const context =
      viewport.name === 'mobile'
        ? await browser.newContext({ ...devices['iPhone 14 Pro'] })
        : await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });

    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160));
    });
    page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + String(e).slice(0, 160)));

    for (const route of ROUTES) {
      consoleErrors.length = 0;
      // 'load', not 'networkidle': the map's tile server keeps streaming, so
      // network idle never arrives on the service-area routes.
      // 'domcontentloaded', not 'load': the hero video streams for as long as it
      // likes, so the window load event is not a reliable settle signal here.
      const res = await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(1200);
      if (route !== '/404' && res && res.status() >= 400) {
        report(name, viewport.name, route, 'http', 'status ' + res.status());
      }

      // Scroll the whole page so lazy images, islands and reveals all trigger.
      await page.evaluate(async () => {
        const step = innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(400);

      const a = await auditPage(page);
      if (a.overflow) {
        report(name, viewport.name, route, 'overflow', `${a.clientWidth} -> ${a.scrollWidth}, widest: ${a.widest}`);
      }
      if (a.brokenImgs.length) report(name, viewport.name, route, 'broken-image', a.brokenImgs.join(', '));
      if (!a.fontLoaded) report(name, viewport.name, route, 'font', 'Inter never reported as loaded');
      if (a.stuckHidden) report(name, viewport.name, route, 'reveal-stuck', `${a.stuckHidden} element(s) left at opacity 0 in viewport`);
      if (consoleErrors.length) report(name, viewport.name, route, 'console', consoleErrors.join(' | '));

      if (route === '/') {
        const i = await auditInteractions(page, viewport);
        for (const [k, v] of Object.entries(i)) {
          if (v === false) report(name, viewport.name, route, 'interaction', k + ' = false');
        }
        await page.screenshot({
          path: resolve(SHOTS, `${name}-${viewport.name}-home.png`),
          fullPage: false,
        });
      }
    }

    await context.close();
  }

  await browser.close();
}

mkdirSync(SHOTS, { recursive: true });
console.log(`QA pass against ${BASE}\n`);

await runBrowser(webkit, 'webkit');
await runBrowser(chromium, 'chromium');

if (!findings.length) {
  console.log('PASS: no overflow, console errors, broken images, font or interaction failures.');
} else {
  console.log(`${findings.length} finding(s):\n`);
  for (const f of findings) {
    console.log(`  [${f.browser}/${f.viewport}] ${f.route} - ${f.kind}: ${f.detail}`);
  }
}
console.log(`\nScreenshots: ${SHOTS}`);
process.exit(findings.length ? 1 : 0);
