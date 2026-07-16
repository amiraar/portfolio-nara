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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.querySelectorAll("[data-reveal]").forEach((child, i) => {
      setTimeout(() => {
        child.style.opacity = "1";
        child.style.transform = "translateY(0)";
      }, 150 + i * 100);
    });
  }, []);

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, rgb(var(--color-accent)), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, rgb(var(--color-accent-2)), transparent 70%)",
          }}
        />
      </div>

      <div
        ref={containerRef}
        className="max-w-6xl mx-auto px-6 lg:px-8 py-28 w-full"
      >
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left — text content */}
          <div className="w-full lg:w-[55%]">
            {/* Status badge */}
            <div
              data-reveal
              className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-accent border border-accent/20 bg-accent/5 px-3.5 py-1.5 rounded-full"
              style={{ opacity: 0, transform: "translateY(14px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Open to opportunities
            </div>

            {/* Name */}
            <h1
              data-reveal
              className="mt-7 font-display leading-[0.92] tracking-tight text-text-primary"
              style={{
                fontSize: "clamp(3rem, 10vw, 5.5rem)",
                opacity: 0,
                transform: "translateY(14px)",
                transition: "all 0.65s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {firstName}
              {secondName ? (
                <>
                  {" "}
                  <em className="not-italic gradient-text">{secondName}</em>
                </>
              ) : null}
              {remainingName ? (
                <span className="block text-text-muted/70 font-light">
                  {remainingName}
                </span>
              ) : null}
            </h1>

            {/* Role label */}
            <div
              data-reveal
              className="mt-5 flex items-center gap-3"
              style={{ opacity: 0, transform: "translateY(14px)", transition: "all 0.65s cubic-bezier(0.16,1,0.3,1)" }}
            >
              <span className="accent-line" />
              <span className="font-mono text-xs text-text-muted tracking-wide">
                Backend Developer · UI/UX Designer
              </span>
            </div>

            {/* Tagline */}
            <p
              data-reveal
              className="mt-6 text-text-muted text-[15px] leading-[1.75] max-w-[460px]"
              style={{ opacity: 0, transform: "translateY(14px)", transition: "all 0.65s cubic-bezier(0.16,1,0.3,1)" }}
            >
              {data.tagline}
            </p>

            {/* CTAs */}
            <div
              data-reveal
              className="mt-9 flex flex-wrap items-center gap-3"
              style={{ opacity: 0, transform: "translateY(14px)", transition: "all 0.65s cubic-bezier(0.16,1,0.3,1)" }}
            >
              <button
                onClick={onChatOpen}
                className="flex items-center gap-2 bg-accent text-background px-7 py-3 rounded-full text-[13px] font-medium hover:bg-accent-hover transition-all duration-200 hover:scale-[1.02] shadow-[0_4px_24px_rgb(var(--color-accent)/0.25)]"
              >
                Start a conversation
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M2 6.5h9M7.5 3l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <a
                href="#projects"
                className="text-text-muted text-[13px] border border-border px-6 py-3 rounded-full hover:border-accent/30 hover:text-text-primary transition-all duration-200"
              >
                View my work
              </a>
            </div>

            {/* Stats */}
            <div
              data-reveal
              className="mt-10 flex flex-wrap items-center gap-0"
              style={{ opacity: 0, transform: "translateY(14px)", transition: "all 0.65s cubic-bezier(0.16,1,0.3,1)" }}
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-col pr-8 mr-8 ${index === stats.length - 1 ? "border-r-0 pr-0 mr-0" : "border-r border-border/60"}`}
                >
                  <span className="font-display text-xl font-medium gradient-text">{stat.value}</span>
                  <span className="font-mono text-[10px] text-text-muted uppercase tracking-wide mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual composition */}
          <div className="w-full lg:w-[45%] flex items-center justify-center">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hidden lg:flex absolute right-8 bottom-10 flex-col items-center gap-3">
        <span className="font-mono text-[8px] tracking-[0.35em] text-text-muted/35 rotate-90">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-accent/20 to-transparent" />
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div
      className="relative w-full max-w-[420px] aspect-square"
      style={{ animation: "float 7s ease-in-out infinite" }}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <svg
        viewBox="0 0 420 420"
        fill="none"
        className="absolute inset-0 w-full h-full"
      >
        <circle
          cx="210" cy="210" r="200"
          stroke="rgb(var(--color-accent))"
          strokeOpacity="0.07"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle
          cx="210" cy="210" r="160"
          stroke="rgb(var(--color-border))"
          strokeOpacity="0.6"
          strokeWidth="1"
        />
      </svg>

      {/* Central card — Backend side */}
      <div
        className="absolute warm-card rounded-2xl p-5 shadow-[0_8px_40px_rgb(0/0/0/0.3)]"
        style={{ top: "12%", left: "8%", width: "56%", }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-accent/60" />
          <span className="font-mono text-[9px] text-accent tracking-widest uppercase">Backend</span>
        </div>
        <div className="space-y-1.5">
          {["Laravel", "PostgreSQL", "REST API", "AWS S3"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent/30" />
              <span className="font-mono text-[10px] text-text-muted">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating accent tag */}
      <div
        className="absolute font-mono text-[9px] tracking-widest text-accent-2/80 border border-accent-2/20 bg-accent-2/5 px-2.5 py-1 rounded-full"
        style={{ top: "34%", right: "4%", transform: "rotate(2deg)" }}
      >
        3 MVPs shipped
      </div>

      {/* Design card */}
      <div
        className="absolute warm-card rounded-2xl p-5 shadow-[0_8px_40px_rgb(0/0/0/0.25)]"
        style={{ bottom: "10%", right: "5%", width: "55%" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-accent-2/60" />
          <span className="font-mono text-[9px] text-accent-2 tracking-widest uppercase">Design</span>
        </div>
        <div className="space-y-1.5">
          {["Figma", "User Research", "UI Systems", "Prototyping"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent-2/30" />
              <span className="font-mono text-[10px] text-text-muted">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Corner dot grid */}
      <svg
        viewBox="0 0 80 80"
        className="absolute bottom-6 left-4 w-16 h-16 opacity-20"
      >
        <defs>
          <pattern id="dot-grid-hero" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgb(var(--color-accent))" />
          </pattern>
        </defs>
        <rect width="80" height="80" fill="url(#dot-grid-hero)" />
      </svg>

      {/* Location pill */}
      <div
        className="absolute glass-card rounded-full px-3 py-1.5 flex items-center gap-1.5"
        style={{ top: "8%", right: "12%", transform: "rotate(-2deg)" }}
      >
        <svg width="9" height="9" viewBox="0 0 12 16" fill="none">
          <path d="M6 0C3 0 0 2.69 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6z" fill="rgb(var(--color-accent))" fillOpacity="0.7" />
          <circle cx="6" cy="6" r="2" fill="rgb(var(--color-bg))" />
        </svg>
        <span className="font-mono text-[9px] text-text-muted">Yogyakarta, ID</span>
      </div>
    </div>
  );
}
