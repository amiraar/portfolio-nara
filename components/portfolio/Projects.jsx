/**
 * components/portfolio/Projects.jsx — Project cards grid.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

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
  useRevealOnScroll(sectionRef, 0.08);

  return (
    <section id="projects" className="py-28 max-w-6xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="flex items-center gap-4 mb-10">
          <span className="font-mono text-[11px] text-accent">03</span>
          <span className="h-px w-10 bg-accent/50" />
          <h2 className="font-display text-4xl text-text-primary">Projects</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-fr">
          {projects.map((project, index) => (
            <ProjectCard
              key={`${project.name}-${project.company}-${index}`}
              project={project}
              spanClass={project.highlight ? "md:col-span-4" : (COL_SPANS[index] ?? "md:col-span-2")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, spanClass }) {
  const isWide = spanClass === "md:col-span-4";

  return (
    <article
      className={clsx(
        "glass-card rounded-2xl overflow-hidden group cursor-default relative transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/8",
        spanClass
      )}
    >
      {project.metric ? (
        <span className="absolute top-4 right-4 font-mono text-sm text-accent font-medium">
          {project.metric}
        </span>
      ) : null}

      <div className="p-5 pb-0">
        <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent/20 bg-accent/5 px-2.5 py-1 rounded-full inline-block">
          {project.type}
        </span>
        <h3 className="font-display text-xl lg:text-2xl font-medium text-text-primary mt-3 leading-tight">
          {project.name}
        </h3>
        <p className="text-xs text-text-muted mt-1">{project.company}</p>
      </div>

      <div className="p-5">
        <p
          className={clsx(
            "text-sm text-text-muted leading-relaxed",
            isWide ? "line-clamp-3" : "line-clamp-2"
          )}
        >
          {project.description}
        </p>
      </div>

      <div className="p-5 pt-0 flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15"
            >
              {tag}
            </span>
          ))}
        </div>

        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-all"
            aria-label="View project"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 11L11 3M11 3H6M11 3V8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        ) : null}
      </div>
    </article>
  );
}
