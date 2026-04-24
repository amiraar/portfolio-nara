/**
 * app/api/analytics/messages/route.js — Messages per day for the last 7 days.
 * GET → { data: [{ date: "2025-01-01", count: 12 }, ...] }
 * Protected: owner session required.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Start of 7-day window: 6 days ago at midnight UTC (inclusive of today = 7 days)
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 6);
    since.setUTCHours(0, 0, 0, 0);

    const rows = await prisma.$queryRaw`
      SELECT
        TO_CHAR(DATE("timestamp"), 'YYYY-MM-DD') AS date,
        CAST(COUNT(*) AS INTEGER)                AS count
      FROM "Message"
      WHERE "timestamp" >= ${since}
      GROUP BY DATE("timestamp")
      ORDER BY DATE("timestamp") ASC
    `;

    // Build a full 7-day range so the chart always has 7 data points
    const map = Object.fromEntries(rows.map((r) => [r.date, r.count]));
    const data = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      return { date: key, count: map[key] ?? 0 };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/analytics/messages]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
