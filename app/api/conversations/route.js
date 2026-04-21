/**
 * app/api/conversations/route.js — List all conversations (dashboard use).
 * GET → returns conversations sorted by latest message, with visitor info.
 *
 * Query params:
 *   cursor   — cuid of the last conversation on the previous page (cursor-based pagination)
 *   q        — search string matched against visitor name and email (case-insensitive)
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function GET(req) {
  try {
    // Protect: only authenticated owner can list conversations
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") ?? null;
    const q = searchParams.get("q")?.trim() ?? null;

    // Build optional visitor search filter
    const visitorFilter = q
      ? {
          visitor: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q } },
            ],
          },
        }
      : {};

    const conversations = await prisma.conversation.findMany({
      take: PAGE_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: visitorFilter,
      orderBy: { updatedAt: "desc" },
      include: {
        visitor: true,
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1, // Latest message preview
        },
      },
    });

    // Compute unread count per conversation in-process (avoids N+1 queries).
    // "Unread" = messages by the visitor (role="user") after ownerLastReadAt.
    const conversationIds = conversations.map((c) => c.id);

    const unreadCounts =
      conversationIds.length > 0
        ? await prisma.$queryRaw`
            SELECT
              m."conversationId",
              COUNT(*)::int AS "unreadCount"
            FROM "Message" m
            JOIN "Conversation" c ON c.id = m."conversationId"
            WHERE
              m."conversationId" = ANY(${conversationIds})
              AND m.role = 'user'
              AND (c."ownerLastReadAt" IS NULL OR m.timestamp > c."ownerLastReadAt")
            GROUP BY m."conversationId"
          `
        : [];

    const unreadMap = Object.fromEntries(
      unreadCounts.map((r) => [r.conversationId, r.unreadCount])
    );

    const enriched = conversations.map((c) => ({
      ...c,
      unreadCount: unreadMap[c.id] ?? 0,
    }));

    const nextCursor =
      conversations.length === PAGE_SIZE
        ? conversations[conversations.length - 1].id
        : null;

    return NextResponse.json({ conversations: enriched, nextCursor });
  } catch (error) {
    console.error("[GET /api/conversations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
