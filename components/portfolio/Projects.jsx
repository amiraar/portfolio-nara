"use client";

import { useEffect, useRef, useState } from "react";
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
  const [activeProject, setActiveProject] = useState(null);
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
              onOpenCaseStudy={() => setActiveProject(project)}
            />
          ))}
        </div>
      </div>

      {activeProject ? (
        <CaseStudyModal project={activeProject} onClose={() => setActiveProject(null)} />
      ) : null}
    </section>
  );
}

function ProjectCard({ project, spanClass, index, onOpenCaseStudy }) {
  const isWide = spanClass === "md:col-span-4";
  const hasCaseStudy = Boolean(project.caseStudy);

  return (
    <article
      onClick={hasCaseStudy ? onOpenCaseStudy : undefined}
      role={hasCaseStudy ? "button" : undefined}
      tabIndex={hasCaseStudy ? 0 : undefined}
      onKeyDown={
        hasCaseStudy
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenCaseStudy();
              }
            }
          : undefined
      }
      className={clsx(
        "warm-card rounded-2xl overflow-hidden group relative transition-all duration-250",
        "hover:-translate-y-0.5 hover:border-accent/30",
        hasCaseStudy ? "cursor-pointer" : "cursor-default",
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

        <div className="flex items-center gap-2 flex-shrink-0">
          {project.caseStudy ? (
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent/70">
              {project.link ? "Case study →" : "Proprietary — Case study →"}
            </span>
          ) : !project.link ? (
            <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted/50">
              Proprietary
            </span>
          ) : null}

          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 flex-shrink-0 rounded-full border border-border flex items-center justify-center hover:border-accent hover:bg-accent/8 transition-all"
              aria-label="View project"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H5.5M9.5 2.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CaseStudyModal({ project, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const { caseStudy, screenshots = [] } = project;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} case study`}
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="warm-card relative w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col">
        {/* Header — stays fixed while the body below scrolls */}
        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-border/60 flex-shrink-0">
          <div className="min-w-0">
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent/70">
              {project.type}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-medium text-text-primary mt-1 leading-tight">
              {project.name}
            </h3>
            <p className="font-mono text-[10px] text-text-muted/60 mt-1">{project.company}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close case study"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:bg-accent/8 transition-all flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body — the only scrollable region */}
        <div className="overflow-y-auto px-6 sm:px-8 py-6">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>

          <div className="mt-6 space-y-5 text-[13px] text-text-muted leading-[1.7]">
            <section>
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-primary mb-1.5">
                Problem
              </h4>
              <p>{caseStudy.problem}</p>
            </section>

            <section>
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-primary mb-1.5">
                Approach
              </h4>
              {Array.isArray(caseStudy.approach) ? (
                <ul className="space-y-2 list-disc pl-4">
                  {caseStudy.approach.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p>{caseStudy.approach}</p>
              )}
            </section>

            <section>
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-primary mb-1.5">
                Result
              </h4>
              <p>{caseStudy.result}</p>
            </section>
          </div>

          {screenshots.length > 0 ? (
            <div className="mt-6 pt-6 border-t border-border/60">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-text-primary mb-3">
                Screenshots
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {screenshots.map((src) => (
                  <a
                    key={src}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border overflow-hidden hover:border-accent/40 transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${project.name} screenshot`}
                      className="w-full aspect-[4/3] object-cover object-top"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
