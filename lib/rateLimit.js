/**
 * lib/rateLimit.js — Simple in-memory rate limiter.
 *
 * Uses a Map keyed by an identifier (conversationId or IP).
 * Tracks a sliding window: stores { count, windowStart }.
 * Resets the counter every WINDOW_MS milliseconds.
 *
 * Note: This is per-process only. If you run multiple Node processes
 * (e.g. PM2 cluster mode) each process has its own counter.
 * For single-process deployments (server.js) this is sufficient.
 *
 * In serverless runtimes the process can be frozen/killed between requests,
 * so this store is best-effort and not a strict global limit.
 */

// Max messages allowed per WINDOW_MS per identifier
const MAX_REQUESTS = 10;
// Window size: 60 seconds
const WINDOW_MS = 60_000;

/** @type {Map<string, { count: number; windowStart: number }>} */
const store = new Map();
const CLEANUP_INTERVAL_MS = 5 * 60_000;

// Periodically clean up stale entries (every 5 minutes) to avoid memory leak
const cleanupTimer = setInterval(() => {
  if (store.size === 0) return;

  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

if (typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

/**
 * Check whether the given identifier is within the rate limit.
 *
 * @param {string} identifier - conversationId or IP address
 * @param {number} [maxRequests] - Override default MAX_REQUESTS for this check
 * @param {number} [windowSec] - Override default window in seconds for this check
 * @param {string} [scope] - Logical namespace for this limiter key
 * @returns {{ allowed: boolean; remaining: number; retryAfter: number }}
 *   - allowed: true if the request should proceed
 *   - remaining: how many requests are left in this window
 *   - retryAfter: seconds until the window resets (only relevant when !allowed)
 */
export function checkRateLimit(identifier, maxRequests = MAX_REQUESTS, windowSec = WINDOW_MS / 1000, scope = "global") {
  const safeMaxRequests =
    Number.isFinite(maxRequests) && maxRequests > 0 ? Math.floor(maxRequests) : MAX_REQUESTS;
  const safeWindowSec =
    Number.isFinite(windowSec) && windowSec > 0 ? Number(windowSec) : WINDOW_MS / 1000;
  const windowMs = safeWindowSec * 1000;
  const now = Date.now();
  const normalizedIdentifier =
    typeof identifier === "string" && identifier.trim() ? identifier.trim() : "unknown";
  const normalizedScope =
    typeof scope === "string" && scope.trim() ? scope.trim() : "global";
  const storeKey = JSON.stringify([normalizedScope, normalizedIdentifier, safeMaxRequests, safeWindowSec]);
  const entry = store.get(storeKey);

  if (!entry || now - entry.windowStart > windowMs) {
    // Start a fresh window
    store.set(storeKey, { count: 1, windowStart: now });
    return { allowed: true, remaining: safeMaxRequests - 1, retryAfter: 0 };
  }

  if (entry.count >= safeMaxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    console.warn("[rateLimit] limit hit", {
      scope: normalizedScope,
      identifier: normalizedIdentifier,
      maxRequests: safeMaxRequests,
      windowSec: safeWindowSec,
      retryAfter,
    });
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: safeMaxRequests - entry.count, retryAfter: 0 };
}
