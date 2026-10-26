/**
 * app/api/visitor/route.js — Start or resume a visitor chat session.
 * POST { name, email, consent } → returns { visitor, conversation }
 *
 * Identity is the server-issued token in the HttpOnly `visitor-token` cookie,
 * never the email address. An email is an unverified claim — anyone can type
 * anyone's — so it is stored as contact information only and is never used to
 * look up, resume, or modify an existing visitor.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  findVisitorByToken,
  getClientIP,
  issueVisitorToken,
  PUBLIC_VISITOR_SELECT,
  VISITOR_TOKEN_TTL_SEC,
  visitorTokenCookie,
} from "@/lib/apiRouteUtils";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 200;

/**
 * Resume the cookie holder's visitor, or create a new visitor, and return the
 * active conversation.
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
        { error: `Too many requests. Please try again in ${retryAfter} seconds.` },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    const body = await req.json();
    const { name, email, consent } = body;

    // Type check before any string method — a non-string body value would
    // otherwise throw and surface as a 500 instead of a validation error.
    if (typeof name !== "string" || typeof email !== "string" || !name.trim() || !email.trim()) {
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

    // Stored verbatim (React escapes on render), so names like "O'Brien" survive.
    // The email regex below already rejects HTML/quote characters.
    const safeName = name.trim();
    const safeEmail = email.trim().toLowerCase();

    // Validate email format — stricter regex rejects obvious malformed emails.
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const presentedToken = req.cookies.get("visitor-token")?.value ?? null;
    const existing = await findVisitorByToken(presentedToken);

    let visitor;
    let rawToken;
    let conversation;

    if (existing) {
      // Same browser, valid token: resume. Refresh the consent timestamp (UU PDP
      // evidence) and slide the token expiry; the token value itself is kept.
      rawToken = presentedToken;
      visitor = await prisma.visitor.update({
        where: { id: existing.id },
        data: {
          consentAt: new Date(),
          tokenExpiresAt: new Date(Date.now() + VISITOR_TOKEN_TTL_SEC * 1000),
        },
      });
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
      // No valid token: always a new visitor, even if this email was used before.
      // Other visitors' rows, tokens, consent records and threads are untouched.
      const token = issueVisitorToken();
      rawToken = token.raw;
      visitor = await prisma.visitor.create({
        data: {
          name: safeName,
          email: safeEmail,
          token: token.hash,
          tokenExpiresAt: token.expiresAt,
          consentAt: new Date(),
        },
      });
      conversation = await prisma.conversation.create({
        data: { visitorId: visitor.id },
        include: { messages: true },
      });
    }

    // Never return the token in the body. It is a bearer credential for
    // /api/chat, /api/conversations/:id and /api/pusher/auth; it lives only in
    // the HttpOnly cookie, out of reach of page scripts.
    const publicVisitor = Object.fromEntries(
      Object.keys(PUBLIC_VISITOR_SELECT).map((key) => [key, visitor[key]])
    );

    const response = NextResponse.json({ visitor: publicVisitor, conversation });
    response.headers.set("Set-Cookie", visitorTokenCookie(rawToken));
    return response;
  } catch (error) {
    await logError("POST /api/visitor", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
