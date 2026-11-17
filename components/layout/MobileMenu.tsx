"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Menu, X } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-media-query";
import { isNavLinkActive } from "@/lib/nav-active";

interface NavLink {
  href: string;
  label: string;
}

/**
 * Full-screen mobile navigation.
 *
 * The overlay is rendered through a portal into <body>. It must not live
 * inside the header: the header's frosted-glass `backdrop-filter` makes it the
 * containing block for `position: fixed` descendants, which shrank the
 * overlay's background to the header's 60px height while the links spilled
 * out, unstyled, over the page underneath.
 */
function subscribeNoop() {
  return () => {};
}

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const menuLinks = [{ href: "/", label: "Home" }, ...links];

  // Portals need document.body, which only exists in the browser: false during
  // server render and hydration, true afterwards.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  // Close on route change (e.g. back/forward navigation while open). Adjusted
  // during render — React's sanctioned way to reset state when a value
  // changes — rather than in an effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const container = overlayRef.current;
    const focusable = container
      ? Array.from(container.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
      : [];
    focusable[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    const trigger = triggerRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const listVariants = {
    hidden: {},
    visible: {
      transition: reducedMotion ? {} : { staggerChildren: 0.04, delayChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: reducedMotion ? 0 : -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: reducedMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-[300] flex flex-col overflow-y-auto overscroll-contain bg-bg md:hidden"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            backgroundImage:
              "radial-gradient(120% 60% at 50% 0%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 60%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2 sm:px-6">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="font-display text-lg uppercase tracking-wide text-text"
            >
              Champions <span className="text-accent">Zone</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-2"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 px-4 pt-4 sm:px-6">
            <p className="px-3 pb-2 font-display text-xs uppercase tracking-widest text-muted">
              2026/27 Season
            </p>
            <motion.ul variants={listVariants} initial="hidden" animate="visible">
              {menuLinks.map((link) => {
                const active =
                  link.href === "/" ? pathname === "/" : isNavLinkActive(pathname, link.href);
                return (
                  <motion.li key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`group flex min-h-14 items-center justify-between rounded-xl px-3 font-display text-2xl uppercase tracking-tight transition-colors ${
                        active
                          ? "bg-surface text-accent shadow-[inset_3px_0_0_var(--accent)]"
                          : "text-text hover:bg-surface/60 active:bg-surface"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight
                        className={`h-5 w-5 transition-transform group-hover:translate-x-0.5 ${
                          active ? "text-accent" : "text-muted"
                        }`}
                        aria-hidden
                      />
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </nav>

          <div className="mt-6 border-t border-line px-7 py-5 text-xs text-muted sm:px-9">
            Unofficial fan site · Built by Bana Owen
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-text transition-colors hover:bg-surface-2 md:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
