import "server-only";

export const SITE_NAME = "Champions Zone";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** True only for an actual production deploy — covers Vercel's own
 * preview/production distinction, so preview deployments and local dev both
 * default to noindex rather than needing their own separate flag. */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

/** Relative path to this page's branded OG/Twitter share image — resolved to
 * an absolute URL via metadataBase wherever it's used in page metadata. */
export function ogImagePath(title: string): string {
  return `/api/og?title=${encodeURIComponent(title)}`;
}

/**
 * A page's Open Graph block, including the site-wide fields (siteName,
 * type, locale) inline rather than relying on them merging down from the
 * root layout — Next.js metadata resolution replaces a nested object like
 * `openGraph` wholesale when a page defines its own, so those fields need
 * repeating here rather than only living in app/layout.tsx.
 */
export function pageOpenGraph({
  title,
  description,
  path,
  imageTitle,
}: {
  title: string;
  description: string;
  path: string;
  /** Headline shown on the generated share image; defaults to `title`. */
  imageTitle?: string;
}) {
  return {
    title,
    description,
    url: path,
    siteName: SITE_NAME,
    type: "website" as const,
    locale: "en_US",
    images: [{ url: ogImagePath(imageTitle ?? title), width: 1200, height: 630 }],
  };
}

/** The matching Twitter card block for the same page. */
export function pageTwitter({
  title,
  description,
  imageTitle,
}: {
  title: string;
  description: string;
  imageTitle?: string;
}) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [ogImagePath(imageTitle ?? title)],
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** A schema.org BreadcrumbList for the given trail, e.g. Home -> Clubs ->
 * Real Madrid. Paths are resolved to absolute URLs against SITE_URL since
 * JSON-LD, unlike page metadata, has no metadataBase to resolve against. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
