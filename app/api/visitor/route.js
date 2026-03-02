/**
 * app/api/visitor/route.js — Create or retrieve a Visitor by email.
 * POST { name, email } → returns { visitor, conversation }
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Upsert visitor (create if new, return existing if not)
    const visitor = await prisma.visitor.upsert({
      where: { email },
      update: {}, // Do not overwrite name on return visit
      create: { name, email },
      include: {
        conversations: {
          where: { status: "active" },
          orderBy: { updatedAt: "desc" },
          take: 1,
          include: {
            messages: {
              orderBy: { timestamp: "asc" },
            },
          },
        },
      },
    });

    // If no active conversation exists, create one
    let conversation = visitor.conversations[0] ?? null;
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { visitorId: visitor.id },
        include: { messages: true },
      });
    }

    return NextResponse.json({ visitor, conversation });
  } catch (error) {
    console.error("[POST /api/visitor]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
