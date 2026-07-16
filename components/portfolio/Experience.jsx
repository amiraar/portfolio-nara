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
    <section id="experience" className="py-28 overflow-hidden" style={{ background: "rgb(var(--color-surface)/0.35)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div ref={sectionRef} className="section-reveal">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-[10px] text-accent/70 tracking-widest">02</span>
            <span className="h-px w-8 bg-accent/40" />
            <h2 className="font-display text-4xl text-text-primary">Experience</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
          </div>

          <div className="relative">
            {/* Vertical timeline line */}
            <div
              className="absolute left-[22px] top-4 bottom-4 w-px"
              style={{ background: "linear-gradient(to bottom, rgb(var(--color-accent)/0.3), rgb(var(--color-border)/0.3))" }}
              aria-hidden="true"
            />

            <div className="flex flex-col gap-5">
              {items.map((exp, i) => (
                <ExperienceItem key={`${exp.company}-${exp.role}-${i}`} exp={exp} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceItem({ exp, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative flex items-start gap-6">
      {/* Timeline node */}
      <div className="relative flex-shrink-0 flex w-11 h-11 items-center justify-center">
        <span
          className={clsx(
            "w-2.5 h-2.5 rounded-full border-2 relative z-10",
            exp.current
              ? "border-accent bg-accent shadow-[0_0_12px_rgb(var(--color-accent)/0.45)]"
              : "border-border bg-surface-2"
          )}
        />
      </div>

      {/* Card */}
      <article className="flex-1 warm-card rounded-2xl p-6 transition-all duration-200 hover:border-accent/25 relative overflow-hidden group">
        {/* Subtle hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
          style={{ background: "radial-gradient(ellipse at top left, rgb(var(--color-accent)/0.04), transparent 60%)" }}
          aria-hidden="true"
        />

        {exp.current ? (
          <span className="absolute top-5 right-5 font-mono text-[9px] text-success bg-success/8 border border-success/20 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgb(var(--color-success)/0.2)]">
            ● Now
          </span>
        ) : null}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <span className="font-mono text-[10px] text-accent tracking-wide">{exp.company}</span>
          <span className="font-mono text-[10px] text-text-muted">{exp.period}</span>
        </div>

        <h3 className="font-display text-xl font-medium text-text-primary mt-2.5">{exp.role}</h3>

        <div className="w-6 h-px bg-accent/30 my-4" />

        <div
          className={clsx(
            "relative text-[13px] text-text-muted leading-[1.75]",
            !expanded && "line-clamp-3"
          )}
        >
          {exp.description}
          {!expanded && (
            <span
              className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgb(var(--color-surface-2)), transparent)" }}
              aria-hidden="true"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 font-mono text-[9px] text-accent/70 hover:text-accent transition-colors tracking-wide"
        >
          {expanded ? "↑ Show less" : "↓ Read more"}
        </button>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {exp.tags.map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      </article>
    </div>
  );
}
