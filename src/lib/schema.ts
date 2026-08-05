import { z } from 'zod';

/** Shared validation for lead capture (chatbot + contact form). */
export const leadSchema = z.object({
  intent: z.string().min(1).max(60),
  name: z.string().min(2).max(120),
  phone: z
    .string()
    .min(10)
    .max(30)
    .refine((v) => v.replace(/\D/g, '').length >= 10, 'Phone must have at least 10 digits'),
  email: z.union([z.email().max(200), z.literal('')]).optional().default(''),
  zip: z.string().max(80).optional().default(''),
  timing: z.string().max(80).optional().default(''),
  details: z.string().max(2000).optional().default(''),
});

export type Lead = z.infer<typeof leadSchema>;

/** Shorter schema for the homepage quick-lead form: name, phone, service only. */
export const quickLeadSchema = z.object({
  source: z.string().max(60),
  name: z.string().min(2).max(120),
  phone: z
    .string()
    .min(10)
    .max(30)
    .refine((v) => v.replace(/\D/g, '').length >= 10, 'Phone must have at least 10 digits'),
  service: z.string().min(1).max(60),
  message: z.string().max(2000).optional().default(''),
});

export type QuickLead = z.infer<typeof quickLeadSchema>;

/** Escape user input before it is placed into an HTML email body. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
