import Image from "next/image";
import type { Match } from "@/types";

/**
 * Broadcast-style results ticker. Pure CSS transform animation (no JS) so it
 * stays off the main thread — pauses on hover via a CSS-only rule and
 * collapses under prefers-reduced-motion via the motion-reduce: variant.
 */
export function ResultsTicker({ matches }: { matches: Match[] }) {
  if (matches.length === 0) return null;

  const items = [...matches, ...matches];

  return (
    <div className="group overflow-hidden border-b border-line bg-surface">
      <div className="flex w-max animate-ticker gap-10 py-3 group-hover:[animation-play-state:paused]">
        {items.map((m, i) => (
          <div key={`${m.id}-${i}`} className="flex shrink-0 items-center gap-2 text-sm">
            <span className="text-xs uppercase tracking-wide text-muted">MD{m.matchday}</span>
            <Image
              src={m.homeTeam.crest}
              alt=""
              width={18}
              height={18}
              className="h-4.5 w-4.5 object-contain"
            />
            <span className="text-text">{m.homeTeam.tla}</span>
            <span className="tabular font-semibold text-text">
              {m.score.fullTime.home}–{m.score.fullTime.away}
            </span>
            <span className="text-text">{m.awayTeam.tla}</span>
            <Image
              src={m.awayTeam.crest}
              alt=""
              width={18}
              height={18}
              className="h-4.5 w-4.5 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
