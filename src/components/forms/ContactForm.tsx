import { useState } from 'react';
import { motion } from 'motion/react';

interface BusinessInfo {
  phoneDisplay: string;
  phoneHref: string;
}

interface Props {
  business: BusinessInfo;
}

const SERVICE_OPTIONS = [
  'Plumbing',
  'Heating / Furnace',
  'Air Conditioning',
  'Water Heater',
  'Drain / Sewer',
  'Emergency, need help now',
  'Something else',
];

const TIMING_OPTIONS = ['As soon as possible', 'Within a few days', 'This week', 'Just getting quotes'];

const fieldBase =
  'w-full rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-text placeholder:text-text-muted outline-none transition-colors focus-visible:border-brand-blue-500 focus-visible:ring-4 focus-visible:ring-brand-blue-500/15';
const errorBase = 'border-brand-red-500 focus-visible:border-brand-red-500';
const labelBase = 'mb-1.5 block text-xs font-semibold tracking-wide text-text-muted uppercase';
const errorText = 'mt-1.5 text-xs font-medium text-brand-red-600';

function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...payload });
}

export default function ContactForm({ business }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    zip: '',
    intent: '',
    timing: '',
    details: '',
    company: '',
  });

  function validate() {
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = 'Please enter your name.';
    if (values.phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a 10-digit phone number.';
    if (!values.intent) next.intent = 'Please select a service.';
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Please enter a valid email.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (values.company) return; // honeypot tripped, silently drop
    if (!validate()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: values.intent,
          name: values.name,
          phone: values.phone,
          email: values.email,
          zip: values.zip,
          timing: values.timing,
          details: values.details,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('sent');
      track('contact_form_submit', { form: 'contact_page', service_needed: values.intent });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-subtle p-10 text-center"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-12 text-brand-blue-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <h3 className="font-display text-xl font-bold text-text">Request received</h3>
        <p className="max-w-sm text-sm text-text-muted">
          Thanks for reaching out. A member of our team will call you back shortly. For emergencies, reach us right now.
        </p>
        <a
          href={business.phoneHref}
          data-analytics-event="phone_click"
          data-analytics-location="contact_form_success"
          className="mt-1 inline-flex items-center gap-2 rounded-full bg-brand-blue-600 px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
        >
          Call {business.phoneDisplay}
        </a>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
        />
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-xl border border-brand-red-200 bg-brand-red-50 px-3 py-2.5 text-sm text-brand-red-800">
          <p>
            That didn't go through. Please call{' '}
            <a href={business.phoneHref} className="font-semibold underline">
              {business.phoneDisplay}
            </a>
            .
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelBase}>
            Full name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            className={`${fieldBase} ${errors.name ? errorBase : ''}`}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
          {errors.name && (
            <p id="contact-name-error" className={errorText}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-phone" className={labelBase}>
            Phone
          </label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            placeholder="(719) 000-0000"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
            className={`${fieldBase} ${errors.phone ? errorBase : ''}`}
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
          {errors.phone && (
            <p id="contact-phone-error" className={errorText}>
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-email" className={labelBase}>
            Email <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            className={`${fieldBase} ${errors.email ? errorBase : ''}`}
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
          {errors.email && (
            <p id="contact-email-error" className={errorText}>
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-zip" className={labelBase}>
            Zip code <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            id="contact-zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="80109"
            className={fieldBase}
            value={values.zip}
            onChange={(e) => setValues((v) => ({ ...v, zip: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-intent" className={labelBase}>
            What do you need?
          </label>
          <select
            id="contact-intent"
            value={values.intent}
            aria-invalid={!!errors.intent}
            aria-describedby={errors.intent ? 'contact-intent-error' : undefined}
            className={`${fieldBase} ${errors.intent ? errorBase : ''}`}
            onChange={(e) => setValues((v) => ({ ...v, intent: e.target.value }))}
          >
            <option value="" disabled>
              Select a service...
            </option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.intent && (
            <p id="contact-intent-error" className={errorText}>
              {errors.intent}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-timing" className={labelBase}>
            When do you need service? <span className="font-normal normal-case">(optional)</span>
          </label>
          <select
            id="contact-timing"
            value={values.timing}
            className={fieldBase}
            onChange={(e) => setValues((v) => ({ ...v, timing: e.target.value }))}
          >
            <option value="">Select timing...</option>
            {TIMING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-details" className={labelBase}>
          Details <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="contact-details"
          rows={4}
          placeholder="Tell us what's going on..."
          className={`${fieldBase} resize-none`}
          value={values.details}
          onChange={(e) => setValues((v) => ({ ...v, details: e.target.value }))}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-card transition-transform hover:bg-brand-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? 'Sending...' : 'Request Service'}
      </button>

      <p className="text-xs text-text-muted">
        No obligation. For emergencies, call {business.phoneDisplay} any time, day or night.
      </p>
    </form>
  );
}
