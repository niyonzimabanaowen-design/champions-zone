export default function ClubsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 h-10 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="mb-6 flex gap-3">
        <div className="h-10 w-64 animate-pulse rounded-full bg-surface-2" />
        <div className="h-10 w-52 animate-pulse rounded-full bg-surface-2" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
