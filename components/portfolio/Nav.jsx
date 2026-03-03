/**
 * components/portfolio/Nav.jsx — Sticky navigation bar with active section highlight.
 * Uses IntersectionObserver to track which section is in view.
 */

"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
];

export default function Nav() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  // Track scroll position for nav background + progress bar
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
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
        scrolled || menuOpen
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-accent/60 transition-all duration-100 pointer-events-none"
        style={{ width: `${scrollPct}%` }}
      />
      <div className="max-w-5xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMenuOpen(false); }}
          className="font-display text-sm font-medium text-text-primary hover:text-accent transition-colors"
        >
          Amirul<span className="text-accent">.</span>
        </button>

        {/* Desktop section links */}
        <div className="hidden sm:flex items-center gap-6">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={clsx(
                "font-sans text-xs transition-colors duration-200",
                active === id
                  ? "text-accent"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* CTA */}
          <a
            href="mailto:amrlkurniawn19@gmail.com"
            className="font-mono text-xs text-accent border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors"
          >
            Hire me
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
