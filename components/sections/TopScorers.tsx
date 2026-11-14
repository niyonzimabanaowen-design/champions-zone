import Image from "next/image";
import type { Scorer } from "@/types";

export function TopScorers({ scorers }: { scorers: Scorer[] }) {
  const maxGoals = Math.max(...scorers.map((s) => s.goals), 1);

  return (
    <ul className="space-y-3">
      {scorers.map((scorer, i) => (
        <li key={scorer.player.id} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-center text-xs tabular text-muted">{i + 1}</span>
          <Image
            src={scorer.team.crest}
            alt={`${scorer.team.name} crest`}
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-text">{scorer.player.name}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(scorer.goals / maxGoals) * 100}%` }}
              />
            </div>
          </div>
          <span className="tabular w-6 shrink-0 text-right text-sm font-semibold text-text">
            {scorer.goals}
          </span>
        </li>
      ))}
    </ul>
  );
}
