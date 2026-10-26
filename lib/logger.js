/**
 * lib/logger.js — Durable server error log (AppLog table), readable in the
 * dashboard so errors do not live only in the host's short-lived runtime log.
 */

import prisma from "@/lib/prisma";

const MAX_MESSAGE = 500;
const MAX_STACK = 2000;

/**
 * Message text that is safe to store. Prisma error messages print the query
 * arguments (emails, message bodies), so only their name and code are kept.
 * @param {unknown} error
 * @returns {string}
 */
function safeMessage(error) {
  if (error?.name?.startsWith?.("PrismaClient")) {
    return [error.name, error.code].filter(Boolean).join(" ");
  }
  return String(error?.message ?? error).slice(0, MAX_MESSAGE);
}

/**
 * Log one server error to the console and the AppLog table. Never throws: a
 * logging failure must not break the request it describes.
 *
 * Await it — on serverless hosts work left running after the response is sent
 * may be frozen before it completes.
 *
 * @param {string} source - the existing log label, e.g. "POST /api/chat"
 * @param {unknown} error
 * @param {Record<string, unknown>} [context] - ids and codes only; no message bodies, passwords, tokens or visitor PII
 * @returns {Promise<void>}
 */
export async function logError(source, error, context) {
  console.error(`[${source}]`, error, ...(context ? [context] : []));

  const stack = typeof error?.stack === "string" && !error.name?.startsWith?.("PrismaClient")
    ? error.stack.slice(0, MAX_STACK)
    : undefined;
  const details = { ...(context ?? {}), ...(stack ? { stack } : {}) };

  try {
    await prisma.appLog.create({
      data: {
        source,
        message: safeMessage(error),
        ...(Object.keys(details).length > 0 ? { details } : {}),
      },
    });
  } catch (dbError) {
    console.error("[logger] failed to persist error", { source, error: dbError?.message ?? String(dbError) });
  }
}
