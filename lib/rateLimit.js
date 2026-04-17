/**
 * lib/rateLimit.js — Persistent, serverless-safe rate limiter backed by PostgreSQL.
 *
 * Uses an atomic "INSERT ... ON CONFLICT DO UPDATE" (upsert) so every check is
 * a single round-trip with no race conditions, even across multiple serverless
 * function instances or cold-start resets.
 *
 * Key format: "<scope>:<identifier>:<maxRequests>:<windowSec>"
 * The key encodes the full window spec so different limits never share a counter.
 *
 * Public API (unchanged from the previous in-memory version):
 *   checkRateLimit(identifier, maxRequests?, windowSec?, scope?)
 *     → Promise<{ allowed, remaining, retryAfter }>
 *
 *   checkMultiRateLimit(identifier, windows[])
 *     → Promise<{ allowed, remaining, retryAfter, limitedBy }>
 */

import prisma from "@/lib/prisma";

const MAX_REQUESTS_DEFAULT = 10;
const WINDOW_SEC_DEFAULT = 60;

/**
 * Atomically increment the request counter for a given key.
 * If the window has expired, the counter resets to 1.
 *
 * Returns the post-increment state: { count, windowStart }.
 *
 * The raw SQL upsert is necessary to make the "reset if expired" logic atomic —
 * a Prisma-level read-modify-write would have a TOCTOU race condition.
 *
 * @param {string} key
 * @param {number} windowSec
 * @returns {Promise<{ count: number; windowStart: Date }>}
 */
async function atomicIncrement(key, windowSec) {
  const rows = await prisma.$queryRaw`
    INSERT INTO rate_limit_entries (key, count, window_start, updated_at)
    VALUES (${key}, 1, NOW(), NOW())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN EXTRACT(EPOCH FROM (NOW() - rate_limit_entries.window_start)) > ${windowSec}::float
          THEN 1
        ELSE rate_limit_entries.count + 1
      END,
      window_start = CASE
        WHEN EXTRACT(EPOCH FROM (NOW() - rate_limit_entries.window_start)) > ${windowSec}::float
          THEN NOW()
        ELSE rate_limit_entries.window_start
      END,
      updated_at = NOW()
    RETURNING count, window_start
  `;

  return {
    count: Number(rows[0].count),
    windowStart: rows[0].window_start,
  };
}

/**
 * Check whether the given identifier is within the rate limit.
 *
 * @param {string} identifier - visitor ID, conversationId, or IP address
 * @param {number} [maxRequests]
 * @param {number} [windowSec]
 * @param {string} [scope] - logical namespace for this limiter key
 * @returns {Promise<{ allowed: boolean; remaining: number; retryAfter: number }>}
 */
export async function checkRateLimit(
  identifier,
  maxRequests = MAX_REQUESTS_DEFAULT,
  windowSec = WINDOW_SEC_DEFAULT,
  scope = "global"
) {
  const safeMax =
    Number.isFinite(maxRequests) && maxRequests > 0 ? Math.floor(maxRequests) : MAX_REQUESTS_DEFAULT;
  const safeWindowSec =
    Number.isFinite(windowSec) && windowSec > 0 ? Number(windowSec) : WINDOW_SEC_DEFAULT;

  const normalizedId =
    typeof identifier === "string" && identifier.trim() ? identifier.trim() : "unknown";
  const normalizedScope =
    typeof scope === "string" && scope.trim() ? scope.trim() : "global";

  const key = `${normalizedScope}:${normalizedId}:${safeMax}:${safeWindowSec}`;

  const { count, windowStart } = await atomicIncrement(key, safeWindowSec);

  if (count > safeMax) {
    const elapsedSec = (Date.now() - new Date(windowStart).getTime()) / 1000;
    const retryAfter = Math.ceil(safeWindowSec - elapsedSec);
    console.warn("[rateLimit] limit hit", {
      scope: normalizedScope,
      identifier: normalizedId,
      maxRequests: safeMax,
      windowSec: safeWindowSec,
      count,
      retryAfter,
    });
    return { allowed: false, remaining: 0, retryAfter: Math.max(retryAfter, 1) };
  }

  return { allowed: true, remaining: safeMax - count, retryAfter: 0 };
}

/**
 * Check multiple rate limit windows simultaneously for a single identifier.
 * All windows must pass — if any fails, the most restrictive result is returned.
 *
 * @param {string} identifier
 * @param {Array<{ maxRequests: number; windowSec: number; scope: string }>} windows
 * @returns {Promise<{ allowed: boolean; remaining: number; retryAfter: number; limitedBy: string | null }>}
 */
export async function checkMultiRateLimit(identifier, windows) {
  // Run all window checks in parallel — each is an independent DB upsert.
  const results = await Promise.all(
    windows.map(({ maxRequests, windowSec, scope }) =>
      checkRateLimit(identifier, maxRequests, windowSec, scope).then((r) => ({ ...r, scope }))
    )
  );

  let mostRestrictive = { allowed: true, remaining: Infinity, retryAfter: 0, limitedBy: null };

  for (const result of results) {
    if (!result.allowed) {
      if (!mostRestrictive.limitedBy || result.retryAfter > mostRestrictive.retryAfter) {
        mostRestrictive = {
          allowed: false,
          remaining: 0,
          retryAfter: result.retryAfter,
          limitedBy: result.scope,
        };
      }
    } else if (mostRestrictive.allowed) {
      if (result.remaining < mostRestrictive.remaining) {
        mostRestrictive.remaining = result.remaining;
      }
    }
  }

  return mostRestrictive;
}
