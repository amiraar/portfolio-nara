/**
 * app/api/conversations/[id]/route.js — Get full conversation detail (messages + visitor).
 * GET /api/conversations/:id → PUBLIC (visitors load their own history via CUID from localStorage).
 * PATCH /api/conversations/:id → protected (owner only — change status).
 */

import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { requireOwnerSession, unauthorizedResponse, getClientIP } from "@/lib/apiRouteUtils";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * GET — requires either an owner session OR a valid visitor-token cookie that owns the conversation.
 * Both the visitor (ChatWidget) and the owner (Dashboard) call this endpoint.
 * The owner authenticates via NextAuth session; visitors authenticate via HttpOnly visitor-token cookie.
 */
export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Rate limit to prevent CUID enumeration brute-force.
    const ip = getClientIP(req);
    const { allowed, retryAfter } = await checkRateLimit(`conv-get:${ip}`, 30, 60, "conv-get");
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    // --- Authentication: owner session OR visitor token ---
    const session = await requireOwnerSession(authOptions);

    let visitorOwnerId = null;
    if (!session) {
      // Not an owner — require a valid visitor-token cookie
      const visitorToken = req.cookies.get("visitor-token")?.value;
      if (!visitorToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const tokenOwner = await prisma.visitor.findUnique({ where: { token: visitorToken } });
      if (!tokenOwner) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      visitorOwnerId = tokenOwner.id;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        visitor: true,
        messages: { orderBy: { timestamp: "asc" } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Visitors may only read their own conversation
    if (visitorOwnerId !== null && conversation.visitorId !== visitorOwnerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[GET /api/conversations/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/conversations/:id — Update status (resolve conversation).
 */
export async function PATCH(req, { params }) {
  try {
    const session = await requireOwnerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["active", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "status must be 'active' or 'resolved'" },
        { status: 400 }
      );
    }

    const existing = await prisma.conversation.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[PATCH /api/conversations/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
