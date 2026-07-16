"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

const CIRCUMFERENCE = 157;

export default function Skills() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("skills", PORTFOLIO_DEFAULTS.skills);
  useRevealOnScroll(sectionRef, 0.1);

  const stats = data.stats ?? [];

  return (
    <section id="skills" className="py-28" style={{ background: "rgb(var(--color-surface)/0.35)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div ref={sectionRef} className="section-reveal">
          {/* Section header */}
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-[10px] text-accent/70 tracking-widest">04</span>
            <span className="h-px w-8 bg-accent/40" />
            <h2 className="font-display text-4xl text-text-primary">Skills</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Skills list */}
            <div className="lg:col-span-3 space-y-7">
              {Object.entries(data.skills ?? {}).map(([category, items], index, arr) => (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[9px] text-accent/60 uppercase tracking-widest">{category}</span>
                    <span className="flex-1 h-px bg-border/40" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-9">
              {/* Languages */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-[9px] text-accent/60 uppercase tracking-widest">Languages</span>
                  <span className="flex-1 h-px bg-border/40" />
                </div>
                <div className="flex gap-8">
                  {(data.languages ?? []).map((lang) => (
                    <LanguageCircle key={lang.name} {...lang} />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-[9px] text-accent/60 uppercase tracking-widest">Quick Stats</span>
                  <span className="flex-1 h-px bg-border/40" />
                </div>
                <div className={stats.length === 4 ? "grid grid-cols-2 gap-3" : "flex flex-wrap gap-3"}>
                  {stats.map((stat) => (
                    <div key={stat.label} className="warm-card rounded-xl p-4 text-center">
                      <div className="font-display text-2xl font-medium gradient-text">
                        {stat.value}
                      </div>
                      <div className="font-mono text-[9px] text-text-muted uppercase tracking-wide mt-1.5">
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
    const frame = requestAnimationFrame(() => { setProgress(pct); });
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative w-[64px] h-[64px]">
        <svg width="64" height="64" viewBox="0 0 64 64" className="rotate-[-90deg]">
          <circle
            cx="32" cy="32" r="25"
            stroke="rgb(var(--color-border))"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="32" cy="32" r="25"
            stroke="url(#lang-gradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
          <defs>
            <linearGradient id="lang-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(var(--color-accent))" />
              <stop offset="100%" stopColor="rgb(var(--color-accent-2))" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-text-primary">
          {pct}%
        </span>
      </div>
      <div className="text-[13px] text-text-primary text-center font-medium">{name}</div>
      <div className="font-mono text-[9px] text-text-muted text-center">{level}</div>
    </div>
  );
}
