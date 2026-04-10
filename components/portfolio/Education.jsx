/**
 * components/portfolio/Education.jsx — Education card section only.
 * Contact and Footer have been extracted into their own components.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";

export default function Education() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("revealed"); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="education" className="py-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="flex items-center gap-4 mb-14">
          <p className="font-mono text-accent text-xs tracking-widest uppercase">05 — Education</p>
          <div className="gold-divider flex-1 max-w-[60px]" />
        </div>

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
