/**
 * lib/apiRouteUtils.js — Shared helpers for authenticated API route patterns.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

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
