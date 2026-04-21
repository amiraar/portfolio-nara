/**
 * __tests__/chat.test.js — Integration tests for POST /api/chat
 *
 * The route under test authenticates visitors via an HttpOnly cookie,
 * validates input, applies rate limiting, saves messages, and calls
 * Gemini (or falls back to a static message when Gemini throws).
 *
 * All external I/O is mocked so these tests run without a live DB or API key.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  default: {
    visitor: { findUnique: vi.fn() },
    conversation: { findUnique: vi.fn() },
    message: { create: vi.fn() },
  },
}));

vi.mock("@/lib/gemini", () => ({
  getKaiaReply: vi.fn(),
}));

vi.mock("@/lib/rateLimit", () => ({
  checkMultiRateLimit: vi.fn(),
}));

vi.mock("@/lib/pusher", () => ({
  default: { trigger: vi.fn() },
  emitConversationEvent: vi.fn(),
}));

vi.mock("@/lib/apiRouteUtils", () => ({
  touchConversation: vi.fn(),
  getClientIP: vi.fn(() => "127.0.0.1"),
}));

// ─── Imports (after mocks are registered) ─────────────────────────────────────

import prisma from "@/lib/prisma";
import { getKaiaReply } from "@/lib/gemini";
import { checkMultiRateLimit } from "@/lib/rateLimit";
import { emitConversationEvent } from "@/lib/pusher";
import pusher from "@/lib/pusher";
import { POST } from "../app/api/chat/route.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal mock Request that satisfies what the chat route reads:
 *   req.json()           → body
 *   req.cookies.get(name) → { value } | undefined
 */
function makeRequest({ body, cookie = null } = {}) {
  return {
    json: () => Promise.resolve(body ?? {}),
    cookies: {
      get: (name) =>
        name === "visitor-token" && cookie ? { value: cookie } : undefined,
    },
  };
}

const VISITOR_TOKEN = "test-token-abc123";
const VISITOR_ID = "visitor-cuid";
const CONV_ID = "conv-cuid";

const MOCK_VISITOR = { id: VISITOR_ID, name: "Tester", email: "tester@example.com", token: VISITOR_TOKEN };
const MOCK_CONVERSATION = {
  id: CONV_ID,
  visitorId: VISITOR_ID,
  mode: "ai",
  status: "active",
  visitor: MOCK_VISITOR,
  messages: [],
};
const MOCK_SAVED_USER_MSG = { id: "msg-1", conversationId: CONV_ID, role: "user", content: "Hello" };
const MOCK_SAVED_ASSISTANT_MSG = { id: "msg-2", conversationId: CONV_ID, role: "assistant", content: "Hi there!" };

beforeEach(() => {
  vi.clearAllMocks();

  // Default happy-path stubs
  prisma.visitor.findUnique.mockResolvedValue(MOCK_VISITOR);
  prisma.conversation.findUnique.mockResolvedValue(MOCK_CONVERSATION);
  prisma.message.create
    .mockResolvedValueOnce(MOCK_SAVED_USER_MSG)
    .mockResolvedValueOnce(MOCK_SAVED_ASSISTANT_MSG);

  checkMultiRateLimit.mockResolvedValue({ allowed: true, remaining: 3, retryAfter: 0, limitedBy: null });
  getKaiaReply.mockResolvedValue("Hi there!");
  emitConversationEvent.mockResolvedValue(undefined);
  pusher.trigger.mockResolvedValue(undefined);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/chat", () => {
  it("returns 200 with message and aiReply on the happy path (mode=ai)", async () => {
    const req = makeRequest({
      body: { conversationId: CONV_ID, content: "Hello" },
      cookie: VISITOR_TOKEN,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toMatchObject({ role: "user", content: "Hello" });
    expect(getKaiaReply).toHaveBeenCalledOnce();
  });

  it("returns 401 when visitor-token cookie is missing", async () => {
    const req = makeRequest({
      body: { conversationId: CONV_ID, content: "Hello" },
      // no cookie
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when visitor-token does not match any visitor", async () => {
    prisma.visitor.findUnique.mockResolvedValue(null);

    const req = makeRequest({
      body: { conversationId: CONV_ID, content: "Hello" },
      cookie: "invalid-token",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 404 when conversation does not exist", async () => {
    prisma.conversation.findUnique.mockResolvedValue(null);

    const req = makeRequest({
      body: { conversationId: "nonexistent-id", content: "Hello" },
      cookie: VISITOR_TOKEN,
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 404 when conversation belongs to a different visitor", async () => {
    prisma.conversation.findUnique.mockResolvedValue({
      ...MOCK_CONVERSATION,
      visitorId: "someone-else",
    });

    const req = makeRequest({
      body: { conversationId: CONV_ID, content: "Hello" },
      cookie: VISITOR_TOKEN,
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 400 when content exceeds 1000 characters", async () => {
    const req = makeRequest({
      body: { conversationId: CONV_ID, content: "x".repeat(1001) },
      cookie: VISITOR_TOKEN,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/too long/i);
  });

  it("returns 400 when content is empty after XSS stripping", async () => {
    // Content is only XSS characters — trimmed to empty
    const req = makeRequest({
      body: { conversationId: CONV_ID, content: '<>"' },
      cookie: VISITOR_TOKEN,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    checkMultiRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfter: 42,
      limitedBy: "chat:rpm",
    });

    const req = makeRequest({
      body: { conversationId: CONV_ID, content: "Hello" },
      cookie: VISITOR_TOKEN,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBeTruthy();
    expect(res.headers.get("Retry-After")).toBe("42");
  });

  it("falls back to AI_FALLBACK_MESSAGE when Gemini throws", async () => {
    getKaiaReply.mockRejectedValue(new Error("Gemini unavailable"));

    const req = makeRequest({
      body: { conversationId: CONV_ID, content: "Hello" },
      cookie: VISITOR_TOKEN,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    // The assistant message content should be the fallback (not re-throw)
    expect(data.aiReply).toBeTruthy();
    // Gemini was attempted
    expect(getKaiaReply).toHaveBeenCalledOnce();
  });

  it("skips Gemini and returns aiReply=null when mode=human", async () => {
    prisma.conversation.findUnique.mockResolvedValue({
      ...MOCK_CONVERSATION,
      mode: "human",
    });

    const req = makeRequest({
      body: { conversationId: CONV_ID, content: "Hello" },
      cookie: VISITOR_TOKEN,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.aiReply).toBeNull();
    expect(getKaiaReply).not.toHaveBeenCalled();
  });
});
