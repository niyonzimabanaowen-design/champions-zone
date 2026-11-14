import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getClubDetail } from "@/lib/data";
import { getClubStadiumPhoto } from "@/lib/club-content";
import { getClubAccentColor } from "@/lib/club-color";
import { ClubCrest } from "@/components/sections/ClubCrest";
import { MatchCard } from "@/components/sections/MatchCard";
import { PositionChart } from "@/components/sections/PositionChart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getClubDetail(slug);
  if (result === "not-found" || result === "unavailable") {
    return { title: "Club" };
  }
  return {
    title: result.team.name,
    description: `${result.team.name} in the 2026/27 UEFA Champions League.`,
  };
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getClubDetail(slug);

  if (result === "not-found") notFound();

  if (result === "unavailable") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="rounded-xl border border-line bg-surface px-4 py-6 text-sm text-muted">
          Live club data isn&apos;t available right now, so this page
          can&apos;t be shown.
        </p>
      </div>
    );
  }

  const { team, standing, matches, topScorer, positionHistory } = result;
  const stadiumPhoto = getClubStadiumPhoto(team.slug);
  const accent = getClubAccentColor(team.clubColors);

  const finished = matches.filter((m) => m.status === "FINISHED");
  const upcoming = matches.filter((m) => m.status !== "FINISHED");

  return (
    <div>
      <div className="relative isolate overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10">
          {stadiumPhoto ? (
            <Image
              src={stadiumPhoto}
              alt={`${team.venue ?? team.name}'s stadium`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-surface" />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 35%, transparent) 0%, var(--bg) 85%)`,
            }}
          />
          <div className="absolute inset-0 bg-bg/55" />
          <div className="grain absolute inset-0" />
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <ClubCrest teamId={team.id} src={team.crest} alt={`${team.name} crest`} size={88} />
          <div>
            <h1 className="font-display text-4xl uppercase tracking-tight text-text sm:text-5xl">
              {team.name}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {team.venue ? `${team.venue} · ` : ""}
              {team.country}
              {team.founded ? ` · Founded ${team.founded}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {standing && (
          <div className="mb-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
            <StatTile label="Position" value={`#${standing.position}`} />
            <StatTile label="Played" value={String(standing.playedGames)} />
            <StatTile
              label="W-D-L"
              value={`${standing.won}-${standing.draw}-${standing.lost}`}
            />
            <StatTile
              label="GD"
              value={
                standing.goalDifference > 0
                  ? `+${standing.goalDifference}`
                  : String(standing.goalDifference)
              }
            />
            <StatTile label="Points" value={String(standing.points)} />
            <StatTile
              label="Top scorer"
              value={topScorer ? `${topScorer.player.name} (${topScorer.goals})` : "—"}
              small
            />
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
              Results
            </h2>
            {finished.length === 0 ? (
              <p className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                No results yet this league phase.
              </p>
            ) : (
              <div className="space-y-3">
                {finished
                  .slice()
                  .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
                  .map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
              </div>
            )}

            {upcoming.length > 0 && (
              <>
                <h2 className="mb-4 mt-10 font-display text-2xl uppercase tracking-tight text-text">
                  Upcoming
                </h2>
                <div className="space-y-3">
                  {upcoming
                    .slice()
                    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
                    .map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="mb-4 font-display text-2xl uppercase tracking-tight text-text">
              Position by Matchday
            </h2>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <PositionChart data={positionHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-3 text-center">
      <p
        className={`tabular font-display text-text ${small ? "truncate text-sm" : "text-xl sm:text-2xl"}`}
        title={value}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
