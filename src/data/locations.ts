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
  { slug: 'arvada', name: 'Arvada', lat: 39.8028, lng: -105.0875, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating provides licensed plumbing, heating, and cooling service throughout Arvada, from Olde Town to the newest builds near Candelas.',
      localContext: [
        'Arvada spans decades of housing stock, from mid-century ranch homes near Olde Town Arvada to newer construction in the northwest foothills, each with different plumbing and HVAC needs.',
        'The city sits at the base of the foothills, where elevation and wind exposure add extra strain on furnaces and heat pumps through the winter.',
        'We dispatch throughout Arvada for everything from water heater replacement to full HVAC installs.',
      ],
      neighborhoods: ['Olde Town Arvada', 'Candelas', 'Ralston Valley', 'Lake Arbor', 'Leyden Rock', 'West Woods'],
    },
  },
  { slug: 'aurora', name: 'Aurora', lat: 39.7294, lng: -104.8319, hasPage: true,
    content: {
      intro: 'Courtesy brings licensed, transparent plumbing and HVAC service to Aurora, one of the largest and most diverse cities in the Denver Metro area.',
      localContext: [
        'Aurora’s size means a wide range of home ages and system types, from established neighborhoods near Fitzsimons to fast-growing communities out toward Southlands.',
        'Aurora’s exposure to Front Range wind and hail makes durable, properly-installed HVAC equipment especially important here.',
        'Our technicians regularly serve homeowners and property managers across Aurora’s many distinct neighborhoods.',
      ],
      neighborhoods: ['Southlands', 'Saddle Rock', 'Tallyn\'s Reach', 'Fitzsimons', 'Heather Ridge', 'Murphy Creek'],
    },
  },
  { slug: 'boulder', name: 'Boulder', lat: 40.0150, lng: -105.2705, hasPage: true,
    content: {
      intro: 'Courtesy provides licensed plumbing, heating, and cooling service to Boulder homeowners, from historic Mapleton Hill to the neighborhoods near CU.',
      localContext: [
        'Boulder’s mix of century-old homes and energy-efficient new construction means service calls range from aging galvanized pipe to modern high-efficiency furnaces.',
        'Boulder’s canyon winds and high elevation put real demand on heating systems, especially in older homes with original ductwork.',
        'We serve Boulder homeowners with the same transparent pricing and no-trip-fee policy as our Castle Rock headquarters.',
      ],
      neighborhoods: ['Mapleton Hill', 'University Hill', 'Gunbarrel', 'North Boulder', 'Table Mesa', 'Chautauqua area'],
    },
  },
  { slug: 'brighton', name: 'Brighton', lat: 39.9853, lng: -104.8206, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating serves Brighton with licensed plumbing, heating, and cooling repair, installation, and maintenance.',
      localContext: [
        'Brighton has grown quickly over the past decade, so our technicians see everything from older farmhouse-era plumbing to brand-new HVAC systems still under builder warranty.',
        'The open, high-plains terrain around Brighton means furnaces and AC units work harder against wind and temperature swings than in more sheltered parts of the metro.',
        'We dispatch throughout Brighton and the surrounding Adams County communities.',
      ],
      neighborhoods: ['Historic Downtown Brighton', 'Prairie Center', 'Brighton Crossing', 'Riverdale Park area'],
    },
  },
  { slug: 'broomfield', name: 'Broomfield', lat: 39.9205, lng: -105.0867, hasPage: true,
    content: {
      intro: 'Courtesy provides licensed plumbing, heating, and cooling service throughout Broomfield, a city known for its mix of established and rapidly growing neighborhoods.',
      localContext: [
        'Broomfield sits between Denver and Boulder, so its housing stock varies widely by neighborhood, and so does the service history of the plumbing and HVAC equipment inside.',
        'Broomfield’s open-plains exposure means high winds and rapid temperature swings that stress heating and cooling systems throughout the year.',
        'We serve Broomfield homeowners with the same licensed, no-trip-fee service available across our full Denver Metro coverage area.',
      ],
      neighborhoods: ['Anthem', 'The Broadlands', 'Interlocken', 'Willow Park'],
    },
  },
  { slug: 'centennial', name: 'Centennial', lat: 39.5807, lng: -104.8772, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating offers licensed plumbing, heating, and cooling service throughout Centennial and the southeast Denver Metro area.',
      localContext: [
        'Centennial’s neighborhoods were largely built from the 1970s through the 2000s, which means many original water heaters and furnaces are now due for replacement.',
        'The city’s proximity to open space and higher elevation can mean colder overnight temperatures than downtown Denver, adding extra load on heating systems.',
        'We regularly serve Centennial homeowners for both routine maintenance and emergency plumbing and HVAC repair.',
      ],
      neighborhoods: ['Piney Creek', 'Homestead', 'Southglenn', 'Willow Creek'],
    },
  },
  { slug: 'commerce-city', name: 'Commerce City', lat: 39.8083, lng: -104.9339, hasPage: true,
    content: {
      intro: 'Courtesy serves Commerce City homeowners with licensed, transparent plumbing, heating, and cooling repair and installation.',
      localContext: [
        'Commerce City has seen significant new construction alongside older established neighborhoods, so service needs range from builder-grade HVAC tune-ups to full system replacements in older homes.',
        'The area’s exposure to high plains wind and weather swings makes reliable heating and cooling especially important for Commerce City homeowners.',
        'Our technicians dispatch throughout Commerce City and the surrounding Adams County communities.',
      ],
      neighborhoods: ['Reunion', 'The Villages at Buffalo Run', 'Historic Commerce City'],
    },
  },
  { slug: 'englewood', name: 'Englewood', lat: 39.6478, lng: -104.9878, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating provides licensed plumbing, heating, and cooling service to Englewood homeowners just south of Denver.',
      localContext: [
        'Englewood’s older housing stock, much of it built mid-century, means our technicians frequently handle aging water heaters, cast iron drain lines, and original ductwork.',
        'Englewood’s close-in location means fast response times from our dispatch, without sacrificing the transparent, no-trip-fee pricing we offer metro-wide.',
        'We serve both single-family homes and multi-unit properties throughout Englewood.',
      ],
      neighborhoods: ['Old Englewood', 'Cherrelyn', 'Broadway Historic District', 'Cushing Park'],
    },
  },
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
  { slug: 'golden', name: 'Golden', lat: 39.7555, lng: -105.2211, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating provides licensed plumbing, heating, and cooling service to Golden homeowners at the foot of the Rockies.',
      localContext: [
        'Golden’s foothills location means many homes deal with higher wind exposure and greater elevation, both of which put extra demand on heating systems in winter.',
        'The city’s mix of historic downtown homes and newer foothill developments means a wide range of plumbing and HVAC system ages and types.',
        'We dispatch throughout Golden and the surrounding foothills communities.',
      ],
      neighborhoods: ['Historic Downtown Golden', 'Applewood', 'Pleasant View', 'Mesa Meadows'],
    },
  },
  { slug: 'greenwood-village', name: 'Greenwood Village', lat: 39.6172, lng: -104.9500, hasPage: true,
    content: {
      intro: 'Courtesy provides licensed plumbing, heating, and cooling service to Greenwood Village homeowners in the southeast Denver Metro area.',
      localContext: [
        'Greenwood Village’s larger, established homes often have more complex plumbing and multi-zone HVAC systems than typical starter homes, which our technicians are equipped to handle.',
        'Many homes in the area were built in the 1980s and 90s, putting original water heaters and furnaces well past their expected service life.',
        'We bring the same transparent, no-trip-fee pricing to Greenwood Village that we offer across the full Denver Metro area.',
      ],
      neighborhoods: ['The Preserve', 'Cherry Creek Vista', 'Village Greens'],
    },
  },
  { slug: 'highlands-ranch', name: 'Highlands Ranch', lat: 39.5539, lng: -104.9689, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating is a trusted local provider for Highlands Ranch homeowners, just north of our Castle Rock headquarters.',
      localContext: [
        'Highlands Ranch’s many planned neighborhoods were built primarily from the late 1980s through the 2000s, meaning a large share of original furnaces and water heaters are now reaching replacement age.',
        'The community’s size and consistent housing styles mean our technicians see recurring, well-understood plumbing and HVAC issues by neighborhood.',
        'As one of our closest service areas to Castle Rock, Highlands Ranch benefits from fast average response times.',
      ],
      neighborhoods: ['Backcountry', 'Southridge', 'Firelight', 'Northridge', 'Eastridge', 'Westridge'],
    },
  },
  { slug: 'lafayette', name: 'Lafayette', lat: 39.9936, lng: -105.0897, hasPage: true,
    content: {
      intro: 'Courtesy provides licensed plumbing, heating, and cooling service to Lafayette homeowners in Boulder County.',
      localContext: [
        'Lafayette’s blend of historic coal-town-era homes and newer subdivisions means service calls range from aging galvanized plumbing to modern high-efficiency systems.',
        'Boulder County’s temperature swings and canyon winds place real demand on both heating and cooling equipment throughout the year.',
        'Our technicians regularly serve Lafayette and the surrounding Boulder County communities.',
      ],
      neighborhoods: ['Old Town Lafayette', 'Indian Peaks', 'Beacon Hill'],
    },
  },
  { slug: 'lakewood', name: 'Lakewood', lat: 39.7047, lng: -105.0814, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating brings licensed, transparent service to Lakewood homeowners throughout the west Denver Metro area.',
      localContext: [
        'Lakewood’s housing stock spans decades, from mid-century homes near Belmar to newer construction toward the foothills, each with distinct plumbing and HVAC service needs.',
        'The city’s proximity to the foothills means slightly cooler temperatures and higher wind exposure than downtown Denver, adding load to heating systems.',
        'We dispatch throughout Lakewood for everything from drain cleaning to full furnace and AC replacement.',
      ],
      neighborhoods: ['Belmar', 'Green Mountain', 'Applewood Valley', 'Union Square'],
    },
  },
  { slug: 'littleton', name: 'Littleton', lat: 39.6133, lng: -105.0166, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating serves Littleton with licensed plumbing, heating, and cooling repair, installation, and maintenance.',
      localContext: [
        'Littleton’s historic downtown and surrounding established neighborhoods mean many homes still have original plumbing and heating equipment well past typical replacement age.',
        'The South Platte River corridor running through Littleton can mean higher groundwater and humidity in some areas, which affects sump pump and drainage needs.',
        'We serve Littleton homeowners with the same 24/7 emergency availability and no-trip-fee pricing offered across our full coverage area.',
      ],
      neighborhoods: ['Historic Downtown Littleton', 'Ken Caryl', 'Columbine', 'Southbridge'],
    },
  },
  { slug: 'lone-tree', name: 'Lone Tree', lat: 39.5486, lng: -104.8828, hasPage: true,
    content: {
      intro: 'Courtesy provides licensed plumbing, heating, and cooling service to Lone Tree homeowners along the I-25 corridor, close to our Castle Rock headquarters.',
      localContext: [
        'Lone Tree’s newer housing stock, largely built since the 1990s, still requires regular HVAC maintenance and occasional early-failure plumbing repairs even in well-built homes.',
        'The community’s proximity to Castle Rock means fast average response times from our home base.',
        'We handle both routine maintenance and emergency service for Lone Tree homeowners and property managers.',
      ],
      neighborhoods: ['Heritage Hills', 'RidgeGate', 'Sky Ridge area'],
    },
  },
  { slug: 'louisville', name: 'Louisville', lat: 39.9778, lng: -105.1319, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating serves Louisville homeowners with licensed plumbing, heating, and cooling repair and installation.',
      localContext: [
        'Louisville’s historic downtown core sits alongside newer subdivisions, meaning our technicians handle everything from century-old plumbing to modern high-efficiency furnaces.',
        'Boulder County’s wind and temperature swings put real seasonal demand on heating and cooling systems throughout Louisville.',
        'We dispatch throughout Louisville and the broader Boulder County service area.',
      ],
      neighborhoods: ['Old Town Louisville', 'Coal Creek Ranch', 'Steel Ranch'],
    },
  },
  { slug: 'northglenn', name: 'Northglenn', lat: 39.9006, lng: -104.9872, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating provides licensed plumbing, heating, and cooling service throughout Northglenn.',
      localContext: [
        'Northglenn’s homes were largely built from the 1960s through the 1980s, meaning original plumbing and HVAC equipment is commonly due for replacement.',
        'The area’s open exposure to Front Range weather means furnaces and AC units work harder than in more sheltered parts of the metro.',
        'We serve Northglenn homeowners with the same transparent, no-trip-fee pricing available across our full Denver Metro coverage.',
      ],
      neighborhoods: ['Northglenn Estates', 'Devonshire Heights', 'Malley Park area'],
    },
  },
  { slug: 'parker', name: 'Parker', lat: 39.5186, lng: -104.7614, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating is a trusted local provider for Parker homeowners, close to our Castle Rock headquarters.',
      localContext: [
        'Parker has grown rapidly over the past two decades, so our technicians see everything from original builder-grade HVAC systems to newly installed high-efficiency units.',
        'The town’s high-plains elevation and exposure bring wide temperature swings that place real seasonal demand on heating and cooling equipment.',
        'As one of our closest service areas to Castle Rock, Parker benefits from fast average response times.',
      ],
      neighborhoods: ['Stroh Ranch', 'The Pinery', 'Idyllwilde', 'Clarke Farms', 'Downtown Parker'],
    },
  },
  { slug: 'thornton', name: 'Thornton', lat: 39.8681, lng: -104.9719, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating provides licensed plumbing, heating, and cooling service throughout Thornton and the north Denver Metro area.',
      localContext: [
        'Thornton’s housing stock spans decades of growth, from established 1970s-era neighborhoods to newer developments toward the east, each with different service needs.',
        'The city’s open, high-plains terrain means wind and rapid temperature swings add real demand on heating and cooling systems.',
        'Our technicians dispatch throughout Thornton for both routine maintenance and emergency plumbing and HVAC repair.',
      ],
      neighborhoods: ['Original Thornton', 'Eastlake', 'Homestead Hills', 'Trail Winds'],
    },
  },
  { slug: 'westminster', name: 'Westminster', lat: 39.8367, lng: -105.0372, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating brings licensed, transparent plumbing, heating, and cooling service to Westminster homeowners.',
      localContext: [
        'Westminster’s housing stock ranges from established mid-century neighborhoods to newer development near the Boulder County line, each with different plumbing and HVAC needs.',
        'The city’s elevated, open terrain means real seasonal temperature swings that put consistent demand on heating and cooling systems.',
        'We dispatch throughout Westminster for everything from drain cleaning to full HVAC system replacement.',
      ],
      neighborhoods: ['The Ranch', 'Legacy Ridge', 'Cotton Creek', 'Church Ranch'],
    },
  },
  { slug: 'wheat-ridge', name: 'Wheat Ridge', lat: 39.7661, lng: -105.0772, hasPage: true,
    content: {
      intro: 'Courtesy Plumbing & Heating serves Wheat Ridge homeowners with licensed plumbing, heating, and cooling repair, installation, and maintenance.',
      localContext: [
        'Wheat Ridge’s largely mid-century housing stock means our technicians frequently handle aging water heaters, original ductwork, and outdated plumbing fixtures.',
        'The city’s proximity to the foothills brings slightly cooler temperatures and higher wind exposure than downtown Denver.',
        'We serve Wheat Ridge homeowners with the same 24/7 emergency availability and no-trip-fee pricing offered across our full coverage area.',
      ],
      neighborhoods: ['Applewood', 'Fruitdale', 'Paramount Heights'],
    },
  },
];

export const primaryLocation = locations.find((l) => l.primary)!;

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
