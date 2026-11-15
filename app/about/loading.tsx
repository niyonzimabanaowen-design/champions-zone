export default function AboutLoading() {
  return (
    <div>
      <div className="h-[280px] animate-pulse bg-surface sm:h-[340px]" />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-surface-2" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-surface-2" />
            <div className="h-4 w-48 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
        <div className="mb-16 h-24 animate-pulse rounded-2xl bg-surface" />
        <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
