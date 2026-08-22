/**
 * Shared submission helper for every lead-capturing form on the site
 * (ContactForm, BookingDrawer) — posts to the companion admin app's
 * `/api/leads` endpoint instead of each form hand-rolling its own fetch.
 *
 * In production this is a same-origin call: the admin app is reached at
 * smgdigitalsolutions.com/admin via a Netlify proxy rewrite (see
 * netlify.toml), so a *relative* URL is all that's needed — no CORS, no
 * cross-origin request. `PUBLIC_ADMIN_ORIGIN` only exists so local
 * development can point at a Next.js dev server running on a different
 * port, where the proxy doesn't apply.
 *
 * The admin app itself has `basePath: '/admin'` (see its next.config.ts),
 * so every one of its routes — including this API route — already carries
 * that prefix; it isn't something this helper adds on top.
 */

const ADMIN_ORIGIN = import.meta.env.PUBLIC_ADMIN_ORIGIN ?? '';
const LEADS_ENDPOINT = `${ADMIN_ORIGIN}/admin/api/leads`;

export type LeadSource = 'CONTACT_FORM' | 'QUOTE_REQUEST' | 'BOOKING_DRAWER';

export interface SubmitLeadInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source: LeadSource;
  /** Free-form context, e.g. selected plan or a quote calculator summary. */
  context?: string;
  isDemoRequest?: boolean;
}

/**
 * Submits a lead. Throws on failure (network error or non-2xx) so callers
 * can show their own error state — this helper doesn't swallow errors or
 * decide UI behavior, it just does the request.
 */
export async function submitLead(input: SubmitLeadInput): Promise<void> {
  const response = await fetch(LEADS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // `company` is a honeypot field the admin API checks — always empty
    // here since this helper is only ever called from a real submit
    // handler, never from a bot filling out every field it can find.
    body: JSON.stringify({ ...input, company: '' }),
  });

  if (!response.ok) {
    throw new Error(`Lead submission failed with status ${response.status}`);
  }
}
