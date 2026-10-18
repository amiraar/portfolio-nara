/**
 * lib/apiRouteUtils.js — Shared helpers for authenticated API route patterns.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createHash, randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

/**
 * Visitor fields that are safe to send to clients (browser JSON, Pusher payloads).
 * Deliberately excludes `token` — it must only ever travel in the HttpOnly cookie.
 */
export const PUBLIC_VISITOR_SELECT = { id: true, name: true, email: true, createdAt: true };

/** Visitor token lifetime; the cookie Max-Age and the DB expiry use the same value. */
export const VISITOR_TOKEN_TTL_SEC = 30 * 24 * 60 * 60;

/**
 * SHA-256 hex digest of a raw visitor token — the form stored in Visitor.token.
 * @param {string} rawToken
 * @returns {string}
 */
export function hashVisitorToken(rawToken) {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

/**
 * Create a new visitor token. `raw` goes into the cookie only; `hash` and
 * `expiresAt` are what the database stores.
 * @returns {{ raw: string, hash: string, expiresAt: Date }}
 */
export function issueVisitorToken() {
  const raw = randomUUID();
  return {
    raw,
    hash: hashVisitorToken(raw),
    expiresAt: new Date(Date.now() + VISITOR_TOKEN_TTL_SEC * 1000),
  };
}

/**
 * Resolve the visitor that owns a raw cookie token. Returns null for a missing,
 * unknown, or expired token.
 * @param {string | null | undefined} rawToken
 * @returns {Promise<import("@prisma/client").Visitor | null>}
 */
export async function findVisitorByToken(rawToken) {
  if (typeof rawToken !== "string" || !rawToken) return null;
  const visitor = await prisma.visitor.findUnique({
    where: { token: hashVisitorToken(rawToken) },
  });
  if (!visitor) return null;
  if (visitor.tokenExpiresAt && visitor.tokenExpiresAt.getTime() <= Date.now()) return null;
  return visitor;
}

/**
 * Permanently delete visitors with all their conversations and messages, in one
 * transaction. Relations have no ON DELETE CASCADE, so children go first.
 * @param {string[]} visitorIds
 * @returns {Promise<{ messages: number, conversations: number, visitors: number }>}
 */
export async function deleteVisitorData(visitorIds) {
  if (visitorIds.length === 0) return { messages: 0, conversations: 0, visitors: 0 };
  const [messages, conversations, visitors] = await prisma.$transaction([
    prisma.message.deleteMany({ where: { conversation: { visitorId: { in: visitorIds } } } }),
    prisma.conversation.deleteMany({ where: { visitorId: { in: visitorIds } } }),
    prisma.visitor.deleteMany({ where: { id: { in: visitorIds } } }),
  ]);
  return { messages: messages.count, conversations: conversations.count, visitors: visitors.count };
}

/**
 * Build the Set-Cookie value for the visitor token.
 * @param {string} rawToken - pass "" with maxAgeSec 0 to clear the cookie
 * @param {number} [maxAgeSec]
 * @returns {string}
 */
export function visitorTokenCookie(rawToken, maxAgeSec = VISITOR_TOKEN_TTL_SEC) {
  return [
    `visitor-token=${rawToken}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${maxAgeSec}`,
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
}

/**
 * Extract the real client IP from a Next.js Request.
 *
 * Priority:
 *  1. cf-connecting-ip  — only when TRUST_CLOUDFLARE=true (app sits behind Cloudflare).
 *                         Otherwise it is a plain client-controlled header and ignored.
 *  2. x-real-ip         — set by Vercel/nginx; not client-controllable
 *  3. x-forwarded-for   — last resort; only the first hop is used
 *
 * Never trust the full x-forwarded-for chain when used for security decisions;
 * it can be spoofed by the client if the server is not behind a trusted proxy.
 *
 * @param {Request} req
 * @returns {string}
 */
export function getClientIP(req) {
  if (process.env.TRUST_CLOUDFLARE === "true") {
    const cf = req.headers.get("cf-connecting-ip");
    if (cf?.trim()) return cf.trim();
  }

  const real = req.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  return "unknown";
}

/**
 * Check that a state-changing request comes from the app's own origin.
 * Compares full origins exactly — a prefix check would accept look-alike hosts
 * such as "https://site.vercel.app.evil.com".
 * @param {Request} req
 * @returns {boolean}
 */
export function isTrustedOrigin(req) {
  const origin = req.headers.get("origin");
  const allowed = process.env.NEXTAUTH_URL;
  if (!origin || !allowed) return false;
  try {
    return new URL(origin).origin === new URL(allowed).origin;
  } catch {
    return false;
  }
}

/**
 * Record an owner action in the audit trail (who, what, which object, when).
 * Never pass message bodies or other personal data in `details`.
 * @param {import("next-auth").Session} session
 * @param {string} action
 * @param {Record<string, unknown>} [details]
 * @returns {Promise<void>}
 */
export function auditLog(session, action, details = {}) {
  return recordAuditEvent({
    actor: session?.user?.email ?? "unknown",
    action,
    details,
  });
}

/**
 * Build a consistent forbidden JSON response envelope.
 * @returns {import("next/server").NextResponse}
 */
export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * Resolve owner session for protected route handlers.
 * @param {import("next-auth").AuthOptions} authOptions
 * @returns {Promise<import("next-auth").Session | null>}
 */
export async function requireOwnerSession(authOptions) {
  return getServerSession(authOptions);
}

/**
 * Build a consistent unauthorized JSON response envelope.
 * @returns {import("next/server").NextResponse}
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Fetch a conversation by id.
 * @param {string} conversationId
 * @param {import("@prisma/client").Prisma.ConversationFindUniqueArgs} [query]
 * @returns {Promise<import("@prisma/client").Conversation | null>}
 */
export async function findConversation(conversationId, query = {}) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    ...query,
  });
}

/**
 * Touch conversation.updatedAt after message writes.
 * @param {string} conversationId
 * @returns {Promise<import("@prisma/client").Conversation>}
 */
export async function touchConversation(conversationId) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}
