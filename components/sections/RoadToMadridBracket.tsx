const STAGES = [
  "Knockout Play-off",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Final",
];

/**
 * football-data.org only has LEAGUE_STAGE matches so far — no knockout
 * pairings exist yet (they're decided after Matchday 8). So this honestly
 * shows every round as TBD rather than guessing matchups, and fills in for
 * real once the data exists.
 */
export function RoadToMadridBracket() {
  return (
    <div>
      <p className="mb-6 text-sm text-muted">
        The knockout bracket isn&apos;t set yet — pairings are decided after
        the league phase ends (Matchday 8, 27 Jan 2027). This fills in here
        once they&apos;re confirmed.
      </p>
      <div className="grid gap-3 sm:grid-cols-5">
        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className="rounded-xl border border-line bg-surface px-3 py-4 text-center"
          >
            <span className="font-display text-xs text-accent">0{i + 1}</span>
            <p className="mt-1 text-sm font-medium text-text">{stage}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-muted">TBD</p>
          </div>
        ))}
      </div>
    </div>
  );
}
