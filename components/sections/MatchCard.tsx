import Image from "next/image";
import type { Match } from "@/types";
import { LocalTime } from "@/components/sections/LocalTime";

const LIVE_STATUSES = new Set(["IN_PLAY", "PAUSED"]);

export function MatchCard({ match }: { match: Match }) {
  const isLive = LIVE_STATUSES.has(match.status);
  const isFinished = match.status === "FINISHED";

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Image
          src={match.homeTeam.crest}
          alt={`${match.homeTeam.name} crest`}
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 object-contain"
        />
        <span className="truncate text-sm text-text">{match.homeTeam.shortName}</span>
      </div>

      <div className="flex flex-col items-center gap-1 px-2 text-center">
        {isLive && (
          <span className="flex items-center gap-1 rounded-full bg-out/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-out">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-out" aria-hidden />
            Live
          </span>
        )}
        {isFinished || isLive ? (
          <span className="tabular text-lg font-semibold text-text">
            {match.score.fullTime.home ?? 0}
            {" – "}
            {match.score.fullTime.away ?? 0}
          </span>
        ) : (
          <span className="text-xs text-muted">
            <LocalTime utcDate={match.utcDate} />
          </span>
        )}
        {match.venue && <span className="text-[11px] text-muted">{match.venue}</span>}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span className="truncate text-sm text-text">{match.awayTeam.shortName}</span>
        <Image
          src={match.awayTeam.crest}
          alt={`${match.awayTeam.name} crest`}
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 object-contain"
        />
      </div>
    </div>
  );
}
