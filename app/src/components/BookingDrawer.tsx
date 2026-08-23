import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { CalendarCheck, PaperPlaneTilt, X } from '@phosphor-icons/react';
import FormField from './FormField';
import FormErrorMessage from './FormErrorMessage';
import { submitLead } from '../lib/leadsApi';

export interface BookingDrawerPayload {
  context?: string;
  summaryLines?: string[];
  /**
   * Flags this submission as a demo request in the admin app (separate
   * "Pending Demos" queue + "new demo request" notification, distinct from
   * a general lead). Set by the "Request your demo today" button
   * (DemoButton.tsx); also swaps the drawer's own heading copy below.
   */
  isDemoRequest?: boolean;
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY_FORM: BookingFormData = { name: '', email: '', phone: '', notes: '' };
const GENERIC_ERROR_MESSAGE =
  "We couldn't send your request. Please try again, or email us directly at hello@smgdigitalsolutions.com.";

/** Elements a focus trap should consider "tabbable". */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const OPEN_EVENT = 'smg:open-booking-drawer';

/**
 * Opens the singleton BookingDrawer (mounted once, near the root of the
 * page) from anywhere in the app. Decoupling "who opens the drawer" from
 * "the drawer itself" via a custom DOM event lets independent Astro islands
 * (PricingPlans, InteractiveQuoteCalculator, ...) trigger it without each
 * needing its own copy of the drawer or a shared React context that would
 * have to span separate hydration roots.
 */
export function openBookingDrawer(payload: BookingDrawerPayload = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<BookingDrawerPayload>(OPEN_EVENT, { detail: payload }));
}

/**
 * Global slide-out drawer used for both "book a call" and "request a
 * custom quote" flows. Implements the ARIA dialog pattern: focus moves into
 * the drawer on open, is trapped within it while open (Tab/Shift+Tab wrap
 * at the edges), and returns to whatever triggered it on close.
 */
export default function BookingDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<BookingDrawerPayload>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>(EMPTY_FORM);

  const drawerRef = useRef<HTMLElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleOpenRequest = (event: Event) => {
      const detail = (event as CustomEvent<BookingDrawerPayload>).detail ?? {};
      setPayload(detail);
      setShowSuccess(false);
      setSubmitError(null);
      setIsOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handleOpenRequest);
    return () => window.removeEventListener(OPEN_EVENT, handleOpenRequest);
  }, []);

  // Focus management + keyboard trap, active only while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    triggerElementRef.current = document.activeElement as HTMLElement | null;

    // Deferred so the element exists in the DOM and the enter animation has
    // started before we move focus (avoids VoiceOver/NVDA missing the jump).
    const focusTimeout = window.setTimeout(() => {
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable?.[0] ?? drawerRef.current)?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const node = drawerRef.current;
      if (!node) return;
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(focusTimeout);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      triggerElementRef.current?.focus();
    };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const contextParts = [payload.context, ...(payload.summaryLines ?? [])].filter(Boolean);

      await submitLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.notes,
        source: 'BOOKING_DRAWER',
        context: contextParts.length > 0 ? contextParts.join('\n') : undefined,
        isDemoRequest: payload.isDemoRequest ?? false,
      });

      setShowSuccess(true);
      setFormData(EMPTY_FORM);
    } catch (error) {
      console.error('Booking submission error:', error);
      setSubmitError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof BookingFormData) => (value: string) =>
    setFormData((current) => ({ ...current, [field]: value }));

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="booking-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
              aria-hidden="true"
            />
            <motion.aside
              key="booking-drawer"
              ref={drawerRef}
              tabIndex={-1}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-drawer-heading"
              className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col overflow-y-auto border-l border-black/10 bg-[#F7F7F7] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1B2C] sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#008C9E] dark:text-[#4CAF50]">
                    <CalendarCheck size={16} weight="bold" aria-hidden="true" />
                    {payload.isDemoRequest ? 'Request a demo' : 'Book a call'}
                  </p>
                  <h2
                    id="booking-drawer-heading"
                    className="mt-2 text-2xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]"
                  >
                    {showSuccess ? 'Request received!' : payload.isDemoRequest ? 'Request your demo' : 'Request your quote'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close booking drawer"
                  className="rounded-full p-2 text-[#121212]/60 transition hover:bg-[#121212]/5 dark:text-white/60 dark:hover:bg-white/10"
                >
                  <X size={20} weight="bold" aria-hidden="true" />
                </button>
              </div>

              {!showSuccess && payload.context && !payload.isDemoRequest && (
                <div className="mt-5 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
                  <p className="font-semibold text-[#121212] dark:text-[#F7F7F7]">{payload.context}</p>
                  {payload.summaryLines && payload.summaryLines.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[#4b5563] dark:text-[#d5dde4]">
                      {payload.summaryLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {showSuccess ? (
                <div role="status" className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/20">
                    <CalendarCheck size={32} weight="bold" className="text-[#4CAF50]" aria-hidden="true" />
                  </div>
                  <p className="text-sm leading-6 text-[#4b5563] dark:text-[#d5dde4]">
                    {payload.isDemoRequest
                      ? "Thanks for reaching out. We'll follow up shortly to schedule your demo."
                      : "Thanks for reaching out. We'll follow up shortly with next steps and a tailored quote."}
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-8 rounded-full bg-[#008C9E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-4">
                  <FormField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={updateField('name')}
                    required
                    disabled={isSubmitting}
                  />
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={updateField('email')}
                    required
                    disabled={isSubmitting}
                  />
                  <FormField
                    label="Phone (optional)"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={updateField('phone')}
                    disabled={isSubmitting}
                  />
                  <FormField
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={updateField('notes')}
                    disabled={isSubmitting}
                    placeholder="Tell us about your business and timeline..."
                    multiline
                    rows={4}
                  />

                  {submitError && <FormErrorMessage message={submitError} />}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
                  >
                    <PaperPlaneTilt size={18} weight="bold" aria-hidden="true" />
                    {isSubmitting ? 'Sending...' : 'Send request'}
                  </button>
                </form>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
