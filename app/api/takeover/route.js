/**
 * app/api/takeover/route.js — Toggle conversation mode between "ai" and "human".
 * PATCH { conversationId, mode } → updates conversation.mode
 * Protected: only authenticated owner can call this.
 */

import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { emitConversationEvent } from "@/lib/pusher";
import { requireOwnerSession, unauthorizedResponse } from "@/lib/apiRouteUtils";

/**
 * Toggle conversation mode between AI and human takeover.
 * @param {Request} req
 * @returns {Promise<import("next/server").NextResponse>}
 */
export async function PATCH(req) {
  try {
    const session = await requireOwnerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
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
    await emitConversationEvent(conversationId, "mode_changed", {
      conversationId,
      mode,
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("[PATCH /api/takeover]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
