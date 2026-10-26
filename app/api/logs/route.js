/**
 * app/api/logs/route.js — Server error log for the owner dashboard.
 * GET → { logs: AppLog[] } (newest first, at most 100)
 * Protected: owner only.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

const LIMIT = 100;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.appLog.findMany({ orderBy: { at: "desc" }, take: LIMIT });
    return NextResponse.json({ logs });
  } catch (error) {
    await logError("GET /api/logs", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
