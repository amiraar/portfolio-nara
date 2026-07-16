"use client";

/**
 * @param {{ number: string, title: string, className?: string }} props
 */
export default function PortfolioSectionHeader({ number, title, className = "mb-12" }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="font-mono text-[10px] text-accent/70 tracking-widest">{number}</span>
      <span className="h-px w-8 bg-accent/40" />
      <h2 className="font-display text-4xl text-text-primary">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
    </div>
  );
}
