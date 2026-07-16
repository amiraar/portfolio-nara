"use client";

import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";

export default function Footer() {
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);
  const githubUrl = data.github ?? "https://github.com/";

  return (
    <footer className="max-w-6xl mx-auto px-6 lg:px-8 pb-10 pt-6">
      <div
        className="h-px mb-8"
        style={{ background: "linear-gradient(90deg, transparent, rgb(var(--color-border)), transparent)" }}
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center">
            <span className="font-mono text-[8px] tracking-wide text-accent">MA</span>
          </span>
          <span className="font-display italic text-[11px] text-text-muted">Kurniawan</span>
        </div>

        <p className="font-mono text-[9px] text-text-muted/35 uppercase tracking-widest text-center">
          {data.footerCopy}
        </p>

        {/* Social links */}
        <div className="flex items-center gap-2">
          {[
            {
              href: `mailto:${data.email}`,
              label: "Email",
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              ),
            },
            {
              href: data.linkedin,
              label: "LinkedIn",
              target: "_blank",
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6H8V8h4v2" />
                  <rect x="2" y="9" width="4" height="11" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              ),
            },
            {
              href: githubUrl,
              label: "GitHub",
              target: "_blank",
              icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-4 1.5-4-2.5-6-3m6 3v-4a4 4 0 0 1 8 0v4m0 0c4 1.5 4-2.5 6-3" />
                  <path d="M12 3C7 3 4 7 4 10c0 2 1 3 2 4l-.5 2.5C5.1 17.7 6 18.5 7 18.5c.8 0 1.5-.4 2-1" />
                  <path d="M15 17.5c.5.6 1.2 1 2 1 1 0 1.9-.8 1.5-2L18 13c1-1 2-2 2-4 0-3-3-7-8-7" />
                </svg>
              ),
            },
          ].map(({ href, label, target, icon }) => (
            <a
              key={label}
              href={href}
              target={target}
              rel={target ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-text-muted hover:border-accent/40 hover:text-accent hover:bg-accent/6 transition-all"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
