import type { Metadata } from "next";
import { getCurrentMatchday, getMatches } from "@/lib/data";
import { ParallaxHeader } from "@/components/motion/ParallaxHeader";
import { PredictorBoard } from "@/components/sections/PredictorBoard";

export const metadata: Metadata = {
  title: "Predictor",
  description: "Predict scores for the next UEFA Champions League matchday.",
};

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
      <ParallaxHeader
        src="/images/predictor/fans-celebrating.jpg"
        alt="Football fans celebrating with a green smoke flare outside a stadium"
        eyebrow="Matchday Predictor"
        title="Predictor"
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
