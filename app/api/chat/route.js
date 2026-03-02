/**
 * app/api/chat/route.js — Handle inbound visitor messages.
 * POST { conversationId, content } → saves message, calls OpenAI if mode="ai"
 * Emits Socket.io events for realtime delivery.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getKaiaReply } from "@/lib/openai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { conversationId, content } = body;

    if (!conversationId || !content?.trim()) {
      return NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      );
    }

    // Fetch conversation with the visitor's details
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        visitor: true,
        messages: { orderBy: { timestamp: "asc" } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Save the visitor's message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: content.trim(),
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Notify dashboard of the new visitor message in realtime
    if (global.io) {
      global.io.to("dashboard").emit("new_message", {
        conversationId,
        message: userMessage,
        visitor: conversation.visitor,
      });
    }

    // If mode is "human", do not call OpenAI — owner handles this
    if (conversation.mode === "human") {
      return NextResponse.json({ message: userMessage, aiReply: null });
    }

    // --- AI mode: call Kaia ---

    // Emit typing indicator to the visitor's room
    if (global.io) {
      global.io.to(conversationId).emit("kaia_typing", { conversationId });
    }

    // Build history (all previous messages, new one already in DB)
    const history = conversation.messages; // messages before the new one

    let replyText;
    try {
      replyText = await getKaiaReply(history, content.trim());
    } catch (aiError) {
      console.error("[OpenAI error]", aiError);
      replyText = "Maaf, Kaia sedang tidak tersedia. Coba lagi nanti.";
    }

    // Save Kaia's reply
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: "assistant",
        content: replyText,
      },
    });

    // Emit Kaia's reply to the visitor's room
    if (global.io) {
      global.io.to(conversationId).emit("new_message", {
        conversationId,
        message: assistantMessage,
      });
      // Also notify dashboard
      global.io.to("dashboard").emit("new_message", {
        conversationId,
        message: assistantMessage,
      });
    }

    return NextResponse.json({ message: userMessage, aiReply: assistantMessage });
  } catch (error) {
    console.error("[POST /api/chat]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
