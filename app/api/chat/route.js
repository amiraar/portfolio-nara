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
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { getKaiaReply } from "@/lib/openai";
import { checkMultiRateLimit } from "@/lib/rateLimit";
import pusher, { emitConversationEvent } from "@/lib/pusher";
import { touchConversation } from "@/lib/apiRouteUtils";

/** Maximum allowed message length (characters). */
const MAX_CONTENT_LENGTH = 1000;

/** Fallback reply shown to visitors when OpenAI is unavailable. */
const AI_FALLBACK_MESSAGE =
  "Maaf, Kaia sedang tidak tersedia saat ini. Silakan hubungi Amirul langsung di amrlkurniawn19@gmail.com — ia akan segera membalas pesan Anda.";

function getCorrelationId(req) {
  const incoming = req.headers.get("x-correlation-id");
  if (incoming && incoming.trim()) return incoming.trim();
  return randomUUID();
}

function normalizeClientTempId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > 120) return null;
  if (!/^[a-zA-Z0-9:_-]+$/.test(normalized)) return null;
  return normalized;
}

function withCorrelation(response, correlationId) {
  response.headers.set("X-Correlation-Id", correlationId);
  return response;
}

/**
 * Persist a visitor chat message and optional AI reply.
 * @param {Request} req
 * @returns {Promise<import("next/server").NextResponse>}
 */
