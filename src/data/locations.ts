/**
 * Verified service-area cities, driving the service-area map, /service-area pages,
 * and footer location list. Coordinates are real lat/lng (city-center, public record)
 * for use with a real geographic map (Leaflet).
 */

export interface LocationContent {
  /** 1-2 sentence hero subhead specific to this city, not boilerplate */
  intro: string;
  /** What's locally distinctive: climate factors, housing stock, neighborhoods */
  localContext: string[];
  /** Named neighborhoods/areas within or near this city, for genuine local relevance */
  neighborhoods: string[];
}

export interface Location {
  slug: string;
  name: string;
  /** Real-world latitude, city center */
  lat: number;
  /** Real-world longitude, city center */
  lng: number;
  /** Primary/headquarters city gets a larger marker + dedicated emphasis */
  primary?: boolean;
  /** Has a fully built local landing page (vs. listed-only on the service-area hub) */
  hasPage?: boolean;
  content?: LocationContent;
}

// City-center coordinates, Denver metro area.
export const locations: Location[] = [
  {
    slug: 'castle-rock', name: 'Castle Rock', lat: 39.3722, lng: -104.8561, primary: true, hasPage: true,
    content: {
      intro: 'Our home base. Courtesy Plumbing & Heating is headquartered in Castle Rock, right off Park Court, and has served the community for 30+ years.',
      localContext: [
        'Castle Rock’s mix of established neighborhoods and newer developments means we work on everything from decades-old furnaces to the latest heat pump systems.',
        'The town’s namesake butte and high-desert elevation bring wide temperature swings, hard on both heating and cooling systems throughout the year.',
        'As our headquarters city, Castle Rock gets our fastest average response times.',
      ],
      neighborhoods: ['The Meadows', 'Founders Village', 'Cobblestone Ranch', 'Crystal Valley', 'Downtown Castle Rock', 'Terrain'],
    },
  },
  { slug: 'denver', name: 'Denver', lat: 39.7392, lng: -104.9903, hasPage: true,
    content: {
      intro: 'Courtesy provides licensed plumbing, heating, and cooling service throughout Denver, from historic bungalows to downtown high-rises.',
      localContext: [
        'Denver’s housing stock spans everything from century-old brick homes with original galvanized plumbing to new-build condos, each with different service needs.',
        'The city’s rapid summer-to-winter swings put real demand on both furnaces and AC systems every year.',
        'We serve homeowners and property managers throughout the Denver metro core and surrounding neighborhoods.',
      ],
      neighborhoods: ['Highlands', 'Washington Park', 'Cherry Creek', 'Capitol Hill', 'Stapleton / Central Park', 'Sloan\'s Lake'],
    },
  },
  { slug: 'arvada', name: 'Arvada', lat: 39.8028, lng: -105.0875 },
  { slug: 'aurora', name: 'Aurora', lat: 39.7294, lng: -104.8319 },
  { slug: 'boulder', name: 'Boulder', lat: 40.0150, lng: -105.2705 },
  { slug: 'brighton', name: 'Brighton', lat: 39.9853, lng: -104.8206 },
  { slug: 'broomfield', name: 'Broomfield', lat: 39.9205, lng: -105.0867 },
  { slug: 'centennial', name: 'Centennial', lat: 39.5807, lng: -104.8772 },
  { slug: 'commerce-city', name: 'Commerce City', lat: 39.8083, lng: -104.9339 },
  { slug: 'englewood', name: 'Englewood', lat: 39.6478, lng: -104.9878 },
  { slug: 'federal-heights', name: 'Federal Heights', lat: 39.8514, lng: -105.0114, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating brings the same licensed, transparent service to Federal Heights that we provide from our Castle Rock headquarters.',
      localContext: [
        'Federal Heights’ established residential streets mean many homes are due for water heater or furnace replacement as original equipment reaches the end of its service life.',
        'We handle everything from routine drain cleaning to full HVAC installation for Federal Heights homeowners.',
        'Our technicians are familiar with the area and dispatch throughout Federal Heights and the surrounding north-metro communities.',
      ],
      neighborhoods: ['Skyline Vista', 'Hyland Hills area', 'North Washington'],
    },
  },
  { slug: 'golden', name: 'Golden', lat: 39.7555, lng: -105.2211 },
  { slug: 'greenwood-village', name: 'Greenwood Village', lat: 39.6172, lng: -104.9500 },
  { slug: 'highlands-ranch', name: 'Highlands Ranch', lat: 39.5539, lng: -104.9689 },
  { slug: 'lafayette', name: 'Lafayette', lat: 39.9936, lng: -105.0897 },
  { slug: 'lakewood', name: 'Lakewood', lat: 39.7047, lng: -105.0814 },
  { slug: 'littleton', name: 'Littleton', lat: 39.6133, lng: -105.0166 },
  { slug: 'lone-tree', name: 'Lone Tree', lat: 39.5486, lng: -104.8828 },
  { slug: 'louisville', name: 'Louisville', lat: 39.9778, lng: -105.1319 },
  { slug: 'northglenn', name: 'Northglenn', lat: 39.9006, lng: -104.9872 },
  { slug: 'parker', name: 'Parker', lat: 39.5186, lng: -104.7614 },
  { slug: 'thornton', name: 'Thornton', lat: 39.8681, lng: -104.9719 },
  { slug: 'westminster', name: 'Westminster', lat: 39.8367, lng: -105.0372 },
  { slug: 'wheat-ridge', name: 'Wheat Ridge', lat: 39.7661, lng: -105.0772 },
];

export const primaryLocation = locations.find((l) => l.primary)!;

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
