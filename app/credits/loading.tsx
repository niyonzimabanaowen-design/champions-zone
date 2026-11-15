export default function CreditsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 h-10 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
