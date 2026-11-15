export default function PredictorLoading() {
  return (
    <div>
      <div className="h-64 animate-pulse bg-surface sm:h-80" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 h-4 w-72 animate-pulse rounded-full bg-surface-2" />
        <div className="space-y-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
