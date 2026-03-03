/**
 * app/api/analytics/route.js — Aggregate stats for the owner dashboard.
 * GET → { totalVisitors, activeConversations, resolvedThisMonth, messagesThisMonth, newVisitorsThisMonth }
 * Protected: owner only.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Start of the current calendar month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalVisitors,
      activeConversations,
      resolvedThisMonth,
      messagesThisMonth,
      newVisitorsThisMonth,
    ] = await Promise.all([
      // All-time unique visitors
      prisma.visitor.count(),

      // Currently active conversations
      prisma.conversation.count({ where: { status: "active" } }),

      // Conversations resolved this calendar month
      prisma.conversation.count({
        where: {
          status: "resolved",
          updatedAt: { gte: monthStart },
        },
      }),

      // Messages sent this month (all roles)
      prisma.message.count({
        where: { timestamp: { gte: monthStart } },
      }),

      // New visitors registered this month
      prisma.visitor.count({
        where: { createdAt: { gte: monthStart } },
      }),
    ]);

    return NextResponse.json({
      totalVisitors,
      activeConversations,
      resolvedThisMonth,
      messagesThisMonth,
      newVisitorsThisMonth,
    });
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
