/**
 * lib/usePortfolioContent.js
 * Fetches portfolio section data from the DB via /api/portfolio.
 * Falls back to `defaultData` if the DB has no override set.
 *
 * Optimisations:
 *  - One batch GET /api/portfolio (no ?section=) on first cache miss, populating
 *    all 6 sections at once instead of firing 6 parallel requests.
 *  - 5-minute TTL: stale entries trigger a fresh batch fetch so the portfolio
 *    stays up-to-date without requiring a hard reload.
 *
 * Usage:
 *   const { data, loading } = usePortfolioContent("hero", DEFAULT_HERO);
 */

import { useState, useEffect } from "react";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Module-level cache: { [section]: { value, fetchedAt } }
const cache = new Map();

// In-flight batch fetch promise — shared across all hook instances so only one
// GET /api/portfolio request fires even when 6 components mount simultaneously.
let _batchFetchPromise = null;

function isCacheValid(section) {
  const entry = cache.get(section);
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

function getCachedValue(section) {
  return cache.get(section)?.value;
}

/**
 * Fire (or reuse an in-flight) batch fetch that populates all sections at once.
 * Returns a Promise that resolves when the cache has been populated.
 */
function batchFetch() {
  if (_batchFetchPromise) return _batchFetchPromise;

  _batchFetchPromise = fetch("/api/portfolio")
    .then((r) => r.json())
    .then((body) => {
      const now = Date.now();
      // body is { [section]: data | null }
      for (const [section, value] of Object.entries(body)) {
        if (value !== null && value !== undefined) {
          cache.set(section, { value, fetchedAt: now });
        }
      }
    })
    .catch(() => {
      // Network error — leave cache untouched; components fall back to defaultData
    })
    .finally(() => {
      _batchFetchPromise = null;
    });

  return _batchFetchPromise;
}

/**
 * @param {string} section  - "hero" | "about" | "experience" | "projects" | "skills" | "education"
 * @param {*} defaultData   - hardcoded fallback used until DB responds (or if DB is empty)
 * @returns {{ data: *, loading: boolean }}
 */
export function usePortfolioContent(section, defaultData) {
  const [data, setData] = useState(() =>
    isCacheValid(section) ? getCachedValue(section) : defaultData
  );
  const [loading, setLoading] = useState(!isCacheValid(section));

  useEffect(() => {
    if (isCacheValid(section)) return; // Fresh cache hit — nothing to do

    let cancelled = false;

    batchFetch().then(() => {
      if (cancelled) return;
      const value = getCachedValue(section);
      if (value !== undefined) setData(value);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [section]);

  return { data, loading };
}
