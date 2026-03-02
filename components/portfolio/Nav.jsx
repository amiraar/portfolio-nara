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
  { id: "education", label: "Contact" },
];

export default function Nav() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for nav background
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
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
  }

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display text-sm font-medium text-text-primary hover:text-accent transition-colors"
        >
          Amirul<span className="text-accent">.</span>
        </button>

        {/* Section links */}
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

        {/* CTA */}
        <a
          href="mailto:amrlkurniawn19@gmail.com"
          className="font-mono text-xs text-accent border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors"
        >
          Hire me
        </a>
      </div>
    </nav>
  );
}
