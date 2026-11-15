import type { Metadata } from "next";
import { getStandingsSplits } from "@/lib/data";
import { StandingsExplorer } from "@/components/sections/StandingsExplorer";
import { UpdatedBadge } from "@/components/sections/UpdatedBadge";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

const TITLE = "Champions League 2026/27 Table & League Phase Standings";
const DESCRIPTION =
  "See the live UEFA Champions League 2026/27 table, updated as league-phase results come in, plus home, away, and recent-form splits for every club.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/standings" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/standings" }),
  twitter: pageTwitter({ title: TITLE, description: DESCRIPTION }),
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Standings", path: "/standings" },
]);

export default async function StandingsPage() {
  const { full, home, away, source, updatedAt } = await getStandingsSplits();

  return (
    <div>
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <ParallaxHeader
        src="/images/standings/aerial-pitch.jpg"
        alt="Aerial view of a football pitch with crisp white line markings"
        eyebrow="2026/27 League Phase"
        title="Champions League Standings"
        sizes="(max-width: 639px) 360px, 100vw"
      >
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted sm:text-base">
          This page shows the live Champions League table for the 2026/27
          league phase, updated as results come in. Switch between the full
          table, home and away splits, and recent form to see how every club
          is performing.
        </p>
      </ParallaxHeader>

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
