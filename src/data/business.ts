/**
 * Single source of truth for all Courtesy Plumbing & Heating business facts.
 * Every phone number, address, and license string in the site should import from here.
 * Verified against courtesyplumbingandheating.com (contact + privacy pages) on 2026-08-04,
 * and cross-checked against a full legacy-site content extraction (65+ pages) on 2026-08-05.
 */

export const business = {
  name: 'Courtesy Plumbing & Heating',
  legalName: 'Courtesy Plumbing & Heating',
  // TODO: VERIFY: privacy policy states DBA "Affordable Plumbing, Heat & Electrical"; confirm how/if this should be disclosed on-site
  dba: 'Affordable Plumbing, Heat & Electrical',

  phone: {
    // The only tel: link used sitewide on the legacy site (every page footer); treated as primary.
    display: '(719) 679-5479',
    href: 'tel:+17196795479',
  },

  // TODO: VERIFY: (303) 688-0597 appears in the legacy site's JSON-LD/contact settings (not a visible
  // tel: link), and (303) 429-6990 appears once as a "privacy policy contact" number. Neither is used
  // on-site here; confirm with the business whether either should replace/supplement the primary line.

  email: {
    display: 'Contact@courtesyinc.net',
    href: 'mailto:Contact@courtesyinc.net',
  },

  address: {
    street: '385 Park Ct',
    city: 'Castle Rock',
    state: 'CO',
    zip: '80109',
    full: '385 Park Ct, Castle Rock, CO 80109',
  },

  // Confirmed via legacy-site contact page (distinct from the standard footer address above).
  secondaryAddress: {
    street: '9275 N Elm Ct',
    city: 'Federal Heights',
    state: 'CO',
    zip: '80260',
    full: '9275 N Elm Ct, Federal Heights, CO 80260',
  },

  license: {
    plumbing: 'PC.0001483',
  },

  hours: {
    display: 'Available 24/7',
    emergency: true,
  },

  tagline: 'Plumbing, Heating & Cooling Done With Courtesy.',
  positioning: 'Transparent Pricing With No Trip Fees',

  // Confirmed verbatim on legacy homepage: "Serving Castle Rock & Denver For More Than 30 Years."
  yearsInBusiness: '30+',

  social: {
    // TODO: VERIFY: exact Google Business Profile URL not confirmed; this is a search-query fallback, not a profile deep link.
    google: 'https://www.google.com/maps/place/?q=Courtesy+Plumbing+%26+Heating',
    // TODO: VERIFY: legacy site JSON-LD sameAs listed a specific Facebook page ID; confirm before publishing
    // (a wrong/generic Facebook link is worse than none, so this stays generic until confirmed).
    facebook: 'https://www.facebook.com/',
  },

  serviceRegion: 'Castle Rock & the Denver Metro Area',
} as const;

export type Business = typeof business;
