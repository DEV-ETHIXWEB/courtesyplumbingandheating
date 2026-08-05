import type { ReactNode } from 'react';
import { services, serviceFamilies, type Service } from '../../data/services';
import { locations, type Location } from '../../data/locations';
import { coupons, type Coupon } from '../../data/coupons';
import { generalFaqs } from '../../data/faqs';
import { serviceDetails } from '../../data/serviceDetails';
import { business } from '../../data/business';

// Keyword-scored knowledge base built directly from the site's own service,
// FAQ, coupon, and service-area data, so chatbot answers can never drift out
// of sync with what the site actually says. No LLM: a small rule engine
// matches on weighted keyword overlap, see findBestMatch() below and
// getSmartReply() in engine.tsx.

export type ReplyContext = {
  /** True the first time this session a visitor lands on this entry's topic.
   * Used to show a smart follow-up question once instead of on every re-ask. */
  isFirstMention: boolean;
};

export type KnowledgeEntry = {
  id: string;
  /** Used for conversation-context tracking, e.g. "service:drain-cleaning" */
  topic: string;
  keywords: string[];
  weight?: number;
  /** Marks a broad catchall entry (services-overview, areas-overview) whose
   * keywords are common single words ("service", "area") likely to also
   * appear in a more specific entry's match. On a tied score, a catchall
   * entry loses to a non-catchall one instead of winning by array order, see
   * findBestMatch(). Doesn't affect the entry's own raw score/threshold. */
  isCatchall?: boolean;
  reply: (ctx: ReplyContext) => ReactNode;
  /** Short plain-text summary of this answer, used in the lead email transcript (bot replies are rich JSX, not plain strings). */
  logLabel: string;
};

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'did', 'you', 'your', 'yours',
  'i', 'im', 'my', 'me', 'to', 'for', 'of', 'in', 'on', 'at', 'and', 'or',
  'what', 'whats', 'how', 'can', 'could', 'will', 'would', 'it', 'its',
  'that', 'this', 'with', 'about', 'if', 'have', 'has', 'had', 'be', 'been',
  'was', 'were', 'there', 'here', 'please',
]);

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ');
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

// Levenshtein edit distance, used only for short single-word typo tolerance
// ("watre" -> "water", "drin" -> "drain"). Deliberately not used for phrase
// matching or long words, both accuracy risks and unnecessary cost, see
// fuzzyKeywordHit() below for where the length/distance caps are enforced.
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** How many typo'd characters we'll forgive for a single-word keyword, scaled
 * to word length so short words ("gas", "hot") aren't fuzzy-matched into
 * false positives while longer ones ("plumbing", "installation") tolerate a
 * couple of slipped keys. */
function maxEditDistanceFor(wordLength: number): number {
  if (wordLength <= 4) return 0;
  if (wordLength <= 7) return 1;
  return 2;
}

/** True if any token in the visitor's message is a near-miss (typo) of the
 * given single-word keyword. Only called after an exact-match pass finds
 * nothing for that keyword, see findBestMatch(). */
function fuzzyKeywordHit(keyword: string, tokens: string[]): boolean {
  const maxDist = maxEditDistanceFor(keyword.length);
  if (maxDist === 0) return false;
  for (const token of tokens) {
    if (Math.abs(token.length - keyword.length) > maxDist) continue;
    if (editDistance(token, keyword) <= maxDist) return true;
  }
  return false;
}

