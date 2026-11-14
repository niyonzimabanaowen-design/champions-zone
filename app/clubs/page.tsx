import type { Metadata } from "next";
import { getTeams } from "@/lib/data";
import { ClubsGrid } from "@/components/sections/ClubsGrid";

export const metadata: Metadata = {
  title: "Clubs",
  description: "All 36 clubs in the 2026/27 UEFA Champions League.",
};

export default async function ClubsPage() {
  const { data: teams, source } = await getTeams();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-display text-sm uppercase tracking-widest text-accent">
          2026/27 League Phase
        </p>
        <h1 className="font-display text-4xl uppercase tracking-tight text-text sm:text-5xl">
          Clubs
        </h1>
      </div>

      {source === "fallback" ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">
          Live club data isn&apos;t available right now, so the clubs list
          can&apos;t be shown — team details aren&apos;t part of the fallback
          seed.
        </p>
      ) : (
        <ClubsGrid teams={teams} />
      )}
    </div>
  );
}
