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
        {/* Section header */}
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] text-accent/70 tracking-widest">05</span>
          <span className="h-px w-8 bg-accent/40" />
          <h2 className="font-display text-4xl text-text-primary">Education</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
        </div>

        <div className="warm-card rounded-2xl p-7 lg:p-10 relative overflow-hidden">
          {/* Ghost number */}
          <span
            className="absolute right-6 bottom-0 font-display font-light select-none pointer-events-none leading-none italic"
            style={{ fontSize: "9rem", color: "rgb(var(--color-accent)/0.05)" }}
            aria-hidden="true"
          >
            05
          </span>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            {/* Degree icon */}
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent/8 border border-accent/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-accent))" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="font-display text-2xl font-medium text-text-primary">
                {data.university}
              </h3>
              <p className="text-text-muted text-[15px] mt-1">{data.degree}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="tag-pill">GPA {data.gpa}</span>
                <span className="tag-pill">{data.period}</span>
                <span className="tag-pill">{data.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
