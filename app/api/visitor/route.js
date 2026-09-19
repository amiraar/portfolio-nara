/**
 * app/api/visitor/route.js — Create or retrieve a Visitor by email.
 * POST { name, email } → returns { visitor, conversation }
 */

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIP } from "@/lib/apiRouteUtils";

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
    const { name, email } = body;

    // Type check before any string method — a non-string body value would
    // otherwise throw and surface as a 500 instead of a validation error.
    if (typeof name !== "string" || typeof email !== "string" || !name.trim() || !email.trim()) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
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

    // An email address is an unverified claim — anyone can type anyone's email.
    // Prior conversation history is therefore only released to a caller that
    // already holds the server-issued token for that visitor (same browser).
    const presentedToken = req.cookies.get("visitor-token")?.value ?? null;

    let visitor = await prisma.visitor.findUnique({ where: { email: safeEmail } });
    const isNewVisitor = !visitor;

    if (!visitor) {
      visitor = await prisma.visitor.create({
        data: { name: safeName, email: safeEmail, token: randomUUID() },
      });
    } else if (!visitor.token) {
      // Backfill token only for legacy visitors created before token support.
      visitor = await prisma.visitor.update({
        where: { id: visitor.id },
        data: { token: randomUUID() },
      });
    }

    // Ownership is proven only by presenting the visitor's own token.
    const ownershipProven =
      isNewVisitor || (Boolean(presentedToken) && presentedToken === visitor.token);

    let conversation;
    if (ownershipProven) {
      // Proven owner — resume the existing thread with its history.
      conversation =
        (await prisma.conversation.findFirst({
          where: { visitorId: visitor.id, status: "active" },
          orderBy: { updatedAt: "desc" },
          include: { messages: { orderBy: { timestamp: "asc" } } },
        })) ??
        (await prisma.conversation.create({
          data: { visitorId: visitor.id },
          include: { messages: true },
        }));
    } else {
      // Unproven claim on an existing email. Never hand back an existing
      // thread — neither its messages nor its id, since the id plus the cookie
      // would allow reading that history via /api/conversations/:id.
      // Reuse an already-empty thread when one exists so repeated calls cannot
      // flood the database; an empty thread has no history to disclose.
      conversation =
        (await prisma.conversation.findFirst({
          where: { visitorId: visitor.id, status: "active", messages: { none: {} } },
          orderBy: { updatedAt: "desc" },
          include: { messages: true },
        })) ??
        (await prisma.conversation.create({
          data: { visitorId: visitor.id },
          include: { messages: true },
        }));
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

    // Never return the token in the body. It is a 30-day bearer credential for
    // /api/chat, /api/conversations/:id and /api/pusher/auth; the client stores
    // this object in localStorage, so including it would put the credential
    // within reach of any script on the page and defeat the HttpOnly cookie.
    const safeVisitor = {
      id: visitor.id,
      name: visitor.name,
      email: visitor.email,
      createdAt: visitor.createdAt,
    };

    const response = NextResponse.json({ visitor: safeVisitor, conversation });
    response.headers.set("Set-Cookie", cookieAttributes);
    return response;
  } catch (error) {
    console.error("[POST /api/visitor]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
