/**
 * app/api/send/route.js — Owner manual reply to a conversation.
 * POST { conversationId, content } → saves message as role "owner", emits via Pusher
 * Protected: only authenticated owner can call this.
 */

import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { emitConversationEvent } from "@/lib/pusher";
import {
  findConversation,
  requireOwnerSession,
  touchConversation,
  unauthorizedResponse,
} from "@/lib/apiRouteUtils";

/**
 * Save an owner message and broadcast it to visitor + dashboard channels.
 * @param {Request} req
 * @returns {Promise<import("next/server").NextResponse>}
 */
export async function POST(req) {
  try {
    const session = await requireOwnerSession(authOptions);
    if (!session) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { conversationId, content } = body;

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      );
    }

    // Verify conversation exists
    const conversation = await findConversation(conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Save owner's message
    const message = await prisma.message.create({
      data: {
        conversationId,
        role: "owner",
        content: content.trim(),
      },
    });

    // Update conversation timestamp
    await touchConversation(conversationId);

    // Emit to both visitor conversation channel and dashboard channel
    await emitConversationEvent(conversationId, "new_message", {
      conversationId,
      message,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[POST /api/send]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
