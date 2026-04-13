/**
 * components/shared/PortfolioSectionHeader.jsx — Shared title row for portfolio sections.
 */

"use client";

/**
 * Render a portfolio section heading with number and divider.
 * @param {{ number: string, title: string, className?: string }} props
 * @returns {import("react").JSX.Element}
 */
export default function PortfolioSectionHeader({ number, title, className = "mb-14" }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <p className="font-mono text-accent text-xs tracking-widest uppercase">
        {number} — {title}
      </p>
      <div className="gold-divider flex-1 max-w-[60px]" />
    </div>
  );
}
