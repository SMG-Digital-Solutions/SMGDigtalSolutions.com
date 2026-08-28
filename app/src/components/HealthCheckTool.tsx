import { useState, type FormEvent } from 'react';
import { ArrowRight, EnvelopeSimple, WarningCircle } from '@phosphor-icons/react';
import FormField from './FormField';
import FormErrorMessage from './FormErrorMessage';
import { submitAuditRun, submitAuditUnlock } from '../lib/subscribeApi';
import type { HealthCheckFormContent } from '../lib/content';

const GENERIC_RUN_ERROR = "We couldn't run that check. Please try again in a moment.";
const GENERIC_UNLOCK_ERROR = "We couldn't send your results. Please try again, or email us directly at hello@smgdigitalsolutions.com.";

type Step = 'url' | 'teaser' | 'sent';

function scoreColor(score: number): string {
  if (score >= 70) return 'text-[#4CAF50]';
  if (score >= 40) return 'text-[#e0a527]';
  return 'text-[#e05252]';
}

interface HealthCheckToolProps {
  form: HealthCheckFormContent | null;
  /** Skips the internal image/headline/bodyText block — used when the surrounding section (e.g. the homepage promo) already has its own headline and copy, so the widget doesn't repeat it. */
  hideHeader?: boolean;
}

/**
 * Two-step, email-gated Website Health Check — step 1 (URL only) runs the
 * real audit and shows a teaser (score + issue count); step 2 (email)
 * unlocks the full score breakdown + report link. The email step is the
 * actual list-acquisition mechanism, so it discloses the opt-in explicitly.
 * Renders nothing if no FULL_PAGE/WEBSITE_HEALTH_CHECK SignupForm is configured.
 */
export default function HealthCheckTool({ form, hideHeader = false }: HealthCheckToolProps) {
  const [step, setStep] = useState<Step>('url');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState('');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<{ overallScore: number; issueCount: number } | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!form) return null;

  const handleRunCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitAuditRun(url);
      setSubmissionId(result.id);
      setTeaser({ overallScore: result.overallScore, issueCount: result.issueCount });
      setStep('teaser');
    } catch (err) {
      console.error('Health check run error:', err);
      setError(err instanceof Error ? err.message : GENERIC_RUN_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!submissionId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // The scored results and PDF link are delivered by email — never
      // rendered inline here, so a captured email is the only way to see
      // them, matching the acquisition-first design of this tool.
      await submitAuditUnlock({ submissionId, email, name: name || undefined, formId: form.id });
      setStep('sent');
    } catch (err) {
      console.error('Health check unlock error:', err);
      setError(err instanceof Error ? err.message : GENERIC_UNLOCK_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5 sm:p-8">
      {!hideHeader && (
        <>
          {form.imageUrl && <img src={form.imageUrl} alt="" className="mb-4 max-h-48 w-full rounded-xl object-cover" />}
          <h2 className="text-xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">{form.headline}</h2>
          {form.bodyText && <p className="mt-2 text-sm text-[#4b5563] dark:text-[#d5dde4]">{form.bodyText}</p>}
        </>
      )}

      {step === 'url' && (
        <div className={hideHeader ? '' : 'mt-6'}>
          <form onSubmit={handleRunCheck} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <FormField
              label="Enter your domain (e.g., yourwebsite.com)"
              name="url"
              value={url}
              onChange={setUrl}
              required
              disabled={isSubmitting}
              placeholder="yourwebsite.com"
              className="sm:flex-1"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
            >
              {isSubmitting ? 'Checking...' : form.buttonLabel}
              {!isSubmitting && <ArrowRight size={16} weight="bold" aria-hidden="true" />}
            </button>
          </form>
          <p className="mt-3 text-xs text-[#4b5563]/80 dark:text-[#d5dde4]/70">No credit card required. Instant analysis.</p>
        </div>
      )}

      {step === 'teaser' && teaser && (
        <div className="mt-6">
          <div className="flex items-center gap-6 rounded-2xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-[#1A2B3C]/70">
            <div>
              <p className={`text-4xl font-black ${scoreColor(teaser.overallScore)}`}>{teaser.overallScore}</p>
              <p className="text-xs text-[#4b5563] dark:text-[#d5dde4]">Overall health score</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#4b5563] dark:text-[#d5dde4]">
              <WarningCircle size={20} weight="bold" className="text-[#e0a527]" aria-hidden="true" />
              We found {teaser.issueCount} issue{teaser.issueCount === 1 ? '' : 's'} worth fixing.
            </div>
          </div>

          <form onSubmit={handleUnlock} className="mt-6 flex flex-col gap-4">
            <p className="text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">Enter your email and we&apos;ll send you the full breakdown and a PDF copy.</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <FormField label="Name (optional)" name="name" value={name} onChange={setName} disabled={isSubmitting} className="sm:flex-1" />
              <FormField label="Email" name="email" type="email" value={email} onChange={setEmail} required disabled={isSubmitting} className="sm:flex-1" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
              >
                {isSubmitting ? 'Sending...' : 'Email me my results'}
              </button>
            </div>
            <p className="text-xs text-[#4b5563]/80 dark:text-[#d5dde4]/70">
              By requesting your results, you&apos;re joining our email list — we&apos;ll send occasional updates, and you can unsubscribe anytime.
            </p>
          </form>
        </div>
      )}

      {step === 'sent' && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white/80 p-8 text-center dark:border-white/10 dark:bg-[#1A2B3C]/70">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/20">
            <EnvelopeSimple size={28} weight="bold" className="text-[#4CAF50]" aria-hidden="true" />
          </div>
          <p role="status" className="text-base font-semibold text-[#121212] dark:text-[#F7F7F7]">
            Your results are on their way!
          </p>
          <p className="text-sm text-[#4b5563] dark:text-[#d5dde4]">
            We've sent your full Website Health Check results to <span className="font-semibold">{email}</span>. Check your inbox
            (and spam folder, just in case).
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <FormErrorMessage message={error} />
        </div>
      )}
    </div>
  );
}