// Handles cases where the site copy uses a different word than a visitor
// would ("no hot water" vs. water heater repair, "AC won't turn on" vs. AC
// repair). Keyed by service slug so it stays attached to the right entry.
const SERVICE_SYNONYMS: Record<string, string[]> = {
  'drain-cleaning': [
    'drain', 'drains', 'clog', 'clogged', 'clogged drain', 'clogged sink',
    'sink not draining', 'tub not draining', 'slow drain', 'backed up',
    'gurgling drain', 'rooter', 'snake the drain', 'roots', 'root intrusion',
    'main line clog',
  ],
  'hydro-jetting': ['hydro jet', 'hydro-jetting', 'hydrojetting', 'jetting', 'high pressure line'],
  'water-heater-repair': [
    'water heater', 'water heaters', 'hot water heater', 'hot water tank',
    'no hot water', 'water heater leaking', 'water heater leak', 'pilot light',
    'water not heating', 'lukewarm water', 'gas water heater', 'electric water heater',
  ],
  'water-heater-replacement': ['new water heater', 'replace water heater', 'water heater install'],
  'tankless-water-heaters': ['tankless', 'tankless heater', 'on demand hot water'],
  'toilet-repair': [
    'toilet', 'running toilet', 'toilet running', 'wont flush', "won't flush",
    'weak flush', 'clogged toilet', 'toilet overflowing', 'toilet leaking at base',
    'wax ring', 'toilet wobbles',
  ],
  'garbage-disposals': ['garbage disposal', 'disposal', 'disposal jammed', 'disposal leaking'],
  'sump-pump-repair': ['sump pump', 'sump pump not working', 'basement flooding', 'sump pump failed'],
  'water-filtration': ['water filtration', 'filter', 'water quality', 'water taste', 'water softener', 'hard water', 'soft water'],
  'water-line-repair': ['water line', 'main water line', 'water line leak', 'low water pressure'],
  'ac-repair': [
    'ac', 'a/c', 'air conditioner', 'air conditioning', 'ac not working',
    'ac wont turn on', 'ac blowing warm air', 'ac not cooling', 'ac broken',
  ],
  'ac-replacement': ['new ac', 'replace ac', 'new air conditioner'],
  'ac-tune-up': ['ac tune up', 'ac maintenance', 'ac check up'],
  'cooling-repair': ['cooling', 'cooling system', 'not cooling'],
  'commercial-ac-repair': ['commercial ac', 'business ac', 'office cooling'],
  'commercial-hvac-repair': ['commercial hvac', 'business hvac', 'office hvac', 'rooftop unit'],
  'furnace-repair': [
    'furnace', 'furnace not working', 'furnace wont turn on', 'no heat',
    'heat not working', 'furnace making noise', 'furnace short cycling',
  ],
  'furnace-replacement': ['new furnace', 'replace furnace', 'furnace install'],
  'furnace-tune-up': ['furnace tune up', 'furnace maintenance'],
  'heat-pump-installation': ['heat pump', 'heat pump install', 'new heat pump'],
  'heating-repair': ['heating', 'heater not working', 'house is cold', 'no heat'],
  'boiler-repair': ['boiler', 'boiler not working', 'boiler leaking', 'boiler pressure'],
  'boiler-replacement': ['new boiler', 'replace boiler'],
  'mini-splits': ['mini split', 'mini splits', 'ductless', 'mini split not working'],
  'humidifier-installation': ['humidifier', 'dry air', 'humidity'],
  'hvac-installation': ['new hvac', 'hvac install', 'new system'],
  'hvac-contractor': ['hvac contractor', 'new construction hvac'],
  'sewer-repair': [
    'sewer', 'sewer line', 'sewer backup', 'sewage backup', 'sewage smell',
    'main sewer line', 'camera inspection', 'whole house backup',
  ],
  'trenchless-sewer-repair': ['trenchless', 'trenchless repair', 'no dig sewer repair'],
  'plumbing-excavation': ['excavation', 'dig up pipe', 'excavate'],
  'sewer-inspection': ['sewer inspection', 'camera inspection', 'sewer camera'],
};

// Words that recur across several service slugs are too generic to act as a
// real single-token signal on their own. Full multi-word matches (the
// service name, phrase synonyms) are unaffected.
const GENERIC_DOMAIN_WORDS = new Set([
  'plumbing', 'plumber', 'repair', 'install', 'installation', 'installations',
  'replacement', 'service', 'services', 'system', 'systems', 'line', 'lines',
]);

function serviceKeywords(service: Service): string[] {
  return [
    service.name.toLowerCase(),
    ...service.slug.split('-').filter((w) => !GENERIC_DOMAIN_WORDS.has(w)),
    ...(SERVICE_SYNONYMS[service.slug] ?? []),
  ];
}

