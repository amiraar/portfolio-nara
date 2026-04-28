/**
 * components/portfolio/Education.jsx — Education section.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

export default function Education() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);
  useRevealOnScroll(sectionRef, 0.1);

  return (
    <section id="education" className="py-28 max-w-6xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="flex flex-col md:flex-row md:items-center gap-10">
          <div className="relative">
            <span className="font-display text-8xl font-light text-accent/10">05</span>
            <span className="absolute left-1 top-10 font-mono text-xs text-accent tracking-widest">
              Education
            </span>
          </div>

          <div className="flex-1">
            <h3 className="font-display text-2xl font-medium text-text-primary">
              {data.university}
            </h3>
            <p className="text-text-muted text-base mt-1">{data.degree}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="glass-card px-3 py-1.5 rounded-full font-mono text-xs">GPA {data.gpa}</span>
              <span className="glass-card px-3 py-1.5 rounded-full font-mono text-xs">{data.period}</span>
              <span className="glass-card px-3 py-1.5 rounded-full font-mono text-xs">{data.location}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
