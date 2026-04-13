/**
 * components/portfolio/About.jsx — About section with personal summary.
 * Content loaded dynamically from DB via usePortfolioContent.
 */

"use client";

import { useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import PortfolioSectionHeader from "@/components/shared/PortfolioSectionHeader";

export default function About() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("about", PORTFOLIO_DEFAULTS.about);
  useRevealOnScroll(sectionRef, 0.15);

  return (
    <section id="about" className="py-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <PortfolioSectionHeader number="01" title="About" className="mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl font-medium text-text-primary leading-tight mb-6">
              {data.heading ?? ""}
              {data.headingAccent
                ? <span className="text-accent italic"> {data.headingAccent}</span>
                : null
              }
            </h2>
            <div className="space-y-4 text-text-muted text-base leading-relaxed">
              {(data.paragraphs ?? []).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {(data.info ?? []).map((row) => (
              <InfoRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-4 py-3 border-b border-border">
      <span className="font-mono text-xs text-accent w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-text-muted leading-relaxed">{value}</span>
    </div>
  );
}
