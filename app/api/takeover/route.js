/**
 * app/api/takeover/route.js — Toggle conversation mode between "ai" and "human".
 * PATCH { conversationId, mode } → updates conversation.mode
 * Protected: only authenticated owner can call this.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, mode } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    if (!["ai", "human"].includes(mode)) {
      return NextResponse.json(
        { error: "mode must be 'ai' or 'human'" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { mode },
    });

    // Notify all parties about mode change via Pusher
    await pusher.trigger(`private-conversation-${conversationId}`, "mode_changed", {
      conversationId,
      mode,
    });
    await pusher.trigger("private-dashboard", "mode_changed", {
      conversationId,
      mode,
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[PATCH /api/takeover]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
