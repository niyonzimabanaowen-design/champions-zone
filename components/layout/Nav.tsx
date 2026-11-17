"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { isNavLinkActive } from "@/lib/nav-active";

const LINKS = [
  { href: "/standings", label: "Standings" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/clubs", label: "Clubs" },
  { href: "/stats", label: "Stats" },
  { href: "/history", label: "History" },
  { href: "/final", label: "Final" },
  { href: "/predictor", label: "Predictor" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            className="font-display text-lg uppercase tracking-wide text-text"
          >
            Champions <span className="text-accent">Zone</span>
          </Link>
          <ul className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    aria-current={active ? "page" : undefined}
                    className={`text-sm transition-colors ${
                      active
                        ? "text-accent underline underline-offset-8 decoration-2"
                        : "text-muted hover:text-text"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <MobileMenu links={LINKS} />
        </nav>
      </div>
    </header>
  );
}
