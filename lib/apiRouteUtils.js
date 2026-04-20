/**
 * lib/apiRouteUtils.js — Shared helpers for authenticated API route patterns.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

/**
 * Extract the real client IP from a Next.js Request.
 *
 * Priority:
 *  1. cf-connecting-ip  — set by Cloudflare; not client-controllable
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
  const cf = req.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();

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
