/**
 * components/portfolio/Hero.jsx — Hero section with name, tagline, and CTA.
 * Content is loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";

/** @param {{ onChatOpen: () => void }} props */
export default function Hero({ onChatOpen }) {
  const containerRef = useRef(null);
  const { data } = usePortfolioContent("hero", PORTFOLIO_DEFAULTS.hero);
  const { data: skillsData } = usePortfolioContent("skills", PORTFOLIO_DEFAULTS.skills);
  const stats = (skillsData?.stats ?? PORTFOLIO_DEFAULTS.skills.stats).slice(0, 3);

  const nameParts = (data.name ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const secondName = nameParts[1] ?? "";
  const remainingName = nameParts.slice(2).join(" ");

  // Staggered section reveal on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const children = el.querySelectorAll("[data-reveal]");
    children.forEach((child, i) => {
      setTimeout(() => {
        child.style.opacity = "1";
        child.style.transform = "translateY(0)";
      }, 200 + i * 120);
    });
  }, []);

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center relative overflow-hidden"
    >
      <div
        ref={containerRef}
        className="max-w-6xl mx-auto px-6 lg:px-8 py-24 w-full"
      >
        <div className="flex flex-col lg:flex-row items-center gap-14">
          <div className="w-full lg:w-[55%]">
            <span
              data-reveal
              className="glass-card inline-flex items-center gap-2 text-[11px] font-mono text-accent uppercase tracking-widest px-4 py-2"
              style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Open to opportunities
            </span>

            <h1
              data-reveal
              className="mt-6 font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-text-primary"
              style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            >
              {firstName}
              {secondName ? (
                <> <span className="gradient-text">{secondName}</span></>
              ) : null}
              {remainingName ? ` ${remainingName}` : null}
            </h1>

            <p
              data-reveal
              className="mt-6 text-text-muted text-lg leading-relaxed max-w-[480px]"
              style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            >
              {data.tagline}
            </p>

            <div
              data-reveal
              className="mt-10 flex flex-wrap items-center gap-4"
              style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            >
              <button
                onClick={onChatOpen}
                className="bg-accent text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-accent-hover hover:scale-[1.02] transition-all shadow-lg shadow-accent/25"
              >
                Start a conversation &rarr;
              </button>
              <a
                href="#projects"
                className="text-text-muted text-sm border border-border px-6 py-3.5 rounded-full hover:border-accent/40 hover:text-text-primary transition-all"
              >
                View my work
              </a>
            </div>

            <div
              data-reveal
              className="mt-8 flex flex-wrap items-center"
              style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-col pr-6 mr-6 border-r border-border/50 ${index === stats.length - 1 ? "border-r-0 pr-0 mr-0" : ""}`}
                >
                  <span className="font-mono text-accent text-xl">{stat.value}</span>
                  <span className="text-text-muted text-xs">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[45%] relative">
            <svg
              viewBox="0 0 500 500"
              className="w-full h-auto text-accent"
              style={{ animation: "float 6s ease-in-out infinite" }}
              aria-hidden="true"
            >
              <style>
                {`@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-12px); } 100% { transform: translateY(0px); } }`}
              </style>
              <defs>
                <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="currentColor" fillOpacity="0.15" />
                </pattern>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="currentColor" floodOpacity="0.12" />
                </filter>
              </defs>

              <rect x="0" y="0" width="500" height="500" fill="url(#dot-grid)" opacity="0.35" />

              <circle cx="250" cy="250" r="200" stroke="currentColor" strokeOpacity="0.06" fill="none" strokeWidth="1" />
              <circle cx="250" cy="250" r="140" stroke="currentColor" strokeOpacity="0.06" fill="none" strokeWidth="1" />

              <g filter="url(#softShadow)">
                <rect x="80" y="140" width="200" height="120" rx="18" fill="currentColor" fillOpacity="0.08" />
                <rect x="210" y="90" width="210" height="140" rx="20" fill="currentColor" fillOpacity="0.12" />
                <rect x="170" y="240" width="220" height="140" rx="22" fill="currentColor" fillOpacity="0.1" />
              </g>

              <line x1="70" y1="420" x2="420" y2="120" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 8" />
              <line x1="120" y1="80" x2="460" y2="360" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 8" />
            </svg>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-6 bottom-12 font-mono text-[9px] tracking-[0.3em] text-text-muted/40 rotate-90">
        SCROLL
      </div>
    </section>
  );
}
