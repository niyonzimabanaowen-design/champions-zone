export default function FixturesLoading() {
  return (
    <div>
      <div className="h-64 animate-pulse bg-surface sm:h-80" />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex gap-2 border-b border-line pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-surface-2" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
