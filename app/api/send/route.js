/**
 * app/api/send/route.js — Owner manual reply to a conversation.
 * POST { conversationId, content } → saves message as role "owner", emits via Socket.io
 * Protected: only authenticated owner can call this.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

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
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Emit to both visitor room and dashboard
    if (global.io) {
      global.io.to(conversationId).emit("new_message", {
        conversationId,
        message,
      });
      global.io.to("dashboard").emit("new_message", {
        conversationId,
        message,
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[POST /api/send]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