// Shown once per session, the first time a visitor asks about that service,
// so the bot feels like it's actually listening instead of reciting the same
// blurb.
const SERVICE_FOLLOWUPS: Record<string, string> = {
  'drain-cleaning': 'Is this in the kitchen, a bathroom, or the main line outside?',
  'water-heater-repair': 'Is it a total loss of hot water, or just not as hot as it should be?',
  'toilet-repair': 'Is it running constantly, clogged, or leaking at the base?',
  'sewer-repair': 'Is it a single drain backing up, or the whole house?',
  'furnace-repair': 'Is the furnace not turning on at all, or running but not heating?',
  'ac-repair': 'Is the AC not turning on, or running but not actually cooling?',
  'heating-repair': 'Is there no heat at all, or is it just not keeping up?',
};

function serviceHref(service: Service): string {
  return `/${service.family}/${service.slug}`;
}

function buildServiceEntries(): KnowledgeEntry[] {
  return services.map((service) => ({
    id: `service:${service.slug}`,
    topic: `service:${service.slug}`,
    keywords: serviceKeywords(service),
    weight: 2,
    logLabel: `Explained ${service.name}`,
    reply: ({ isFirstMention }) => (
      <>
        <p>{service.description}</p>
        {service.emergency && (
          <p className="mt-2">
            <strong>This is one of our 24/7 emergency services.</strong>
          </p>
        )}
        <a
          href={serviceHref(service)}
          className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-blue-700 hover:text-brand-blue-800"
        >
          More on {service.name} &rarr;
        </a>
        {isFirstMention && SERVICE_FOLLOWUPS[service.slug] && (
          <p className="mt-2">{SERVICE_FOLLOWUPS[service.slug]}</p>
        )}
      </>
    ),
  }));
}

function buildFaqEntries(): KnowledgeEntry[] {
  return generalFaqs.map((faq, index) => ({
    id: `faq:${index}`,
    topic: 'general-faq',
    keywords: tokenize(faq.question),
    weight: 1,
    logLabel: `Answered: "${faq.question}"`,
    reply: () => <p>{faq.answer}</p>,
  }));
}

// Per-service FAQs from each service's detail page (pricing nuance, repair-vs-
// replace, timelines) so the chatbot can answer paraphrased versions of
// questions that only live on the service page, not the general FAQ list.
// Tagged with the service's own topic so page-context boost still applies.
function buildServiceFaqEntries(): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];
  for (const service of services) {
    const detail = serviceDetails[service.slug];
    if (!detail) continue;
    detail.faqs.forEach((faq, index) => {
      entries.push({
        id: `service-faq:${service.slug}:${index}`,
        topic: `service:${service.slug}`,
        keywords: [...tokenize(faq.question), ...serviceKeywords(service)],
        weight: 1,
        logLabel: `Answered: "${faq.question}"`,
        reply: () => (
          <>
            <p>{faq.answer}</p>
            <a
              href={serviceHref(service)}
              className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-blue-700 hover:text-brand-blue-800"
            >
              More on {service.name} &rarr;
            </a>
          </>
        ),
      });
    });
  }
  return entries;
}

/** True if a coupon's `expires` (M/D/YYYY, as sourced on coupons.ts) is today or later. Coupons without an expires date are treated as always-active. */
function isCouponActive(coupon: Coupon): boolean {
  if (!coupon.expires) return true;
  const parsed = new Date(coupon.expires);
  if (Number.isNaN(parsed.getTime())) return true;
  const endOfDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59);
  return endOfDay.getTime() >= Date.now();
}

function activeCoupons(): Coupon[] {
  return coupons.filter(isCouponActive);
}

function buildCouponEntries(): KnowledgeEntry[] {
  return activeCoupons().map((coupon) => ({
    id: `coupon:${coupon.slug}`,
    topic: 'coupons',
    keywords: [...tokenize(coupon.title), ...tokenize(coupon.description)],
    weight: 1,
    logLabel: `Mentioned coupon ${coupon.title}`,
    reply: () => (
      <>
        <p>
          {coupon.title} &mdash; {coupon.description}
        </p>
        {coupon.restrictions && <p className="mt-1.5 text-xs">{coupon.restrictions}</p>}
      </>
    ),
  }));
}

