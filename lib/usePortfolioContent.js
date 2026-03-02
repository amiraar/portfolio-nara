/**
 * lib/usePortfolioContent.js
 * Fetches portfolio section data from the DB via /api/portfolio.
 * Falls back to `defaultData` if the DB has no override set.
 *
 * Usage:
 *   const { data, loading } = usePortfolioContent("hero", DEFAULT_HERO);
 */

import { useState, useEffect } from "react";

/**
 * @param {string} section  - "hero" | "experience" | "projects" | "skills" | "education"
 * @param {*} defaultData   - hardcoded fallback used until DB responds (or if DB is empty)
 * @returns {{ data: *, loading: boolean }}
 */
export function usePortfolioContent(section, defaultData) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/portfolio?section=${section}`)
      .then((r) => r.json())
      .then(({ content }) => {
        if (!cancelled && content !== null && content !== undefined) {
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
