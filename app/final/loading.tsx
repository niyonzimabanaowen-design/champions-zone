export default function FinalLoading() {
  return (
    <div>
      <div className="flex min-h-[90vh] animate-pulse items-center justify-center bg-surface">
        <div className="h-16 w-72 rounded-lg bg-surface-2" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-surface sm:row-span-2 sm:h-full" />
          <div className="h-40 animate-pulse rounded-2xl bg-surface" />
          <div className="h-40 animate-pulse rounded-2xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