function buildLocationEntries(): KnowledgeEntry[] {
  return locations
    .filter((l) => l.hasPage)
    .map((loc: Location) => ({
      id: `location:${loc.slug}`,
      topic: `location:${loc.slug}`,
      keywords: [loc.name.toLowerCase()],
      weight: 3,
      logLabel: `Confirmed service area: ${loc.name}`,
      reply: () => (
        <>
          <p>Yes, we serve {loc.name}.</p>
          <a
            href={`/service-area/${loc.slug}`}
            className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-blue-700 hover:text-brand-blue-800"
          >
            {loc.name} service details &rarr;
          </a>
        </>
      ),
    }));
}

// Areas listed on the map but without their own landing page yet, matched
// loosely so "do you serve Arvada" still gets a confident yes.
function buildBroadServiceAreaEntries(): KnowledgeEntry[] {
  return locations
    .filter((l) => !l.hasPage)
    .map((loc) => ({
      id: `area:${loc.slug}`,
      topic: 'areas-overview',
      keywords: [loc.name.toLowerCase()],
      weight: 3,
      logLabel: `Confirmed service area: ${loc.name}`,
      reply: () => (
        <>
          Yes, {loc.name} is inside our service area.{' '}
          <a href="/service-area" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
            See full coverage
          </a>
        </>
      ),
    }));
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

const STATIC_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'services-overview',
    topic: 'services-overview',
    keywords: [
      'service', 'services', 'offer', 'offerings', 'provide', 'help with',
      'do you do', 'what do you do', 'what do you fix', 'what can you fix',
      'types of service', 'list of services', 'everything you do', 'full list',
    ],
    weight: 2,
    isCatchall: true,
    logLabel: 'Listed service categories',
    reply: () => (
      <>
        We handle {joinWithAnd(Object.values(serviceFamilies).map((f) => f.name.toLowerCase()))}, everything from a
        leaky faucet to a full furnace replacement.{' '}
        <a href="/hvac" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
          See all services
        </a>
      </>
    ),
  },
  {
    id: 'areas-overview',
    topic: 'areas-overview',
    keywords: [
      'area', 'areas', 'location', 'locations', 'city', 'cities', 'region',
      'where', 'serve', 'coverage', 'service area', 'do you come to',
      'do you come out', 'do you travel', 'travel to', 'zip code',
      'where are you located', 'where are you based', 'what cities', 'near me',
    ],
    weight: 2,
    isCatchall: true,
    logLabel: 'Listed service area coverage',
    reply: () => (
      <>
        We&rsquo;re based in {business.address.city} and serve {locations.length}+ communities across{' '}
        {business.serviceRegion}, including {joinWithAnd(locations.filter((l) => l.hasPage).map((l) => l.name))} and
        more.{' '}
        <a href="/service-area" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
          Check your city
        </a>
      </>
    ),
  },
  {
    id: 'hours',
    topic: 'hours',
    keywords: [
      'hour', 'hours', 'open', 'open now', 'are you open', '24', '247', '24 7',
      '24/7', 'time', 'what time', 'weekend', 'weekends', 'saturday', 'sunday',
      'holiday', 'holidays', 'closed', 'late night', 'middle of the night', 'overnight',
    ],
    weight: 2,
    logLabel: 'Answered a question about hours',
    reply: () => <>{business.hours.display}, including nights, weekends, and holidays.</>,
  },
  {
    id: 'pricing-philosophy',
    topic: 'pricing',
    keywords: [
      'price', 'prices', 'pricing', 'cost', 'costs', 'expensive', 'cheap',
      'cheapest', 'affordable', 'afford', 'budget', 'estimate', 'quote',
      'ballpark', 'how much is it', 'how much would it be', 'what will it cost',
      'flat rate', 'upfront pricing', 'hidden fees', 'trip fee', 'trip charge', 'diagnostic fee',
    ],
    weight: 2,
    logLabel: 'Explained pricing philosophy',
    reply: () => (
      <>
        {business.positioning}. Every job gets a clear, upfront quote before any work begins, and we don&rsquo;t
        charge a trip fee to come take a look.{' '}
        <a href="/contact" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
          Get a free estimate
        </a>
      </>
    ),
  },
  {
    id: 'insurance-licensing',
    topic: 'permits',
    keywords: [
      'permit', 'permits', 'licensed', 'licence', 'license', 'licensing',
      'insured', 'insurance', 'bonded', 'bonded and insured', 'certified',
      'qualifications', 'credentials', 'are your technicians licensed', 'license number',
    ],
    weight: 2,
    logLabel: 'Answered a question about licensing/insurance',
    reply: () => (
      <>
        We&rsquo;re fully licensed, Colorado plumbing license #{business.license.plumbing}. Every technician is
        trained and experienced before they&rsquo;re sent to your home.
      </>
    ),
  },
  {
    id: 'why-choose-us',
    topic: 'why-choose-us',
    keywords: [
      'why choose', 'why should i', 'why you', 'different', 'stand out',
      'better than', 'best plumber', 'best hvac company', 'trust you',
      'experience', 'experienced', 'how long have you', 'how long in business',
      'years in business', 'established', 'locally owned', 'reputable',
    ],
    weight: 2,
    logLabel: 'Explained why customers choose us',
    reply: () => (
      <>
        Castle Rock and Denver metro homeowners choose us because we&rsquo;re licensed, available 24/7, and quote
        every job upfront with no trip fees. We&rsquo;ve been at it {business.yearsInBusiness} years.{' '}
        <a href="/about" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
          More about us
        </a>
      </>
    ),
  },
  {
    id: 'commercial-residential',
    topic: 'commercial-residential',
    keywords: [
      'commercial', 'residential', 'business plumbing', 'office building',
      'office', 'apartment', 'property manager', 'landlord', 'tenant',
      'home or business', 'my house', 'my home',
    ],
    weight: 3,
    logLabel: 'Confirmed residential and commercial service',
    reply: () => (
      <>
        We handle both residential homes and commercial properties, including commercial HVAC.{' '}
        <a href="/contact" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
          Get a free estimate
        </a>
      </>
    ),
  },
  {
    id: 'financing',
    topic: 'financing',
    keywords: [
      'financing', 'finance', 'payment plan', 'payment plans', 'payment',
      'payments', 'loan', 'loans', 'pay over time', 'pay monthly',
      'monthly payments', 'credit', 'soft credit check',
      "can't afford it all at once", 'installments',
    ],
    weight: 3,
    logLabel: 'Answered a question about financing',
    reply: () => (
      <>
        Yes, we offer financing options for larger jobs like furnace, AC, and water heater replacements.{' '}
        <a href="/financing" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
          See financing options
        </a>
      </>
    ),
  },
  {
    id: 'rebates',
    topic: 'rebates',
    keywords: ['rebate', 'rebates', 'tax credit', 'energy rebate', 'utility rebate', 'incentive', 'incentives'],
    weight: 3,
    logLabel: 'Answered a question about rebates',
    reply: () => (
      <>
        There are often manufacturer and utility rebates available on qualifying furnace, AC, and heat pump
        installs.{' '}
        <a href="/rebates" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
          See current rebates
        </a>
      </>
    ),
  },
  {
    id: 'coupons-overview',
    topic: 'coupons',
    keywords: [
      'coupon', 'coupons', 'discount', 'discounts', 'deal', 'deals', 'offer',
      'offers', 'savings', 'save money', 'promo', 'promo code', 'promotion',
      'promotions', 'special', 'specials', 'sale', 'any deals', 'money off',
      'senior discount', 'military discount',
    ],
    weight: 2,
    logLabel: 'Pointed to current coupons',
    reply: () => {
      const active = activeCoupons();
      return active.length > 0 ? (
        <>
          We&rsquo;ve got {active.length} current offer{active.length === 1 ? '' : 's'}.{' '}
          <a href="/coupons" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
            See current coupons
          </a>
        </>
      ) : (
        <>
          Check our{' '}
          <a href="/coupons" className="font-semibold text-brand-blue-700 hover:text-brand-blue-800">
            specials page
          </a>{' '}
          for current offers, or ask your technician about available savings when you schedule.
        </>
      );
    },
  },
];

