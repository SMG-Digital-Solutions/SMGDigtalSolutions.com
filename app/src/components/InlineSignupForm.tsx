import { useState, type FormEvent } from 'react';
import { EnvelopeSimple } from '@phosphor-icons/react';
import FormField from './FormField';
import FormErrorMessage from './FormErrorMessage';
import { submitSignup } from '../lib/subscribeApi';
import type { SignupFormContent } from '../lib/content';

const GENERIC_ERROR_MESSAGE = "We couldn't sign you up. Please try again, or email us directly at hello@smgdigitalsolutions.com.";

/**
 * Plain embedded signup form — the INLINE placement, no drawer/modal chrome
 * (unlike SignupPopup). Renders nothing if `form` is null (no active
 * INLINE-placement SignupForm configured in the admin).
 */
export default function InlineSignupForm({ form }: { form: SignupFormContent | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!form) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitSignup({ email, name: name || undefined, formId: form.id });
      setShowSuccess(true);
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Signup submission error:', error);
      setSubmitError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5 sm:p-8">
      {form.imageUrl && <img src={form.imageUrl} alt="" className="mb-4 max-h-48 w-full rounded-xl object-cover" />}
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#008C9E] dark:text-[#4CAF50]">
        <EnvelopeSimple size={16} weight="bold" aria-hidden="true" />
        Join our list
      </p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">{form.headline}</h2>
      {form.bodyText && <p className="mt-2 text-sm text-[#4b5563] dark:text-[#d5dde4]">{form.bodyText}</p>}

      {showSuccess ? (
        <div role="status" className="mt-5 flex items-center gap-2 text-sm text-[#4b5563] dark:text-[#d5dde4]">
          <EnvelopeSimple size={18} weight="bold" className="text-[#4CAF50]" aria-hidden="true" />
          You&apos;re on the list! Keep an eye on your inbox.
        </div>
      ) : (
        <>
          <p className="mt-2 text-xs text-[#4b5563]/80 dark:text-[#d5dde4]/70">
            By signing up, you&apos;re joining our email list — we&apos;ll send occasional updates, and you can unsubscribe anytime.
          </p>
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
            <FormField
              label="Name (optional)"
              name="name"
              value={name}
              onChange={setName}
              disabled={isSubmitting}
              className="sm:flex-1"
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              disabled={isSubmitting}
              className="sm:flex-1"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
            >
              {isSubmitting ? 'Submitting...' : form.buttonLabel}
            </button>
          </form>
          {submitError && (
            <div className="mt-4">
              <FormErrorMessage message={submitError} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
