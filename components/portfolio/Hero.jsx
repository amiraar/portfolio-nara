"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import portrait from "@/public/profile/portrait.webp";

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
        className="max-w-6xl mx-auto px-6 lg:px-8 pt-24 pb-16 lg:py-28 w-full"
      >
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
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
                Backend Developer · QA Automation
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

          {/* Right — portrait (shown first on mobile so visitors see a face right away) */}
          <div
            data-reveal
            className="order-first lg:order-none w-full lg:w-[45%] flex items-center justify-center"
            style={{ opacity: 0, transform: "translateY(14px)", transition: "all 0.65s cubic-bezier(0.16,1,0.3,1)" }}
          >
            <HeroPortrait name={data.name} />
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

/** @param {{ name?: string }} props */
function HeroPortrait({ name }) {
  return (
    <div className="relative w-full max-w-[200px] sm:max-w-[280px] lg:max-w-[380px] aspect-[4/5]">
      {/* Arch backdrop; the head rises above its top edge */}
      <div
        className="absolute inset-x-0 bottom-0 top-[14%] rounded-t-full rounded-b-2xl warm-card overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgb(var(--color-accent) / 0.18), transparent 70%)",
          }}
        />
      </div>

      <Image
        src={portrait}
        alt={name ? `${name} at graduation` : "Graduation portrait"}
        fill
        preload
        placeholder="blur"
        sizes="(min-width: 1024px) 380px, (min-width: 640px) 280px, 200px"
        className="object-contain object-bottom rounded-b-2xl"
      />

      {/* Location pill */}
      <div className="absolute -left-2 sm:-left-6 bottom-[12%] glass-card rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-[0_8px_24px_rgb(0_0_0/0.25)]">
        <svg width="9" height="9" viewBox="0 0 12 16" fill="none" aria-hidden="true">
          <path d="M6 0C3 0 0 2.69 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6z" fill="rgb(var(--color-accent))" fillOpacity="0.7" />
          <circle cx="6" cy="6" r="2" fill="rgb(var(--color-bg))" />
        </svg>
        <span className="font-mono text-[9px] sm:text-[10px] text-text-muted">Yogyakarta, ID</span>
      </div>

      {/* Accent tag */}
      <div className="hidden sm:block absolute -right-6 top-[26%] font-mono text-[10px] tracking-widest text-accent-2 border border-accent-2/25 bg-background/80 backdrop-blur px-2.5 py-1 rounded-full">
        3 MVPs shipped
      </div>
    </div>
  );
}
