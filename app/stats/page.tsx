import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getStatsOverview } from "@/lib/data";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";
import { InView } from "@/components/motion/InView";
import { UpdatedBadge } from "@/components/sections/UpdatedBadge";
import { Leaderboard } from "@/components/sections/Leaderboard";
import { BiggestWins } from "@/components/sections/BiggestWins";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

// Recharts (~100KB gzipped) and the player comparison picker are split into
// their own chunks and, below, only mounted once scrolled into view — so
// neither is fetched nor hydrated as part of this page's initial load.
const GoalsByMatchdayChart = dynamic(
  () => import("@/components/sections/GoalsByMatchdayChart").then((m) => m.GoalsByMatchdayChart),
);
const PlayerComparison = dynamic(
  () => import("@/components/sections/PlayerComparison").then((m) => m.PlayerComparison),
);

const TITLE = "Champions League 2026/27 Top Scorers & Stats";
const DESCRIPTION =
  "Champions League 2026/27 stats: top scorers and assists, goals per matchday, biggest wins, clean sheets, and a head-to-head player comparison tool.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/stats" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/stats" }),
  twitter: pageTwitter({ title: TITLE, description: DESCRIPTION }),
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Stats", path: "/stats" },
]);

export default async function StatsPage() {
  const { topScorers, topAssists, allScorers, goalsByMatchday, biggestWins, cleanSheets, source, updatedAt } =
    await getStatsOverview();

  return (
    <div>
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <ParallaxHeader
        src="/images/stats/ball-in-net.jpg"
        alt="Close-up of a soccer ball resting in the goal net"
        eyebrow="2026/27 League Phase"
        title="Champions League Stats Center"
      >
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
          This Stats Center tracks the 2026/27 Champions League&apos;s top
          scorers, assists, and goals per matchday, all computed from real
          match results. Compare any two players, or see which clubs have
          posted the biggest wins and the most clean sheets.
        </p>
      </ParallaxHeader>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-end">
          <UpdatedBadge source={source} updatedAt={updatedAt} />
        </div>

        {source === "fallback" && (
          <p className="mb-8 rounded-xl border border-line bg-surface px-4 py-3 text-center text-sm text-muted">
            Live stats aren&apos;t available right now, so only the seeded
            top scorers are shown — the rest of this page needs match-level
            data the fallback doesn&apos;t have.
          </p>
        )}

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
              Top Scorers
            </h2>
            <div className="rounded-2xl border border-line bg-surface p-5">
              {topScorers.length === 0 ? (
                <p className="text-sm text-muted">No scorers yet.</p>
              ) : (
                <Leaderboard
                  rows={topScorers.map((s) => ({
                    id: s.player.id,
                    crest: s.team.crest,
                    name: s.player.name,
                    subtitle: s.team.shortName,
                    value: s.goals,
                  }))}
                />
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
              Top Assists
            </h2>
            <div className="rounded-2xl border border-line bg-surface p-5">
              {topAssists.length === 0 ? (
                <p className="text-sm text-muted">No assist data available yet.</p>
              ) : (
                <Leaderboard
                  rows={topAssists.map((s) => ({
                    id: s.player.id,
                    crest: s.team.crest,
                    name: s.player.name,
                    subtitle: s.team.shortName,
                    value: s.assists ?? 0,
                  }))}
                />
              )}
            </div>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
            Goals per Matchday
          </h2>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <InView fallback={<div className="h-56 w-full animate-pulse rounded-xl bg-surface-2" />}>
              <GoalsByMatchdayChart data={goalsByMatchday} />
            </InView>
          </div>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
              Biggest Wins
            </h2>
            <BiggestWins wins={biggestWins} />
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
              Clean Sheets
            </h2>
            <div className="rounded-2xl border border-line bg-surface p-5">
              {cleanSheets.length === 0 ? (
                <p className="text-sm text-muted">No clean sheet data available yet.</p>
              ) : (
                <Leaderboard
                  rows={cleanSheets.map((c) => ({
                    id: c.team.id,
                    crest: c.team.crest,
                    name: c.team.shortName,
                    value: c.count,
                  }))}
                />
              )}
            </div>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
            Player Comparison
          </h2>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <InView fallback={<div className="h-72 w-full animate-pulse rounded-xl bg-surface-2" />}>
              <PlayerComparison players={allScorers} />
            </InView>
          </div>
        </section>
      </div>
    </div>
  );
}
