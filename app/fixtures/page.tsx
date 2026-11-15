import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentMatchday, getMatches } from "@/lib/data";
import { MatchCard } from "@/components/sections/MatchCard";
import { UpdatedBadge } from "@/components/sections/UpdatedBadge";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";

export const metadata: Metadata = {
  title: "Fixtures & Results",
  description: "UEFA Champions League 2026/27 league-phase fixtures and results, matchday by matchday.",
};

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
      <ParallaxHeader
        src="/images/fixtures/floodlights.jpg"
        alt="Close-up of stadium floodlight towers lit up against a dark night sky"
        eyebrow="League Phase"
        title="Fixtures & Results"
      />

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
