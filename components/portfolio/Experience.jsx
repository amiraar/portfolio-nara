/**
 * components/portfolio/Experience.jsx — Work experience timeline.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import PortfolioSectionHeader from "@/components/shared/PortfolioSectionHeader";

export default function Experience() {
  const sectionRef = useRef(null);
  const { data: items } = usePortfolioContent("experience", PORTFOLIO_DEFAULTS.experience);
  useRevealOnScroll(sectionRef, 0.08);

  return (
    <section id="experience" className="py-28 bg-surface/40">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div ref={sectionRef} className="section-reveal">
          <PortfolioSectionHeader number="02" title="Experience" />

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border hidden sm:block" />

            <div className="space-y-10">
              {items.map((exp, i) => (
                <ExperienceItem key={i} exp={exp} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceItem({ exp }) {
  return (
    <div className="sm:pl-8 relative group">
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border border-border bg-surface hidden sm:flex items-center justify-center group-hover:border-accent/50 transition-colors">
        <div className={`w-1.5 h-1.5 rounded-full ${exp.current ? "bg-accent animate-pulse" : "bg-text-muted"}`} />
      </div>

      <div className="p-5 rounded-xl border border-border bg-surface/60 hover:border-accent/20 transition-all duration-300">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-display text-lg font-medium text-text-primary">{exp.role}</h3>
            <p className="text-accent text-sm font-mono mt-0.5">{exp.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {exp.current && (
              <span className="font-mono text-[10px] text-accent border border-accent/30 px-2 py-0.5 rounded-full bg-accent/5">
                Current
              </span>
            )}
            <span className="font-mono text-xs text-text-muted whitespace-nowrap">{exp.period}</span>
          </div>
        </div>

        <p className="text-text-muted text-sm leading-relaxed mb-4">{exp.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {exp.tags.map((tag) => (
            <span key={tag} className="skill-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