let cachedKnowledgeBase: KnowledgeEntry[] | null = null;

export function getKnowledgeBase(): KnowledgeEntry[] {
  if (!cachedKnowledgeBase) {
    cachedKnowledgeBase = [
      ...STATIC_ENTRIES,
      ...buildServiceEntries(),
      ...buildFaqEntries(),
      ...buildServiceFaqEntries(),
      ...buildCouponEntries(),
      ...buildLocationEntries(),
      ...buildBroadServiceAreaEntries(),
    ];
  }
  return cachedKnowledgeBase;
}

/** Turns a "service:drain-cleaning" / "location:denver" topic id back into a
 * human label for the lead email transcript. */
export function topicLabel(topic: string): string {
  if (topic.startsWith('service:')) {
    const slug = topic.slice('service:'.length);
    return services.find((s) => s.slug === slug)?.name ?? slug;
  }
  if (topic.startsWith('location:')) {
    const slug = topic.slice('location:'.length);
    return locations.find((l) => l.slug === slug)?.name ?? slug;
  }
  return topic.replace(/-/g, ' ');
}

/** Maps the current page path to a knowledge-base topic id, so a visitor
 * chatting from that page gets a small relevance boost toward what they're
 * already looking at. Returns null on pages with no obvious single topic. */
export function getPageContextTopic(pathname: string): string | null {
  const serviceMatch = pathname.match(/^\/(hvac|plumbing|sewer)\/([^/]+)\/?$/);
  if (serviceMatch && services.some((s) => s.slug === serviceMatch[2])) {
    return `service:${serviceMatch[2]}`;
  }
  const locationMatch = pathname.match(/^\/service-area\/([^/]+)\/?$/);
  if (locationMatch && locations.some((l) => l.slug === locationMatch[1])) {
    return `location:${locationMatch[1]}`;
  }
  return null;
}

