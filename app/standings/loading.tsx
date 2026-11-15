export default function StandingsLoading() {
  return (
    <div>
      <div className="h-64 animate-pulse bg-surface sm:h-80" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <div className="h-6 w-40 animate-pulse rounded-full bg-surface-2" />
        </div>
        <div className="h-[600px] animate-pulse rounded-2xl bg-surface" />
      </div>
    </div>
  );
}
