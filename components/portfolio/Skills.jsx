/**
 * components/portfolio/Skills.jsx — Technical and soft skills display.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

const CATEGORY_ICONS = {
  Backend: "⬡",
  Database: "◈",
  Cloud: "△",
  Frontend: "◻",
  Design: "◈",
  Mobile: "⬡",
  "Soft Skills": "◇",
};

const CIRCUMFERENCE = 157;

export default function Skills() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("skills", PORTFOLIO_DEFAULTS.skills);
  useRevealOnScroll(sectionRef, 0.1);

  const stats = data.stats ?? [];
  const statsLayout = stats.length === 4 ? "grid grid-cols-2 gap-3" : "flex flex-wrap gap-3";

  return (
    <section id="skills" className="py-28 bg-surface/40">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div ref={sectionRef} className="section-reveal">
          <div className="flex items-center gap-4 mb-10">
            <span className="font-mono text-[11px] text-accent">04</span>
            <span className="h-px w-10 bg-accent/50" />
            <h2 className="font-display text-4xl text-text-primary">Skills</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              {Object.entries(data.skills ?? {}).map(([category, items], index) => (
                <div
                  key={category}
                  className={clsx("pt-6", index === 0 ? "pt-0" : "border-t border-border/40")}
                >
                  <p className="font-mono text-[10px] text-accent/60 uppercase mb-2 mt-6 first:mt-0">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15 transition-all hover:border-accent/40 hover:bg-gradient-accent hover:bg-[length:200%_200%] hover:animate-shimmer"
                      >
                        <span className="text-[8px] mr-1 opacity-50">{CATEGORY_ICONS[category] ?? "◇"}</span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="font-mono text-[10px] text-accent/60 uppercase mb-4">Languages</p>
                <div className="grid grid-cols-2 gap-6">
                  {(data.languages ?? []).map((lang) => (
                    <LanguageCircle key={lang.name} {...lang} />
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] text-accent/60 uppercase mb-4">Quick Stats</p>
                <div className={statsLayout}>
                  {stats.map((stat) => (
                    <div key={stat.label} className="glass-card p-4 rounded-xl text-center">
                      <div className="font-display text-3xl font-medium gradient-text">
                        {stat.value}
                      </div>
                      <div className="font-mono text-[10px] text-text-muted uppercase mt-1">
                        {stat.label}
                      </div>
                    </div>
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

function LanguageCircle({ name, level, pct }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const frame = requestAnimationFrame(() => {
      setProgress(pct);
    });
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[60px] h-[60px] text-accent">
        <svg width="60" height="60" viewBox="0 0 60 60" className="rotate-[-90deg]">
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeOpacity="0.1"
          />
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs text-text-primary">
          {pct}%
        </span>
      </div>
      <div className="text-sm text-text-primary text-center">{name}</div>
      <div className="font-mono text-[10px] text-text-muted text-center">{level}</div>
    </div>
  );
}
