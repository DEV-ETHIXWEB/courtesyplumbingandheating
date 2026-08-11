/**
 * Single source of truth for all Courtesy Plumbing & Heating business facts.
 * Every phone number, address, and license string in the site should import from here.
 * Verified against courtesyplumbingandheating.com (contact + privacy pages) on 2026-08-04,
 * and cross-checked against a full legacy-site content extraction (65+ pages) on 2026-08-05.
 */

export const business = {
  name: 'Courtesy Plumbing & Heating',
  legalName: 'Courtesy Plumbing & Heating',
  // Appears in the legacy privacy policy. Not surfaced anywhere on-site; kept here so the
  // coupon artwork's branding has a documented source. See docs/PENDING-CLIENT-CONFIRMATIONS.md.
  dba: 'Affordable Plumbing, Heat & Electrical',

  phone: {
    // The only tel: link used sitewide on the legacy site (every page footer); treated as primary.
    display: '(719) 679-5479',
    href: 'tel:+17196795479',
  },

  // Only the primary line above is published. Two other numbers found in the legacy site
  // are pending client confirmation - see docs/PENDING-CLIENT-CONFIRMATIONS.md.

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

  // Any entry left null is not rendered anywhere. Unconfirmed profile URLs stay null rather
  // than shipping a generic link - see docs/PENDING-CLIENT-CONFIRMATIONS.md.
  social: {
    // Maps search for the business. Replace with the Google Business Profile deep link
    // once the client supplies it.
    google: 'https://www.google.com/maps/search/?api=1&query=Courtesy+Plumbing+%26+Heating+Castle+Rock+CO',
    // Footer link was removed while this is null; re-add it once a real page URL arrives.
    facebook: null as string | null,
  },

  serviceRegion: 'Castle Rock & the Denver Metro Area',
} as const;

export type Business = typeof business;
