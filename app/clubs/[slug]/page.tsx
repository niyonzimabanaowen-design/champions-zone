import type { Metadata } from "next";
import Image from "next/image";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getClubDetail } from "@/lib/data";
import { getClubPhotoMeta } from "@/lib/club-content";
import { getClubAccentColor } from "@/lib/club-color";
import { ClubCrest } from "@/components/sections/ClubCrest";
import { MatchCard } from "@/components/sections/MatchCard";
import { InView } from "@/components/motion/InView";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

// Recharts is a large dependency — split into its own chunk and, below, only
// mounted once scrolled into view, rather than bundling or fetching it as
// part of this page's initial load.
const PositionChart = dynamic(() =>
  import("@/components/sections/PositionChart").then((m) => m.PositionChart),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getClubDetail(slug);
  if (result === "not-found" || result === "unavailable") {
    return { title: "Club", robots: { index: false, follow: false } };
  }

  const { team } = result;
  const title = `${team.name} in the Champions League 2026/27: Results, Stats & Form`;
  const description = `${team.name} in the UEFA Champions League 2026/27: league-phase results, current form, top scorer, and position in the table, from live match data.`;
  const canonical = `/clubs/${team.slug}`;

  const ogTitle = `${team.name} — Champions League 2026/27`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: pageOpenGraph({
      title: ogTitle,
      description,
      path: canonical,
      imageTitle: team.name,
    }),
    twitter: pageTwitter({ title: ogTitle, description, imageTitle: team.name }),
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
  const photoMeta = getClubPhotoMeta(team.slug);
  const stadiumPhoto = photoMeta?.stadiumPhoto;
  const stadiumPhotoAlt =
    photoMeta?.generic && photoMeta.alt
      ? photoMeta.alt
      : `${team.venue ?? team.name}'s stadium`;
  const accent = getClubAccentColor(team.clubColors);

  const finished = matches.filter((m) => m.status === "FINISHED");
  const upcoming = matches.filter((m) => m.status !== "FINISHED");

  return (
    <div>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Clubs", path: "/clubs" },
          { name: team.name, path: `/clubs/${team.slug}` },
        ])}
      />
      <div className="relative isolate overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10">
          {stadiumPhoto ? (
            <Image
              src={stadiumPhoto}
              alt={stadiumPhotoAlt}
              fill
              priority
              fetchPriority="high"
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
              <InView fallback={<div className="h-48 w-full animate-pulse rounded-xl bg-surface-2" />}>
                <PositionChart data={positionHistory} />
              </InView>
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
