/**
 * General/homepage FAQs built from verified positioning claims only.
 * Service-specific FAQs will live alongside each service page in Phase 5.
 */

export interface FAQ {
  question: string;
  answer: string;
}

export const generalFaqs: FAQ[] = [
  {
    question: 'Do you offer 24/7 emergency service?',
    answer:
      'Yes. Courtesy Plumbing & Heating is available 24/7 for plumbing and HVAC emergencies throughout Castle Rock and the Denver Metro area.',
  },
  {
    question: 'Do you charge a trip fee to come look at my problem?',
    answer: 'No. Courtesy offers transparent pricing with no trip fees.',
  },
  {
    question: 'What areas do you serve?',
    answer:
      'Courtesy serves Castle Rock and the greater Denver Metro area, including Denver, Parker, Highlands Ranch, Centennial, Aurora, Littleton, Lakewood, Golden, Thornton, Westminster, Boulder, and more. See our full service area for details.',
  },
  {
    question: 'Are your technicians licensed?',
    answer: `Yes. Courtesy Plumbing & Heating holds Colorado plumbing license #PC.0001483.`,
  },
];
