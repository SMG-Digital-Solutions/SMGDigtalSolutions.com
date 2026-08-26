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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
