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

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(Math.min(pct, 100));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-35% 0px -55% 0px" }
      );
      obs.observe(el);
      return obs;
    }).filter(Boolean);
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        scrolled || menuOpen
          ? "glass-card shadow-[0_1px_0_rgb(var(--color-border)/0.5)]"
          : "bg-transparent"
      )}
    >
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-3 focus:py-2 focus:text-xs focus:rounded-full focus:bg-surface focus:text-text-primary"
      >
        Skip to content
      </a>

      {/* Scroll progress */}
      <div
        className="fixed top-0 left-0 z-50 h-[1.5px] bg-gradient-to-r from-accent to-accent-2 transition-all duration-75 pointer-events-none"
        style={{ width: `${scrollPct}%` }}
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 h-[52px] flex items-center justify-between">
        {/* Wordmark */}
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMenuOpen(false); }}
          className="group flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          aria-label="Scroll to top"
        >
          <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center">
            <span className="font-mono text-[9px] tracking-wider text-accent font-medium">MA</span>
          </span>
          <span className="hidden sm:block font-display italic text-[11px] text-text-muted group-hover:text-text-primary transition-colors">
            Kurniawan
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={clsx(
                "relative px-3 py-1.5 text-[11px] font-medium tracking-wide rounded-md transition-all duration-200",
                active === id
                  ? "text-accent"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {label}
              {active === id && (
                <span className="absolute bottom-0.5 left-3 right-3 h-px bg-accent rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-text-muted hover:border-accent/35 hover:text-accent transition-colors"
          >
            {theme === "dark" ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* CTA */}
          <a
            href="mailto:amrlkurniawn19@gmail.com"
            className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-accent bg-accent/8 border border-accent/25 px-3.5 py-1.5 rounded-full hover:bg-accent hover:text-background transition-all duration-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Available
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden w-7 h-7 flex flex-col items-center justify-center gap-1.5 rounded-md hover:bg-surface-2 transition-colors"
            aria-label="Toggle menu"
          >
            <span className={clsx("block w-4 h-px bg-text-primary transition-all duration-300", menuOpen && "rotate-45 translate-y-[5px]")} />
            <span className={clsx("block w-4 h-px bg-text-primary transition-all duration-300", menuOpen && "opacity-0")} />
            <span className={clsx("block w-4 h-px bg-text-primary transition-all duration-300", menuOpen && "-rotate-45 -translate-y-[5px]")} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "sm:hidden overflow-hidden transition-all duration-300 border-t border-border/40 bg-background/95 backdrop-blur-xl",
          menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 py-3 flex flex-col gap-0.5">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={clsx(
                "text-left px-2 py-2.5 text-sm rounded-md transition-colors",
                active === id
                  ? "text-accent font-medium"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {label}
            </button>
          ))}
          <a
            href="mailto:amrlkurniawn19@gmail.com"
            className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-accent px-2 py-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Available for work
          </a>
        </div>
      </div>
    </nav>
  );
}
