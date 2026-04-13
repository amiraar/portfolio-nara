/**
 * components/portfolio/Education.jsx — Education card section only.
 * Contact and Footer have been extracted into their own components.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import PortfolioSectionHeader from "@/components/shared/PortfolioSectionHeader";

export default function Education() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);
  useRevealOnScroll(sectionRef, 0.1);

  return (
    <section id="education" className="py-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <PortfolioSectionHeader number="05" title="Education" />

        <div className="p-6 rounded-xl border border-border bg-surface/60 max-w-md">
          <p className="font-mono text-xs text-accent mb-4 tracking-wider uppercase">Education</p>
          <h3 className="font-display text-xl font-medium text-text-primary leading-snug">
            {data.university}
          </h3>
          <p className="text-text-muted text-sm mt-1">{data.degree}</p>
          <div className="mt-5 space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-xs text-text-muted">GPA</span>
              <span className="font-mono text-sm text-accent">{data.gpa}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-xs text-text-muted">Period</span>
              <span className="font-mono text-sm text-text-muted">{data.period}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-text-muted">Location</span>
              <span className="font-mono text-sm text-text-muted">{data.location}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
