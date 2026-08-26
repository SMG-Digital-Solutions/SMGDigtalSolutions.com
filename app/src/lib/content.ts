/**
 * Build-time fetch of CMS content (Services, Add-Ons, Gallery, Banners) from
 * the companion admin app's public `/api/content` endpoint. Called exactly
 * once, at the top of index.astro's frontmatter, which runs in Node during
 * `astro build` — not in the browser, so there's no relative-URL/same-origin
 * shortcut like the client-side lead-submission helper (leadsApi.ts) uses.
 * Defaults to the production domain; `PUBLIC_ADMIN_ORIGIN` overrides it for
 * local dev, same as leadsApi.ts.
 *
 * Throws on failure rather than falling back to empty content — a broken
 * build is far preferable to silently shipping a site with missing
 * Services/Gallery/Add-Ons sections.
 */

const ADMIN_ORIGIN = import.meta.env.PUBLIC_ADMIN_ORIGIN || 'https://smgdigitalsolutions.com';
const CONTENT_ENDPOINT = `${ADMIN_ORIGIN}/admin/api/content`;

export type AddOnUnit = 'MONTHLY' | 'ONE_TIME' | 'QUOTE';

export interface ServiceItemContent {
  id: string;
  title: string;
  description: string;
  iconKey: string;
}

export interface ServiceCategoryContent {
  id: string;
  label: string;
  iconKey: string;
  services: ServiceItemContent[];
}

export interface AddOnItemContent {
  id: string;
  name: string;
  price: string;
  unit: AddOnUnit;
  description: string;
  iconKey: string;
}

export interface AddOnCategoryContent {
  id: string;
  title: string;
  iconKey: string;
  items: AddOnItemContent[];
}

export interface GalleryProjectContent {
  id: string;
  title: string;
  type: string;
  imageUrl: string;
  imageAlt: string;
  summary: string;
  highlights: string[];
  stack: string[];
  liveUrl: string;
}

export interface BannerContent {
  id: string;
  message: string;
  ctaLabel: string | null;
  ctaHref: string | null;
}

export interface SignupFormContent {
  id: string;
  placement: 'POPUP' | 'INLINE';
  headline: string;
  bodyText: string | null;
  buttonLabel: string;
  imageUrl: string | null;
}

export interface HealthCheckFormContent {
  id: string;
  headline: string;
  bodyText: string | null;
  buttonLabel: string;
  imageUrl: string | null;
}

export interface LinkInBioFormContent {
  id: string;
  slug: string;
  headline: string;
  bodyText: string | null;
  buttonLabel: string;
  imageUrl: string | null;
}

export interface SiteContent {
  serviceCategories: ServiceCategoryContent[];
  addOnCategories: AddOnCategoryContent[];
  galleryProjects: GalleryProjectContent[];
  banners: {
    announcement: BannerContent | null;
    pricingCallout: BannerContent | null;
  };
  signupForms: {
    popup: SignupFormContent | null;
    inline: SignupFormContent | null;
    healthCheck: HealthCheckFormContent | null;
    linkInBio: LinkInBioFormContent[];
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  const response = await fetch(CONTENT_ENDPOINT);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch site content from ${CONTENT_ENDPOINT} (status ${response.status}). Is the admin app deployed and reachable?`,
    );
  }
  return response.json();
}
