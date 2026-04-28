/**
 * components/portfolio/Contact.jsx — Contact section (email + LinkedIn).
 * Content loaded dynamically from DB via usePortfolioContent (shared cache with Education).
 */

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
        <div className="bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5 rounded-3xl p-8 lg:p-12">
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-text-primary">
            {headingFirst}
            {headingRest ? <span className="gradient-text"> {headingRest}</span> : null}
          </h2>
          <p className="text-text-muted text-lg leading-relaxed max-w-xl mt-4">
            {data.contactSubtext}
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <a
              href={`mailto:${data.email}`}
              className="glass-card p-6 rounded-2xl flex-1 group cursor-pointer hover:-translate-y-1 hover:border-accent/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-mono text-[10px] text-accent">EMAIL</p>
                  <p className="text-text-primary text-sm mt-2">{data.email}</p>
                </div>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 12L12 4M12 4H7M12 4V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </a>
            <a
              href={data.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 rounded-2xl flex-1 group cursor-pointer hover:-translate-y-1 hover:border-accent/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-mono text-[10px] text-accent">LINKEDIN</p>
                  <p className="text-text-primary text-sm mt-2">{data.linkedinLabel}</p>
                </div>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 12L12 4M12 4H7M12 4V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </a>
          </div>

          <p className="font-mono text-[10px] text-text-muted/50 text-center mt-6">
            Response time &lt; 24h
          </p>
        </div>
      </div>
    </section>
  );
}
