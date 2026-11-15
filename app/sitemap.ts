import type { MetadataRoute } from "next";
import { getTeams } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

// Regenerated at most once an hour — the club list barely changes, and this
// avoids hitting the football-data.org API on every crawler visit.
export const revalidate = 3600;

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
  }));

  // Real team slugs only — if the live API isn't reachable, getTeams()
  // honestly returns no teams rather than guessing at 36 slugs, so the
  // sitemap just omits club pages rather than inventing URLs.
  const { data: teams } = await getTeams();
  for (const team of teams) {
    entries.push({ url: `${SITE_URL}/clubs/${team.slug}`, lastModified: now });
  }

  return entries;
}
