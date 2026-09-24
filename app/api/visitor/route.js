/**
 * app/api/visitor/route.js — Create or retrieve a Visitor by email.
 * POST { name, email } → returns { visitor, conversation }
 */

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIP, PUBLIC_VISITOR_SELECT } from "@/lib/apiRouteUtils";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 200;

/**
 * Strip characters that could enable XSS if rendered without escaping.
 * React escapes by default, but this is a defence-in-depth measure.
 * @param {string} str
 * @returns {string}
 */
function sanitizeText(str) {
  return str.replace(/[<>"'`]/g, "");
}

/**
 * Upsert a visitor identity and return/seed their active conversation.
 * @param {Request} req
 * @returns {Promise<import("next/server").NextResponse>}
 */
export async function POST(req) {
  try {
    // --- Rate limiting: 5 registrations per minute per IP ---
    const ip = getClientIP(req);
    const { allowed, retryAfter } = await checkRateLimit(`visitor:${ip}`, 5, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.` },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    const body = await req.json();
    const { name, email, consent } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    // Explicit consent is required and its timestamp is stored as evidence (UU PDP).
    if (consent !== true) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 });
    }

    // --- Input length validation ---
    if (name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name too long. Maximum ${MAX_NAME_LENGTH} characters.` },
        { status: 400 }
      );
    }
    if (email.trim().length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { error: `Email too long. Maximum ${MAX_EMAIL_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // --- XSS sanitization ---
    const safeName = sanitizeText(name.trim());
    const safeEmail = sanitizeText(email.trim().toLowerCase());

    // Validate email format — stricter regex rejects obvious malformed emails.
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Upsert visitor (create if new, return existing if not)
    let visitor = await prisma.visitor.upsert({
      where: { email: safeEmail },
      create: { name: safeName, email: safeEmail, token: randomUUID(), consentAt: new Date() },
      update: { consentAt: new Date() }, // Do not overwrite name on return visit
    });

    // Backfill token only for legacy visitors created before token support.
    if (!visitor.token) {
      const token = randomUUID();
      await prisma.visitor.update({
        where: { id: visitor.id },
        data: { token },
      });
      visitor = { ...visitor, token };
    }

    // Knowing an email address is not proof of identity. Only a request that
    // already carries this visitor's HttpOnly token may resume their existing
    // conversation; anyone else gets a fresh, empty one so prior history is
    // never disclosed to whoever typed the email.
    const requestToken = req.cookies?.get("visitor-token")?.value;
    const isKnownDevice = Boolean(requestToken) && requestToken === visitor.token;

    let conversation = isKnownDevice
      ? await prisma.conversation.findFirst({
          where: { visitorId: visitor.id, status: "active" },
          orderBy: { updatedAt: "desc" },
          include: { messages: { orderBy: { timestamp: "asc" } } },
        })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { visitorId: visitor.id },
        include: { messages: true },
      });
    }

    // Issue HttpOnly cookie so the server can verify visitor identity on /api/chat
    const isProd = process.env.NODE_ENV === "production";
    const cookieAttributes = [
      `visitor-token=${visitor.token}`,
      "HttpOnly",
      "SameSite=Strict",
      "Path=/",
      "Max-Age=2592000", // 30 days
      ...(isProd ? ["Secure"] : []),
    ].join("; ");

    // Never expose the token in the JSON body — it lives only in the HttpOnly cookie.
    const publicVisitor = Object.fromEntries(
      Object.keys(PUBLIC_VISITOR_SELECT).map((key) => [key, visitor[key]])
    );

    const response = NextResponse.json({ visitor: publicVisitor, conversation });
    response.headers.set("Set-Cookie", cookieAttributes);
    return response;
  } catch (error) {
    console.error("[POST /api/visitor]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
