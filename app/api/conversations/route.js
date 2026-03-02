/**
 * app/api/conversations/route.js — List all conversations (dashboard use).
 * GET → returns conversations sorted by latest message, with visitor info.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    // Protect: only authenticated owner can list conversations
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        visitor: true,
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1, // Latest message preview
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[GET /api/conversations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
