import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="font-display text-base uppercase tracking-wide text-text">
              Champions <span className="text-accent">Zone</span>
            </p>
            <p className="max-w-md">
              Unofficial fan site. Not affiliated with or endorsed by UEFA.
              Club names and crests belong to their owners. Photo credits on
              the{" "}
              <Link href="/credits" className="underline hover:text-text">
                Credits
              </Link>{" "}
              page.
            </p>
          </div>
          <div className="space-y-2 sm:text-right">
            <p>Football data provided by the Football-Data.org API.</p>
            <nav className="flex flex-wrap gap-4 sm:justify-end">
              <Link href="/credits" className="hover:text-text">
                Credits
              </Link>
              <Link href="/clubs" className="hover:text-text">
                Clubs
              </Link>
              <Link href="/history" className="hover:text-text">
                History
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
