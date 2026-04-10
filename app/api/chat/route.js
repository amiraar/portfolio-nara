/**
 * app/api/chat/route.js — Handle inbound visitor messages.
 * POST { conversationId, content } → saves message, calls OpenAI if mode="ai"
 * Emits Pusher events for realtime delivery.
 *
 * Security:
 *  - Rate limit: 10 messages per minute per conversationId (fallback to IP).
 *  - Input validation: message must be 1–1000 characters.
 *  - Graceful OpenAI fallback: returns a helpful message if the AI is down.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getKaiaReply } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rateLimit";
import pusher from "@/lib/pusher";

/** Maximum allowed message length (characters). */
const MAX_CONTENT_LENGTH = 1000;

/** Fallback reply shown to visitors when OpenAI is unavailable. */
const AI_FALLBACK_MESSAGE =
  "Maaf, Kaia sedang tidak tersedia saat ini. Silakan hubungi Amirul langsung di amrlkurniawn19@gmail.com — ia akan segera membalas pesan Anda.";

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

    // --- Verify visitor identity via HttpOnly cookie (not request body) ---
    const visitorToken = req.cookies.get("visitor-token")?.value;
    if (!visitorToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Resolve visitor from the signed server-issued token
    const tokenOwner = await prisma.visitor.findUnique({ where: { token: visitorToken } });
    if (!tokenOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- XSS sanitization + input length validation ---
    // Strip HTML-dangerous characters before storing or sending to OpenAI
    const trimmed = content.trim().replace(/[<>"'`]/g, "");
    if (trimmed.length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_CONTENT_LENGTH} characters allowed.` },
        { status: 400 }
      );
    }

    // --- Rate limiting ---
    // Prefer conversationId as the rate-limit key (stable, visitor-specific).
    // Fall back to forwarded IP if needed.
    const rateLimitKey =
      conversationId ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "unknown";

    const { allowed, remaining, retryAfter } = checkRateLimit(rateLimitKey);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak pesan. Coba lagi dalam ${retryAfter} detik.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
          },
        }
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

    // --- Ownership check: cookie-resolved visitor must own this conversation ---
    if (conversation.visitorId !== tokenOwner.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Save the visitor's message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: trimmed,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Notify dashboard of the new visitor message in realtime
    await pusher.trigger("private-dashboard", "new_message", {
      conversationId,
      message: userMessage,
      visitor: conversation.visitor,
    });

    // If mode is "human", do not call OpenAI — owner handles this
    if (conversation.mode === "human") {
      return NextResponse.json({ message: userMessage, aiReply: null });
    }

    // --- AI mode: call Kaia ---

    // Emit typing indicator to the visitor's conversation channel
    await pusher.trigger(
      `private-conversation-${conversationId}`,
      "kaia_typing",
      { conversationId }
    );

    // Build history (all previous messages, new one already in DB)
    const history = conversation.messages; // messages before the new one

    let replyText;
    try {
      replyText = await getKaiaReply(history, trimmed);
    } catch (aiError) {
      console.error("[OpenAI error]", aiError);
      replyText = AI_FALLBACK_MESSAGE;
    }

    // Save Kaia's reply
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: "assistant",
        content: replyText,
      },
    });

    // Emit Kaia's reply to the visitor's conversation channel
    await pusher.trigger(`private-conversation-${conversationId}`, "new_message", {
      conversationId,
      message: assistantMessage,
    });

    // Also notify dashboard
    await pusher.trigger("private-dashboard", "new_message", {
      conversationId,
      message: assistantMessage,
    });

    return NextResponse.json({ message: userMessage, aiReply: assistantMessage });
  } catch (error) {
    console.error("[POST /api/chat]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
