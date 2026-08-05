/**
 * Verified offers. Sourced from the Affordable Plumbing, Heat & Electrical coupons
 * page (affordableplumbingandheat.com/coupons), the confirmed DBA/sister brand of
 * Courtesy Plumbing & Heating (see business.dba in ./business.ts) — screenshot
 * reviewed 2026-08-05. Same underlying company, same license, same offer terms.
 *
 * Expiration on the source page reads 8/31/2026; kept as-is since that is the
 * verified date on the source, not invented. Re-check before that date passes.
 */

export interface Coupon {
  slug: string;
  title: string;
  /** Big display value, e.g. "$89", "$400", "FREE", "5%" */
  amount: string;
  /** Suffix shown smaller/superscript next to amount, e.g. "OFF", "00" */
  amountSuffix?: string;
  description: string;
  restrictions?: string;
  expires?: string;
  featured?: boolean;
}

export const coupons: Coupon[] = [
  {
    slug: 'ac-tune-up',
    title: 'AC Tune-Up',
    amount: '$89',
    description: 'Get ready for the heat! Seasonal inspection and tune-up for your air conditioning system.',
    restrictions: 'Offer not valid with any other offers or discounts. Must present coupon at time of service.',
    expires: '8/31/2026',
    featured: true,
  },
  {
    slug: 'ac-install',
    title: 'Any Air Conditioner',
    amount: '$400',
    amountSuffix: 'OFF',
    description: 'With purchase and installation of any new air conditioner.',
    restrictions: 'Offer not valid with any other offers or discounts. Must present coupon at time of service.',
    expires: '8/31/2026',
  },
  {
    slug: 'ac-furnace-combo',
    title: 'AC / Furnace Combo Install',
    amount: '$1,000',
    amountSuffix: 'OFF',
    description: 'With the purchase and install of any new AC & Furnace.',
    restrictions: 'Offer not valid with any other offers or discounts. Must present coupon at time of service.',
    expires: '8/31/2026',
    featured: true,
  },
  {
    slug: 'water-heater',
    title: 'Water Heater',
    amount: '$249',
    amountSuffix: 'OFF',
    description: 'With purchase and installation of any new water heater.',
    restrictions: 'Offer not valid with any other offers or discounts. Must present coupon at time of service.',
    expires: '8/31/2026',
  },
  {
    slug: 'second-opinion',
    title: 'Second Opinion',
    amount: 'FREE',
    description: 'There is no charge to do a site visit & provide a competitive estimate.',
    restrictions: 'Offer not valid with any other offers or discounts. Must present coupon at time of service.',
    expires: '8/31/2026',
  },
  {
    slug: 'drain-cleaning',
    title: 'Any Drain Cleaning, Including Mainlines',
    amount: '$99',
    description: 'Includes a complimentary camera inspection.',
    restrictions: 'Offer not valid with any other offers or discounts. Must present coupon at time of service.',
    expires: '8/31/2026',
    featured: true,
  },
  {
    slug: 'senior-military',
    title: 'Senior or Military Discount',
    amount: '5%',
    amountSuffix: 'OFF',
    description: 'Thank you for your service. Available on qualifying work.',
    restrictions: 'Must present coupon at time of service. May not be combined with any other offers. Some restrictions apply.',
    expires: '8/31/2026',
  },
];
