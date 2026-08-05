/**
 * Full service catalog, grouped by family. Drives navigation, service pages,
 * homepage service cards, and the quick service selector.
 */

export type ServiceFamily = 'hvac' | 'plumbing' | 'sewer';

export interface Service {
  slug: string;
  name: string;
  shortName?: string;
  family: ServiceFamily;
  description: string;
  /** Lucide icon name, kebab-case as exported by lucide */
  icon: string;
  emergency?: boolean;
}

export interface ServiceDetail {
  /** 1-2 sentence hero subhead, more specific than the card description */
  intro: string;
  /** "Signs you need this service" / when to call */
  signs: string[];
  /** What Courtesy actually does for this service, in order */
  process: { title: string; description: string }[];
  /** Why choose Courtesy for this specific service */
  benefits: string[];
  faqs: { question: string; answer: string }[];
  /** Related service slugs within the same or a different family, as "family/slug" */
  related: string[];
}

export const serviceFamilies: Record<
  ServiceFamily,
  { name: string; slug: string; description: string; icon: string; color: string }
> = {
  hvac: {
    name: 'Heating & Cooling',
    slug: 'hvac',
    description: 'Furnace, AC, heat pump, boiler, and mini split repair, replacement, and installation.',
    icon: 'thermometer',
    color: 'brand-red',
  },
  plumbing: {
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Drain cleaning, water heaters, fixtures, and everyday plumbing repair.',
    icon: 'wrench',
    color: 'brand-blue',
  },
  sewer: {
    name: 'Sewer & Drains',
    slug: 'sewer',
    description: 'Sewer repair, hydro jetting, trenchless repair, and camera inspection.',
    icon: 'git-branch',
    color: 'brand-navy',
  },
};

