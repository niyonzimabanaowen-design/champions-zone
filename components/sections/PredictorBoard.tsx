"use client";

import Image from "next/image";
import { useLocalStorageState } from "@/lib/use-local-storage";
import { PointsCelebration } from "@/components/motion/PointsCelebration";
import type { Match } from "@/types";

interface Prediction {
  home: number;
  away: number;
}
type Predictions = Record<number, Prediction>;

/** Exact score = 3, correct result (win/draw/loss) = 1, otherwise 0 — the
 * site's own scoring rule, not data from the API. */
function outcomeScore(pred: Prediction, actual: Prediction): number {
  if (pred.home === actual.home && pred.away === actual.away) return 3;
  const predSign = Math.sign(pred.home - pred.away);
  const actualSign = Math.sign(actual.home - actual.away);
  return predSign === actualSign ? 1 : 0;
}

export function PredictorBoard({ matchday, matches }: { matchday: number; matches: Match[] }) {
  const [predictions, setPredictions] = useLocalStorageState<Predictions>(
    `cz-predictions-md-${matchday}`,
    {},
  );

  function updatePrediction(matchId: number, field: "home" | "away", value: number) {
    const current = predictions[matchId] ?? { home: 0, away: 0 };
    setPredictions({ ...predictions, [matchId]: { ...current, [field]: Math.max(0, value) } });
  }

  const allFinished = matches.length > 0 && matches.every((m) => m.status === "FINISHED");
  const totalPoints = matches.reduce((sum, m) => {
    const pred = predictions[m.id];
    if (
      !pred ||
      m.status !== "FINISHED" ||
      m.score.fullTime.home === null ||
      m.score.fullTime.away === null
    ) {
      return sum;
    }
    return sum + outcomeScore(pred, { home: m.score.fullTime.home, away: m.score.fullTime.away });
  }, 0);

  return (
    <div>
      {allFinished && <PointsCelebration points={totalPoints} maxPoints={matches.length * 3} />}

      <div className="space-y-3">
        {matches.map((m) => {
          const pred = predictions[m.id];
          const isFinished = m.status === "FINISHED";
          const points =
            isFinished && pred && m.score.fullTime.home !== null && m.score.fullTime.away !== null
              ? outcomeScore(pred, { home: m.score.fullTime.home, away: m.score.fullTime.away })
              : null;

          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Image
                  src={m.homeTeam.crest}
                  alt=""
                  width={22}
                  height={22}
                  className="h-5.5 w-5.5 shrink-0 object-contain"
                />
                <span className="truncate text-sm text-text">{m.homeTeam.shortName}</span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {isFinished ? (
                  <span className="tabular text-sm text-text">
                    {pred ? `${pred.home}–${pred.away}` : "No pick"}
                  </span>
                ) : (
                  <>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      inputMode="numeric"
                      value={pred?.home ?? ""}
                      onChange={(e) => updatePrediction(m.id, "home", Number(e.target.value) || 0)}
                      className="w-12 rounded-md border border-line bg-surface-2 px-2 py-1 text-center text-sm text-text focus:border-accent focus:outline-none"
                      aria-label={`Predicted goals for ${m.homeTeam.shortName}`}
                    />
                    <span className="text-muted">–</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      inputMode="numeric"
                      value={pred?.away ?? ""}
                      onChange={(e) => updatePrediction(m.id, "away", Number(e.target.value) || 0)}
                      className="w-12 rounded-md border border-line bg-surface-2 px-2 py-1 text-center text-sm text-text focus:border-accent focus:outline-none"
                      aria-label={`Predicted goals for ${m.awayTeam.shortName}`}
                    />
                  </>
                )}
                {points !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      points === 3
                        ? "bg-qualify/20 text-qualify"
                        : points === 1
                          ? "bg-playoff/20 text-playoff"
                          : "bg-out/20 text-out"
                    }`}
                  >
                    +{points}
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                <span className="truncate text-sm text-text">{m.awayTeam.shortName}</span>
                <Image
                  src={m.awayTeam.crest}
                  alt=""
                  width={22}
                  height={22}
                  className="h-5.5 w-5.5 shrink-0 object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
