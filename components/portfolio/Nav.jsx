/**
 * components/portfolio/Nav.jsx — Sticky navigation bar with active section highlight.
 * Uses IntersectionObserver to track which section is in view.
 */

"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { useTheme } from "@/components/ThemeProvider";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
];

export default function Nav() {
  const { theme, toggle } = useTheme();
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Track scroll position for nav background + progress bar
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 100);
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(pct, 100));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -50% 0px" }
      );
      obs.observe(el);
      return obs;
    }).filter(Boolean);

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  function scrollTo(id) {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled || menuOpen ? "glass-card" : "bg-transparent"
      )}
    >
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-3 focus:py-2 focus:text-xs focus:rounded-full focus:bg-surface focus:text-text-primary"
      >
        Skip to content
      </a>

      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-[2px] bg-accent/60 transition-all duration-100 pointer-events-none"
        style={{ width: `${scrollPct}%` }}
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setMenuOpen(false);
          }}
          className="flex flex-col items-start leading-none hover:opacity-90 transition-opacity"
          aria-label="Scroll to top"
        >
          <span className="font-mono text-xs tracking-widest uppercase text-accent">MA</span>
          <span className="font-display text-[10px] italic text-text-muted">Kurniawan</span>
        </button>

        {/* Desktop section links */}
        <div className="hidden sm:flex items-center gap-6">
          {SECTIONS.map(({ id, label }, index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="group flex items-center gap-2"
              >
                <span
                  className={clsx(
                    "font-mono text-[10px] transition-colors duration-200",
                    active === id ? "text-accent" : "text-text-muted"
                  )}
                >
                  {number}
                </span>
                <span className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-300 group-hover:max-w-[80px]">
                  <span className="block translate-x-2 text-[10px] text-text-muted transition-transform duration-300 group-hover:translate-x-0">
                    {label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-colors"
          >
            {theme === "dark" ? (
              /* Sun */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              /* Moon */
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* CTA */}
          <a
            href="mailto:amrlkurniawn19@gmail.com"
            className="flex items-center font-mono text-xs text-accent border border-accent/40 px-4 py-1.5 rounded-full hover:bg-accent hover:text-white transition-all duration-300"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block mr-2" />
            Available for work &rarr;
          </a>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-surface transition-colors"
            aria-label="Toggle menu"
          >
            <span className={clsx("block w-5 h-px bg-text-primary transition-all duration-300", menuOpen && "rotate-45 translate-y-[5px]")} />
            <span className={clsx("block w-5 h-px bg-text-primary transition-all duration-300", menuOpen && "opacity-0")} />
            <span className={clsx("block w-5 h-px bg-text-primary transition-all duration-300", menuOpen && "-rotate-45 -translate-y-[5px]")} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={clsx(
          "sm:hidden overflow-hidden transition-all duration-300 border-b border-border",
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 pb-4 flex flex-col gap-1">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={clsx(
                "text-left py-2.5 text-sm font-medium border-b border-border/50 last:border-0 transition-colors",
                active === id ? "text-accent" : "text-text-muted"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
