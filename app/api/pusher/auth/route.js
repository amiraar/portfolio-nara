/**
 * app/api/pusher/auth/route.js — Pusher private-channel auth endpoint.
 *
 * Supports:
 * - private-dashboard (owner session required)
 * - private-conversation-{conversationId} (visitorId must match conversation owner)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import pusher from "@/lib/pusher";

const CONVERSATION_PREFIX = "private-conversation-";

function getConversationIdFromChannel(channelName) {
  if (!channelName.startsWith(CONVERSATION_PREFIX)) return null;
  return channelName.slice(CONVERSATION_PREFIX.length);
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const socketId = form.get("socket_id");
    const channelName = form.get("channel_name");

    if (typeof socketId !== "string" || typeof channelName !== "string") {
      return NextResponse.json(
        { error: "socket_id and channel_name are required" },
        { status: 400 }
      );
    }

    if (channelName === "private-dashboard") {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const auth = pusher.authorizeChannel(socketId, channelName);
      return NextResponse.json(auth);
    }

    const conversationId = getConversationIdFromChannel(channelName);
    if (!conversationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Resolve visitor identity from the HttpOnly cookie — never trust client-supplied visitorId.
    const visitorToken = req.cookies.get("visitor-token")?.value;
    if (!visitorToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenOwner = await prisma.visitor.findUnique({
      where: { token: visitorToken },
      select: { id: true },
    });

    if (!tokenOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { visitorId: true },
    });

    if (!conversation || conversation.visitorId !== tokenOwner.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch (error) {
    console.error("[POST /api/pusher/auth]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
