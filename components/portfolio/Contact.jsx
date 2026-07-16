"use client";

import { useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

export default function Contact() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);
  useRevealOnScroll(sectionRef, 0.1);

  const headingParts = (data.contactHeading ?? "").trim().split(/\s+/).filter(Boolean);
  const headingFirst = headingParts[0] ?? "";
  const headingRest = headingParts.slice(1).join(" ");

  return (
    <section id="contact" className="pb-28 max-w-6xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">

        {/* Thin top divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-16" aria-hidden="true" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — heading & subtext */}
          <div>
            <span className="font-mono text-[10px] text-accent/70 tracking-widest">Let's work together</span>
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-text-primary mt-4 leading-tight">
              {headingFirst}
              {headingRest ? (
                <em className="not-italic gradient-text"> {headingRest}</em>
              ) : null}
            </h2>
            <p className="text-text-muted text-[15px] leading-[1.8] max-w-sm mt-5">
              {data.contactSubtext}
            </p>
            <p className="font-mono text-[10px] text-text-muted/40 mt-6 tracking-wide">
              Response time &lt; 24h
            </p>
          </div>

          {/* Right — contact cards */}
          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${data.email}`}
              className="warm-card rounded-2xl p-6 group flex items-center justify-between hover:border-accent/35 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div>
                <p className="font-mono text-[9px] text-accent/70 uppercase tracking-widest mb-2">Email</p>
                <p className="text-text-primary text-sm font-medium">{data.email}</p>
              </div>
              <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/8 transition-all">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M2.5 10.5L10.5 2.5M10.5 2.5H6.5M10.5 2.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>

            <a
              href={data.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="warm-card rounded-2xl p-6 group flex items-center justify-between hover:border-accent/35 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div>
                <p className="font-mono text-[9px] text-accent/70 uppercase tracking-widest mb-2">LinkedIn</p>
                <p className="text-text-primary text-sm font-medium">{data.linkedinLabel}</p>
              </div>
              <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-accent group-hover:bg-accent/8 transition-all">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M2.5 10.5L10.5 2.5M10.5 2.5H6.5M10.5 2.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
