import type { MetadataRoute } from "next";
import { getStoredClubSlugs } from "@/lib/club-slugs";
import { SITE_URL } from "@/lib/seo";

const STATIC_PATHS = [
  "/",
  "/standings",
  "/fixtures",
  "/clubs",
  "/stats",
  "/history",
  "/final",
  "/predictor",
  "/about",
  "/credits",
];

// Built entirely from stored data (STATIC_PATHS plus the slug list in
// data/teams.json, via getStoredClubSlugs()) — never from a live API call —
// so all 46 URLs are always present even if football-data.org is down or
// rate-limited. See lib/club-slugs.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
  }));

  for (const slug of getStoredClubSlugs()) {
    entries.push({ url: `${SITE_URL}/clubs/${slug}`, lastModified: now });
  }

  return entries;
}
