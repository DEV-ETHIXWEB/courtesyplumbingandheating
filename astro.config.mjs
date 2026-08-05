// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

// 301 redirects from legacy Squarespace URLs (courtesyplumbingandheating.com) to the
// new site architecture. Old site used clean URLs (no .html) at the root; city-variant
// service pages (e.g. "-federal-heights") collapse into the single canonical service
// page since the new architecture doesn't fork service pages per city.
const redirects = {
  // HVAC
  '/ac-repair-castle-rock': '/hvac/ac-repair',
  '/ac-repair-federal-heights': '/hvac/ac-repair',
  '/ac-replacement-castle-rock': '/hvac/ac-replacement',
  '/ac-tune-up-castle-rock': '/hvac/ac-tune-up',
  '/boiler-repair-castle-rock': '/hvac/boiler-repair',
  '/boiler-replacement-castle-rock': '/hvac/boiler-replacement',
  '/commercial-ac-repair-castle-rock': '/hvac/commercial-ac-repair',
  '/commercial-hvac-repair': '/hvac/commercial-hvac-repair',
  '/cooling-repair-castle-rock': '/hvac/cooling-repair',
  '/furnace-repair-castle-rock-colorado': '/hvac/furnace-repair',
  '/furnace-repair-federal-heights': '/hvac/furnace-repair',
  '/furnace-replacement-castle-rock-colorado': '/hvac/furnace-replacement',
  '/furnace-tune-up-castle-rock': '/hvac/furnace-tune-up',
  '/heat-pump-installation-castle-rock': '/hvac/heat-pump-installation',
  '/heating-repair-castle-rock-colorado': '/hvac/heating-repair',
  '/humidifier-installation-castle-rock': '/hvac/humidifier-installation',
  '/hvac-contractor-castle-rock': '/hvac/hvac-contractor',
  '/hvac-installation-castle-rock': '/hvac/hvac-installation',
  '/hvac-plumbing-services': '/hvac',
  '/mini-split-installation-castle-rock': '/hvac/mini-splits',

  // Plumbing
  '/drain-cleaning-castle-rock-colorado': '/plumbing/drain-cleaning',
  '/drain-cleaning-federal-heights': '/plumbing/drain-cleaning',
  '/garbage-disposal-replacement-castle-rock-colorado': '/plumbing/garbage-disposals',
  '/plumber-castle-rock': '/plumbing',
  '/sump-pump-repair-castle-rock': '/plumbing/sump-pump-repair',
  '/tankless-water-heater-castle-rock': '/plumbing/tankless-water-heaters',
  '/toilet-repair-castle-rock-colorado': '/plumbing/toilet-repair',
  '/water-filtration': '/plumbing/water-filtration',
  '/water-heater-repair-castle-rock': '/plumbing/water-heater-repair',
  '/water-heater-repair-federal-heights': '/plumbing/water-heater-repair',
  '/water-heater-replacement-castle-rock-colorado': '/plumbing/water-heater-replacement',
  '/water-heater-replacement-federal-heights': '/plumbing/water-heater-replacement',

  // Sewer & Drains
  '/hydro-jetting-castle-rock': '/sewer/hydro-jetting',
  '/plumbing-excavation-castle-rock': '/sewer/plumbing-excavation',
  '/sewer-inspection-castle-rock': '/sewer/sewer-inspection',
  '/sewer-repair-castle-rock': '/sewer/sewer-repair',
  '/sewer-repair-federal-heights': '/sewer/sewer-repair',
  '/sewer-services-castle-rock': '/sewer',
  '/trenchless-sewer-repair-castle-rock': '/sewer/trenchless-sewer-repair',
  '/water-line-repair-castle-rock': '/sewer/water-line-repair',

  // Locations / company pages
  '/federal-heights-plumbing': '/service-area/federal-heights',
  '/contact-us-1': '/contact',
  '/submission-form': '/contact',
  '/cart': '/',

  // Blog listing pagination fragments collapse to the new blog index
  '/blog04eb': '/blog',
  '/blog06aa': '/blog',
  '/blog29c9': '/blog',
  '/blog3304': '/blog',
  '/blog56c4': '/blog',
  '/blog5a12': '/blog',
  '/blog6b7d': '/blog',
  '/blog7fdd': '/blog',
  '/blog9220': '/blog',
  '/blog98ee': '/blog',
  '/bloga19d': '/blog',
  '/bloga742': '/blog',
  '/bloga7a6': '/blog',
  '/blogb7fe': '/blog',
  '/blogc6af': '/blog',
  '/blogd627': '/blog',
  '/bloge315': '/blog',
};

// https://astro.build/config
export default defineConfig({
  // TODO: VERIFY final production domain before launch
  site: 'https://www.courtesyplumbingandheating.com',

  redirects,

  integrations: [react(), sitemap()],

  image: {
    responsiveStyles: true,
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel()
});