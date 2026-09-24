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

    // --- XSS sanitization ---
    const safeName = sanitizeText(name.trim());
    const safeEmail = sanitizeText(email.trim().toLowerCase());

    // Validate email format — stricter regex rejects obvious malformed emails.
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

<<<<<<< HEAD
    // Upsert visitor (create if new, return existing if not)
    let visitor = await prisma.visitor.upsert({
      where: { email: safeEmail },
      create: { name: safeName, email: safeEmail, token: randomUUID(), consentAt: new Date() },
      update: { consentAt: new Date() }, // Do not overwrite name on return visit
    });
=======
    // An email address is an unverified claim — anyone can type anyone's email.
    // Prior conversation history is therefore only released to a caller that
    // already holds the server-issued token for that visitor (same browser).
    const presentedToken = req.cookies.get("visitor-token")?.value ?? null;
>>>>>>> ac126ffb782dcf8cfd4934a50be1794cdd70c1e5

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

<<<<<<< HEAD
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
=======
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
>>>>>>> ac126ffb782dcf8cfd4934a50be1794cdd70c1e5
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

<<<<<<< HEAD
    // Never expose the token in the JSON body — it lives only in the HttpOnly cookie.
    const publicVisitor = Object.fromEntries(
      Object.keys(PUBLIC_VISITOR_SELECT).map((key) => [key, visitor[key]])
    );

    const response = NextResponse.json({ visitor: publicVisitor, conversation });
=======
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
>>>>>>> ac126ffb782dcf8cfd4934a50be1794cdd70c1e5
    response.headers.set("Set-Cookie", cookieAttributes);
    return response;
  } catch (error) {
    console.error("[POST /api/visitor]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
