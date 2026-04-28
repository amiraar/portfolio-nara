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
    <div className={`flex items-center gap-6 ${className}`}>
      <span className="font-mono text-[10px] text-accent/60 tracking-widest">{number}</span>
      <h2 className="font-display text-4xl lg:text-5xl font-medium text-text-primary">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-accent/20 to-transparent" />
    </div>
  );
}
