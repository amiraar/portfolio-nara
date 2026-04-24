/**
 * app/api/portfolio/route.js
 * GET  /api/portfolio?section=xxx → public, returns one section's data
 * GET  /api/portfolio             → public, returns all sections as { [section]: data }
 * PATCH /api/portfolio            → protected (owner only), upsert section data
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");

    if (section) {
      const content = await prisma.portfolioContent.findUnique({
        where: { section },
      });
      return NextResponse.json({ content: content?.data ?? null });
    }

    const all = await prisma.portfolioContent.findMany();
    const result = {};
    for (const item of all) {
      result[item.section] = item.data;
    }
    return NextResponse.json({ content: result });
  } catch (error) {
    console.error("[GET /api/portfolio]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { section, data } = body;

    if (!section || data === undefined) {
      return NextResponse.json(
        { error: "section and data are required" },
        { status: 400 }
      );
    }

    const valid = ["hero", "about", "experience", "projects", "skills", "education", "kaia_config"];
    if (!valid.includes(section)) {
      return NextResponse.json(
        { error: `section must be one of: ${valid.join(", ")}` },
        { status: 400 }
      );
    }

    // Prevent excessively large payloads from bloating the database.
    const MAX_DATA_SIZE = 50_000; // 50 KB
    const dataSize = JSON.stringify(data).length;
    if (dataSize > MAX_DATA_SIZE) {
      return NextResponse.json(
        { error: `Data payload too large. Maximum ${MAX_DATA_SIZE} characters.` },
        { status: 413 }
      );
    }

    const content = await prisma.portfolioContent.upsert({
      where: { section },
      update: { data },
      create: { section, data },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error("[PATCH /api/portfolio]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
