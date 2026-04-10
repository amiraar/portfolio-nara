/**
 * components/portfolio/Footer.jsx — Site footer with copyright.
 * Content loaded dynamically from DB via usePortfolioContent (shared cache with Education).
 */

"use client";

import { usePortfolioContent } from "@/lib/usePortfolioContent";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";

export default function Footer() {
  const { data } = usePortfolioContent("education", PORTFOLIO_DEFAULTS.education);

  return (
    <footer className="max-w-5xl mx-auto px-6 lg:px-8 pb-12 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-display text-text-muted text-sm">{data.footerCopy}</p>
      </div>
    </footer>
  );
}
