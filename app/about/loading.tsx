export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 h-10 w-64 animate-pulse rounded-lg bg-surface-2" />
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
  );
}
