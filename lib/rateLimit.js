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
 */

// Max messages allowed per WINDOW_MS per identifier
const MAX_REQUESTS = 10;
// Window size: 60 seconds
const WINDOW_MS = 60_000;

/** @type {Map<string, { count: number; windowStart: number }>} */
const store = new Map();

// Periodically clean up stale entries (every 5 minutes) to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}, 5 * 60_000);

/**
 * Check whether the given identifier is within the rate limit.
 *
 * @param {string} identifier - conversationId or IP address
 * @param {number} [maxRequests] - Override default MAX_REQUESTS for this check
 * @param {number} [windowSec] - Override default window in seconds for this check
 * @returns {{ allowed: boolean; remaining: number; retryAfter: number }}
 *   - allowed: true if the request should proceed
 *   - remaining: how many requests are left in this window
 *   - retryAfter: seconds until the window resets (only relevant when !allowed)
 */
export function checkRateLimit(identifier, maxRequests = MAX_REQUESTS, windowSec = WINDOW_MS / 1000) {
  const windowMs = windowSec * 1000;
  const now = Date.now();
  const storeKey = `${identifier}:${maxRequests}:${windowSec}`;
  const entry = store.get(storeKey);

  if (!entry || now - entry.windowStart > windowMs) {
    // Start a fresh window
    store.set(storeKey, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfter: 0 };
}
