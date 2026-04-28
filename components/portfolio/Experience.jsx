/**
 * components/portfolio/Experience.jsx — Work experience timeline.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

export default function Experience() {
  const sectionRef = useRef(null);
  const scrollerRef = useRef(null);
  const { data: items } = usePortfolioContent("experience", PORTFOLIO_DEFAULTS.experience);
  useRevealOnScroll(sectionRef, 0.08);

  function scrollByCard(delta) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section id="experience" className="py-28 bg-surface/40 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div ref={sectionRef} className="section-reveal">
          <div className="flex items-center gap-4 mb-10">
            <span className="font-mono text-[11px] text-accent">02</span>
            <span className="h-px w-10 bg-accent/50" />
            <h2 className="font-display text-4xl text-text-primary">Experience</h2>
          </div>

          <div
            ref={scrollerRef}
            className="flex flex-col lg:flex-row gap-6 lg:overflow-x-auto lg:pb-6 lg:snap-x lg:snap-mandatory scrollbar-none"
          >
            {items.map((exp, i) => (
              <ExperienceItem key={`${exp.company}-${exp.role}-${i}`} exp={exp} />
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => scrollByCard(-400)}
              className="glass-card w-10 h-10 rounded-full flex items-center justify-center hover:border-accent/30 transition-all"
              aria-label="Scroll left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(400)}
              className="glass-card w-10 h-10 rounded-full flex items-center justify-center hover:border-accent/30 transition-all"
              aria-label="Scroll right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceItem({ exp }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="relative glass-card p-6 rounded-2xl transition-all group hover:border-accent/30 min-w-[320px] lg:min-w-[380px] w-full lg:w-auto snap-center flex-shrink-0">
      {exp.current ? (
        <span className="absolute top-4 right-4 font-mono text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.35)]">
          ● Now
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-xs text-accent">{exp.company}</span>
        <span className="font-mono text-xs text-text-muted whitespace-nowrap">{exp.period}</span>
      </div>

      <h3 className="font-display text-xl font-medium text-text-primary mt-3">{exp.role}</h3>

      <div className="w-8 h-px bg-accent/40 my-4" />

      <div
        className={clsx(
          "relative text-sm text-text-muted leading-relaxed",
          expanded ? "" : "line-clamp-3",
          !expanded && "after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-6 after:bg-gradient-to-t after:from-surface after:to-transparent"
        )}
      >
        {exp.description}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-3 text-[10px] font-mono text-accent hover:text-accent-hover transition-colors"
      >
        {expanded ? "Show less" : "Read more"}
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        {exp.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
