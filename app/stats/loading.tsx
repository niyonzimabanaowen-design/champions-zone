export default function StatsLoading() {
  return (
    <div>
      <div className="h-64 animate-pulse bg-surface sm:h-80" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-surface" />
          <div className="h-80 animate-pulse rounded-2xl bg-surface" />
        </div>
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-surface" />
      </div>
    </div>
  );
}
