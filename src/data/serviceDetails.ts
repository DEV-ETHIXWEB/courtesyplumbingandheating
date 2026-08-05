/**
 * Long-form content for individual service detail pages, keyed by service slug.
 * Kept separate from services.ts (which drives cards/nav/menus) so that file
 * stays scannable. Every service in services.ts should have an entry here.
 *
 * Content is written from general trade knowledge (what these repairs/installs
 * involve) plus verified Courtesy positioning (24/7, no trip fees, licensed).
 * No invented prices, warranty terms, or certifications.
 */
import type { ServiceDetail } from './services';

export const serviceDetails: Record<string, ServiceDetail> = {
  // ------------------------------------------------------------------ HVAC
  'ac-repair': {
    intro: 'When your AC stops cooling on a 95-degree Colorado afternoon, you need a technician who shows up fast and fixes it right the first time.',
    signs: [
      'Warm air blowing from vents instead of cool air',
      'AC runs constantly but never reaches the set temperature',
      'Strange grinding, clicking, or squealing noises',
      'Water pooling around the indoor unit',
      'Higher-than-normal electric bills with no other explanation',
    ],
    process: [
      { title: 'Diagnose', description: 'We inspect the compressor, refrigerant levels, electrical connections, and airflow to pinpoint the exact cause.' },
      { title: 'Explain', description: 'You get a clear explanation of what’s wrong and what it takes to fix it, before any work begins.' },
      { title: 'Repair', description: 'Our technicians carry common parts on the truck to get most systems running again same-day.' },
      { title: 'Verify', description: 'We test the full system under load to confirm proper cooling before we leave.' },
    ],
    benefits: [
      'Available 24/7, including nights, weekends, and holidays',
      'No trip fee to come take a look',
      'Licensed technicians who explain the problem in plain language',
      'Upfront pricing before any repair begins',
    ],
    faqs: [
      { question: 'Why is my AC running but not cooling?', answer: 'This is often low refrigerant from a leak, a failing compressor, a dirty condenser coil, or a frozen evaporator coil restricting airflow. A technician can diagnose the exact cause on-site.' },
      { question: 'How fast can you get to me for an AC emergency?', answer: 'Courtesy offers 24/7 emergency service throughout Castle Rock and the Denver Metro area. Call and we’ll get a technician dispatched as quickly as possible.' },
      { question: 'Is it better to repair or replace my AC?', answer: 'It depends on the age of your system, the cost of the repair, and how often it’s broken down before. Our technicians will give you an honest recommendation, not just an upsell.' },
    ],
    related: ['hvac/cooling-repair', 'hvac/ac-tune-up', 'hvac/ac-replacement'],
  },
  'ac-replacement': {
    intro: 'When your air conditioner is beyond economical repair, we help you choose and install a properly sized replacement system built for Colorado summers.',
    signs: [
      'Your AC is 12-15+ years old and needs frequent repairs',
      'Repair costs are approaching the price of a new system',
      'Your system still uses discontinued R-22 refrigerant',
      'Uneven cooling or rising energy bills despite maintenance',
    ],
    process: [
      { title: 'Assess', description: 'We evaluate your home’s size, ductwork, and cooling needs, not just the old unit.' },
      { title: 'Recommend', description: 'You get options sized correctly for your home, with no pressure toward the most expensive unit.' },
      { title: 'Install', description: 'Our team removes the old system and installs the new one with attention to proper charge, airflow, and electrical connections.' },
      { title: 'Walkthrough', description: 'We walk you through your new system, thermostat settings, and any applicable rebates.' },
    ],
    benefits: [
      'Correctly sized systems, not one-size-fits-all replacements',
      'Financing options available for qualified buyers',
      'Help identifying manufacturer and utility rebates',
      'Licensed installation backed by manufacturer warranties',
    ],
    faqs: [
      { question: 'How long does AC replacement take?', answer: 'Most residential AC replacements are completed in a single day, depending on the complexity of the installation.' },
      { question: 'What size AC do I need?', answer: 'The right size depends on your home’s square footage, insulation, windows, and layout, not just a rule of thumb. We calculate this before recommending a system.' },
      { question: 'Are there rebates available for a new AC?', answer: 'Utility and manufacturer rebates change periodically. See our Rebates page or ask your technician what’s currently available.' },
    ],
    related: ['hvac/ac-repair', 'hvac/hvac-installation', 'hvac/ac-tune-up'],
  },
  'cooling-repair': {
    intro: 'From refrigerant leaks to failing compressors and fan motors, our technicians diagnose and repair the full range of cooling system problems.',
    signs: [
      'Refrigerant leaks or hissing sounds near the outdoor unit',
      'Compressor won’t start or trips the breaker',
      'Fan motor is loud, slow, or not spinning',
      'Ice forming on refrigerant lines or the indoor coil',
    ],
    process: [
      { title: 'Inspect', description: 'We check refrigerant charge, electrical components, and airflow across both indoor and outdoor units.' },
      { title: 'Test', description: 'Pressure and amperage testing identify exactly which component has failed.' },
      { title: 'Repair', description: 'We repair or replace the failed component, from capacitors and contactors to compressors and fan motors.' },
      { title: 'Confirm', description: 'A full system cycle test confirms your cooling is restored before we consider the job done.' },
    ],
    benefits: [
      'Diagnostics that find the real cause, not just symptoms',
      'Transparent pricing with no trip fees',
      '24/7 availability for cooling failures',
    ],
    faqs: [
      { question: 'Why does my AC have ice on the lines?', answer: 'Ice buildup is usually caused by restricted airflow (dirty filter, blocked vents) or low refrigerant. Running the system with ice on the lines can damage the compressor, so it’s worth turning it off and calling for service.' },
      { question: 'Can a refrigerant leak be repaired?', answer: 'Small leaks at fittings or valves can often be repaired and the system recharged. Leaks in the coil itself may point toward replacement being more cost-effective.' },
    ],
    related: ['hvac/ac-repair', 'hvac/ac-tune-up', 'hvac/ac-replacement'],
  },
  'commercial-ac-repair': {
    intro: 'Commercial cooling failures cost you business. We diagnose and repair rooftop units, split systems, and packaged units with minimal disruption.',
    signs: [
      'Uneven cooling across different zones of your building',
      'Rooftop unit cycling frequently or not shutting off',
      'Rising utility costs without a clear cause',
      'Tenant or employee complaints about comfort',
    ],
    process: [
      { title: 'Assess', description: 'We evaluate your commercial system type, age, and service history.' },
      { title: 'Schedule strategically', description: 'Work is scheduled to minimize disruption to your business operations where possible.' },
      { title: 'Repair', description: 'Our technicians handle rooftop units, packaged systems, and commercial-grade components.' },
      { title: 'Document', description: 'You receive a clear summary of what was done and any recommendations for your system.' },
    ],
    benefits: [
      'Experience with commercial rooftop and packaged systems',
      'Available for after-hours and emergency commercial calls',
      'Straightforward communication with facility managers and owners',
    ],
    faqs: [
      { question: 'Do you service rooftop commercial units?', answer: 'Yes, our technicians repair rooftop and packaged commercial AC units in addition to residential systems.' },
      { question: 'Can you work around our business hours?', answer: 'We do our best to schedule commercial work at times that minimize disruption. Call to discuss your building’s needs.' },
    ],
    related: ['hvac/commercial-hvac-repair', 'hvac/hvac-contractor', 'hvac/cooling-repair'],
  },
  'commercial-hvac-repair': {
    intro: 'Full-service commercial HVAC repair, from rooftop units and ventilation systems to boilers serving multi-tenant buildings.',
    signs: [
      'Inconsistent temperatures between floors or units',
      'Unusual noises from rooftop or mechanical room equipment',
      'Frequent short-cycling or system lockouts',
      'Aging equipment nearing the end of its service life',
    ],
    process: [
      { title: 'Site assessment', description: 'We review your building’s HVAC layout, equipment age, and any prior service records.' },
      { title: 'Diagnose', description: 'Technicians identify the failed component, whether mechanical, electrical, or control-related.' },
      { title: 'Repair or recommend', description: 'We complete the repair, or provide a clear recommendation if replacement makes more sense.' },
      { title: 'Follow up', description: 'For larger commercial systems, we can discuss a maintenance plan to reduce future breakdowns.' },
    ],
    benefits: [
      'Experience across furnaces, rooftop units, boilers, and ventilation',
      'Licensed HVAC contracting for commercial properties',
      'Clear, professional communication for property managers',
    ],
    faqs: [
      { question: 'What types of commercial HVAC systems do you service?', answer: 'We work on rooftop units, packaged systems, commercial boilers, and ventilation equipment common to Denver-metro commercial buildings.' },
    ],
    related: ['hvac/commercial-ac-repair', 'hvac/hvac-contractor', 'hvac/boiler-repair'],
  },
  'heating-repair': {
    intro: 'A cold house in a Colorado winter is more than an inconvenience. Our technicians repair furnaces, boilers, and heat pumps day or night.',
    signs: [
      'Furnace won’t turn on or won’t stay running',
      'Cold air blowing from vents',
      'Strange smells (burning, gas) or unusual noises',
      'Thermostat unresponsive or inaccurate',
      'Rising heating bills without a clear cause',
    ],
    process: [
      { title: 'Safety check', description: 'We check for gas leaks, carbon monoxide risk, and electrical hazards first.' },
      { title: 'Diagnose', description: 'We identify whether the issue is ignition, blower motor, thermostat, or another component.' },
      { title: 'Repair', description: 'Common parts are carried on the truck so most repairs are completed same-visit.' },
      { title: 'Verify heat output', description: 'We confirm the system is producing and distributing heat properly before leaving.' },
    ],
    benefits: [
      '24/7 emergency heating repair, every day of the year',
      'No trip fee to diagnose the problem',
      'Licensed technicians who prioritize safety first',
    ],
    faqs: [
      { question: 'My furnace smells like gas. What should I do?', answer: 'Leave the house immediately, do not operate any switches, and call your gas utility or 911 from a safe location before calling for repair.' },
      { question: 'Why does my furnace blow cold air?', answer: 'This can point to a pilot light or ignition issue, a dirty filter restricting airflow, or a thermostat problem. A technician can determine the exact cause quickly.' },
    ],
    related: ['hvac/furnace-repair', 'hvac/boiler-repair', 'hvac/furnace-tune-up'],
  },
  'humidifier-installation': {
    intro: 'Colorado’s dry climate is hard on skin, wood floors, and furniture. We install whole-house and portable humidifiers to add comfort back to your home.',
    signs: [
      'Dry skin, static shocks, or nosebleeds indoors during winter',
      'Cracking wood floors, trim, or furniture',
      'Consistently low indoor humidity readings',
    ],
    process: [
      { title: 'Assess', description: 'We evaluate your furnace system and home size to recommend the right humidifier type.' },
      { title: 'Install', description: 'Whole-house units are integrated directly with your furnace and ductwork.' },
      { title: 'Set up', description: 'We configure the humidistat to the right target level for your home.' },
      { title: 'Explain maintenance', description: 'You’ll know exactly how to maintain the unit for reliable, healthy operation.' },
    ],
    benefits: [
      'Whole-house and portable options',
      'Integrated installation with your existing furnace',
      'Improved comfort and protection for your home’s finishes',
    ],
    faqs: [
      { question: 'Is a whole-house humidifier worth it in Colorado?', answer: 'Colorado’s low humidity, especially in winter, makes whole-house humidifiers a popular upgrade for comfort and protecting wood floors and furniture.' },
    ],
    related: ['hvac/hvac-installation', 'plumbing/water-filtration', 'hvac/furnace-tune-up'],
  },
  'hvac-installation': {
    intro: 'New construction or full system replacement, we install furnaces, air conditioners, heat pumps, and boilers sized correctly for your home.',
    signs: [
      'Building a new home or addition',
      'Replacing multiple failing systems at once',
      'Upgrading from an inefficient or oversized/undersized system',
    ],
    process: [
      { title: 'Load calculation', description: 'We calculate your home’s actual heating and cooling needs rather than guessing based on the old system.' },
      { title: 'System selection', description: 'You get options that fit your budget, efficiency goals, and home layout.' },
      { title: 'Professional install', description: 'Ductwork, electrical, and refrigerant connections are all handled to code.' },
      { title: 'Commissioning', description: 'We test the full system before handing it over, including thermostat setup.' },
    ],
    benefits: [
      'Licensed HVAC installation for residential and commercial projects',
      'Proper load calculations, not rule-of-thumb sizing',
      'Financing available for qualified buyers',
    ],
    faqs: [
      { question: 'How do you decide what size system I need?', answer: 'We calculate a Manual J-style load estimate based on your home’s square footage, insulation, windows, and orientation rather than just matching the old unit’s size.' },
    ],
    related: ['hvac/ac-replacement', 'hvac/furnace-replacement', 'hvac/hvac-contractor'],
  },
  'hvac-contractor': {
    intro: 'Licensed HVAC contracting for new construction, major system replacements, and commercial projects throughout Castle Rock and Denver Metro.',
    signs: [
      'Planning new construction or a major renovation',
      'Need a licensed contractor for permitted HVAC work',
      'Coordinating HVAC with other trades on a build',
    ],
    process: [
      { title: 'Consult', description: 'We review your project scope, whether new construction, renovation, or commercial build-out.' },
      { title: 'Design', description: 'System layout and equipment selection are planned around your building’s needs.' },
      { title: 'Install', description: 'Our licensed team handles installation to code, coordinating with other trades as needed.' },
      { title: 'Inspect and hand off', description: 'Systems are tested and documented before project close-out.' },
    ],
    benefits: [
      'Licensed contracting for permitted HVAC work',
      'Experience with both residential and commercial projects',
      'Direct communication throughout the project',
    ],
    faqs: [
      { question: 'Do you handle HVAC for new home construction?', answer: 'Yes, we provide HVAC contracting services for new construction projects in addition to replacement and repair work.' },
    ],
    related: ['hvac/hvac-installation', 'hvac/commercial-hvac-repair', 'sewer/plumbing-excavation'],
  },
  'mini-splits': {
    intro: 'Ductless mini split systems deliver targeted, efficient heating and cooling for additions, garages, or homes without existing ductwork.',
    signs: [
      'A room or addition with no existing ductwork',
      'Uneven temperatures in specific rooms',
      'Wanting independent zone control without full duct installation',
    ],
    process: [
      { title: 'Site evaluation', description: 'We assess the space and determine the right unit size and placement.' },
      { title: 'Install indoor and outdoor units', description: 'The indoor air handler and outdoor compressor are installed and connected.' },
      { title: 'Electrical and refrigerant lines', description: 'All connections are run and tested for proper charge and performance.' },
      { title: 'Walkthrough', description: 'You’ll learn how to use the remote/controls for each zone.' },
    ],
    benefits: [
      'No ductwork required',
      'Independent temperature control by room or zone',
      'Energy-efficient heating and cooling in one system',
    ],
    faqs: [
      { question: 'Are mini splits good for Colorado winters?', answer: 'Many modern mini split heat pumps perform well in cold climates, though for very low temperatures a backup heat source is sometimes recommended. We can advise based on your specific space.' },
    ],
    related: ['hvac/heat-pump-installation', 'hvac/hvac-installation', 'hvac/humidifier-installation'],
  },
  'furnace-replacement': {
    intro: 'When repairs no longer make sense, we replace aging or inefficient furnaces with properly sized systems built for reliable Colorado winters.',
    signs: [
      'Furnace is 15-20+ years old',
      'Repair costs keep climbing or repairs keep recurring',
      'Uneven heating or rising gas bills',
      'Furnace is noisy, cycles frequently, or won’t hold temperature',
    ],
    process: [
      { title: 'Evaluate', description: 'We assess your existing system, ductwork, and home heating needs.' },
      { title: 'Recommend', description: 'Options are presented based on your home’s actual requirements and your budget.' },
      { title: 'Install', description: 'The old unit is removed and the new furnace installed with attention to venting, gas lines, and electrical.' },
      { title: 'Test and explain', description: 'We test the system fully and walk you through your new thermostat and controls.' },
    ],
    benefits: [
      'Correctly sized replacement furnaces',
      'Financing options for qualified buyers',
      'Help navigating available rebates',
    ],
    faqs: [
      { question: 'How long does furnace replacement take?', answer: 'Most furnace replacements are completed in a single day, though complex venting or ductwork changes can extend the timeline.' },
      { question: 'Should I repair or replace my furnace?', answer: 'We consider the age of the unit, repair cost relative to replacement cost, and repair history before making a recommendation, always honestly.' },
    ],
    related: ['hvac/furnace-repair', 'hvac/hvac-installation', 'hvac/furnace-tune-up'],
  },
  'furnace-repair': {
    intro: 'Ignition failures, blower motor issues, and thermostat problems are the most common reasons a furnace stops working. We fix them fast.',
    signs: [
      'Furnace won’t ignite or shuts off shortly after starting',
      'Blower runs constantly or not at all',
      'Pilot light won’t stay lit',
      'Unusual banging, rattling, or squealing noises',
    ],
    process: [
      { title: 'Safety and diagnostics', description: 'We check for gas and carbon monoxide issues first, then diagnose the specific fault.' },
      { title: 'Repair', description: 'Ignition components, blower motors, and control boards are common repairs completed same-visit.' },
      { title: 'Test', description: 'We run a full heat cycle to confirm the repair holds under normal operation.' },
    ],
    benefits: [
      '24/7 emergency furnace repair',
      'No trip fee to diagnose the issue',
      'Parts commonly stocked on the truck for faster repairs',
    ],
    faqs: [
      { question: 'Why does my furnace keep shutting off?', answer: 'Short-cycling is often caused by a dirty filter, a failing flame sensor, or a thermostat issue. A technician can pinpoint the exact cause.' },
    ],
    related: ['hvac/heating-repair', 'hvac/furnace-tune-up', 'hvac/furnace-replacement'],
  },
  'heat-pump-installation': {
    intro: 'Heat pumps deliver efficient heating and cooling from a single system. We help you evaluate whether one is right for your home and install it correctly.',
    signs: [
      'Looking to replace separate AC and furnace systems',
      'Wanting a more energy-efficient heating and cooling solution',
      'Interested in available heat pump rebates',
    ],
    process: [
      { title: 'Consult', description: 'We discuss your home’s heating/cooling needs and whether a heat pump fits your climate use case.' },
      { title: 'Size and select', description: 'The right system is chosen based on load calculations, not guesswork.' },
      { title: 'Install', description: 'Indoor and outdoor components are installed and connected to your ductwork or as a ductless system.' },
      { title: 'Commission', description: 'We test heating and cooling modes and walk you through operation.' },
    ],
    benefits: [
      'Energy-efficient heating and cooling in one system',
      'Guidance on available utility and manufacturer rebates',
      'Financing available for qualified buyers',
    ],
    faqs: [
      { question: 'Do heat pumps work well in Colorado’s cold winters?', answer: 'Modern heat pumps have improved cold-climate performance significantly. We’ll help you evaluate whether a heat pump alone or a heat pump with backup heat is the better fit for your home.' },
    ],
    related: ['hvac/mini-splits', 'hvac/hvac-installation', 'rebates'],
  },
  'boiler-repair': {
    intro: 'Boiler systems require specialized knowledge. We diagnose and repair pilot light issues, leaks, and pressure problems to restore your heat.',
    signs: [
      'No heat despite the boiler running',
      'Leaking water around the unit',
      'Unusual noises like banging or kettling',
      'Pilot light won’t stay lit',
    ],
    process: [
      { title: 'Inspect', description: 'We check pressure, pilot/ignition system, and look for leaks or corrosion.' },
      { title: 'Diagnose', description: 'The specific failed component is identified, from valves to circulator pumps.' },
      { title: 'Repair', description: 'We complete the repair and bleed/re-pressurize the system as needed.' },
      { title: 'Confirm', description: 'Heat output is verified across the system before we finish.' },
    ],
    benefits: [
      '24/7 emergency boiler repair',
      'Experience with both residential and older boiler systems common in Colorado homes',
      'No trip fee for diagnostics',
    ],
    faqs: [
      { question: 'Why is my boiler making a banging noise?', answer: 'This is often called "kettling" and is usually caused by mineral scale buildup on the heat exchanger. It should be inspected before it causes further damage.' },
    ],
    related: ['hvac/boiler-replacement', 'hvac/heating-repair', 'plumbing/water-heater-repair'],
  },
  'boiler-replacement': {
    intro: 'When a boiler is losing efficiency or reliability, we replace it with a properly sized system built for your home’s heating needs.',
    signs: [
      'Boiler is aging and repairs are becoming frequent',
      'Declining efficiency and rising heating bills',
      'Persistent leaks or corrosion',
    ],
    process: [
      { title: 'Evaluate', description: 'We assess your current system, radiators or baseboard heat, and home layout.' },
      { title: 'Recommend', description: 'You get a properly sized boiler recommendation, not a one-size-fits-all swap.' },
      { title: 'Install', description: 'The old unit is removed and the new boiler installed, piped, and vented correctly.' },
      { title: 'Test', description: 'We verify heat delivery throughout the system before considering the job complete.' },
    ],
    benefits: [
      'Properly sized boiler replacements',
      'Financing options for qualified buyers',
      'Licensed installation',
    ],
    faqs: [
      { question: 'How long do boilers typically last?', answer: 'Well-maintained boilers can last 15-20+ years, but efficiency and reliability decline with age. We can help you decide if repair or replacement makes more sense for your situation.' },
    ],
    related: ['hvac/boiler-repair', 'hvac/hvac-installation', 'plumbing/water-heater-replacement'],
  },
  'ac-tune-up': {
    intro: 'A seasonal AC tune-up catches small problems before they become expensive breakdowns, and keeps your system running efficiently all summer.',
    signs: [
      'It’s been over a year since your last AC service',
      'You want to avoid a mid-summer breakdown',
      'Rising energy bills without increased use',
    ],
    process: [
      { title: 'Inspect', description: 'We check refrigerant levels, electrical connections, and the condenser and evaporator coils.' },
      { title: 'Clean', description: 'Coils and components are cleaned to restore proper heat transfer.' },
      { title: 'Test', description: 'We verify the system cycles properly and reaches target temperature.' },
      { title: 'Report', description: 'You get a clear rundown of your system’s condition and any recommendations.' },
    ],
    benefits: [
      'Catch small issues before they become costly repairs',
      'Improved energy efficiency',
      'Extend the working life of your system',
    ],
    faqs: [
      { question: 'How often should I get an AC tune-up?', answer: 'An annual tune-up before cooling season is generally recommended to catch developing issues and keep your system running efficiently.' },
    ],
    related: ['hvac/ac-repair', 'hvac/furnace-tune-up', 'hvac/ac-replacement'],
  },
  'furnace-tune-up': {
    intro: 'A pre-winter furnace tune-up checks safety components and efficiency so your system is ready before the first cold snap.',
    signs: [
      'It’s been over a year since your last furnace service',
      'Preparing for winter and want peace of mind',
      'Noticing higher gas bills or uneven heat',
    ],
    process: [
      { title: 'Inspect', description: 'We check the heat exchanger, ignition system, and safety controls.' },
      { title: 'Clean', description: 'Burners and components are cleaned for efficient, safe operation.' },
      { title: 'Test', description: 'We verify proper ignition, heat output, and shutdown cycles.' },
      { title: 'Report', description: 'You get a clear summary of your furnace’s condition heading into winter.' },
    ],
    benefits: [
      'Catch safety issues like cracked heat exchangers early',
      'Improved efficiency and lower gas bills',
      'Fewer mid-winter breakdowns',
    ],
    faqs: [
      { question: 'When should I schedule a furnace tune-up?', answer: 'Early fall, before consistent heating season begins, is the ideal time so any needed repairs can be handled before you rely on the system daily.' },
    ],
    related: ['hvac/furnace-repair', 'hvac/ac-tune-up', 'hvac/furnace-replacement'],
  },

  // -------------------------------------------------------------- Plumbing
  'drain-cleaning': {
    intro: 'From a single slow sink to a fully clogged main line, we use hydro jetting and camera inspection to clear drains completely, not just temporarily.',
    signs: [
      'Slow-draining sinks, tubs, or showers',
      'Gurgling sounds from drains or toilets',
      'Repeated clogs in the same drain',
      'Sewage smell near drains',
    ],
    process: [
      { title: 'Inspect', description: 'For recurring or serious clogs, we use camera inspection to see exactly what’s happening inside the pipe.' },
      { title: 'Clear', description: 'Hydro jetting or drain snaking removes the blockage, whether grease, roots, or debris.' },
      { title: 'Verify', description: 'We run water through the line to confirm full flow is restored.' },
      { title: 'Recommend', description: 'If we spot a recurring issue like root intrusion, we’ll explain your options.' },
    ],
    benefits: [
      '24/7 emergency drain service',
      'Camera inspection to diagnose the real problem',
      'Hydro jetting clears buildup that snaking alone can miss',
    ],
    faqs: [
      { question: 'What’s the difference between snaking and hydro jetting?', answer: 'Snaking breaks through a clog to restore flow. Hydro jetting uses high-pressure water to scour the full interior of the pipe, removing grease, scale, and debris buildup that snaking leaves behind.' },
      { question: 'Why does my drain keep clogging in the same spot?', answer: 'Recurring clogs in the same location often point to a structural issue like a pipe belly, root intrusion, or buildup that a camera inspection can identify.' },
    ],
    related: ['sewer/hydro-jetting', 'sewer/sewer-inspection', 'sewer/sewer-repair'],
  },
  'water-heater-repair': {
    intro: 'No hot water, discolored water, or strange noises from your water heater? We diagnose and repair tank and tankless units quickly.',
    signs: [
      'No hot water or inconsistent temperature',
      'Rusty or discolored water',
      'Water pooling around the base of the tank',
      'Popping or rumbling noises (sediment buildup)',
    ],
    process: [
      { title: 'Inspect', description: 'We check the pilot/ignition system, heating elements, thermostat, and tank condition.' },
      { title: 'Diagnose', description: 'The specific cause, whether sediment, a failed element, or a leak, is identified.' },
      { title: 'Repair', description: 'Most repairs are completed same-visit with parts carried on the truck.' },
      { title: 'Test', description: 'We confirm hot water output and check for leaks before finishing.' },
    ],
    benefits: [
      '24/7 emergency water heater repair',
      'Experience with both tank and tankless systems',
      'Honest advice on repair vs. replacement',
    ],
    faqs: [
      { question: 'Why does my water heater make popping noises?', answer: 'Popping or rumbling sounds are usually caused by sediment buildup at the bottom of the tank. Flushing the tank can often resolve this.' },
      { question: 'How long do water heaters typically last?', answer: 'Tank water heaters typically last 8-12 years, while tankless units can last considerably longer with proper maintenance.' },
    ],
    related: ['plumbing/water-heater-replacement', 'plumbing/tankless-water-heaters', 'plumbing/water-filtration'],
  },
  'water-heater-replacement': {
    intro: 'When repair no longer makes sense, we replace your water heater with a correctly sized unit, installed right the first time.',
    signs: [
      'Water heater is 10+ years old',
      'Frequent repairs or declining performance',
      'Not enough hot water for your household’s needs',
      'Visible rust or corrosion on the tank',
    ],
    process: [
      { title: 'Assess', description: 'We evaluate your household’s hot water needs and existing setup.' },
      { title: 'Recommend', description: 'Tank or tankless options are presented based on your usage and budget.' },
      { title: 'Install', description: 'The old unit is removed and the new one installed with proper venting and connections.' },
      { title: 'Test', description: 'We verify temperature, pressure, and leak-free operation before we leave.' },
    ],
    benefits: [
      'Properly sized replacements, tank or tankless',
      'Financing options for qualified buyers',
      'Help identifying available rebates',
    ],
    faqs: [
      { question: 'Should I switch to a tankless water heater?', answer: 'Tankless units provide continuous hot water and take up less space, but have different upfront and installation costs than tank units. We can walk you through the tradeoffs for your home.' },
    ],
    related: ['plumbing/tankless-water-heaters', 'plumbing/water-heater-repair', 'rebates'],
  },
  'tankless-water-heaters': {
    intro: 'Tankless water heaters deliver continuous hot water on demand. We install, replace, and descale tankless systems for Denver-metro homes.',
    signs: [
      'Tired of running out of hot water',
      'Looking to save space by removing a tank',
      'Existing tankless unit needs descaling or repair',
    ],
    process: [
      { title: 'Evaluate', description: 'We assess your household’s hot water demand and existing gas/electrical setup.' },
      { title: 'Install or service', description: 'New units are installed with correct venting and gas line sizing; existing units are descaled or repaired.' },
      { title: 'Test', description: 'We verify consistent temperature and flow rate before finishing.' },
    ],
    benefits: [
      'Continuous hot water, no tank required',
      'Space-saving compared to traditional tanks',
      'Descaling service to maintain efficiency over time',
    ],
    faqs: [
      { question: 'Do tankless water heaters need maintenance?', answer: 'Yes, periodic descaling is recommended, especially with hard water, to maintain efficiency and prevent mineral buildup inside the unit.' },
    ],
    related: ['plumbing/water-heater-replacement', 'plumbing/water-filtration', 'plumbing/water-heater-repair'],
  },
  'toilet-repair': {
    intro: 'From constant running to weak flushes and clogs, we repair toilets quickly so your bathroom is back in service.',
    signs: [
      'Toilet runs constantly or randomly',
      'Weak or incomplete flush',
      'Frequent clogging',
      'Rocking, leaking, or water pooling at the base',
    ],
    process: [
      { title: 'Diagnose', description: 'We identify whether the issue is the fill valve, flapper, wax ring, or something else.' },
      { title: 'Repair', description: 'Common toilet repairs are completed same-visit.' },
      { title: 'Test', description: 'We test multiple flush cycles to confirm the issue is resolved.' },
    ],
    benefits: [
      'Fast diagnosis and same-visit repairs for most issues',
      'Transparent pricing before work begins',
    ],
    faqs: [
      { question: 'Why does my toilet keep running?', answer: 'A constantly running toilet is usually caused by a worn flapper valve or a fill valve that isn’t shutting off properly, both straightforward repairs.' },
    ],
    related: ['plumbing/garbage-disposals', 'plumbing/drain-cleaning', 'plumbing/water-filtration'],
  },
  'garbage-disposals': {
    intro: 'Jammed, leaking, or dead garbage disposal? We repair and replace disposals so your kitchen gets back to normal.',
    signs: [
      'Disposal hums but doesn’t spin',
      'Leaking from the bottom of the unit',
      'Unusual grinding noise or complete silence when switched on',
      'Frequent jamming',
    ],
    process: [
      { title: 'Diagnose', description: 'We determine whether the issue is a jam, a failed motor, or a leak.' },
      { title: 'Repair or replace', description: 'Simple jams are cleared on the spot; failed units are replaced with a properly matched disposal.' },
      { title: 'Test', description: 'We run the disposal through a full cycle to confirm proper operation.' },
    ],
    benefits: [
      'Same-visit repair or replacement in most cases',
      'Correctly matched replacement units for your sink setup',
    ],
    faqs: [
      { question: 'Why is my garbage disposal humming but not spinning?', answer: 'This usually means the motor is jammed or the impeller is stuck. Many times this can be manually reset, but if it persists, the unit may need replacement.' },
    ],
    related: ['plumbing/toilet-repair', 'plumbing/drain-cleaning', 'plumbing/water-filtration'],
  },
  'sump-pump-repair': {
    intro: 'A failed sump pump can mean a flooded basement fast. We repair motors, float switches, and clear debris to keep your basement dry.',
    signs: [
      'Pump doesn’t turn on when the pit fills with water',
      'Pump runs constantly',
      'Unusual noises from the pump',
      'Water in the basement despite having a sump pump',
    ],
    process: [
      { title: 'Inspect', description: 'We check the float switch, motor, discharge line, and pit for debris.' },
      { title: 'Repair', description: 'Common failures like a stuck float switch or clogged discharge are repaired on the spot.' },
      { title: 'Test', description: 'We run a full cycle test by filling the pit to confirm the pump activates and clears properly.' },
    ],
    benefits: [
      '24/7 emergency service for active flooding risk',
      'Fast diagnosis to prevent water damage',
    ],
    faqs: [
      { question: 'Why did my sump pump stop working suddenly?', answer: 'Common causes include a stuck float switch, a jammed impeller, power loss, or a failed motor. We can diagnose the exact cause on-site.' },
    ],
    related: ['sewer/water-line-repair', 'plumbing/drain-cleaning', 'sewer/sewer-inspection'],
  },
  'water-filtration': {
    intro: 'Whole-house filtration, reverse osmosis, and water softeners for cleaner, better-tasting water throughout your home.',
    signs: [
      'Hard water spots on fixtures and dishes',
      'Chlorine taste or smell from tap water',
      'Dry skin or hair after showering',
      'Reduced soap lathering',
    ],
    process: [
      { title: 'Test', description: 'We assess your water quality and household needs.' },
      { title: 'Recommend', description: 'You get a system recommendation, softener, whole-house filter, or reverse osmosis, matched to your water.' },
      { title: 'Install', description: 'The system is installed and integrated with your existing plumbing.' },
      { title: 'Explain', description: 'You’ll know how to maintain the system for reliable performance.' },
    ],
    benefits: [
      'Options ranging from whole-house filtration to point-of-use RO systems',
      'Softeners to address hard water throughout Colorado',
    ],
    faqs: [
      { question: 'Do I need a water softener in Castle Rock?', answer: 'Much of the Denver metro area has moderately hard water. A softener can reduce scale buildup on fixtures and appliances and improve soap performance.' },
    ],
    related: ['plumbing/tankless-water-heaters', 'plumbing/water-heater-replacement', 'sewer/water-line-repair'],
  },

  // ----------------------------------------------------------------- Sewer
  'sewer-repair': {
    intro: 'Sewer line problems require experience and the right approach. We offer both trenchless and traditional sewer repair based on what your line actually needs.',
    signs: [
      'Multiple drains backing up at once',
      'Sewage smell in the yard or basement',
      'Unusually lush or soggy patches in the yard',
      'Gurgling from toilets when running water elsewhere',
    ],
    process: [
      { title: 'Inspect', description: 'A camera inspection identifies the exact location and cause of the problem.' },
      { title: 'Recommend', description: 'We explain whether trenchless repair, spot repair, or full excavation is the right fit.' },
      { title: 'Repair', description: 'Our team completes the repair using the appropriate method for your line’s condition.' },
      { title: 'Verify', description: 'A follow-up camera pass or flow test confirms the repair is effective.' },
    ],
    benefits: [
      '24/7 emergency sewer service',
      'Camera-verified diagnosis before recommending repair method',
      'Trenchless options to minimize yard disruption where possible',
    ],
    faqs: [
      { question: 'How do I know if I have a sewer line problem?', answer: 'Multiple drains backing up simultaneously, sewage odors, and gurgling toilets are common signs of a main sewer line issue rather than an isolated clog.' },
      { question: 'Is trenchless sewer repair always possible?', answer: 'It depends on the type and location of the damage. A camera inspection tells us whether trenchless methods will work or if traditional excavation is needed.' },
    ],
    related: ['sewer/trenchless-sewer-repair', 'sewer/sewer-inspection', 'sewer/hydro-jetting'],
  },
  'hydro-jetting': {
    intro: 'High-pressure hydro jetting clears roots, grease, and years of buildup from sewer and drain lines, restoring full flow.',
    signs: [
      'Recurring clogs that snaking doesn’t fully resolve',
      'Slow drainage throughout the home',
      'Known root intrusion in the sewer line',
    ],
    process: [
      { title: 'Inspect', description: 'We often camera-inspect first to confirm hydro jetting is the right approach for your line’s condition.' },
      { title: 'Jet', description: 'High-pressure water scours the full interior of the pipe, removing buildup that snaking leaves behind.' },
      { title: 'Verify', description: 'We confirm restored flow and, when appropriate, re-inspect with the camera.' },
    ],
    benefits: [
      'Clears buildup that snaking alone cannot remove',
      'Effective against grease, scale, and root intrusion',
    ],
    faqs: [
      { question: 'Is hydro jetting safe for older pipes?', answer: 'We evaluate pipe material and condition, often via camera inspection, before hydro jetting to confirm it’s appropriate for your specific line.' },
    ],
    related: ['plumbing/drain-cleaning', 'sewer/sewer-inspection', 'sewer/sewer-repair'],
  },
  'water-line-repair': {
    intro: 'Leaking or damaged water lines waste water and can undermine your foundation over time. We locate and repair leaks with minimal disruption.',
    signs: [
      'Unexplained spike in your water bill',
      'Wet or soggy spots in the yard',
      'Low water pressure throughout the home',
      'Sound of running water when everything is off',
    ],
    process: [
      { title: 'Locate', description: 'We use leak detection methods to pinpoint the exact location of the problem.' },
      { title: 'Recommend', description: 'Trenchless or traditional repair is recommended based on the line’s condition and location.' },
      { title: 'Repair', description: 'The damaged section is repaired or replaced.' },
      { title: 'Verify', description: 'We confirm pressure and flow are restored and there’s no continuing leak.' },
    ],
    benefits: [
      'Leak detection to avoid unnecessary digging',
      'Trenchless repair options where appropriate',
    ],
    faqs: [
      { question: 'How do I know if I have a water line leak?', answer: 'A rising water bill without increased usage, low pressure, or wet spots in the yard are common signs of an underground water line leak.' },
    ],
    related: ['sewer/trenchless-sewer-repair', 'sewer/plumbing-excavation', 'plumbing/water-filtration'],
  },
  'trenchless-sewer-repair': {
    intro: 'Pipe lining and pipe bursting repair damaged sewer lines without fully excavating your yard, driveway, or landscaping.',
    signs: [
      'Confirmed sewer line damage from a camera inspection',
      'Wanting to avoid full yard excavation',
      'Root intrusion or cracked pipe sections',
    ],
    process: [
      { title: 'Inspect', description: 'Camera inspection confirms the damage and whether trenchless methods are suitable.' },
      { title: 'Choose method', description: 'We determine whether pipe lining or pipe bursting is the better fit for your line.' },
      { title: 'Repair', description: 'The trenchless repair is completed with limited excavation, typically at access points only.' },
      { title: 'Verify', description: 'A follow-up inspection confirms the new pipe is intact and flowing properly.' },
    ],
    benefits: [
      'Minimizes disruption to landscaping, driveways, and hardscaping',
      'Often faster than traditional full excavation',
    ],
    faqs: [
      { question: 'What’s the difference between pipe lining and pipe bursting?', answer: 'Pipe lining installs a new liner inside the existing damaged pipe. Pipe bursting breaks apart the old pipe while simultaneously pulling a new one into place. The right method depends on your pipe’s condition.' },
    ],
    related: ['sewer/sewer-repair', 'sewer/sewer-inspection', 'sewer/plumbing-excavation'],
  },
  'plumbing-excavation': {
    intro: 'Some sewer and water line issues require excavation. We handle the digging, repair, and site restoration as one coordinated job.',
    signs: [
      'Sewer or water line damage beyond trenchless repair',
      'New sewer or water line installation',
      'Confirmed collapsed or severely damaged pipe',
    ],
    process: [
      { title: 'Plan', description: 'We confirm the exact location and scope of excavation needed based on inspection findings.' },
      { title: 'Excavate', description: 'The work area is dug to access the damaged line.' },
      { title: 'Repair or install', description: 'The line is repaired or newly installed to code.' },
      { title: 'Restore', description: 'The site is backfilled and restored as close to original condition as possible.' },
    ],
    benefits: [
      'Full-service excavation, repair, and restoration',
      'Used only when trenchless methods aren’t suitable',
    ],
    faqs: [
      { question: 'Will you restore my yard after excavation?', answer: 'Yes, backfilling and reasonable site restoration are part of the excavation process. We’ll discuss the scope of restoration before work begins.' },
    ],
    related: ['sewer/sewer-repair', 'sewer/trenchless-sewer-repair', 'sewer/water-line-repair'],
  },
  'sewer-inspection': {
    intro: 'Camera inspection shows exactly what’s happening inside your sewer line, root intrusion, corrosion, bellies, or blockages, before we recommend a fix.',
    signs: [
      'Recurring clogs with no obvious cause',
      'Buying a home and want to verify sewer line condition',
      'Preparing for a larger plumbing project',
    ],
    process: [
      { title: 'Access', description: 'We access the line through an existing cleanout or fixture.' },
      { title: 'Inspect', description: 'A camera is run through the line to visually assess its condition.' },
      { title: 'Document', description: 'We identify and explain any root intrusion, cracks, bellies, or blockages found.' },
      { title: 'Recommend', description: 'You get a clear, honest recommendation based on what we actually see.' },
    ],
    benefits: [
      'Accurate diagnosis before recommending repair',
      'Useful for home purchases and pre-project planning',
    ],
    faqs: [
      { question: 'Should I get a sewer inspection before buying a home?', answer: 'Yes, sewer line issues aren’t always visible or included in a standard home inspection. A camera inspection can reveal costly problems before you close.' },
    ],
    related: ['sewer/sewer-repair', 'sewer/hydro-jetting', 'sewer/trenchless-sewer-repair'],
  },
};
