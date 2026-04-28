/**
 * components/portfolio/About.jsx — About section with personal summary.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";

export default function About() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("about", PORTFOLIO_DEFAULTS.about);
  useRevealOnScroll(sectionRef, 0.15);

  const defaultInfo = PORTFOLIO_DEFAULTS.about.info;
  const locationRow = defaultInfo.find((row) => row.label === "Location");
  const statusRow = defaultInfo.find((row) => row.label === "Currently");
  const paragraphs = data.paragraphs ?? [];
  const [firstParagraph, ...restParagraphs] = paragraphs;
  const firstLetter = firstParagraph ? firstParagraph.trim().charAt(0) : "";
  const firstParagraphRest = firstParagraph ? firstParagraph.trim().slice(1) : "";

  return (
    <section id="about" className="py-28 max-w-6xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <aside className="lg:col-span-1">
            <div className="flex flex-col">
              <span className="w-px h-16 bg-accent mb-6" />
              <span className="font-mono text-xs text-accent">01</span>
              <h2 className="font-display text-2xl font-medium mt-2">About</h2>
            </div>

            <div className="relative mt-10 w-40 h-40 glass-card border border-accent/20 flex items-center justify-center">
              <span className="font-display text-5xl font-light text-accent/30">AK</span>
              <span className="absolute top-3 right-3 font-mono text-[9px] text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Available
              </span>
            </div>

            <div className="mt-8 space-y-4 text-sm">
              {locationRow ? (
                <div className="flex items-center gap-3 text-text-muted">
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <polygon points="5,0 10,5 5,10 0,5" fill="currentColor" />
                  </svg>
                  <span>{locationRow.value}</span>
                </div>
              ) : null}
              {statusRow ? (
                <div className="flex items-center gap-3 text-text-muted">
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
                    <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                  <span>{statusRow.value}</span>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="lg:col-span-2">
            <h3 className="font-display text-3xl lg:text-4xl font-medium text-text-primary leading-tight">
              {data.heading ?? ""}
              {data.headingAccent ? (
                <span className="gradient-text"> {data.headingAccent}</span>
              ) : null}
            </h3>

            <div className="mt-6 space-y-4 text-text-muted text-base leading-[1.8]">
              {firstParagraph ? (
                <p>
                  <span className="font-display text-5xl float-left mr-3 leading-none text-accent">
                    {firstLetter}
                  </span>
                  {firstParagraphRest}
                </p>
              ) : null}
              {restParagraphs.map((paragraph, index) => (
                <p key={`${paragraph.slice(0, 12)}-${index}`}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(data.info ?? []).map((row) => (
                <div key={row.label} className="glass-card p-3 rounded-xl">
                  <div className="font-mono text-[10px] text-accent uppercase tracking-wider mb-1">
                    {row.label}
                  </div>
                  <div className="text-sm text-text-primary">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
