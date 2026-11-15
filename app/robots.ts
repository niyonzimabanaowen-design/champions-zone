import type { MetadataRoute } from "next";
import { IS_PRODUCTION, SITE_URL } from "@/lib/seo";

/** Only the actual production deploy gets crawled — Vercel preview
 * deployments (and local dev) disallow everything, so an in-progress
 * preview URL never ends up indexed alongside the real site. */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
