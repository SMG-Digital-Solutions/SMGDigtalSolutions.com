import { useState } from 'react';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formsubmit.co/smgdigitalsolutions@outlook.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: 'New contact form submission',
          _captcha: 'false',
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
  };

  const handleBackToWebsite = () => {
    setShowSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="min-h-96 lg:min-h-[28rem] space-y-4 rounded-[1.5rem] border border-black/10 bg-[#F7F7F7]/90 p-6 dark:border-white/10 dark:bg-[#0F1B2C]/80"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isSubmitting}
              className="mt-2 w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7] disabled:opacity-50"
            />
          </label>
          <label className="block text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isSubmitting}
              className="mt-2 w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7] disabled:opacity-50"
            />
          </label>
        </div>
        <label className="block text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">
          Message
          <textarea
            name="message"
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            disabled={isSubmitting}
            className="mt-2 w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-3 text-sm text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7] disabled:opacity-50"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] dark:bg-[#4CAF50] dark:hover:bg-[#379d55] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>
      </form>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white p-8 shadow-lg dark:border-white/10 dark:bg-[#1A2B3C]">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/20">
                <svg
                  className="h-8 w-8 text-[#4CAF50]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-[#121212] dark:text-[#F7F7F7]">
                Message Sent!
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#4b5563] dark:text-[#d5dde4]">
                Thank you for reaching out. We've received your message and will get back to you
                soon with a custom quote.
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 rounded-full border border-[#121212]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#121212] transition hover:bg-[#121212]/5 dark:border-white/20 dark:bg-[#0F1B2C] dark:text-white dark:hover:bg-white/10"
              >
                Close
              </button>
              <button
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
