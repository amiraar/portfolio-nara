/**
 * components/portfolio/Projects.jsx — Project cards grid with hover details.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useRef, useState } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import PortfolioSectionHeader from "@/components/shared/PortfolioSectionHeader";

export default function Projects() {
  const sectionRef = useRef(null);
  const { data: projects } = usePortfolioContent("projects", PORTFOLIO_DEFAULTS.projects);
  useRevealOnScroll(sectionRef, 0.08);

  return (
    <section id="projects" className="py-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <PortfolioSectionHeader number="03" title="Projects" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative p-5 rounded-xl border transition-all duration-300 cursor-default ${
        project.highlight
          ? "border-accent/20 bg-accent/[0.03]"
          : "border-border bg-surface/60"
      } hover:border-accent/30 hover:shadow-lg`}
      style={hovered ? { boxShadow: "0 8px 32px rgba(201,169,110,0.08)" } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-display text-lg font-medium text-text-primary">{project.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[10px] text-accent border border-accent/25 px-1.5 py-0.5 rounded">
              {project.type}
            </span>
            <span className="text-xs text-text-muted">{project.company}</span>
          </div>
        </div>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-accent transition-colors flex-shrink-0"
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
        )}
      </div>

      <p className="text-text-muted text-sm leading-relaxed mb-4">{project.description}</p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="skill-tag">{tag}</span>
          ))}
        </div>
        {project.metric && (
          <span className="font-mono text-[11px] text-accent bg-accent/10 px-2 py-1 rounded whitespace-nowrap">
            {project.metric}
          </span>
        )}
      </div>
    </div>
  );
}
