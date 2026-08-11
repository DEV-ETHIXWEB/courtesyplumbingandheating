import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Turnstile } from './Turnstile';
import {
  Wrench,
  Flame,
  Snowflake,
  Droplets,
  Waves,
  Zap,
  HelpCircle,
  Clock3,
  CalendarDays,
  CalendarClock,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

interface BusinessInfo {
  phoneDisplay: string;
  phoneHref: string;
}

interface Props {
  business: BusinessInfo;
}

const SERVICE_OPTIONS: { label: string; icon: LucideIcon }[] = [
  { label: 'Plumbing', icon: Wrench },
  { label: 'Heating / Furnace', icon: Flame },
  { label: 'Air Conditioning', icon: Snowflake },
  { label: 'Water Heater', icon: Droplets },
  { label: 'Drain / Sewer', icon: Waves },
  { label: 'Emergency, need help now', icon: Zap },
  { label: 'Something else', icon: HelpCircle },
];

const TIMING_OPTIONS: { label: string; icon: LucideIcon }[] = [
  { label: 'As soon as possible', icon: Zap },
  { label: 'Within a few days', icon: Clock3 },
  { label: 'This week', icon: CalendarDays },
  { label: 'Just getting quotes', icon: CalendarClock },
];

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

function PickerChips({
  options,
  value,
  onChange,
  error,
  name,
}: {
  options: { label: string; icon: LucideIcon }[];
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  name: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={name}>
      {options.map(({ label, icon: Icon }) => {
        const selected = value === label;
        return (
          <motion.button
            key={label}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(label)}
            whileTap={{ scale: 0.96 }}
            className={`group relative flex h-full min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-(--radius-md) border px-2 py-2.5 text-center text-xs font-semibold transition-all duration-200 ${
              selected
                ? 'border-brand-blue-600 bg-[linear-gradient(155deg,var(--color-brand-blue-500)_0%,var(--color-brand-blue-700)_100%)] text-white shadow-[0_6px_16px_-6px_rgba(15,95,168,0.5)]'
                : `border-border bg-white text-text hover:border-brand-blue-300 hover:bg-brand-blue-50/60 ${
                    error ? 'border-brand-red-300' : ''
                  }`
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center transition-colors duration-200 ${
                selected ? 'text-white' : 'text-brand-blue-600 group-hover:text-brand-blue-700'
              }`}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
            </span>
            <span className="leading-snug">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

const turnstileRequired = Boolean(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY);

export default function ContactForm({ business }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
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
    if (!validate()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Honeypot travels with the payload so the server can reject bots that
          // skip this form entirely and post at the API.
          company: values.company,
          intent: values.intent,
          name: values.name,
          phone: values.phone,
          email: values.email,
          zip: values.zip,
          timing: values.timing,
          details: values.details,
          turnstileToken,
        }),
      });
      // Success is only claimed when the server confirms the lead was actually delivered.
      const data = (await res.json().catch(() => null)) as { delivered?: boolean } | null;
      if (!res.ok || data?.delivered !== true) throw new Error('Request failed');
      setStatus('sent');
      track('contact_form_submit', { form: 'contact_page', service_needed: values.intent });
    } catch {
      // Tokens are single-use; clear it so the widget must re-verify before retrying.
      setTurnstileToken(null);
      setStatus('error');
    }
  }

  const filledCount = [values.name, values.phone, values.intent].filter(Boolean).length;
  const progress = Math.round((filledCount / 3) * 100);

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-subtle p-10 text-center"
      >
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 260, delay: 0.1 }}
          className="flex size-16 items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--color-brand-blue-500)_0%,var(--color-brand-blue-700)_100%)] text-white shadow-[0_10px_24px_-8px_rgba(15,95,168,0.5)]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </motion.span>
        <h3 className="font-display text-xl font-bold text-text">Request received</h3>
        <p className="max-w-sm text-sm text-text-muted">
          Thanks for reaching out. A member of our team will call you back shortly. For emergencies, reach us right now.
        </p>
        <a
          href={business.phoneHref}
          data-analytics-event="phone_click"
          data-analytics-location="contact_form_success"
          className="mt-1 inline-flex items-center gap-2 rounded-(--radius-md) bg-brand-blue-600 px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
        >
          Call {business.phoneDisplay}
        </a>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
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

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-brand-blue-500),var(--color-brand-blue-700))]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          />
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-text-muted">
          <Sparkles aria-hidden="true" className="size-3.5 text-brand-blue-500" />
          {progress}%
        </span>
      </div>

      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 rounded-xl border border-brand-red-200 bg-brand-red-50 px-3 py-2.5 text-sm text-brand-red-800"
          >
            <p>
              That didn't go through. Please call{' '}
              <a href={business.phoneHref} className="font-semibold underline">
                {business.phoneDisplay}
              </a>
              .
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label className={labelBase}>What do you need?</label>
        <PickerChips
          name="Service needed"
          options={SERVICE_OPTIONS}
          value={values.intent}
          onChange={(v) => setValues((s) => ({ ...s, intent: v }))}
          error={!!errors.intent}
        />
        {errors.intent && <p className={errorText}>{errors.intent}</p>}
      </div>

      <div>
        <label className={labelBase}>
          When do you need service? <span className="font-normal normal-case">(optional)</span>
        </label>
        <PickerChips
          name="Timing"
          options={TIMING_OPTIONS}
          value={values.timing}
          onChange={(v) => setValues((s) => ({ ...s, timing: v }))}
        />
      </div>

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

      <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} theme="light" />

      <motion.button
        type="submit"
        disabled={status === 'sending' || (turnstileRequired && !turnstileToken)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-(--radius-md) bg-[linear-gradient(155deg,var(--color-brand-blue-500)_0%,var(--color-brand-blue-700)_100%)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(15,95,168,0.5)] transition-shadow hover:shadow-[0_14px_30px_-8px_rgba(15,95,168,0.6)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? 'Sending...' : 'Request Service'}
      </motion.button>

      <p className="text-xs text-text-muted">
        No obligation. For emergencies, call {business.phoneDisplay} any time, day or night.
      </p>
    </form>
  );
}
