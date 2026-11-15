import Link from "next/link";
import { MobileMenu } from "@/components/layout/MobileMenu";

const LINKS = [
  { href: "/standings", label: "Standings" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/clubs", label: "Clubs" },
  { href: "/stats", label: "Stats" },
  { href: "/history", label: "History" },
  { href: "/final", label: "Final" },
  { href: "/predictor", label: "Predictor" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-display text-lg uppercase tracking-wide text-text"
          >
            Champions <span className="text-accent">Zone</span>
          </Link>
          <ul className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted transition-colors hover:text-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <MobileMenu links={LINKS} />
        </nav>
      </div>
    </header>
  );
}
