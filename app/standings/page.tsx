import type { Metadata } from "next";
import { getStandings } from "@/lib/data";
import { StandingsTable } from "@/components/sections/StandingsTable";
import { UpdatedBadge } from "@/components/sections/UpdatedBadge";

export const metadata: Metadata = {
  title: "Standings",
  description: "The full 2026/27 UEFA Champions League league-phase table.",
};

export default async function StandingsPage() {
  const { data: standings, source, updatedAt } = await getStandings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm uppercase tracking-widest text-accent">
            2026/27 League Phase
          </p>
          <h1 className="font-display text-4xl uppercase tracking-tight text-text sm:text-5xl">
            Live Table
          </h1>
        </div>
        <UpdatedBadge source={source} updatedAt={updatedAt} />
      </div>

      {source === "fallback" && standings.length < 36 && (
        <p className="mb-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          Showing the top {standings.length} clubs from cached fallback data —
          the live API is temporarily unavailable, so the rest of the table
          isn&apos;t shown rather than guessed.
        </p>
      )}

      <StandingsTable standings={standings} />
    </div>
  );
}
