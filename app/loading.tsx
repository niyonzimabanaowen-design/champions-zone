export default function HomeLoading() {
  return (
    <div>
      <div className="h-[90vh] min-h-[600px] animate-pulse bg-surface" />
      <div className="h-11 border-b border-line bg-surface" />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mx-auto h-10 w-20 animate-pulse rounded-lg bg-surface-2" />
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-surface" />
          <div className="h-96 animate-pulse rounded-2xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
