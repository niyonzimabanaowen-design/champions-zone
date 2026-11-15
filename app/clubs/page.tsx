import type { Metadata } from "next";
import { getTeams } from "@/lib/data";
import { ClubsGrid } from "@/components/sections/ClubsGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

const TITLE = "Champions League 2026/27 Clubs: All 36 Teams";
const DESCRIPTION =
  "Explore all 36 clubs in the UEFA Champions League 2026/27 league phase, with crests, stadiums, countries, and a link to every club profile page.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/clubs" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/clubs" }),
  twitter: pageTwitter({ title: TITLE, description: DESCRIPTION }),
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Clubs", path: "/clubs" },
]);

export default async function ClubsPage() {
  const { data: teams, source } = await getTeams();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <div className="mb-8">
        <p className="font-display text-sm uppercase tracking-widest text-accent">
          2026/27 League Phase
        </p>
        <h1 className="font-display text-4xl uppercase tracking-tight text-text sm:text-5xl">
          Champions League Clubs
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
