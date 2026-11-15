export default function ClubLoading() {
  return (
    <div>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-surface py-20">
        <div className="h-20 w-20 animate-pulse rounded-full bg-surface-2" />
        <div className="h-8 w-56 animate-pulse rounded-lg bg-surface-2" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
