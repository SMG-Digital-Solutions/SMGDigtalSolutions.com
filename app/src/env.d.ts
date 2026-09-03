/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Overrides the admin API's origin for local development only (e.g.
   * `http://localhost:3000` when running the admin app's Next.js dev
   * server directly). Leave unset in production.
   *
   * Two different callers use this: client-side lead submission
   * (leadsApi.ts) falls back to a relative URL when unset — same-origin
   * through the Netlify proxy at smgdigitalsolutions.com/admin. The
   * build-time CMS content fetch (content.ts) falls back to the full
   * production URL instead, since a relative URL has no meaning to
   * Node's `fetch` during `astro build`.
   */
  readonly PUBLIC_ADMIN_ORIGIN?: string;
  /**
   * Google Analytics 4 Measurement ID (e.g. "G-XXXXXXXXXX"). The gtag.js
   * snippet in Layout.astro only renders when this is set, so local dev
   * builds don't send test traffic into the real GA4 property.
   */
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  /**
   * Meta (Facebook) Pixel ID (a numeric string). The fbq() snippet in
   * Layout.astro only renders when this is set, same env-gating reason as
   * PUBLIC_GA_MEASUREMENT_ID — no local dev test traffic in the real pixel.
   */
  readonly PUBLIC_META_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
