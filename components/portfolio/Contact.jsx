/**
 * components/portfolio/Contact.jsx — Contact section (email + LinkedIn).
 * Content loaded dynamically from DB via usePortfolioContent (shared cache with Education).
 */

"use client";

import { useRef } from "react";
import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { useRevealOnScroll } from "@/lib/useRevealOnScroll";
import PortfolioSectionHeader from "@/components/shared/PortfolioSectionHeader";

export default function Contact() {
  const sectionRef = useRef(null);
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);
  useRevealOnScroll(sectionRef, 0.1);

  return (
    <section id="contact" className="pb-28 max-w-5xl mx-auto px-6 lg:px-8">
      <div ref={sectionRef} className="section-reveal">
        <PortfolioSectionHeader number="06" title="Contact" />

        <div className="max-w-md p-6 rounded-xl border border-border bg-surface/60">
          <p className="font-mono text-xs text-accent mb-4 tracking-wider uppercase">Get in Touch</p>
          <h3 className="font-display text-xl font-medium text-text-primary leading-snug mb-2">
            {data.contactHeading}
          </h3>
          <p className="text-text-muted text-sm leading-relaxed mb-6">
            {data.contactSubtext}
          </p>

          <div className="space-y-3">
            <a
              href={`mailto:${data.email}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/30 transition-all group"
            >
              <div>
                <p className="text-xs text-text-muted font-mono">Email</p>
                <p className="text-sm text-text-primary mt-0.5">{data.email}</p>
              </div>
              <span className="text-text-muted group-hover:text-accent transition-colors">↗</span>
            </a>
            <a
              href={data.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/30 transition-all group"
            >
              <div>
                <p className="text-xs text-text-muted font-mono">LinkedIn</p>
                <p className="text-sm text-text-primary mt-0.5">{data.linkedinLabel}</p>
              </div>
              <span className="text-text-muted group-hover:text-accent transition-colors">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
