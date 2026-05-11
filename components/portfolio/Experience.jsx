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
  const { data: items } = usePortfolioContent("experience", PORTFOLIO_DEFAULTS.experience);
  useRevealOnScroll(sectionRef, 0.08);

  return (
    <section id="experience" className="py-28 bg-surface/40 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div ref={sectionRef} className="section-reveal">
          <div className="flex items-center gap-4 mb-10">
            <span className="font-mono text-[11px] text-accent">02</span>
            <span className="h-px w-10 bg-accent/50" />
            <h2 className="font-display text-4xl text-text-primary">Experience</h2>
          </div>

          <div className="flex flex-col gap-6">
            {items.map((exp, i) => (
              <ExperienceItem key={`${exp.company}-${exp.role}-${i}`} exp={exp} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceItem({ exp }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative flex items-start gap-4">
      <div className="relative flex w-6 justify-center">
        <span className="absolute top-0 bottom-0 w-px bg-accent/20" />
        <span className="relative mt-2 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(14,165,233,0.35)]" />
      </div>

      <article className="relative glass-card p-6 rounded-2xl transition-all group hover:border-accent/30 w-full">
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
    </div>
  );
}
