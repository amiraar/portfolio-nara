/**
 * __tests__/conversationById.test.js — Tests for GET/PATCH /api/conversations/:id
 *
 * Next.js 16 passes route params as a Promise; these tests pass them the same
 * way so a synchronous `params.id` access would surface as a failure.
 *
 * All external I/O is mocked so these run without a live DB.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  default: {
    visitor: { findUnique: vi.fn() },
    conversation: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("@/lib/authOptions", () => ({ authOptions: {} }));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/apiRouteUtils", () => ({
  auditLog: vi.fn(),
  findVisitorByToken: vi.fn((token) => (token ? prisma.visitor.findUnique() : null)),
  forbiddenResponse: vi.fn(() => Response.json({ error: "Forbidden" }, { status: 403 })),
  getClientIP: vi.fn(() => "127.0.0.1"),
  isTrustedOrigin: vi.fn(() => true),
  PUBLIC_VISITOR_SELECT: { id: true, name: true, email: true, createdAt: true },
  requireOwnerSession: vi.fn(),
  unauthorizedResponse: vi.fn(() => Response.json({ error: "Unauthorized" }, { status: 401 })),
}));

// ─── Imports (after mocks are registered) ─────────────────────────────────────

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { isTrustedOrigin, requireOwnerSession } from "@/lib/apiRouteUtils";
import { GET, PATCH } from "../app/api/conversations/[id]/route.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VISITOR_TOKEN = "visitor-token-abc";
const VISITOR = { id: "visitor-1" };
const CONV_ID = "conv-1";
const CONVERSATION = { id: CONV_ID, visitorId: VISITOR.id, messages: [] };

function makeRequest({ body, cookie = null } = {}) {
  return {
    json: () => Promise.resolve(body ?? {}),
    cookies: {
      get: (name) => (name === "visitor-token" && cookie ? { value: cookie } : undefined),
    },
  };
}

/** Route context exactly as Next.js 16 supplies it: params is a Promise. */
function ctx(id = CONV_ID) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimit.mockResolvedValue({ allowed: true, remaining: 29, retryAfter: 0 });
  requireOwnerSession.mockResolvedValue(null);
  isTrustedOrigin.mockReturnValue(true);
  prisma.visitor.findUnique.mockResolvedValue(VISITOR);
  prisma.conversation.findUnique.mockResolvedValue(CONVERSATION);
  prisma.conversation.update.mockResolvedValue({ ...CONVERSATION, status: "resolved" });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/conversations/:id", () => {
  it("returns the conversation to the visitor who owns it", async () => {
    const res = await GET(makeRequest({ cookie: VISITOR_TOKEN }), ctx());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.conversation.id).toBe(CONV_ID);
    expect(prisma.conversation.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: CONV_ID } })
    );
  });

  it("returns 404 (not 403) when the conversation belongs to another visitor", async () => {
    prisma.conversation.findUnique.mockResolvedValue({ ...CONVERSATION, visitorId: "someone-else" });

    const res = await GET(makeRequest({ cookie: VISITOR_TOKEN }), ctx());
    expect(res.status).toBe(404);
  });

  it("returns 404 when the conversation does not exist", async () => {
    prisma.conversation.findUnique.mockResolvedValue(null);

    const res = await GET(makeRequest({ cookie: VISITOR_TOKEN }), ctx("missing"));
    expect(res.status).toBe(404);
  });

  it("returns 401 without an owner session or visitor cookie", async () => {
    const res = await GET(makeRequest(), ctx());
    expect(res.status).toBe(401);
  });

  it("lets the owner read any conversation", async () => {
    requireOwnerSession.mockResolvedValue({ user: { email: "owner@example.com" } });
    prisma.conversation.findUnique.mockResolvedValue({ ...CONVERSATION, visitorId: "someone-else" });

    const res = await GET(makeRequest(), ctx());
    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/conversations/:id", () => {
  it("updates the status of the conversation named in the route", async () => {
    requireOwnerSession.mockResolvedValue({ user: { email: "owner@example.com" } });

    const res = await PATCH(makeRequest({ body: { status: "resolved" } }), ctx());

    expect(res.status).toBe(200);
    expect(prisma.conversation.update).toHaveBeenCalledWith({
      where: { id: CONV_ID },
      data: { status: "resolved" },
    });
  });

  it("returns 401 without an owner session", async () => {
    const res = await PATCH(makeRequest({ body: { status: "resolved" } }), ctx());
    expect(res.status).toBe(401);
  });
});
