import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getStatsOverview } from "@/lib/data";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";
import { UpdatedBadge } from "@/components/sections/UpdatedBadge";
import { Leaderboard } from "@/components/sections/Leaderboard";
import { BiggestWins } from "@/components/sections/BiggestWins";
import { PlayerComparison } from "@/components/sections/PlayerComparison";

// Recharts is a large dependency (~100KB gzipped) — split into its own chunk
// rather than bundling it into this page's initial JS.
const GoalsByMatchdayChart = dynamic(
  () => import("@/components/sections/GoalsByMatchdayChart").then((m) => m.GoalsByMatchdayChart),
);

export const metadata: Metadata = {
  title: "Stats Center",
  description:
    "Top scorers, assists, goals per matchday, biggest wins, and clean sheets for the 2026/27 UEFA Champions League.",
};

export default async function StatsPage() {
  const { topScorers, topAssists, allScorers, goalsByMatchday, biggestWins, cleanSheets, source, updatedAt } =
    await getStatsOverview();

  return (
    <div>
      <ParallaxHeader
        src="/images/stats/ball-in-net.jpg"
        alt="Close-up of a soccer ball resting in the goal net"
        eyebrow="2026/27 League Phase"
        title="Stats Center"
      />

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
            <GoalsByMatchdayChart data={goalsByMatchday} />
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
            <PlayerComparison players={allScorers} />
          </div>
        </section>
      </div>
    </div>
  );
}
