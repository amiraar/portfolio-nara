"use client";

import { useRef } from "react";
import { clsx } from "clsx";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

const COL_SPANS = [
  "md:col-span-4",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-4",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
];

export default function Projects() {
  const sectionRef = useRef(null);
  const { data: projects } = usePortfolioContent("projects", PORTFOLIO_DEFAULTS.projects);
  useRevealOnScroll(sectionRef, 0.06);

  return (
    <section id="projects" className="py-28 max-w-6xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] text-accent/70 tracking-widest">03</span>
          <span className="h-px w-8 bg-accent/40" />
          <h2 className="font-display text-4xl text-text-primary">Projects</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {projects.map((project, index) => (
            <ProjectCard
              key={`${project.name}-${project.company}-${index}`}
              project={project}
              spanClass={project.highlight ? "md:col-span-4" : (COL_SPANS[index] ?? "md:col-span-2")}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, spanClass, index }) {
  const isWide = spanClass === "md:col-span-4";

  return (
    <article
      className={clsx(
        "warm-card rounded-2xl overflow-hidden group cursor-default relative transition-all duration-250",
        "hover:-translate-y-0.5 hover:border-accent/30",
        spanClass
      )}
    >
      {/* Top accent stripe */}
      <div
        className="h-[2px] w-full"
        style={{
          background: isWide
            ? "linear-gradient(90deg, rgb(var(--color-accent)/0.6), rgb(var(--color-accent-2)/0.4), transparent)"
            : "linear-gradient(90deg, rgb(var(--color-accent)/0.3), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgb(var(--color-accent)/0.04), transparent 60%)" }}
        aria-hidden="true"
      />

      {project.metric ? (
        <span className="absolute top-4 right-4 font-mono text-[11px] gradient-text font-medium">
          {project.metric}
        </span>
      ) : null}

      <div className="p-5 pb-0">
        <span className="font-mono text-[9px] uppercase tracking-widest text-accent/70">
          {project.type}
        </span>
        <h3 className="font-display text-xl lg:text-2xl font-medium text-text-primary mt-2 leading-tight">
          {project.name}
        </h3>
        <p className="font-mono text-[10px] text-text-muted/60 mt-1">{project.company}</p>
      </div>

      <div className="p-5">
        <p
          className={clsx(
            "text-[13px] text-text-muted leading-[1.7]",
            isWide ? "line-clamp-3" : "line-clamp-2"
          )}
        >
          {project.description}
        </p>
      </div>

      <div className="p-5 pt-0 flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>

        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex-shrink-0 rounded-full border border-border flex items-center justify-center hover:border-accent hover:bg-accent/8 transition-all"
            aria-label="View project"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 9.5L9.5 2.5M9.5 2.5H5.5M9.5 2.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ) : null}
      </div>
    </article>
  );
}
