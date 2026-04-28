/**
 * components/portfolio/Footer.jsx — Site footer with social links.
 * Content loaded dynamically from DB via usePortfolioContent (shared cache with Education).
 */

"use client";

import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";

export default function Footer() {
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);
  const githubUrl = data.github ?? "https://github.com/";

  return (
    <footer className="max-w-6xl mx-auto px-6 lg:px-8 pb-12 pt-8">
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-8" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-start leading-none">
          <span className="font-mono text-xs tracking-widest uppercase text-accent">MA</span>
          <span className="font-display text-[10px] italic text-text-muted">Kurniawan</span>
        </div>

        <div className="font-mono text-[10px] text-text-muted/40 uppercase tracking-widest text-center">
          {data.footerCopy}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${data.email}`}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-all"
            aria-label="Email"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z" />
              <path d="m4 6 8 6 8-6" />
            </svg>
          </a>
          <a
            href={data.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-all"
            aria-label="LinkedIn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6H8V8h4v2" />
              <rect x="2" y="9" width="4" height="11" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-all"
            aria-label="GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-4 1.5-4-2.5-6-3" />
              <path d="M15 19c0-2 1-3 3-3s3 1 3 3" />
              <path d="M9 19v-4a4 4 0 0 1 8 0v4" />
              <path d="M5 16c-2-1-3-2-3-4 0-3 2-5 5-6" />
              <path d="M19 6c3 1 5 3 5 6 0 2-1 3-3 4" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
