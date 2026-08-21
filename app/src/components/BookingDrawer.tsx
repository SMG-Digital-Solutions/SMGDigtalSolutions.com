import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, PaperPlaneTilt, X } from '@phosphor-icons/react';

export interface BookingDrawerPayload {
  context?: string;
  summaryLines?: string[];
}

const OPEN_EVENT = 'smg:open-booking-drawer';

export function openBookingDrawer(payload: BookingDrawerPayload = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<BookingDrawerPayload>(OPEN_EVENT, { detail: payload }));
}

export default function BookingDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<BookingDrawerPayload>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<BookingDrawerPayload>).detail ?? {};
      setPayload(detail);
      setShowSuccess(false);
      setIsOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formsubmit.co/smgdigitalsolutions@outlook.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
          request: payload.context ?? 'General booking request',
          selection: payload.summaryLines?.join(' | ') ?? '',
          _subject: 'New booking / quote request',
          _captcha: 'false',
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({ name: '', email: '', phone: '', notes: '' });
      }
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                  <CalendarCheck size={16} weight="bold" />
                  Book a call
                </p>
                <h2
                  id="booking-drawer-heading"
                  className="mt-2 text-2xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]"
                >
                  {showSuccess ? 'Request received!' : 'Request your quote'}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close booking drawer"
                className="rounded-full p-2 text-[#121212]/60 transition hover:bg-[#121212]/5 dark:text-white/60 dark:hover:bg-white/10"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {!showSuccess && payload.context && (
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
              <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/20">
                  <CalendarCheck size={32} weight="bold" className="text-[#4CAF50]" />
                </div>
                <p className="text-sm leading-6 text-[#4b5563] dark:text-[#d5dde4]">
                  Thanks for reaching out. We&apos;ll follow up shortly with next steps and a tailored quote.
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
                <label className="block text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
                  Name
                  <input
                    type="text"
                    name="name"
                    required
                    disabled={isSubmitting}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7] disabled:opacity-50"
                  />
                </label>
                <label className="block text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
                  Email
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={isSubmitting}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7] disabled:opacity-50"
                  />
                </label>
                <label className="block text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
                  Phone (optional)
                  <input
                    type="tel"
                    name="phone"
                    disabled={isSubmitting}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7] disabled:opacity-50"
                  />
                </label>
                <label className="flex flex-1 flex-col text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
                  Notes
                  <textarea
                    name="notes"
                    rows={4}
                    disabled={isSubmitting}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about your business and timeline..."
                    className="mt-2 w-full flex-1 rounded-[1.5rem] border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7] disabled:opacity-50"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] dark:bg-[#4CAF50] dark:hover:bg-[#379d55] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PaperPlaneTilt size={18} weight="bold" />
                  {isSubmitting ? 'Sending...' : 'Send request'}
                </button>
              </form>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
