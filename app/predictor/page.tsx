import type { Metadata } from "next";
import { getCurrentMatchday, getMatches } from "@/lib/data";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";
import { PredictorBoard } from "@/components/sections/PredictorBoard";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

const TITLE = "Champions League Predictor: Predict Matchday Scores";
const DESCRIPTION =
  "Predict every UEFA Champions League 2026/27 matchday score, saved right in your browser, and see how your picks score against the real results.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/predictor" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/predictor" }),
  twitter: pageTwitter({ title: TITLE, description: DESCRIPTION }),
};

const BREADCRUMB_JSON_LD = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Predictor", path: "/predictor" },
]);

export default async function PredictorPage() {
  // Fetched in parallel rather than waiting on currentMatchday first: both
  // calls hit the API regardless, so there's no reason to serialize them —
  // getMatches() with no matchday filter is then narrowed down once we know
  // which one is current.
  const [currentMatchday, { data: allMatches, source }] = await Promise.all([
    getCurrentMatchday(),
    getMatches(),
  ]);
  const matches = allMatches.filter((m) => m.matchday === currentMatchday);

  return (
    <div>
      <JsonLd data={BREADCRUMB_JSON_LD} />
      <ParallaxHeader
        src="/images/predictor/fans-celebrating.jpg"
        alt="Football fans celebrating with a green smoke flare outside a stadium"
        eyebrow="Matchday Predictor"
        title="Champions League Predictor"
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm text-muted">
          Predict every score for Matchday {currentMatchday}. Picks are saved
          in your browser — an exact score is worth 3 points, the correct
          result 1 point, and a miss nothing.
        </p>

        {matches.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">
            {source === "fallback"
              ? "No fixture-level fallback data is available — reconnect the live API to make predictions."
              : "No fixtures found for this matchday."}
          </p>
        ) : (
          <PredictorBoard matchday={currentMatchday} matches={matches} />
        )}
      </div>
    </div>
  );
}
