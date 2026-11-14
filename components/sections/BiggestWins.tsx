import Image from "next/image";
import type { BigWin } from "@/lib/data";

export function BiggestWins({ wins }: { wins: BigWin[] }) {
  if (wins.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-muted">
        No results yet this league phase.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {wins.map((w, i) => {
        const margin = Math.abs(w.homeGoals - w.awayGoals);
        return (
          <div
            key={`${w.homeTeam.id}-${w.awayTeam.id}-${w.matchday}-${i}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Image
                src={w.homeTeam.crest}
                alt=""
                width={22}
                height={22}
                className="h-5.5 w-5.5 shrink-0 object-contain"
              />
              <span className="truncate text-sm text-text">{w.homeTeam.shortName}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2 px-2">
              <span className="tabular text-base font-semibold text-text">
                {w.homeGoals}–{w.awayGoals}
              </span>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                +{margin}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <span className="truncate text-sm text-text">{w.awayTeam.shortName}</span>
              <Image
                src={w.awayTeam.crest}
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
  );
}
