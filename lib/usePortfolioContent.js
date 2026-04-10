/**
 * lib/usePortfolioContent.js
 * Fetches portfolio section data from the DB via /api/portfolio.
 * Falls back to `defaultData` if the DB has no override set.
 *
 * Usage:
 *   const { data, loading } = usePortfolioContent("hero", DEFAULT_HERO);
 */

import { useState, useEffect } from "react";

// Module-level cache: persists for the lifetime of the page (cleared on full reload).
// Prevents 6 parallel DB fetches on portfolio load — each section fetches at most once.
const cache = new Map();

/**
 * @param {string} section  - "hero" | "about" | "experience" | "projects" | "skills" | "education"
 * @param {*} defaultData   - hardcoded fallback used until DB responds (or if DB is empty)
 * @returns {{ data: *, loading: boolean }}
 */
export function usePortfolioContent(section, defaultData) {
  const [data, setData] = useState(() => cache.get(section) ?? defaultData);
  const [loading, setLoading] = useState(!cache.has(section));

  useEffect(() => {
    if (cache.has(section)) return; // Already fetched — use cached value immediately

    let cancelled = false;
    fetch(`/api/portfolio?section=${section}`)
      .then((r) => r.json())
      .then(({ content }) => {
        if (!cancelled && content !== null && content !== undefined) {
          cache.set(section, content);
          setData(content);
        }
      })
      .catch(() => {
        // Network error — keep defaultData, fail silently
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [section]);

  return { data, loading };
}