export const services: Service[] = [
  // HVAC
  { slug: 'ac-repair', name: 'AC Repair', family: 'hvac', icon: 'snowflake', emergency: true,
    description: 'Fast diagnostics and repair for AC units that have stopped cooling or are running poorly.' },
  { slug: 'ac-replacement', name: 'AC Replacement', family: 'hvac', icon: 'refresh-cw',
    description: 'Full system replacement when repairs no longer make sense for older units.' },
  { slug: 'cooling-repair', name: 'Cooling Repair', family: 'hvac', icon: 'wind', emergency: true,
    description: 'Refrigerant leaks, compressor issues, and fan motor repair.' },
  { slug: 'commercial-ac-repair', name: 'Commercial AC Repair', family: 'hvac', icon: 'building-2',
    description: 'Commercial cooling diagnostics and repair with minimal business disruption.' },
  { slug: 'commercial-hvac-repair', name: 'Commercial HVAC Repair', family: 'hvac', icon: 'building',
    description: 'Rooftop units, ventilation, and full commercial HVAC service.' },
  { slug: 'heating-repair', name: 'Heating Repair', family: 'hvac', icon: 'flame', emergency: true,
    description: 'Furnace, boiler, and heat pump repair to get your heat back fast.' },
  { slug: 'humidifier-installation', name: 'Humidifier Installation', family: 'hvac', icon: 'droplets',
    description: 'Whole-house and portable humidifier installation and repair.' },
  { slug: 'hvac-installation', name: 'HVAC Installation', family: 'hvac', icon: 'settings-2',
    description: 'New system installation for furnaces, AC, heat pumps, and boilers.' },
  { slug: 'hvac-contractor', name: 'HVAC Contractor', family: 'hvac', icon: 'hard-hat',
    description: 'Licensed HVAC contracting for new construction and major system work.' },
  { slug: 'mini-splits', name: 'Mini Splits', family: 'hvac', icon: 'layout-grid',
    description: 'Ductless mini split installation for zoned comfort in any room.' },
  { slug: 'furnace-replacement', name: 'Furnace Replacement', family: 'hvac', icon: 'flame-kindling',
    description: 'Full furnace replacement for aging or inefficient systems.' },
  { slug: 'furnace-repair', name: 'Furnace Repair', family: 'hvac', icon: 'wrench', emergency: true,
    description: 'Ignition, blower motor, and thermostat repair for furnaces.' },
  { slug: 'heat-pump-installation', name: 'Heat Pump Installation', family: 'hvac', icon: 'sun-snow',
    description: 'Energy-efficient heat pump consultation and installation.' },
  { slug: 'boiler-repair', name: 'Boiler Repair', family: 'hvac', icon: 'flame', emergency: true,
    description: 'Boiler inspection, leak repair, and pilot light service.' },
  { slug: 'boiler-replacement', name: 'Boiler Replacement', family: 'hvac', icon: 'refresh-cw',
    description: 'Full boiler replacement for units losing efficiency or reliability.' },
  { slug: 'ac-tune-up', name: 'AC Tune Up', family: 'hvac', icon: 'clipboard-check',
    description: 'Seasonal inspection, refrigerant check, and coil cleaning.' },
  { slug: 'furnace-tune-up', name: 'Furnace Tune Up', family: 'hvac', icon: 'clipboard-check',
    description: 'Seasonal furnace inspection, cleaning, and safety testing.' },

  // Plumbing
  { slug: 'drain-cleaning', name: 'Drain Cleaning', family: 'plumbing', icon: 'waves-horizontal', emergency: true,
    description: 'Hydro jetting and camera inspection to clear stubborn clogs.' },
  { slug: 'water-heater-repair', name: 'Water Heater Repair', family: 'plumbing', icon: 'flame', emergency: true,
    description: 'Sediment buildup, pilot light, and leak repair for water heaters.' },
  { slug: 'water-heater-replacement', name: 'Water Heater Replacement', family: 'plumbing', icon: 'refresh-cw',
    description: 'Full water heater replacement, sized and installed correctly.' },
  { slug: 'tankless-water-heaters', name: 'Tankless Water Heaters', family: 'plumbing', icon: 'zap',
    description: 'Tankless water heater installation, replacement, and descaling.' },
  { slug: 'toilet-repair', name: 'Toilet Repair', family: 'plumbing', icon: 'wrench',
    description: 'Clogs, running toilets, and weak flush repair.' },
  { slug: 'garbage-disposals', name: 'Garbage Disposals', family: 'plumbing', icon: 'trash-2',
    description: 'Garbage disposal replacement and repair.' },
  { slug: 'sump-pump-repair', name: 'Sump Pump Repair', family: 'plumbing', icon: 'droplet', emergency: true,
    description: 'Motor repair, float switch, and debris removal for sump pumps.' },
  { slug: 'water-filtration', name: 'Water Filtration', family: 'plumbing', icon: 'filter',
    description: 'Whole-house filtration, reverse osmosis, and water softeners.' },

  // Sewer
  { slug: 'sewer-repair', name: 'Sewer Repair', family: 'sewer', icon: 'wrench', emergency: true,
    description: 'Trenchless and traditional sewer line repair.' },
  { slug: 'hydro-jetting', name: 'Hydro Jetting', family: 'sewer', icon: 'waves-horizontal',
    description: 'High-pressure line clearing for roots and stubborn buildup.' },
  { slug: 'water-line-repair', name: 'Water Line Repair', family: 'sewer', icon: 'git-branch',
    description: 'Leak detection and trenchless water line repair.' },
  { slug: 'trenchless-sewer-repair', name: 'Trenchless Sewer Repair', family: 'sewer', icon: 'shovel',
    description: 'Pipe lining and pipe bursting without full excavation.' },
  { slug: 'plumbing-excavation', name: 'Plumbing Excavation', family: 'sewer', icon: 'shovel',
    description: 'Sewer and water line installation requiring excavation.' },
  { slug: 'sewer-inspection', name: 'Sewer Inspection', family: 'sewer', icon: 'video',
    description: 'Camera inspection to identify root intrusion, corrosion, and damage.' },
];

export function getServicesByFamily(family: ServiceFamily): Service[] {
  return services.filter((s) => s.family === family);
}

export function getServiceBySlug(family: ServiceFamily, slug: string): Service | undefined {
  return services.find((s) => s.family === family && s.slug === slug);
}

export const emergencyServices = services.filter((s) => s.emergency);
