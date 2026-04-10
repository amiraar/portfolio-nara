/**
 * components/portfolio/Hero.jsx — Hero section with name, tagline, and CTA.
 * Content is loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";

/** @param {{ onChatOpen: () => void }} props */
export default function Hero({ onChatOpen }) {
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 25, y: 33 });
  const { data } = usePortfolioContent("hero", PORTFOLIO_DEFAULTS.hero);

  // Track mouse position relative to the section
  function handleMouseMove(e) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

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
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Mouse-tracking background orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201,169,110,0.055) 0%, transparent 65%)",
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: "translate(-50%, -50%)",
          transition: "left 0.6s cubic-bezier(0.16,1,0.3,1), top 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      <div ref={containerRef} className="max-w-5xl mx-auto px-6 lg:px-8 py-20 w-full">

        <p
          data-reveal
          className="font-mono text-accent text-xs tracking-widest uppercase mb-6"
          style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
        >
          Software Developer
        </p>

        <h1
          data-reveal
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-medium text-text-primary leading-[1.05] tracking-tight"
          style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
        >
            {(() => {
              const parts = (data.name ?? "").split(" ");
              const line1 = parts[0] ?? "";
              const line2 = parts.length > 1 ? parts[1] : null;
              const line3 = parts.length > 2 ? parts.slice(2).join(" ") : null;
              return (
                <>
                  {line1}
                  {line2 && (<><br /><span className="text-accent">{line2}</span></>)}
                  {line3 && (<><br />{line3}</>)}
                </>
              );
            })()}
        </h1>

        <p
          data-reveal
          className="mt-4 text-text-muted text-lg sm:text-xl font-light leading-relaxed max-w-xl"
          style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
        >
          {data.tagline}
        </p>

        <div
          data-reveal
          className="mt-8 flex flex-wrap gap-3"
          style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
        >
          <button
            onClick={onChatOpen}
            className="px-6 py-3 bg-accent text-background text-sm font-medium rounded-lg hover:bg-accent-hover transition-all duration-200 shadow-lg"
            style={{ boxShadow: "0 4px 20px rgba(201,169,110,0.25)" }}
          >
            Chat with Kaia →
          </button>
          <a
            href={`mailto:${data.email}`}
            className="px-6 py-3 border border-border text-text-muted text-sm rounded-lg hover:border-accent/40 hover:text-text-primary transition-all duration-200"
          >
            Get in touch
          </a>
        </div>

        <div
          data-reveal
          className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-muted"
          style={{ opacity: 0, transform: "translateY(16px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
        >
          <span className="flex items-center gap-1.5">
            <span>📍</span> {data.location}
          </span>
          <a
            href={data.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            LinkedIn ↗
          </a>
          <a
            href={`mailto:${data.email}`}
            className="hover:text-accent transition-colors"
          >
            Email
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-[10px] font-mono text-text-muted tracking-widest uppercase">scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-text-muted to-transparent" />
      </div>
    </section>
  );
}
