/**
 * First-party, privacy-conscious pageview + CTA-click tracking for the
 * admin app's Analytics dashboard. No third-party script, no PII: the
 * visitor id is a random UUID stored in a first-party cookie, never
 * derived from IP/user-agent/fingerprinting.
 *
 * Any element with a `data-cta="some-id"` attribute anywhere on the page
 * is tracked automatically via event delegation — no per-button wiring
 * needed beyond adding the attribute.
 *
 * Same-origin-relative endpoint in production (see leadsApi.ts for why);
 * `PUBLIC_ADMIN_ORIGIN` only matters for local development.
 */

const VISITOR_ID_COOKIE = 'smg_visitor_id';
const VISITOR_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const ADMIN_ORIGIN = import.meta.env.PUBLIC_ADMIN_ORIGIN ?? '';
const TRACK_ENDPOINT = `${ADMIN_ORIGIN}/admin/api/track`;

function getOrCreateVisitorId(): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${VISITOR_ID_COOKIE}=([^;]*)`));
  if (match) return decodeURIComponent(match[1]);

  const id = crypto.randomUUID();
  document.cookie = `${VISITOR_ID_COOKIE}=${id}; path=/; max-age=${VISITOR_ID_MAX_AGE_SECONDS}; SameSite=Lax`;
  return id;
}

function sendBeacon(payload: Record<string, unknown>): void {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(TRACK_ENDPOINT, blob);
    return;
  }

  // Fallback for browsers without sendBeacon; keepalive lets it survive a
  // page unload the way sendBeacon does.
  fetch(TRACK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Best-effort only — a dropped analytics beacon should never surface
    // to the visitor or affect anything else on the page.
  });
}

function trackPageview(visitorId: string): void {
  sendBeacon({
    type: 'PAGEVIEW',
    path: window.location.pathname,
    visitorId,
    referrer: document.referrer || undefined,
  });
}

function trackCtaClicks(visitorId: string): void {
  document.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-cta]');
    if (!target) return;

    sendBeacon({
      type: 'CTA_CLICK',
      path: window.location.pathname,
      ctaId: target.dataset.cta,
      visitorId,
    });
  });
}

const visitorId = getOrCreateVisitorId();
trackPageview(visitorId);
trackCtaClicks(visitorId);
