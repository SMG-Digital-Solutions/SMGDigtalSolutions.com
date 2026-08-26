import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle, EnvelopeSimple, WarningCircle, XCircle } from '@phosphor-icons/react';
import FormField from './FormField';
import FormErrorMessage from './FormErrorMessage';
import { submitAuditRun, submitAuditUnlock, type AuditCategoryScore, type BusinessDetailCheck } from '../lib/subscribeApi';
import type { HealthCheckFormContent } from '../lib/content';

const GENERIC_RUN_ERROR = "We couldn't run that check. Please try again in a moment.";
const GENERIC_UNLOCK_ERROR = "We couldn't unlock your report. Please try again, or email us directly at hello@smgdigitalsolutions.com.";

type Step = 'url' | 'teaser' | 'unlocked';

interface FullAudit {
  healthScores: { overall: number; categories: AuditCategoryScore[] };
  businessDetailChecks: BusinessDetailCheck[];
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-[#4CAF50]';
  if (score >= 40) return 'text-[#e0a527]';
  return 'text-[#e05252]';
}

/**
 * Two-step, email-gated Website Health Check — step 1 (URL only) runs the
 * real audit and shows a teaser (score + issue count); step 2 (email)
 * unlocks the full score breakdown + report link. The email step is the
 * actual list-acquisition mechanism, so it discloses the opt-in explicitly.
 * Renders nothing if no FULL_PAGE/WEBSITE_HEALTH_CHECK SignupForm is configured.
 */
export default function HealthCheckTool({ form }: { form: HealthCheckFormContent | null }) {
  const [step, setStep] = useState<Step>('url');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState('');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<{ overallScore: number; issueCount: number } | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [fullAudit, setFullAudit] = useState<FullAudit | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

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
      const result = await submitAuditUnlock({ submissionId, email, name: name || undefined, formId: form.id });
      setFullAudit(result.audit);
      setReportUrl(result.reportUrl);
      setStep('unlocked');
    } catch (err) {
      console.error('Health check unlock error:', err);
      setError(err instanceof Error ? err.message : GENERIC_UNLOCK_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5 sm:p-8">
      {form.imageUrl && <img src={form.imageUrl} alt="" className="mb-4 max-h-48 w-full rounded-xl object-cover" />}
      <h2 className="text-xl font-black tracking-tight text-[#121212] dark:text-[#F7F7F7]">{form.headline}</h2>
      {form.bodyText && <p className="mt-2 text-sm text-[#4b5563] dark:text-[#d5dde4]">{form.bodyText}</p>}

      {step === 'url' && (
        <form onSubmit={handleRunCheck} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <FormField
            label="Your website URL"
            name="url"
            value={url}
            onChange={setUrl}
            required
            disabled={isSubmitting}
            placeholder="https://yourbusiness.com"
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
            <p className="text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]">Enter your email to see the full breakdown and get a PDF copy.</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <FormField label="Name (optional)" name="name" value={name} onChange={setName} disabled={isSubmitting} className="sm:flex-1" />
              <FormField label="Email" name="email" type="email" value={email} onChange={setEmail} required disabled={isSubmitting} className="sm:flex-1" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
              >
                {isSubmitting ? 'Unlocking...' : 'See full results'}
              </button>
            </div>
            <p className="text-xs text-[#4b5563]/80 dark:text-[#d5dde4]/70">
              By unlocking your results, you&apos;re joining our email list — we&apos;ll send occasional updates, and you can unsubscribe anytime.
            </p>
          </form>
        </div>
      )}

      {step === 'unlocked' && fullAudit && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2 text-sm text-[#4CAF50]" role="status">
            <EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
            Your full report is ready{reportUrl ? ' and on its way to your inbox' : ''}.
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-[#1A2B3C]/70">
            <p className={`text-4xl font-black ${scoreColor(fullAudit.healthScores.overall)}`}>{fullAudit.healthScores.overall}</p>
            <p className="text-xs text-[#4b5563] dark:text-[#d5dde4]">Overall health score</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {fullAudit.healthScores.categories.map((category) => (
                <div key={category.key} className="flex items-center justify-between rounded-xl border border-black/5 bg-white/60 px-4 py-3 text-sm dark:border-white/5 dark:bg-white/5">
                  <span className="text-[#4b5563] dark:text-[#d5dde4]">{category.label}</span>
                  <span className={`font-bold ${category.assessed ? scoreColor(category.score) : 'text-[#4b5563]/50 dark:text-[#d5dde4]/40'}`}>
                    {category.assessed ? `${category.score}%` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {fullAudit.businessDetailChecks.map((check) => (
              <div key={check.key} className="flex items-start gap-3 rounded-xl border border-black/5 bg-white/60 p-4 text-sm dark:border-white/5 dark:bg-white/5">
                {check.assessed && check.ok ? (
                  <CheckCircle size={20} weight="bold" className="mt-0.5 shrink-0 text-[#4CAF50]" aria-hidden="true" />
                ) : check.assessed ? (
                  <XCircle size={20} weight="bold" className="mt-0.5 shrink-0 text-[#e05252]" aria-hidden="true" />
                ) : (
                  <WarningCircle size={20} weight="bold" className="mt-0.5 shrink-0 text-[#4b5563]/50 dark:text-[#d5dde4]/40" aria-hidden="true" />
                )}
                <div>
                  <p className="font-semibold text-[#121212] dark:text-[#F7F7F7]">{check.label}</p>
                  <p className="mt-1 text-[#4b5563] dark:text-[#d5dde4]">{check.description}</p>
                </div>
              </div>
            ))}
          </div>

          {reportUrl && (
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#008C9E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#006a73] dark:bg-[#4CAF50] dark:hover:bg-[#379d55]"
            >
              Download your PDF report
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </a>
          )}
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
