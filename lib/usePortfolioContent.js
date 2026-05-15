/**
 * lib/usePortfolioContent.js
 * Fetches portfolio section data from the DB via /api/portfolio.
 * Falls back to `defaultData` if the DB has no override set.
 *
 * Optimisations:
 *  - One batch GET /api/portfolio (no ?section=) on first cache miss, populating
 *    all sections at once instead of firing parallel requests.
 *  - 5-minute TTL: stale entries trigger a fresh batch fetch so the portfolio
 *    stays up-to-date without requiring a hard reload.
 *  - BroadcastChannel: dashboard saves immediately push updated values to all
 *    open tabs so the public page reflects changes without a reload.
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

// Subscribers: section → Set of setState callbacks from active hook instances
const _subscribers = new Map();

function subscribe(section, cb) {
  if (!_subscribers.has(section)) _subscribers.set(section, new Set());
  _subscribers.get(section).add(cb);
  return () => _subscribers.get(section)?.delete(cb);
}

function notifySubscribers(section, value) {
  _subscribers.get(section)?.forEach((cb) => cb(value));
}

// BroadcastChannel: push updates from the dashboard tab to all other open tabs.
let _channel = null;
if (typeof window !== "undefined") {
  _channel = new BroadcastChannel("portfolio-updates");
  _channel.onmessage = (e) => {
    const { section, value } = e.data ?? {};
    if (!section || value === undefined) return;
    cache.set(section, { value, fetchedAt: Date.now() });
    notifySubscribers(section, value);
  };
}

/**
 * Called by the dashboard after a successful save. Updates the local cache,
 * notifies hook instances in the same tab, and broadcasts to other open tabs.
 *
 * @param {string} section
 * @param {*} value  - the saved data (already returned by the PATCH response)
 */
export function notifyPortfolioUpdate(section, value) {
  cache.set(section, { value, fetchedAt: Date.now() });
  notifySubscribers(section, value);
  _channel?.postMessage({ section, value });
}

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
      // API returns { content: { [section]: data } }
      const sections = body?.content ?? {};
      const now = Date.now();
      for (const [section, value] of Object.entries(sections)) {
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
    // Subscribe to live updates (same-tab or cross-tab BroadcastChannel)
    const unsubscribe = subscribe(section, (value) => setData(value));

    if (!isCacheValid(section)) {
      let cancelled = false;
      batchFetch().then(() => {
        if (cancelled) return;
        const value = getCachedValue(section);
        if (value !== undefined) setData(value);
        setLoading(false);
      });
      return () => {
        cancelled = true;
        unsubscribe();
      };
    }

    return unsubscribe;
  }, [section]);

  return { data, loading };
}
