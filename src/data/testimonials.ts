/**
 * Sourced from the Courtesy Plumbing & Heating Google Business Profile
 * (screenshots reviewed 2026-08-05). Ratings summary (4.4 avg / 68 reviews
 * / star breakdown) is also from that profile — see ratingSummary below.
 *
 * TODO: VERIFY: re-check counts/quotes periodically against Google, since
 * reviews accrue over time and this is a point-in-time snapshot.
 */

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location?: string;
  rating?: number;
}

export const ratingSummary = {
  average: 4.4,
  count: 68,
  breakdown: [
    { stars: 5, percent: 82 },
    { stars: 4, percent: 6 },
    { stars: 3, percent: 2 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 9 },
  ],
} as const;

export const testimonials: Testimonial[] = [
  {
    id: 'ian',
    quote:
      "Dealing with Courtesy Plumbing and Heating was a pleasure from start to finish. My recent experiences have seemed like similar operations were about exploiting customers, often at very stressful times. Courtesy does not play those exploitive games, providing fair pricing reflective of an honest respect for their customers. And the service was top notch. Their installer was professional and friendly, helping program the thermostat and actually doing me a favour. From start to finish, I have nothing but kudos for them. I would give them 6 stars if I could!",
    author: 'Ian',
    rating: 5,
  },
  {
    id: 'tim-coolican',
    quote:
      'Courtesy replaced out leaky hot water tank, in the new home we just bought, some 10 years ago now. They were fast and efficient, and the tank is still working just fine today. They also replaced our old unit heater, out in our garage, a couple of years ago. We found there was something wrong with the exhaust / inducer fan. Their warranty covered the replacement of this fan. Fast & friendly service. Would highly recommend.',
    author: 'Tim Coolican',
    rating: 5,
  },
  {
    id: 'sask-sask',
    quote:
      'We had a plumbing issue in a condo that a family member just purchased. We called for someone to come but they gave us some advice so we could take care of it ourselves. It was much appreciated.',
    author: 'Sask Sask',
    rating: 5,
  },
  {
    id: 'm-lav',
    quote:
      "I called Courtesy P&H emergency line after we awoke to a cold house early Sunday morning. Colin patiently took the time to walk me through some troubleshooting & after every option failed, he was at our door 15 minutes later! He diagnosed the issue, repaired it and ensured we understood EXACTLY what had been done & gave us a complete health report on our furnace. We felt like we'd called a family member- Colin was friendly, genuine and treated us extremely well. If you want professional, very affordable service Colin and Courtesy P&H are the way to go. Much appreciated!",
    author: 'M Lav',
    rating: 5,
  },
  {
    id: 'liberty-c',
    quote:
      "The rental unit I live in has been having issues with the old radiator heating system for a few years, and out of all the companies my landlords have contacted when we've had emergencies (such as the heat not working during a cold snap), courtesy plumbing has been the best one I've dealt with. I can't speak to pricing or scheduling at all, but anytime I've had a plumber from this company come into my suite to do work they've been friendly, polite, knowledgeable, and professional. They always clean up after themselves and communicate with me. We've had other plumbing companies give us the run around and spend days fixing a problem that courtesy has then come in and fixed in a few hours. I am always happy to see the courtesy plumbing van pull up when we need work done in our apartment!",
    author: 'Liberty C',
    rating: 5,
  },
  {
    id: 'bob-shmon',
    quote:
      'I recently had an issue with our old furnace when it started to make weird noises. I called Courtesy Plumbing first thing when they opened and I appreciated how promptly someone came to look at it. It was recommended to replace the furnace so we did, along with the water heater. I also had them repair a cracked pipe under our kitchen sink. We are happy with the work they did and would definitely use them again.',
    author: 'Bob Shmon',
    rating: 5,
  },
  {
    id: 'dana-mann',
    quote:
      'Courtesy Plumbing and Gillian were exceptional. We had a heavily leaking shower on a Sunday evening and this was the fourth company with 24 hr service that I contacted. They were referred by another company. They walked me through shutting our water off so that we didn’t have to pay for after hours service. Jillian arrived first thing in the morning, fixed the shower and then also fixed another faucet. Very impressed, thank you!',
    author: 'Dana Mann',
    rating: 5,
  },
  {
    id: 'dana-d',
    quote:
      'I’ve called on Courtesy Plumbing a few times. Always for emergency situations. They have always been fast and very efficient. They fix the problem in a timely manner which I appreciate when you pay for these kinds of services by the hour. In the past they’ve made recommendations for improvements yet never push it. This is something else I appreciate as I know nothing about plumbing pipes, etc. Colin’s crew are super friendly and always willing to explain everything to me.',
    author: 'Dana D',
    rating: 5,
  },
  {
    id: 'megan',
    quote:
      'Very professional and fast. We switched to a tankless water heater and there was extensive work required to move the new Navien unit to a new location. The guys got it all done in one day and took the time to answer our questions and explain the new system, warranties and rebate. They were very polite, even apologizing for (and cleaning up) a tiny amount of water that came out of the old broken waterlogged unit during its removal... Will definitely be using their services again. Great work and thanks again!',
    author: 'Megan',
    rating: 5,
  },
];
