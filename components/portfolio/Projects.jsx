/**
 * components/portfolio/Projects.jsx — Project cards grid with hover details.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";

const DEFAULT_PROJECTS = [
  {
    name: "Racker",
    type: "Web App",
    company: "SoftwareSeni",
    description:
      "End-to-end reimbursement and request workflow platform. Multi-step approval chains, AWS S3 file storage, in-app and email notification system.",
    tags: ["Laravel", "PostgreSQL", "AWS S3", "Notifications"],
    link: null,
    highlight: true,
  },
  {
    name: "QuickCue",
    type: "AI Product",
    company: "SoftwareSeni",
    description:
      "AI-driven one-page profile generation tool. Visitors receive unique slug-based shareable URLs. Core APIs and OpenAI integration.",
    tags: ["Laravel", "OpenAI API", "Slug URLs", "REST API"],
    link: null,
    highlight: true,
  },
  {
    name: "CPTool",
    type: "Admin System",
    company: "SoftwareSeni",
    description:
      "Comprehensive Laravel admin dashboard with Google OAuth, Role-Based Access Control, server-side DataTables for skills and client management.",
    tags: ["Laravel", "Google OAuth", "RBAC", "DataTables"],
    link: null,
  },
  {
    name: "UI/UX Study App",
    type: "UX Design",
    company: "Ahmad Dahlan University",
    description:
      "Mobile app interface designed for 500+ students. User research and iterative design led to a +30% engagement improvement.",
    tags: ["Figma", "User Research", "Mobile UI"],
    link: "https://bit.ly/uiuxstudyapp",
    metric: "+30% engagement",
  },
  {
    name: "UI/UX Laboratorium",
    type: "UX Design",
    company: "RSU Mitra Paramedika",
    description:
      "Hospital laboratory system interface redesign. Streamlined workflows for clinical staff, reducing processing time by 15%.",
    tags: ["Figma", "Healthcare UX", "Prototyping"],
    link: "https://bit.ly/uiuxlaboratorium",
    metric: "-15% processing time",
  },
  {
    name: "UI/UX Travel & Transportation",
    type: "UX Design",
    company: "Personal Project",
    description:
      "Booking experience redesign for travel and transport platform. Improved conversion and usability resulting in +20% booking rate.",
    tags: ["Figma", "UX Research", "Booking Flow"],
    link: "https://bit.ly/uiuxtravelandtransportation",
    metric: "+20% bookings",
  },
  {
    name: "UI/UX Farmasi Rawat Jalan",
    type: "UX Design",
    company: "Hospital System",
    description:
      "Outpatient pharmacy system interface. Optimized dispensing workflow for pharmacy staff, achieving +20% efficiency improvement.",
    tags: ["Figma", "Healthcare UX", "Workflow Design"],
    link: "https://bit.ly/uiuxfarmasirawatjalan",
    metric: "+20% efficiency",
  },
];

export default function Projects() {
  const sectionRef = useRef(null);
  const { data: projects } = usePortfolioContent("projects", PORTFOLIO_DEFAULTS.projects);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("revealed"); },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className="py-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="flex items-center gap-4 mb-14">
          <p className="font-mono text-accent text-xs tracking-widest uppercase">03 — Projects</p>
          <div className="gold-divider flex-1 max-w-[60px]" />
        </div>

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
