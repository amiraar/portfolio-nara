/**
 * app/api/visitor/me/route.js — Data subject rights for the cookie holder (UU PDP).
 * GET    → download a copy of the visitor's own data (JSON attachment)
 * DELETE → permanently delete the visitor, their conversations and messages,
 *          and clear the cookie (also withdraws consent)
 *
 * Identity comes only from the HttpOnly visitor-token cookie.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  deleteVisitorData,
  findVisitorByToken,
  forbiddenResponse,
  getClientIP,
  isTrustedOrigin,
  PUBLIC_VISITOR_SELECT,
  unauthorizedResponse,
  visitorTokenCookie,
} from "@/lib/apiRouteUtils";

/**
 * Shared guard: per-IP rate limit, then resolve the visitor from the cookie.
 * @param {Request} req
 * @returns {Promise<{ visitor: import("@prisma/client").Visitor } | { response: NextResponse }>}
 */
async function resolveVisitor(req) {
  const { allowed, retryAfter } = await checkRateLimit(getClientIP(req), 10, 60, "visitor-me");
  if (!allowed) {
    return {
      response: NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      ),
    };
  }
  const visitor = await findVisitorByToken(req.cookies.get("visitor-token")?.value);
  if (!visitor) return { response: unauthorizedResponse() };
  return { visitor };
}

export async function GET(req) {
  try {
    const result = await resolveVisitor(req);
    if (result.response) return result.response;

    const data = await prisma.visitor.findUnique({
      where: { id: result.visitor.id },
      select: {
        ...PUBLIC_VISITOR_SELECT,
        consentAt: true,
        conversations: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            messages: {
              orderBy: { timestamp: "asc" },
              select: { role: true, content: true, timestamp: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { exportedAt: new Date().toISOString(), visitor: data },
      { headers: { "Content-Disposition": 'attachment; filename="data-chat-kaia.json"' } }
    );
  } catch (error) {
    console.error("[GET /api/visitor/me]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    // Cookie is SameSite=Strict; the origin check is a second CSRF layer for a destructive action.
    if (!isTrustedOrigin(req)) return forbiddenResponse();

    const result = await resolveVisitor(req);
    if (result.response) return result.response;

    const deleted = await deleteVisitorData([result.visitor.id]);

    const response = NextResponse.json({ deleted });
    response.headers.set("Set-Cookie", visitorTokenCookie("", 0));
    return response;
  } catch (error) {
    console.error("[DELETE /api/visitor/me]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
