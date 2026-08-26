/**
 * Submission helper for the site's signup forms (SignupPopup,
 * InlineSignupForm) — mirrors leadsApi.ts exactly: relative URL in
 * production (same-origin via the Netlify proxy rewrite), PUBLIC_ADMIN_ORIGIN
 * override for local dev, honeypot always empty (a bot filling every field
 * it can find is the only way this ever gets a value), throws on failure so
 * callers own their own error UI.
 */

const ADMIN_ORIGIN = import.meta.env.PUBLIC_ADMIN_ORIGIN ?? '';
const SUBSCRIBE_ENDPOINT = `${ADMIN_ORIGIN}/admin/api/subscribe`;

export interface SubmitSignupInput {
  email: string;
  name?: string;
  /** Which SignupForm was submitted — the server looks up its segment/lead magnet from this, never trusts a client-supplied segment id. */
  formId: string;
}

export async function submitSignup(input: SubmitSignupInput): Promise<void> {
  const response = await fetch(SUBSCRIBE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, company: '' }),
  });

  if (!response.ok) {
    throw new Error(`Signup submission failed with status ${response.status}`);
  }
}

const AUDIT_RUN_ENDPOINT = `${ADMIN_ORIGIN}/admin/api/audit-run`;

export interface AuditRunResult {
  id: string;
  overallScore: number;
  issueCount: number;
}

/** Step 1 of the Website Health Check flow — URL only, returns a teaser (score + issue count), never the full report. */
export async function submitAuditRun(url: string): Promise<AuditRunResult> {
  const response = await fetch(AUDIT_RUN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, company: '' }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Health check failed with status ${response.status}`);
  }
  return response.json();
}

export interface AuditCategoryScore {
  key: string;
  label: string;
  score: number;
  assessed: boolean;
}

export interface BusinessDetailCheck {
  key: string;
  label: string;
  description: string;
  ok: boolean;
  assessed: boolean;
}

export interface AuditUnlockResult {
  ok: true;
  audit: {
    healthScores: { overall: number; categories: AuditCategoryScore[] };
    businessDetailChecks: BusinessDetailCheck[];
  };
  reportUrl: string | null;
}

export interface SubmitAuditUnlockInput {
  submissionId: string;
  email: string;
  name?: string;
  formId: string;
}

/** Step 2 — unlocks the full report for a previously-run submission, joining the visitor to the form's email list. */
export async function submitAuditUnlock(input: SubmitAuditUnlockInput): Promise<AuditUnlockResult> {
  const { submissionId, ...body } = input;
  const response = await fetch(`${AUDIT_RUN_ENDPOINT}/${submissionId}/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, company: '' }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || `Unlock failed with status ${response.status}`);
  }
  return response.json();
}
