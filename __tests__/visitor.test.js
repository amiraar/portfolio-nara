/**
 * __tests__/visitor.test.js — Security tests for POST /api/visitor
 *
 * An email address is an unverified claim: anyone can type anyone's email.
 * These tests pin the rules that follow from that:
 *   - prior conversation history is released only to a caller holding the
 *     visitor's own server-issued token
 *   - the existing thread's id is withheld too, since id + cookie would allow
 *     reading that history via /api/conversations/:id
 *   - the token itself is never returned in the response body
 *
 * All external I/O is mocked so these run without a live DB.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  default: {
    visitor: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    conversation: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/apiRouteUtils", () => ({
  getClientIP: vi.fn(() => "127.0.0.1"),
}));

// ─── Imports (after mocks are registered) ─────────────────────────────────────

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { POST } from "../app/api/visitor/route.js";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VICTIM_TOKEN = "victim-token-secret-abc123";
const VICTIM_EMAIL = "victim@example.com";

const VICTIM_VISITOR = {
  id: "victim-visitor-id",
  name: "Victim",
  email: VICTIM_EMAIL,
  token: VICTIM_TOKEN,
  createdAt: new Date("2026-01-01"),
};

const SECRET_MESSAGE = "my salary expectation is confidential";

/** The victim's real thread — contains history that must not leak. */
const VICTIM_CONVERSATION = {
  id: "victim-conversation-id",
  visitorId: VICTIM_VISITOR.id,
  status: "active",
  messages: [{ id: "m1", role: "user", content: SECRET_MESSAGE }],
};

/** A freshly created, empty thread. */
const FRESH_CONVERSATION = {
  id: "fresh-conversation-id",
  visitorId: VICTIM_VISITOR.id,
  status: "active",
  messages: [],
};

/**
 * Build a minimal mock Request matching what the route reads:
 *   req.json()            → body
 *   req.headers.get(name) → null (only used by the mocked getClientIP)
 *   req.cookies.get(name) → { value } | undefined
 */
function makeRequest({ body, cookie = null } = {}) {
  return {
    json: () => Promise.resolve(body ?? {}),
    headers: { get: () => null },
    cookies: {
      get: (name) =>
        name === "visitor-token" && cookie ? { value: cookie } : undefined,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });

  // Existing visitor found by email.
  prisma.visitor.findUnique.mockResolvedValue(VICTIM_VISITOR);

  // Return the history-bearing thread ONLY when the caller did not restrict the
  // query to empty threads. If the `messages: { none: {} }` guard is ever
  // removed from the unverified path, that path starts receiving the victim's
  // thread here and the leak assertions below fail.
  prisma.conversation.findFirst.mockImplementation(({ where }) =>
    Promise.resolve(where?.messages?.none !== undefined ? null : VICTIM_CONVERSATION)
  );

  prisma.conversation.create.mockResolvedValue(FRESH_CONVERSATION);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/visitor — unverified email claim", () => {
  it("does not return another visitor's message history", async () => {
    const res = await POST(
      makeRequest({ body: { name: "Attacker", email: VICTIM_EMAIL } }) // no cookie
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.conversation.messages).toEqual([]);
    expect(JSON.stringify(data)).not.toContain(SECRET_MESSAGE);
  });

  it("does not return the existing thread's id", async () => {
    const res = await POST(
      makeRequest({ body: { name: "Attacker", email: VICTIM_EMAIL } })
    );
    const data = await res.json();

    // Holding this id plus the cookie would expose the history via
    // GET /api/conversations/:id.
    expect(data.conversation.id).not.toBe(VICTIM_CONVERSATION.id);
    expect(data.conversation.id).toBe(FRESH_CONVERSATION.id);
  });

  it("reuses an existing empty thread instead of creating one per request", async () => {
    prisma.conversation.findFirst.mockResolvedValue(FRESH_CONVERSATION);

    const res = await POST(
      makeRequest({ body: { name: "Attacker", email: VICTIM_EMAIL } })
    );
    await res.json();

    expect(prisma.conversation.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/visitor — proven ownership", () => {
  it("resumes the existing thread with its history when the token matches", async () => {
    const res = await POST(
      makeRequest({
        body: { name: "Victim", email: VICTIM_EMAIL },
        cookie: VICTIM_TOKEN,
      })
    );
    const data = await res.json();

    expect(data.conversation.id).toBe(VICTIM_CONVERSATION.id);
    expect(data.conversation.messages).toHaveLength(1);
  });

  it("treats a wrong token as an unverified claim", async () => {
    const res = await POST(
      makeRequest({
        body: { name: "Attacker", email: VICTIM_EMAIL },
        cookie: "not-the-real-token",
      })
    );
    const data = await res.json();

    expect(data.conversation.id).toBe(FRESH_CONVERSATION.id);
    expect(data.conversation.messages).toEqual([]);
  });
});

describe("POST /api/visitor — token confidentiality", () => {
  it("never includes the visitor token in the response body", async () => {
    const res = await POST(
      makeRequest({
        body: { name: "Victim", email: VICTIM_EMAIL },
        cookie: VICTIM_TOKEN,
      })
    );
    const data = await res.json();

    expect(data.visitor).not.toHaveProperty("token");
    expect(JSON.stringify(data)).not.toContain(VICTIM_TOKEN);
  });

  it("still sets the token as an HttpOnly, SameSite=Strict cookie", async () => {
    const res = await POST(
      makeRequest({ body: { name: "Victim", email: VICTIM_EMAIL }, cookie: VICTIM_TOKEN })
    );

    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toContain(`visitor-token=${VICTIM_TOKEN}`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Strict");
  });
});

describe("POST /api/visitor — new visitor", () => {
  it("creates the visitor and returns an empty thread", async () => {
    prisma.visitor.findUnique.mockResolvedValue(null);
    prisma.visitor.create.mockResolvedValue({
      id: "new-id",
      name: "New Person",
      email: "new@example.com",
      token: "brand-new-token",
      createdAt: new Date(),
    });
    prisma.conversation.findFirst.mockResolvedValue(null);

    const res = await POST(
      makeRequest({ body: { name: "New Person", email: "new@example.com" } })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(prisma.visitor.create).toHaveBeenCalled();
    expect(data.visitor.email).toBe("new@example.com");
    expect(data.visitor).not.toHaveProperty("token");
  });
});

describe("POST /api/visitor — input validation", () => {
  it("rejects non-string input with 400 rather than throwing a 500", async () => {
    const res = await POST(makeRequest({ body: { name: { $ne: null }, email: ["a@b.com"] } }));

    expect(res.status).toBe(400);
  });

  it("rejects a malformed email address", async () => {
    const res = await POST(makeRequest({ body: { name: "Tester", email: "not-an-email" } }));

    expect(res.status).toBe(400);
  });
});
