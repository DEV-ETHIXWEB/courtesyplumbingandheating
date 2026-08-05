import { serviceFamilies, getServicesByFamily } from './services';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  href: string;
  description: string;
  items: NavLink[];
}

export const megaMenuGroups: NavGroup[] = (['hvac', 'plumbing', 'sewer'] as const).map((family) => {
  const info = serviceFamilies[family];
  return {
    label: info.name,
    href: `/${info.slug}`,
    description: info.description,
    items: getServicesByFamily(family).map((s) => ({
      label: s.name,
      href: `/${family}/${s.slug}`,
    })),
  };
});

export const primaryNav: NavLink[] = [
  { label: 'Heating & Cooling', href: '/hvac' },
  { label: 'Plumbing', href: '/plumbing' },
  { label: 'Sewer & Drains', href: '/sewer' },
  { label: 'Service Areas', href: '/service-area' },
  { label: 'Specials', href: '/coupons' },
  { label: 'About', href: '/about' },
];

export const secondaryNav: NavLink[] = [
  { label: 'Financing', href: '/financing' },
  { label: 'Rebates', href: '/rebates' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

export const footerNav = {
  services: [
    { label: 'Heating & Cooling', href: '/hvac' },
    { label: 'Plumbing', href: '/plumbing' },
    { label: 'Sewer & Drains', href: '/sewer' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  offers: [
    { label: 'Specials & Coupons', href: '/coupons' },
    { label: 'Financing', href: '/financing' },
    { label: 'Rebates', href: '/rebates' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ],
};
