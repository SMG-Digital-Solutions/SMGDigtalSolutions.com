/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Overrides the admin API's origin for local development only (e.g.
   * `http://localhost:3000` when running the admin app's Next.js dev
   * server directly). Leave unset in production — requests are same-origin
   * through the Netlify proxy at smgdigitalsolutions.com/admin, so a
   * relative URL is correct there.
   */
  readonly PUBLIC_ADMIN_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
