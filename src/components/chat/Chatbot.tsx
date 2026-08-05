import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { X, Send, Phone, Mail, MessageCircle, Sparkles, CircleCheck, AlertTriangle } from 'lucide-react';
import { business } from '../../data/business';
import { services } from '../../data/services';
import { locations } from '../../data/locations';
import {
  detectContactInfo,
  getSmartReply,
  initialChatContext,
  isValidEmail,
  isValidName,
  isValidPhone,
  type ChatContext,
} from '../../lib/chat/engine';
import { getPageContextTopic, topicLabel } from '../../lib/chat/knowledge';

interface Props {
  business: { phoneDisplay: string; phoneHref: string };
}

const EASE = [0.16, 1, 0.3, 1] as const;
const TEASER_SEEN_KEY = 'courtesy-chat-teaser-seen';

type Message = { id: string; from: 'bot' | 'user'; content: React.ReactNode };
type QuickAction = { key: string; label: string; shortLabel: string; triggerText: string };
type LeadStep =
  | 'idle'
  | 'offer'
  | 'wizard-service'
  | 'wizard-urgency'
  | 'wizard-city'
  | 'wizard-type'
  | 'wizard-issue'
  | 'name'
  | 'phone'
  | 'email'
  | 'confirm'
  | 'sending'
  | 'done';
type PropertyType = 'Residential' | 'Commercial';
type LeadState = {
  step: LeadStep;
  name?: string;
  phone?: string;
  email?: string;
  wizard?: boolean;
  wizardService?: string;
  wizardUrgent?: boolean;
  wizardCity?: string;
  wizardPropertyType?: PropertyType;
  wizardIssue?: string;
};
type TranscriptLine = { from: 'bot' | 'user'; text: string };

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

const GREETING = (
  <>
    Hi, I&rsquo;m the {business.name} assistant. Ask me about a service, your area, pricing, or just tell me
    what&rsquo;s going on, I&rsquo;ll get you the right answer or a real person.
  </>
);

/** Smart greeting based on current page: a visitor already reading about a
 * specific service or city gets acknowledged instead of a generic hello. */
function buildGreeting(pageTopic: string | null): React.ReactNode {
  if (pageTopic?.startsWith('service:')) {
    const slug = pageTopic.slice('service:'.length);
    const service = services.find((s) => s.slug === slug);
    if (service) {
      return (
        <>
          Hi, I&rsquo;m the {business.name} assistant. Looking into {service.name.toLowerCase()}? I can answer
          questions about it, pricing, or anything else on your mind.
        </>
      );
    }
  }
  if (pageTopic?.startsWith('location:')) {
    const slug = pageTopic.slice('location:'.length);
    const loc = locations.find((l) => l.slug === slug);
    if (loc) {
      return (
        <>
          Hi, I&rsquo;m the {business.name} assistant. Yep, we serve {loc.name}, ask me anything about service
          there, pricing, or a specific issue.
        </>
      );
    }
  }
  return GREETING;
}

/** Quick-reply chips adapt to the page a visitor is chatting from. */
function buildQuickActions(pageTopic: string | null): QuickAction[] {
  if (pageTopic?.startsWith('service:')) {
    const slug = pageTopic.slice('service:'.length);
    const service = services.find((s) => s.slug === slug);
    if (service) {
      const contextual: QuickAction = {
        key: 'page-service-cost',
        label: `Cost of ${service.name.toLowerCase()}`,
        shortLabel: 'Pricing',
        triggerText: 'How much will this cost?',
      };
      return [contextual, ...QUICK_ACTIONS.filter((qa) => qa.key !== 'services')];
    }
  }
  return QUICK_ACTIONS;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    key: 'estimate-wizard',
    label: 'Get a free estimate',
    shortLabel: 'Free estimate',
    triggerText: "I'd like a free estimate",
  },
  { key: 'emergency', label: 'This is an emergency', shortLabel: 'Emergency', triggerText: 'This is an emergency' },
  {
    key: 'services',
    label: 'What services do you offer',
    shortLabel: 'Services',
    triggerText: 'What services do you offer?',
  },
  { key: 'areas', label: 'Do you serve my area', shortLabel: 'Service area', triggerText: 'Do you serve my area?' },
  { key: 'coupons', label: 'Any current specials', shortLabel: 'Specials', triggerText: 'Do you have any coupons?' },
  {
    key: 'human',
    label: 'Talk to a real person',
    shortLabel: 'Talk to a human',
    triggerText: 'I want to talk to a real person',
  },
];

