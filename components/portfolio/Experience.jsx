/**
 * components/portfolio/Experience.jsx — Work experience timeline.
 */

"use client";

import { useEffect, useRef } from "react";

const EXPERIENCE = [
  {
    company: "SoftwareSeni",
    role: "Software Developer",
    period: "Aug 2025 – Present",
    description:
      "Built the MVP of QuickCue — an AI-driven one-page profile generation platform with shareable slug-based URLs and core API infrastructure. Developed Racker — an end-to-end reimbursement and request workflow system with multi-step approvals, AWS S3 file handling, and in-app + email notifications.",
    tags: ["Laravel", "PostgreSQL", "AWS S3", "OpenAI API", "REST API"],
    current: true,
  },
  {
    company: "SoftwareSeni",
    role: "Software Training (Bootcamp)",
    period: "May 2025 – Aug 2025",
    description:
      "Completed intensive bootcamp at SoftwareSeni. Built CPTool — a comprehensive Laravel admin system featuring Google OAuth integration, Role-Based Access Control (RBAC), server-side DataTables for skills and client management.",
    tags: ["Laravel", "Google OAuth", "RBAC", "DataTables", "MySQL"],
  },
  {
    company: "RSU Mitra Paramedika",
    role: "UI/UX Designer",
    period: "Aug 2023 – Nov 2023",
    description:
      "Designed hospital system interfaces resulting in +25% user satisfaction score. Conducted user research with 50 participants across clinical and administrative staff to inform wireframes and usability improvements.",
    tags: ["Figma", "User Research", "Prototyping", "Healthcare UX"],
  },
  {
    company: "Lazismu Yogyakarta",
    role: "Project Manager",
    period: "May 2023 – Aug 2023",
    description:
      "Led project coordination for nonprofit initiatives. Achieved +20% improvement in project delivery efficiency and reduced project delays by 15% through improved planning and stakeholder communication.",
    tags: ["Project Management", "Stakeholder Communication", "Agile"],
  },
  {
    company: "Ahmad Dahlan University",
    role: "Lab Assistant",
    period: "Sep 2022 – Jul 2024",
    description:
      "Assisted in teaching Statistics, Algorithm Strategy, Deep Learning, and Data Visualization courses. Supported 30+ students per course through hands-on lab sessions and individual tutoring.",
    tags: ["Statistics", "Deep Learning", "Data Visualization", "Mentoring"],
  },
];

export default function Experience() {
  const sectionRef = useRef(null);

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
    <section id="experience" className="py-28 bg-surface/40">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div ref={sectionRef} className="section-reveal">
          <div className="flex items-center gap-4 mb-14">
            <p className="font-mono text-accent text-xs tracking-widest uppercase">02 — Experience</p>
            <div className="gold-divider flex-1 max-w-[60px]" />
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border hidden sm:block" />

            <div className="space-y-10">
              {EXPERIENCE.map((exp, i) => (
                <ExperienceItem key={i} exp={exp} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceItem({ exp }) {
  return (
    <div className="sm:pl-8 relative group">
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border border-border bg-surface hidden sm:flex items-center justify-center group-hover:border-accent/50 transition-colors">
        <div className={`w-1.5 h-1.5 rounded-full ${exp.current ? "bg-accent animate-pulse" : "bg-text-muted"}`} />
      </div>

      <div className="p-5 rounded-xl border border-border bg-surface/60 hover:border-accent/20 transition-all duration-300">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-display text-lg font-medium text-text-primary">{exp.role}</h3>
            <p className="text-accent text-sm font-mono mt-0.5">{exp.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {exp.current && (
              <span className="font-mono text-[10px] text-accent border border-accent/30 px-2 py-0.5 rounded-full bg-accent/5">
                Current
              </span>
            )}
            <span className="font-mono text-xs text-text-muted whitespace-nowrap">{exp.period}</span>
          </div>
        </div>

        <p className="text-text-muted text-sm leading-relaxed mb-4">{exp.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {exp.tags.map((tag) => (
            <span key={tag} className="skill-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
