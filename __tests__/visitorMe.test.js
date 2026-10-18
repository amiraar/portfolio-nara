/**
 * __tests__/visitorMe.test.js — GET/DELETE /api/visitor/me (data subject rights)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: { visitor: { findUnique: vi.fn() } },
}));

vi.mock("@/lib/rateLimit", () => ({ checkRateLimit: vi.fn() }));

vi.mock("@/lib/apiRouteUtils", () => ({
  deleteVisitorData: vi.fn(),
  findVisitorByToken: vi.fn(),
  forbiddenResponse: vi.fn(() => Response.json({ error: "Forbidden" }, { status: 403 })),
  getClientIP: vi.fn(() => "127.0.0.1"),
  isTrustedOrigin: vi.fn(),
  PUBLIC_VISITOR_SELECT: { id: true, name: true, email: true, createdAt: true },
  unauthorizedResponse: vi.fn(() => Response.json({ error: "Unauthorized" }, { status: 401 })),
  visitorTokenCookie: vi.fn((raw, maxAge) => `visitor-token=${raw}; Max-Age=${maxAge}`),
}));

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { deleteVisitorData, findVisitorByToken, isTrustedOrigin } from "@/lib/apiRouteUtils";
import { GET, DELETE } from "../app/api/visitor/me/route.js";

const VISITOR = { id: "visitor-1" };

function makeRequest(cookie = "raw-token") {
  return {
    headers: new Headers(),
    cookies: { get: (name) => (name === "visitor-token" && cookie ? { value: cookie } : undefined) },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimit.mockResolvedValue({ allowed: true, remaining: 9, retryAfter: 0 });
  findVisitorByToken.mockResolvedValue(VISITOR);
  isTrustedOrigin.mockReturnValue(true);
  prisma.visitor.findUnique.mockResolvedValue({ id: VISITOR.id, conversations: [] });
  deleteVisitorData.mockResolvedValue({ messages: 3, conversations: 1, visitors: 1 });
});

describe("GET /api/visitor/me", () => {
  it("exports only the cookie holder's own data as an attachment", async () => {
    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    expect(prisma.visitor.findUnique.mock.calls[0][0].where).toEqual({ id: VISITOR.id });
    // The token (hashed or not) is never part of the export.
    expect(prisma.visitor.findUnique.mock.calls[0][0].select).not.toHaveProperty("token");
  });

  it("returns 401 without a valid cookie", async () => {
    findVisitorByToken.mockResolvedValue(null);
    const res = await GET(makeRequest(null));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfter: 30 });
    const res = await GET(makeRequest());
    expect(res.status).toBe(429);
  });
});

describe("DELETE /api/visitor/me", () => {
  it("deletes the cookie holder's data and clears the cookie", async () => {
    const res = await DELETE(makeRequest());

    expect(res.status).toBe(200);
    expect(deleteVisitorData).toHaveBeenCalledWith([VISITOR.id]);
    expect(res.headers.get("Set-Cookie")).toContain("Max-Age=0");
  });

  it("rejects a cross-origin request before touching data", async () => {
    isTrustedOrigin.mockReturnValue(false);
    const res = await DELETE(makeRequest());

    expect(res.status).toBe(403);
    expect(deleteVisitorData).not.toHaveBeenCalled();
  });

  it("returns 401 without a valid cookie", async () => {
    findVisitorByToken.mockResolvedValue(null);
    const res = await DELETE(makeRequest(null));

    expect(res.status).toBe(401);
    expect(deleteVisitorData).not.toHaveBeenCalled();
  });
});
