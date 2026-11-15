import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentMatchday, getMatches } from "@/lib/data";
import { MatchCard } from "@/components/sections/MatchCard";
import { UpdatedBadge } from "@/components/sections/UpdatedBadge";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

const TITLE = "Champions League Fixtures & Results 2026/27";
const DESCRIPTION =
  "Browse UEFA Champions League 2026/27 fixtures and results by matchday, with kickoff times and final scores for every club in the league phase.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/fixtures" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/fixtures" }),
  twitter: pageTwitter({ title: TITLE, description: DESCRIPTION }),
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Fixtures", path: "/fixtures" },
]);

const LEAGUE_PHASE_MATCHDAYS = [1, 2, 3, 4, 5, 6, 7, 8];

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ md?: string }>;
}) {
  const params = await searchParams;
  // Skips the extra currentMatchday API round trip whenever the matchday is
  // already known from the URL (true for every tab click) — only the
  // initial, tab-less visit needs that lookup.
  const matchday = Number(params.md) || (await getCurrentMatchday());

  const { data: matches, source, updatedAt } = await getMatches(matchday);

  return (
    <div>
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <ParallaxHeader
        src="/images/fixtures/floodlights.jpg"
        alt="Close-up of stadium floodlight towers lit up against a dark night sky"
        eyebrow="League Phase"
        title="Champions League Fixtures & Results"
      >
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
          Here are the Champions League fixtures and results for the 2026/27
          league phase, matchday by matchday. Pick a matchday above to see
          scheduled kickoff times or final scores for every club.
        </p>
      </ParallaxHeader>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <UpdatedBadge source={source} updatedAt={updatedAt} />
        </div>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-line pb-4">
          {LEAGUE_PHASE_MATCHDAYS.map((md) => (
            <Link
              key={md}
              href={`/fixtures?md=${md}`}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                md === matchday
                  ? "bg-accent text-bg"
                  : "bg-surface text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              MD {md}
            </Link>
          ))}
        </div>

        {matches.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">
            {source === "fallback"
              ? "No fixture-level fallback data is available — reconnect the live API to see matchday fixtures."
              : "No fixtures found for this matchday."}
          </p>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
