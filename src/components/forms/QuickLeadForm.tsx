import { useState } from 'react';
import { motion } from 'motion/react';
import { Turnstile } from './Turnstile';

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

const fieldBase =
  'w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] text-white placeholder:text-white/45 outline-none transition-colors focus-visible:border-brand-blue-300 focus-visible:bg-white/15 focus-visible:ring-4 focus-visible:ring-brand-blue-400/20';
const errorBase = 'border-brand-red-400/70 focus-visible:border-brand-red-400';
const labelBase = 'mb-1.5 block text-xs font-semibold tracking-wide text-white/70 uppercase';
const errorText = 'mt-1.5 text-xs font-medium text-brand-red-300';

function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...payload });
}

const turnstileRequired = Boolean(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY);

export default function QuickLeadForm({ business }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [values, setValues] = useState({ name: '', phone: '', service: '', message: '', company: '' });

  function validate() {
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = 'Please enter your name.';
    if (values.phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a 10-digit phone number.';
    if (!values.service) next.service = 'Please select a service.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Honeypot travels with the payload so the server can reject bots that
          // skip this form entirely and post at the API.
          company: values.company,
          source: 'quick-lead-form',
          name: values.name,
          phone: values.phone,
          service: values.service,
          message: values.message,
          turnstileToken,
        }),
      });
      // Success is only claimed when the server confirms the lead was actually delivered.
      const data = (await res.json().catch(() => null)) as { delivered?: boolean } | null;
      if (!res.ok || data?.delivered !== true) throw new Error('Request failed');
      setStatus('sent');
      track('contact_form_submit', { form: 'quick_lead', service_needed: values.service });
    } catch {
      // Tokens are single-use; clear it so the widget must re-verify before retrying.
      setTurnstileToken(null);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-8 text-center"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-10 text-brand-blue-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <h3 className="font-display text-lg font-bold text-white">Request received</h3>
        <p className="max-w-xs text-sm text-white/70">
          We&rsquo;ll call you back shortly. For emergencies, reach us right now.
        </p>
        <a
          href={business.phoneHref}
          data-analytics-event="phone_click"
          data-analytics-location="quick_lead_form_success"
          className="mt-1 inline-flex items-center gap-2 rounded-full bg-brand-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-transform active:scale-95"
        >
          Call {business.phoneDisplay}
        </a>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="quick-company">Company</label>
        <input
          id="quick-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
        />
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-xl border border-brand-red-400/40 bg-brand-red-500/15 px-3 py-2.5 text-sm text-red-100">
          <p>
            That didn't go through. Please call{' '}
            <a href={business.phoneHref} className="font-semibold underline">
              {business.phoneDisplay}
            </a>
            .
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quick-name" className={labelBase}>
            Name
          </label>
          <input
            id="quick-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'quick-name-error' : undefined}
            className={`${fieldBase} ${errors.name ? errorBase : ''}`}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
          {errors.name && (
            <p id="quick-name-error" className={errorText}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="quick-phone" className={labelBase}>
            Phone
          </label>
          <input
            id="quick-phone"
            type="tel"
            autoComplete="tel"
            placeholder="(719) 000-0000"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'quick-phone-error' : undefined}
            className={`${fieldBase} ${errors.phone ? errorBase : ''}`}
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
          {errors.phone && (
            <p id="quick-phone-error" className={errorText}>
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="quick-service" className={labelBase}>
          What do you need?
        </label>
        <select
          id="quick-service"
          value={values.service}
          aria-invalid={!!errors.service}
          aria-describedby={errors.service ? 'quick-service-error' : undefined}
          className={`${fieldBase} [&>option]:text-neutral-900 ${errors.service ? errorBase : ''}`}
          onChange={(e) => setValues((v) => ({ ...v, service: e.target.value }))}
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
        {errors.service && (
          <p id="quick-service-error" className={errorText}>
            {errors.service}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="quick-message" className={labelBase}>
          Details <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="quick-message"
          rows={2}
          placeholder="Briefly, what's going on?"
          className={`${fieldBase} resize-none`}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        />
      </div>

      <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} theme="dark" />

      <button
        type="submit"
        disabled={status === 'sending' || (turnstileRequired && !turnstileToken)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-blue-900/30 transition-transform hover:bg-brand-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : 'Request Service'}
      </button>

      <p className="text-center text-xs text-white/50">
        No obligation. For emergencies, call {business.phoneDisplay}.
      </p>
    </form>
  );
}