function BotAvatar() {
  return (
    <span className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-navy">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 32% 26%, rgba(15,95,168,0.5), transparent 60%)' }}
      />
      <MessageCircle className="relative h-3.5 w-3.5 text-white" strokeWidth={2.25} />
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-neutral-300"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-border px-2 py-2 text-center text-xs leading-tight font-medium text-text transition-colors hover:border-brand-blue-400 hover:text-brand-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function buildLeadPayload(lead: LeadState, ctx: ChatContext, transcript: TranscriptLine[]) {
  const urgent = Boolean(lead.wizardUrgent || ctx.urgent);
  const topics = ctx.topicsDiscussed.map(topicLabel).join(', ') || 'General chat';
  return {
    intent: lead.wizardService || (urgent ? 'Emergency' : 'General Inquiry'),
    name: lead.name ?? '',
    phone: lead.phone ?? '',
    email: lead.email ?? '',
    zip: lead.wizardCity ?? '',
    timing: urgent ? 'As soon as possible' : '',
    details: [
      lead.wizardPropertyType ? `Property type: ${lead.wizardPropertyType}` : null,
      lead.wizardIssue ? `Issue: ${lead.wizardIssue}` : null,
      `Topics discussed: ${topics}`,
      '',
      'Conversation:',
      ...transcript.map((line) => `${line.from === 'bot' ? 'Bot' : 'Visitor'}: ${line.text}`),
    ]
      .filter((line) => line !== null)
      .join('\n'),
  };
}

// Astro islands with client:idle hydrate in the browser, so this module-level
// read happens once, after mount, never during SSR.
const initialPageTopic: string | null =
  typeof window === 'undefined' ? null : getPageContextTopic(window.location.pathname);

export default function Chatbot({ business: businessProp }: Props) {
  const [pageTopic] = useState<string | null>(initialPageTopic);
  const quickActions = useMemo(() => buildQuickActions(pageTopic), [pageTopic]);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), from: 'bot', content: buildGreeting(initialPageTopic) },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [unread, setUnread] = useState(0);
  const [ctx, setCtx] = useState<ChatContext>(initialChatContext);
  const [lead, setLead] = useState<LeadState>({ step: 'idle' });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptLine[]>([{ from: 'bot', text: 'Greeted the visitor' }]);
  const leadRef = useRef<LeadState>(lead);
  const ctxRef = useRef<ChatContext>(ctx);

  useEffect(() => {
    leadRef.current = lead;
  }, [lead]);
  useEffect(() => {
    ctxRef.current = ctx;
  }, [ctx]);

  useEffect(() => {
    if (sessionStorage.getItem(TEASER_SEEN_KEY)) return;
    const t = setTimeout(() => {
      setTeaser(true);
      sessionStorage.setItem(TEASER_SEEN_KEY, '1');
    }, 4500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const launcher = (e.target as HTMLElement).closest('[aria-label="Open chat"], [aria-label="Close chat"]');
        if (!launcher) setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  // External triggers (mobile action bar "Chat" button)
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setTeaser(false);
      setUnread(0);
    };
    document.querySelectorAll('[data-chatbot-open]').forEach((el) => el.addEventListener('click', handler));
    return () => {
      document.querySelectorAll('[data-chatbot-open]').forEach((el) => el.removeEventListener('click', handler));
    };
  }, []);

  function pushUserMessage(text: string) {
    setMessages((m) => [...m, { id: nextId(), from: 'user', content: text }]);
    transcriptRef.current.push({ from: 'user', text });
  }

  function pushBotReply(content: React.ReactNode, logLabel: string, onDone?: () => void) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId(), from: 'bot', content }]);
      transcriptRef.current.push({ from: 'bot', text: logLabel });
      if (!open) setUnread((u) => u + 1);
      onDone?.();
    }, 700);
  }

  function offerLeadCapture() {
    setCtx((c) => ({ ...c, leadOffered: true }));
    setLead({ step: 'offer' });
    pushBotReply(
      <>Want me to have a technician follow up? I just need a name and phone number, no obligation.</>,
      'Offered to collect contact info'
    );
  }

  function startLeadCapture(prefill: { phone?: string; email?: string }, autoDetected: boolean) {
    setCtx((c) => ({ ...c, leadOffered: true }));
    setLead({ step: 'name', phone: prefill.phone, email: prefill.email });
    pushBotReply(
      autoDetected ? (
        <>Thanks, I&rsquo;ve got that. What name should I put with it?</>
      ) : (
        <>Great, what&rsquo;s your name?</>
      ),
      'Detected contact info and started lead capture'
    );
  }

  function startWizard() {
    setCtx((c) => ({ ...c, leadOffered: true }));
    setLead({ step: 'wizard-service', wizard: true });
    pushBotReply(
      <>Happy to help you get an estimate. What do you need help with?</>,
      'Started the estimate wizard: asked for service type'
    );
  }

  function confirmReply(l: LeadState): React.ReactNode {
    return (
      <>
        <p>Here&rsquo;s what I&rsquo;ve got:</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          {l.wizard && <li>Service: {l.wizardService}</li>}
          {l.wizard && <li>Urgency: {l.wizardUrgent ? 'Emergency' : 'Not an emergency'}</li>}
          {l.wizard && <li>City: {l.wizardCity}</li>}
          {l.wizard && <li>Property: {l.wizardPropertyType}</li>}
          {l.wizard && l.wizardIssue && <li>Details: {l.wizardIssue}</li>}
          <li>Name: {l.name}</li>
          <li>Phone: {l.phone}</li>
          {l.email && <li>Email: {l.email}</li>}
        </ul>
        <p className="mt-2">
          {l.wizard
            ? 'Perfect! We’ve got everything our team needs. Want me to send this over now?'
            : 'Want me to send this to the team?'}
        </p>
      </>
    );
  }

  async function submitLeadFromChat() {
    setLead((prev) => ({ ...prev, step: 'sending' }));
    const payload = buildLeadPayload(leadRef.current, ctxRef.current, transcriptRef.current);
    try {
      const res = await fetch('/api/chatbot-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      setLead((prev) => ({ ...prev, step: 'done' }));
      setCtx((c) => ({ ...c, leadSubmitted: true }));
      pushBotReply(
        <>
          <p className="flex items-center gap-1.5 font-semibold text-brand-blue-700">
            <CircleCheck className="h-4 w-4" /> Got it, thanks!
          </p>
          <p className="mt-1 text-text-muted">
            Our team will reach out shortly. For anything urgent, call {businessProp.phoneDisplay}.
          </p>
        </>,
        'Lead submitted successfully to the office'
      );
    } catch {
      setLead((prev) => ({ ...prev, step: 'done' }));
      setCtx((c) => ({ ...c, leadSubmitted: true }));
      pushBotReply(
        <>
          <p className="flex items-center gap-1.5 font-semibold text-brand-red-700">
            <AlertTriangle className="h-4 w-4" /> That didn&rsquo;t go through.
          </p>
          <p className="mt-1 text-text-muted">
            Please call us directly at {businessProp.phoneDisplay} and we&rsquo;ll get you taken care of.
          </p>
        </>,
        'Lead API unreachable'
      );
    }
  }

  function handleLeadStep(text: string) {
    const t = text.trim();
    const step = leadRef.current.step;

    if (step === 'offer') {
      if (/^(yes|yep|yeah|sure|let'?s do it|ok|okay|sounds good)/i.test(t)) {
        setLead({ step: 'name' });
        pushBotReply(<>Great, what&rsquo;s your name?</>, 'Asked for name');
      } else if (/^(no|nope|not now|no thanks|not really)/i.test(t)) {
        setCtx((c) => ({ ...c, leadDeclined: true }));
        setLead({ step: 'idle' });
        pushBotReply(
          <>No problem, happy to keep answering questions. Call {businessProp.phoneDisplay} any time.</>,
          'Declined lead capture'
        );
      } else {
        pushBotReply(<>Just a yes or no works, want me to grab your info?</>, 'Reprompted for offer response');
      }
      return;
    }

    if (step === 'wizard-service') {
      const matchedService = services.find((s) => s.name.toLowerCase() === t.toLowerCase());
      const label = matchedService?.name ?? t;
      if (t.length < 2) {
        pushBotReply(
          <>What kind of issue is it, drain, water heater, cooling, heating, or something else?</>,
          'Reprompted for service type'
        );
        return;
      }
      const urgentWords = /emergency|urgent|burst|flood|no water|no heat|leak|leaking|asap|spark/i.test(t);
      setLead((prev) => ({ ...prev, wizardService: label, step: 'wizard-urgency' }));
      pushBotReply(
        <>Got it, {label.toLowerCase()}. Is this an emergency, or can it wait for regular scheduling?</>,
        `Wizard: service = ${label}`,
        () => {
          if (urgentWords) setCtx((c) => ({ ...c, urgent: true }));
        }
      );
      return;
    }

    if (step === 'wizard-urgency') {
      const isUrgent = /^(yes|yep|yeah|emergency|urgent|asap|right now)/i.test(t);
      const isNotUrgent = /^(no|nope|not|can wait|whenever|regular|schedule)/i.test(t);
      if (!isUrgent && !isNotUrgent) {
        pushBotReply(<>Just need to know, is it an emergency (yes) or can it wait (no)?</>, 'Reprompted for urgency');
        return;
      }
      setLead((prev) => ({ ...prev, wizardUrgent: isUrgent, step: 'wizard-city' }));
      if (isUrgent) setCtx((c) => ({ ...c, urgent: true }));
      pushBotReply(
        isUrgent ? (
          <>
            Got it, we&rsquo;ll flag this as urgent. For fastest help right now you can also call{' '}
            {businessProp.phoneDisplay} directly. Which city are you in?
          </>
        ) : (
          <>No rush, good to know. Which city are you in?</>
        ),
        `Wizard: urgency = ${isUrgent ? 'emergency' : 'not urgent'}`
      );
      return;
    }

    if (step === 'wizard-city') {
      if (t.length < 2) {
        pushBotReply(<>Which city should I put down?</>, 'Reprompted for city');
        return;
      }
      setLead((prev) => ({ ...prev, wizardCity: t, step: 'wizard-type' }));
      pushBotReply(<>Thanks. Is this for a home (residential) or a business (commercial)?</>, `Wizard: city = ${t}`);
      return;
    }

    if (step === 'wizard-type') {
      const isCommercial = /^comm/i.test(t);
      const isResidential = /^resi|^home|^house/i.test(t);
      if (!isCommercial && !isResidential) {
        pushBotReply(<>Residential or commercial?</>, 'Reprompted for property type');
        return;
      }
      const propertyType: PropertyType = isCommercial ? 'Commercial' : 'Residential';
      setLead((prev) => ({ ...prev, wizardPropertyType: propertyType, step: 'wizard-issue' }));
      pushBotReply(
        <>
          Last thing before I grab your contact info, anything else about the issue our team should know? (Or type
          &ldquo;skip&rdquo;.)
        </>,
        `Wizard: property type = ${propertyType}`
      );
      return;
    }

    if (step === 'wizard-issue') {
      const issue = /^skip$/i.test(t) ? undefined : t;
      setLead((prev) => ({ ...prev, wizardIssue: issue, step: 'name' }));
      pushBotReply(<>Great, what&rsquo;s your name?</>, 'Wizard: collected issue details, asked for name');
      return;
    }

    if (step === 'name') {
      if (!isValidName(t)) {
        pushBotReply(<>I didn&rsquo;t quite catch a name there, mind typing it again?</>, 'Asked again for name');
        return;
      }
      const firstName = t.split(' ')[0];
      if (leadRef.current.phone) {
        setLead((prev) => ({ ...prev, name: t, step: 'confirm' }));
        pushBotReply(confirmReply({ ...leadRef.current, name: t }), 'Recapped lead details for confirmation');
      } else {
        setLead((prev) => ({ ...prev, name: t, step: 'phone' }));
        pushBotReply(<>Thanks, {firstName}. What&rsquo;s the best phone number to reach you?</>, 'Asked for phone');
      }
      return;
    }

    if (step === 'phone') {
      if (!isValidPhone(t)) {
        pushBotReply(
          <>That doesn&rsquo;t look like a full phone number, mind trying again?</>,
          'Asked again for phone'
        );
        return;
      }
      if (leadRef.current.email) {
        setLead((prev) => ({ ...prev, phone: t, step: 'confirm' }));
        pushBotReply(confirmReply({ ...leadRef.current, phone: t }), 'Recapped lead details for confirmation');
      } else {
        setLead((prev) => ({ ...prev, phone: t, step: 'email' }));
        pushBotReply(<>Got it. Email too? Optional, type &ldquo;skip&rdquo; to move on.</>, 'Asked for email');
      }
      return;
    }

    if (step === 'email') {
      if (/^skip$/i.test(t)) {
        setLead((prev) => ({ ...prev, step: 'confirm' }));
        pushBotReply(confirmReply(leadRef.current), 'Recapped lead details for confirmation');
        return;
      }
      if (!isValidEmail(t)) {
        pushBotReply(
          <>That email doesn&rsquo;t look quite right, try again or type &ldquo;skip&rdquo;.</>,
          'Asked again for email'
        );
        return;
      }
      setLead((prev) => ({ ...prev, email: t, step: 'confirm' }));
      pushBotReply(confirmReply({ ...leadRef.current, email: t }), 'Recapped lead details for confirmation');
      return;
    }

    if (step === 'confirm') {
      if (/^(yes|yep|yeah|send|confirm|correct|sure)/i.test(t)) {
        submitLeadFromChat();
      } else if (/^(no|nope|start over|redo|restart)/i.test(t)) {
        setLead({ step: 'name' });
        pushBotReply(<>No problem, let&rsquo;s start over. What&rsquo;s your name?</>, 'Restarted lead capture');
      } else {
        pushBotReply(
          <>Just need a yes to send this along, or say &ldquo;start over&rdquo;.</>,
          'Reprompted for confirmation'
        );
      }
    }
  }

  function cancelLeadCapture() {
    pushUserMessage('Cancel');
    setCtx((c) => ({ ...c, leadDeclined: true }));
    setLead({ step: 'idle' });
    pushBotReply(<>No worries, cancelled. What else can I help with?</>, 'Cancelled lead capture');
  }

  function handleUserInput(displayText: string, matchText: string = displayText) {
    // Guards against a message slipping in while a bot reply (and any
    // chained action like startWizard/offerLeadCapture, queued via setTimeout
    // in that reply's onDone) is still in flight: without this, a fast second
    // message can get routed through the wrong handler because lead.step
    // hasn't updated yet, silently dropping the user's answer to the wizard.
    if (typing) return;
    pushUserMessage(displayText);

    const step = leadRef.current.step;
    if (step !== 'idle' && step !== 'done') {
      handleLeadStep(matchText);
      return;
    }

    const detected = detectContactInfo(matchText);
    if ((detected.phone || detected.email) && !ctx.leadOffered && !ctx.leadDeclined && !ctx.leadSubmitted) {
      startLeadCapture(detected, true);
      return;
    }

    const result = getSmartReply(matchText, ctx, pageTopic);
    setCtx(result.nextContext);
    pushBotReply(result.content, result.logLabel, () => {
      if (result.startWizard) setTimeout(startWizard, 500);
      else if (result.offerLeadCapture) setTimeout(offerLeadCapture, 500);
    });
  }

  function handleQuickAction(qa: QuickAction) {
    if (qa.key === 'estimate-wizard' || qa.key === 'page-service-estimate') {
      pushUserMessage(qa.label);
      startWizard();
      return;
    }
    handleUserInput(qa.label, qa.triggerText);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    handleUserInput(text);
  }

  const capturing = lead.step !== 'idle' && lead.step !== 'done';
  const placeholder =
    lead.step === 'name'
      ? 'Your name…'
      : lead.step === 'phone'
        ? 'Your phone number…'
        : lead.step === 'email'
          ? 'Your email (or type skip)…'
          : lead.step === 'offer' ||
              lead.step === 'confirm' ||
              lead.step === 'wizard-urgency' ||
              lead.step === 'wizard-type'
            ? 'Yes or no…'
            : lead.step === 'wizard-service'
              ? 'e.g. drain cleaning…'
              : lead.step === 'wizard-city'
                ? 'Your city…'
                : lead.step === 'wizard-issue'
                  ? 'Optional details, or type skip…'
                  : 'Type a question…';

  return (
    <MotionConfig reducedMotion="user">
    <div className="fixed right-4 bottom-20 z-(--z-chatbot) lg:right-6 lg:bottom-6" data-chatbot-launcher>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: EASE }}
            id="courtesy-chatbot-panel"
            className="mb-4 flex h-[min(600px,72vh)] w-[92vw] max-w-[400px] flex-col overflow-hidden rounded-(--radius-xl) border border-border bg-white shadow-elevated"
            role="dialog"
            aria-label={`Chat with ${business.name}`}
          >
            <div className="relative shrink-0 overflow-hidden bg-brand-navy p-5">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(circle at 18% 0%, rgba(15,95,168,0.4), transparent 60%)' }}
              />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white/20 bg-white">
                    <MessageCircle className="h-5 w-5 text-brand-blue-700" strokeWidth={2.25} />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      {business.name}
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
                        <Sparkles className="h-2.5 w-2.5" /> Smart assistant
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/70">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      Usually replies in minutes
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close chat"
                  aria-expanded={open}
                  aria-controls="courtesy-chatbot-panel"
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative mt-4 flex flex-wrap gap-2">
                <a
                  href={businessProp.phoneHref}
                  data-analytics-event="phone_click"
                  data-analytics-location="chatbot_header"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  <Phone className="h-3 w-3" /> Call
                </a>
                <a
                  href={business.email.href}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  <Mail className="h-3 w-3" /> Email
                </a>
              </div>
            </div>

            <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-end gap-2 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.from === 'bot' && <BotAvatar />}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.from === 'user'
                        ? 'rounded-br-md bg-brand-blue-600 text-white'
                        : 'rounded-bl-md border border-border text-text'
                    } ${m.from === 'bot' ? 'bg-white' : ''}`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {typing && <TypingIndicator />}
            </div>

            <div
              className={`shrink-0 border-t border-border bg-surface-subtle px-3 py-2.5 ${typing ? 'pointer-events-none opacity-60' : ''}`}
            >
              {lead.step === 'offer' ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <ActionButton label="Yes, let's do it" onClick={() => handleUserInput("Yes, let's do it")} />
                  <ActionButton label="No thanks" onClick={() => handleUserInput('No thanks')} />
                </div>
              ) : lead.step === 'wizard-service' ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {services.slice(0, 8).map((s) => (
                    <ActionButton key={s.slug} label={s.name} onClick={() => handleUserInput(s.name)} />
                  ))}
                  <ActionButton label="Something else" onClick={() => handleUserInput('Something else')} />
                  <ActionButton label="Cancel" onClick={cancelLeadCapture} />
                </div>
              ) : lead.step === 'wizard-urgency' ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <ActionButton label="Yes, emergency" onClick={() => handleUserInput('Yes, emergency')} />
                  <ActionButton label="No, can wait" onClick={() => handleUserInput('No, can wait')} />
                </div>
              ) : lead.step === 'wizard-type' ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <ActionButton label="Residential" onClick={() => handleUserInput('Residential')} />
                  <ActionButton label="Commercial" onClick={() => handleUserInput('Commercial')} />
                </div>
              ) : lead.step === 'wizard-issue' ? (
                <ActionButton label="Skip this" onClick={() => handleUserInput('skip')} />
              ) : lead.step === 'confirm' ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <ActionButton label="Yes, send it" onClick={() => handleUserInput('Yes, send it')} />
                  <ActionButton label="Start over" onClick={() => handleUserInput('Start over')} />
                </div>
              ) : lead.step === 'sending' ? (
                <p className="py-1.5 text-center text-xs text-text-muted">Sending&hellip;</p>
              ) : lead.step === 'name' ||
                lead.step === 'phone' ||
                lead.step === 'email' ||
                lead.step === 'wizard-city' ? (
                <ActionButton label="Cancel" onClick={cancelLeadCapture} />
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {quickActions.map((qa) => (
                    <ActionButton key={qa.key} label={qa.shortLabel} onClick={() => handleQuickAction(qa)} />
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex shrink-0 items-center gap-2 border-t border-border p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder={placeholder}
                aria-label="Type your message"
                className="flex-1 rounded-full border border-border-strong bg-white px-4 py-2.5 text-sm text-text outline-none placeholder:text-text-muted focus:border-brand-blue-500 focus-visible:outline-2 focus-visible:outline-brand-blue-600"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || typing}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-blue-600 text-white transition-transform active:scale-95 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="shrink-0 px-4 pb-3 text-center text-[11px] text-text-muted">
              {capturing
                ? 'Your info goes straight to our team.'
                : `Automated assistant. For anything urgent, call ${businessProp.phoneDisplay}.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end gap-3">
        <AnimatePresence>
          {teaser && !open && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="flex max-w-[220px] items-start gap-2 rounded-2xl rounded-br-md border border-border bg-white p-3.5 pr-2.5 shadow-elevated"
            >
              <p className="flex-1 text-sm leading-snug text-text">
                Got a plumbing or HVAC question? I can help, or connect you to a real person.
              </p>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setTeaser(false)}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-text-muted hover:bg-surface-muted hover:text-text"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!open && (
            <motion.button
              type="button"
              onClick={() => {
                setOpen(true);
                setTeaser(false);
                setUnread(0);
              }}
              aria-label="Open chat"
              aria-expanded={open}
              aria-controls="courtesy-chatbot-panel"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2, ease: EASE }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="group relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-blue-600 text-white shadow-elevated hover:bg-brand-blue-700 lg:h-16 lg:w-16"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-brand-blue-500/60 motion-reduce:hidden"
                style={{ animationDuration: '2.2s' }}
              />
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand-blue-300/70" />
              <MessageCircle className="relative h-6 w-6 lg:h-7 lg:w-7" strokeWidth={2.25} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-brand-red-600 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
    </MotionConfig>
  );
}
