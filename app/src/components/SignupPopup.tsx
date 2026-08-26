import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { EnvelopeSimple, X } from '@phosphor-icons/react';
import FormField from './FormField';
import FormErrorMessage from './FormErrorMessage';
import { submitSignup } from '../lib/subscribeApi';
import type { SignupFormContent } from '../lib/content';

const GENERIC_ERROR_MESSAGE = "We couldn't sign you up. Please try again, or email us directly at hello@smgdigitalsolutions.com.";

/** Elements a focus trap should consider "tabbable" — same list as BookingDrawer's. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const OPEN_EVENT = 'smg:open-signup-popup';
const SUBMITTED_KEY = 'smg-signup-popup-submitted';
const DISMISSED_AT_KEY = 'smg-signup-popup-dismissed-at';
const AUTO_SHOW_DELAY_MS = 15000;
const RE_SHOW_AFTER_DISMISS_DAYS = 7;

/**
 * Opens the singleton SignupPopup (mounted once in Layout.astro) from
 * anywhere in the app — e.g. a "Join our list" link in the footer. Same
 * cross-island CustomEvent pattern as BookingDrawer.openBookingDrawer,
 * necessary because each Astro island hydrates as its own isolated React
 * root with no shared context.
 */
export function openSignupPopup() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

function shouldAutoShow(): boolean {
  try {
    if (localStorage.getItem(SUBMITTED_KEY) === '1') return false; // already subscribed — never auto-show again
    const dismissedAt = localStorage.getItem(DISMISSED_AT_KEY);
    if (!dismissedAt) return true;
    const daysSinceDismiss = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
    return daysSinceDismiss >= RE_SHOW_AFTER_DISMISS_DAYS;
  } catch {
    return true; // localStorage unavailable — default to showing rather than silently never showing
  }
}

/**
 * Sitewide signup popup. Renders nothing if `form` is null (no active
 * POPUP-placement SignupForm configured in the admin). Auto-shows once per
 * visit after a short delay, frequency-capped via localStorage (same
 * technique as AnnouncementBanner.astro's dismiss-persistence) — never
 * shown again after a successful signup, re-shown after a dismissal only
 * once RE_SHOW_AFTER_DISMISS_DAYS has passed. Can also be triggered
 * on-demand via openSignupPopup(). Full ARIA dialog pattern reused from
 * BookingDrawer (focus trap, Escape-to-close, scroll lock, focus-return).
 */
export default function SignupPopup({ form }: { form: SignupFormContent | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const dialogRef = useRef<HTMLElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!form) return;

    const handleOpenRequest = () => {
      setShowSuccess(false);
      setSubmitError(null);
      setIsOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handleOpenRequest);

    let autoShowTimeout: number | undefined;
    if (shouldAutoShow()) {
      autoShowTimeout = window.setTimeout(() => setIsOpen(true), AUTO_SHOW_DELAY_MS);
    }

    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpenRequest);
      if (autoShowTimeout) window.clearTimeout(autoShowTimeout);
    };
  }, [form]);

  // Focus management + keyboard trap, active only while open — same pattern as BookingDrawer.
  useEffect(() => {
    if (!isOpen) return;

    triggerElementRef.current = document.activeElement as HTMLElement | null;

    const focusTimeout = window.setTimeout(() => {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable?.[0] ?? dialogRef.current)?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const node = dialogRef.current;
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

  const handleClose = () => {
    if (!showSuccess) {
      try {
        localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
      } catch {
        // localStorage unavailable — the popup will just auto-show again next visit, no worse than not persisting at all.
      }
    }
    setIsOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitSignup({ email, name: name || undefined, formId: form.id });
      setShowSuccess(true);
      try {
        localStorage.setItem(SUBMITTED_KEY, '1');
      } catch {
        // Non-fatal — worst case the popup could auto-show once more on a future visit.
      }
    } catch (error) {
      console.error('Signup submission error:', error);
      setSubmitError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) return null;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="signup-popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
              aria-hidden="true"
            />
            {/*
              A plain flex-centering wrapper, not a motion element: framer-motion
              writes the `animate` prop's y/scale directly to the dialog's own
              `transform` style, which would silently override (not compose
              with) a CSS `-translate-y-1/2` utility class targeting that same
              property if it lived on the animated element itself — that's
              exactly what broke vertical centering here (bounding-box
              measurement confirmed the dialog rendering well below the
              viewport). Centering via flexbox on this non-animated wrapper
              sidesteps the conflict entirely.
            */}
            <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
              <motion.div
                key="signup-popup-dialog"
                ref={dialogRef}
                tabIndex={-1}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="signup-popup-heading"
                className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[1.5rem] border border-black/10 bg-[#F7F7F7] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1B2C] sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#008C9E] dark:text-[#4CAF50]">
                    <EnvelopeSimple size={16} weight="bold" aria-hidden="true" />
                    Join our list
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close signup popup"
                    className="rounded-full p-2 text-[#121212]/60 transition hover:bg-[#121212]/5 dark:text-white/60 dark:hover:bg-white/10"
                  >
                    <X size={20} weight="bold" aria-hidden="true" />
                  </button>
                </div>

                {showSuccess ? (
                  <div role="status" className="mt-4 flex flex-col items-center py-6 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/20">
                      <EnvelopeSimple size={32} weight="bold" className="text-[#4CAF50]" aria-hidden="true" />
                    </div>
                    <p className="text-sm leading-6 text-[#4b5563] dark:text-[#d5dde4]">
                      You&apos;re on the list! Keep an eye on your inbox.
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-6 rounded-full bg-[#008C9E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    {form.imageUrl && (
                      <img
                        src={form.imageUrl}
                        alt=""
                        className="mt-3 max-h-40 w-full rounded-xl object-cover"
                      />
                    )}
                    <h2 id="signup-popup-heading" className="mt-2 text-xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">
                      {form.headline}
                    </h2>
                    {form.bodyText && <p className="mt-2 text-sm text-[#4b5563] dark:text-[#d5dde4]">{form.bodyText}</p>}
                    <p className="mt-2 text-xs text-[#4b5563]/80 dark:text-[#d5dde4]/70">
                      By signing up, you&apos;re joining our email list — we&apos;ll send occasional updates, and you can unsubscribe
                      anytime.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
                      <FormField label="Name (optional)" name="name" value={name} onChange={setName} disabled={isSubmitting} />
                      <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        required
                        disabled={isSubmitting}
                      />

                      {submitError && <FormErrorMessage message={submitError} />}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
                      >
                        {isSubmitting ? 'Submitting...' : form.buttonLabel}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
