/**
 * app/api/conversations/[id]/route.js — Get full conversation detail (messages + visitor).
 * GET /api/conversations/:id → protected, returns full message history.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
