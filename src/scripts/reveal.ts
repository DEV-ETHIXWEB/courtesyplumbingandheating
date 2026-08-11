/**
 * Zero-dependency scroll-reveal. Observes every [data-reveal] element and
 * flips a class when it enters the viewport. Staggered groups set
 * --reveal-delay via [data-reveal-group] (see ui/Reveal.astro).
 *
 * The CSS gate (html.io-ready) is what hides un-revealed content, so it is only
 * ever switched on once an observer that can switch it back off is running, and
 * a watchdog drops the gate entirely if the observer never reports (see below).
 */
const REVEAL_WATCHDOG_MS = 2000;

let observer: IntersectionObserver | null = null;
let observerReported = false;

function dropGate(): void {
  // Removing the gate leaves every [data-reveal] element permanently visible.
  document.documentElement.classList.remove('io-ready');
  observer?.disconnect();
  observer = null;
}

function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    // No IO support: leave content visible rather than hiding it forever.
    return;
  }

  if (!observer) {
    // Flip the CSS gate on now, in the same tick we start observing, so
    // content is never hidden without an observer that will unhide it.
    document.documentElement.classList.add('io-ready');

    observer = new IntersectionObserver(
      (entries) => {
        observerReported = true;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    // Failsafe: in any environment where the observer never reports (no
    // compositing, exotic embedded webview), show everything rather than
    // leaving the page blank.
    window.setTimeout(() => {
      if (!observerReported) dropGate();
    }, REVEAL_WATCHDOG_MS);
  }

  targets.forEach((el) => observer?.observe(el));
}

// Run on first load, and again after client-side navigations if a router is added.
initReveal();
document.addEventListener('astro:page-load', initReveal);

// Newly-inserted or newly-shown [data-reveal] nodes (e.g. the blog "show more"
// batch) opt in by dispatching this event; already-revealed nodes are skipped.
document.addEventListener('reveal:refresh', initReveal);