export async function POST(req) {
  const correlationId = getCorrelationId(req);
  const startedAt = Date.now();

  try {
    const body = await req.json();
    const { conversationId, content, clientTempId: rawClientTempId } = body;
    const clientTempId = normalizeClientTempId(rawClientTempId);

    console.info("[chat] Incoming request", {
      correlationId,
      conversationId,
      hasClientTempId: Boolean(clientTempId),
    });

    if (!conversationId || !content?.trim()) {
      return withCorrelation(NextResponse.json(
        { error: "conversationId and content are required" },
        { status: 400 }
      ), correlationId);
    }

    // --- Verify visitor identity via HttpOnly cookie (not request body) ---
    const visitorToken = req.cookies.get("visitor-token")?.value;
    console.info("[chat] Cookie validation", {
      correlationId,
      hasVisitorToken: Boolean(visitorToken),
    });

    if (!visitorToken) {
      return withCorrelation(NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ), correlationId);
    }

    // Resolve visitor from the signed server-issued token
    const tokenOwner = await prisma.visitor.findUnique({ where: { token: visitorToken } });
    console.info("[chat] Cookie owner lookup", {
      correlationId,
      resolved: Boolean(tokenOwner),
      ownerId: tokenOwner?.id ?? null,
    });

    if (!tokenOwner) {
      return withCorrelation(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), correlationId);
    }

    // --- XSS sanitization + input length validation ---
    // Strip HTML-dangerous characters before storing or sending to OpenAI
    const trimmed = content.trim().replace(/[<>"'`]/g, "");
    if (trimmed.length === 0) {
      return withCorrelation(NextResponse.json({ error: "Message cannot be empty" }, { status: 400 }), correlationId);
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      return withCorrelation(NextResponse.json(
        { error: `Message too long. Maximum ${MAX_CONTENT_LENGTH} characters allowed.` },
        { status: 400 }
      ), correlationId);
    }

    // --- Rate limiting ---
    // Keyed per-visitor globally (not per-conversation) to prevent limit bypass
    // via multiple conversations. Limits are conservative to protect Gemini free
    // tier quota (5 RPM / 20 RPD).
    const rateLimitKey = `visitor:${tokenOwner.id}`;
    const { allowed, remaining, retryAfter, limitedBy } = checkMultiRateLimit(rateLimitKey, [
      { maxRequests: 4,  windowSec: 60,          scope: "chat:rpm" },  // 4/min  (Gemini free: 5 RPM)
      { maxRequests: 15, windowSec: 24 * 60 * 60, scope: "chat:rpd" }, // 15/day (Gemini free: 20 RPD)
    ]);
    if (!allowed) {
      const isDaily = limitedBy === "chat:rpd";
      const errorMsg = isDaily
        ? `Batas pesan harian tercapai. Coba lagi besok.`
        : `Terlalu banyak pesan. Coba lagi dalam ${retryAfter} detik.`;
      return withCorrelation(NextResponse.json(
        { error: errorMsg },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": isDaily ? "15" : "4",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Window": isDaily ? "day" : "minute",
          },
        }
      ), correlationId);
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
      return withCorrelation(NextResponse.json({ error: "Conversation not found" }, { status: 404 }), correlationId);
    }

    // --- Ownership check: cookie-resolved visitor must own this conversation ---
    if (conversation.visitorId !== tokenOwner.id) {
      return withCorrelation(NextResponse.json({ error: "Forbidden" }, { status: 403 }), correlationId);
    }

    const emittedKeys = new Set();
    async function emitOnce(emitKey, emitter) {
      if (emittedKeys.has(emitKey)) {
        console.warn("[chat] Duplicate emit blocked", {
          correlationId,
          conversationId,
          emitKey,
        });
        return false;
      }

      emittedKeys.add(emitKey);
      await emitter();
      return true;
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
    await touchConversation(conversationId);

    // Notify dashboard of the new visitor message in realtime
    await emitOnce(`user:new_message:${userMessage.id}`, async () => {
      const eventId = randomUUID();
      await emitConversationEvent(conversationId, "new_message", {
        correlationId,
        eventId,
        conversationId,
        message: userMessage,
        clientTempId,
        visitor: conversation.visitor,
      });
      console.info("[chat] Realtime emitted", {
        correlationId,
        eventId,
        type: "user:new_message",
      });
    });

    // If mode is "human", do not call OpenAI — owner handles this
    if (conversation.mode === "human") {
      const res = NextResponse.json({ correlationId, message: userMessage, aiReply: null });
      res.headers.set("X-RateLimit-Remaining", String(remaining));
      return withCorrelation(res, correlationId);
    }

    // --- AI mode: call Kaia ---

    // Emit typing indicator to the visitor's conversation channel
    const typingEventId = randomUUID();
    await emitOnce(`assistant:typing:${conversationId}`, async () => {
      await pusher.trigger(
        `private-conversation-${conversationId}`,
        "kaia_typing",
        { correlationId, eventId: typingEventId, conversationId }
      );
      console.info("[chat] Realtime emitted", {
        correlationId,
        eventId: typingEventId,
        type: "assistant:typing",
      });
    });

    // Build history (all previous messages, new one already in DB)
    const history = conversation.messages; // messages before the new one

    let replyText;
    try {
      replyText = await getKaiaReply(history, trimmed, { correlationId });
    } catch (aiError) {
      console.error("[Kaia fallback triggered]", {
        correlationId,
        conversationId,
        model: process.env.OPENAI_MODEL ?? "unset",
        status: aiError?.status ?? aiError?.response?.status ?? "unknown",
        code: aiError?.code ?? "unknown",
        message: aiError?.message ?? String(aiError),
        timestamp: new Date().toISOString(),
      });
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

    // ChatWidget sends an optimistic message with a temporary id. If Pusher
    // arrives before the HTTP response, the client replaces the optimistic row
    // by optimistic id; once API data returns, duplicate-by-id guards keep the
    // final list stable without double-appending persisted messages.
    let assistantRealtimeDelivered = true;
    try {
      await emitOnce(`assistant:new_message:${assistantMessage.id}`, async () => {
        const eventId = randomUUID();
        await emitConversationEvent(conversationId, "new_message", {
          correlationId,
          eventId,
          conversationId,
          message: assistantMessage,
        });
        console.info("[chat] Realtime emitted", {
          correlationId,
          eventId,
          type: "assistant:new_message",
        });
      });
    } catch (emitError) {
      assistantRealtimeDelivered = false;
      console.error("[chat] Assistant realtime emit failed", {
        correlationId,
        conversationId,
        messageId: assistantMessage.id,
        error: emitError?.message ?? String(emitError),
      });
    }

    console.info("[chat] Request completed", {
      correlationId,
      conversationId,
      assistantRealtimeDelivered,
      durationMs: Date.now() - startedAt,
    });

    const res = NextResponse.json({
      correlationId,
      message: userMessage,
      aiReply: assistantMessage,
      realtime: { assistantDelivered: assistantRealtimeDelivered },
    });
    res.headers.set("X-RateLimit-Remaining", String(remaining));
    return withCorrelation(res, correlationId);
  } catch (error) {
    console.error("[POST /api/chat]", {
      correlationId,
      error: error?.message ?? String(error),
    });
    return withCorrelation(NextResponse.json({ error: "Internal server error" }, { status: 500 }), correlationId);
  }
}