export function findBestMatch(
  input: string,
  entries: KnowledgeEntry[] = getKnowledgeBase(),
  contextTopic: string | null = null
): KnowledgeEntry | null {
  const normalizedInput = normalizeText(input);
  const tokens = new Set(tokenize(input));
  if (tokens.size === 0) return null;

  let best: { entry: KnowledgeEntry; score: number } | null = null;
  for (const entry of entries) {
    let score = 0;
    // Tokens that already scored an exact hit on *some* keyword in this
    // entry are excluded from that same entry's fuzzy pass, so e.g. the
    // token "service" can't score both an exact hit on keyword "service"
    // and a second, fuzzy hit on the near-duplicate keyword "services" in
    // the same entry, inflating one entry's total past a genuinely
    // different topic that matched a single, real keyword.
    const exactlyMatchedTokens = new Set(entry.keywords.filter((k) => !k.includes(' ') && tokens.has(k)));
    const fuzzyCandidateTokens = Array.from(tokens).filter((t) => !exactlyMatchedTokens.has(t));
    for (const keyword of entry.keywords) {
      if (keyword.includes(' ')) {
        if (normalizedInput.includes(keyword)) score += 3 * (entry.weight ?? 1);
      } else if (tokens.has(keyword)) {
        score += entry.weight ?? 1;
      } else if (fuzzyKeywordHit(keyword, fuzzyCandidateTokens)) {
        // Typo tolerance ("watre heater", "drin clog"): counts for less than
        // an exact hit so a real match elsewhere always outranks a guess.
        score += Math.max(1, (entry.weight ?? 1) - 1);
      }
    }
    // Small nudge (not a hard override) so a genuinely ambiguous question
    // ("how much does it cost") leans toward the service/city the visitor
    // is already reading about, without letting page context beat a clear,
    // differently-scored match.
    if (score > 0 && contextTopic && entry.topic === contextTopic) {
      score += 1;
    }
    if (score > 0 && best) {
      // On a tied score, a broad catchall entry loses to a specific one
      // (see isCatchall doc comment) instead of silently winning just for
      // appearing earlier in the array.
      const winsOnTie = score === best.score && best.entry.isCatchall && !entry.isCatchall;
      if (score > best.score || winsOnTie) best = { entry, score };
    } else if (score > 0) {
      best = { entry, score };
    }
  }

  return best && best.score >= 2 ? best.entry : null;
}
