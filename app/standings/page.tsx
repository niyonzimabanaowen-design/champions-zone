import type { Metadata } from "next";
import { getStandingsSplits } from "@/lib/data";
import { StandingsExplorer } from "@/components/sections/StandingsExplorer";
import { UpdatedBadge } from "@/components/sections/UpdatedBadge";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";

export const metadata: Metadata = {
  title: "Standings",
  description: "The full 2026/27 UEFA Champions League league-phase table.",
};

export default async function StandingsPage() {
  const { full, home, away, source, updatedAt } = await getStandingsSplits();

  return (
    <div>
      <ParallaxHeader
        src="/images/standings/aerial-pitch.jpg"
        alt="Aerial view of a football pitch with crisp white line markings"
        eyebrow="2026/27 League Phase"
        title="Live Table"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <UpdatedBadge source={source} updatedAt={updatedAt} />
        </div>

        {source === "fallback" && full.length < 36 && (
          <p className="mb-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
            Showing the top {full.length} clubs from cached fallback data —
            the live API is temporarily unavailable, so the rest of the table
            and the Home/Away splits aren&apos;t shown rather than guessed.
          </p>
        )}

        <StandingsExplorer full={full} home={home} away={away} />
      </div>
    </div>
  );
}
