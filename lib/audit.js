/**
 * lib/audit.js — Durable audit trail (AuditEvent table).
 *
 * Kept separate from lib/apiRouteUtils.js so lib/authOptions.js can record
 * authentication events without importing route helpers.
 */

import prisma from "@/lib/prisma";

/**
 * Record one audit event. Never throws: a logging failure must not break the
 * request it describes, so errors fall back to the runtime log.
 *
 * Await it — on serverless hosts work left running after the response is sent
 * may be frozen before it completes.
 *
 * @param {{ actor: string, action: string, ip?: string | null, details?: Record<string, unknown> }} event
 *   `details` must not contain message bodies, passwords, tokens or visitor PII.
 * @returns {Promise<void>}
 */
export async function recordAuditEvent({ actor, action, ip = null, details }) {
  console.info("[audit]", { actor, action, ...(details ?? {}), at: new Date().toISOString() });
  try {
    await prisma.auditEvent.create({
      data: { actor, action, ip, ...(details ? { details } : {}) },
    });
  } catch (error) {
    console.error("[audit] failed to persist event", { action, error: error?.message ?? String(error) });
  }
}
