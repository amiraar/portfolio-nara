/**
 * components/portfolio/Skills.jsx — Technical and soft skills display.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";

const DEFAULT_SKILLS = {
  skills: {
    Backend: ["Laravel", "CodeIgniter", "Node.js", "REST API"],
    Database: ["PostgreSQL", "SQLite", "Prisma ORM"],
    Cloud: ["AWS S3", "Vercel", "Neon"],
    Frontend: ["Next.js", "Tailwind CSS", "React"],
    Design: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Adobe Premiere Pro"],
    Mobile: ["Android Studio"],
    "Soft Skills": ["Leadership", "Communication", "Adaptability", "Time Management", "Problem-solving"],
  },
  languages: [
    { name: "Bahasa Indonesia", level: "Native", pct: 100 },
    { name: "English", level: "Intermediate", pct: 65 },
  ],
  stats: [
    { label: "Projects shipped", value: "7+" },
    { label: "Students mentored", value: "30+" },
    { label: "Years experience", value: "2+" },
    { label: "GPA", value: "3.82" },
  ],
};

export default function Skills() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("skills", DEFAULT_SKILLS);

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
    <section id="skills" className="py-28 bg-surface/40">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div ref={sectionRef} className="section-reveal">
          <div className="flex items-center gap-4 mb-14">
            <p className="font-mono text-accent text-xs tracking-widest uppercase">04 — Skills</p>
            <div className="gold-divider flex-1 max-w-[60px]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Skills grid */}
            <div className="lg:col-span-2 space-y-5">
              {Object.entries(data.skills).map(([category, items]) => (
                <div key={category}>
                  <p className="font-mono text-xs text-accent mb-2.5">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span key={skill} className="skill-tag cursor-default">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div className="space-y-6">
              <div>
                <p className="font-mono text-xs text-accent mb-4">Languages</p>
                <div className="space-y-4">
                  {data.languages.map((lang) => (
                    <LanguageBar key={lang.name} {...lang} />
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-8 p-4 rounded-xl border border-border bg-surface/60">
                <p className="font-mono text-xs text-accent mb-3">Quick Stats</p>
                <div className="space-y-2">
                  {data.stats.map((s) => (
                    <Stat key={s.label} label={s.label} value={s.value} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LanguageBar({ name, level, pct }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm text-text-primary">{name}</span>
        <span className="font-mono text-xs text-text-muted">{level}</span>
      </div>
      <div className="h-1 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent/80 to-accent"
          style={{ width: `${pct}%`, transition: "width 1s ease" }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="font-mono text-sm text-accent">{value}</span>
    </div>
  );
}
