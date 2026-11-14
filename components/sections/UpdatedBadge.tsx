export function UpdatedBadge({
  source,
  updatedAt,
}: {
  source: "live" | "fallback";
  updatedAt: string;
}) {
  const formatted = new Date(updatedAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
      <span
        className={`h-1.5 w-1.5 rounded-full ${source === "live" ? "bg-qualify" : "bg-playoff"}`}
        aria-hidden
      />
      {source === "live" ? "Live" : "Fallback data"} · Updated {formatted}
    </span>
  );
}
