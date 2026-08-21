import { useState, type FormEvent } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import FormField from './FormField';
import FormErrorMessage from './FormErrorMessage';

const CONTACT_ENDPOINT = 'https://formsubmit.co/smgdigitalsolutions@outlook.com';
const GENERIC_ERROR_MESSAGE =
  "We couldn't send your message. Please try again, or email us directly at hello@smgdigitalsolutions.com.";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const EMPTY_FORM: ContactFormData = { name: '', email: '', message: '' };

/**
 * Primary "Contact us" form. Submits to formsubmit.co (a static-site form
 * relay — no backend of our own is required) and shows a success modal on
 * completion, or a visible, screen-reader-announced error if the request
 * fails so a failed submit is never silent.
 */
export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>(EMPTY_FORM);

  const updateField = (field: keyof ContactFormData) => (value: string) =>
    setFormData((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: 'New contact form submission',
          _captcha: 'false',
        }),
      });

      if (!response.ok) {
        throw new Error(`Contact form submission failed with status ${response.status}`);
      }

      setShowSuccess(true);
      setFormData(EMPTY_FORM);
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => setShowSuccess(false);

  const handleBackToWebsite = () => {
    setShowSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="min-h-96 space-y-4 rounded-[1.5rem] border border-black/10 bg-[#F7F7F7]/90 p-6 dark:border-white/10 dark:bg-[#0F1B2C]/80 lg:min-h-[28rem]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <FormField
          label="Message"
          name="message"
          value={formData.message}
          onChange={updateField('message')}
          required
          disabled={isSubmitting}
          multiline
          rows={5}
        />

        {submitError && <FormErrorMessage message={submitError} />}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
        >
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>
      </form>

      {showSuccess && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-success-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-8 shadow-lg dark:border-white/10 dark:bg-[#1A2B3C]">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/20">
                <CheckCircle size={32} weight="bold" className="text-[#4CAF50]" aria-hidden="true" />
              </div>
              <h3 id="contact-success-heading" className="text-2xl font-black text-[#121212] dark:text-[#F7F7F7]">
                Message Sent!
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#4b5563] dark:text-[#d5dde4]">
                Thank you for reaching out. We&apos;ve received your message and will get back to you soon with a
                custom quote.
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 rounded-full border border-[#121212]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#121212] transition hover:bg-[#121212]/5 dark:border-white/20 dark:bg-[#0F1B2C] dark:text-white dark:hover:bg-white/10"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleBackToWebsite}
                className="flex-1 rounded-full bg-[#008C9E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#006a73] dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
              >
                Back to Website
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
