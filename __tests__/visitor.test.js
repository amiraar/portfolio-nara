/**
<<<<<<< HEAD
 * __tests__/visitor.test.js — POST /api/visitor
 *
 * Covers the impersonation fix: knowing a visitor's email must not disclose
 * their conversation history or token, and consent must be explicit.
=======
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
>>>>>>> ac126ffb782dcf8cfd4934a50be1794cdd70c1e5
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

<<<<<<< HEAD
vi.mock("@/lib/prisma", () => ({
  default: {
    visitor: { upsert: vi.fn(), update: vi.fn() },
=======
// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  default: {
    visitor: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
>>>>>>> ac126ffb782dcf8cfd4934a50be1794cdd70c1e5
    conversation: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(),
}));

<<<<<<< HEAD
=======
vi.mock("@/lib/apiRouteUtils", () => ({
  getClientIP: vi.fn(() => "127.0.0.1"),
}));

// ─── Imports (after mocks are registered) ─────────────────────────────────────

>>>>>>> ac126ffb782dcf8cfd4934a50be1794cdd70c1e5
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { POST } from "../app/api/visitor/route.js";

<<<<<<< HEAD
const TOKEN = "victim-token";
const VISITOR = {
  id: "visitor-1",
  name: "Victim",
  email: "victim@example.com",
  token: TOKEN,
  createdAt: new Date("2026-01-01T00:00:00Z"),
};
const EXISTING_CONV = {
  id: "conv-old",
  visitorId: VISITOR.id,
  messages: [{ id: "m1", role: "user", content: "private history" }],
};
const NEW_CONV = { id: "conv-new", visitorId: VISITOR.id, messages: [] };

function makeRequest({ body, cookie = null } = {}) {
  return {
    json: () => Promise.resolve(body ?? {}),
    headers: new Headers({ "x-real-ip": "203.0.113.9" }),
    cookies: {
      get: (name) => (name === "visitor-token" && cookie ? { value: cookie } : undefined),
=======
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
>>>>>>> ac126ffb782dcf8cfd4934a50be1794cdd70c1e5
    },
  };
}

<<<<<<< HEAD
const VALID_BODY = { name: "Anyone", email: "victim@example.com", consent: true };

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });
  prisma.visitor.upsert.mockResolvedValue(VISITOR);
  prisma.conversation.findFirst.mockResolvedValue(EXISTING_CONV);
  prisma.conversation.create.mockResolvedValue(NEW_CONV);
});

describe("POST /api/visitor", () => {
  it("does not disclose existing history to a request without the visitor's cookie", async () => {
    const res = await POST(makeRequest({ body: VALID_BODY }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(prisma.conversation.findFirst).not.toHaveBeenCalled();
    expect(data.conversation).toEqual(NEW_CONV);
  });

  it("does not disclose existing history when the cookie belongs to someone else", async () => {
    const res = await POST(makeRequest({ body: VALID_BODY, cookie: "attacker-token" }));
    const data = await res.json();

    expect(prisma.conversation.findFirst).not.toHaveBeenCalled();
    expect(data.conversation.id).toBe("conv-new");
  });

  it("resumes the active conversation when the request carries the visitor's own cookie", async () => {
    const res = await POST(makeRequest({ body: VALID_BODY, cookie: TOKEN }));
    const data = await res.json();

    expect(data.conversation.id).toBe("conv-old");
    expect(prisma.conversation.create).not.toHaveBeenCalled();
  });

  it("never returns the visitor token in the JSON body", async () => {
    const res = await POST(makeRequest({ body: VALID_BODY }));
    const data = await res.json();

    expect(JSON.stringify(data)).not.toContain(TOKEN);
    expect(Object.keys(data.visitor).sort()).toEqual(["createdAt", "email", "id", "name"]);
    expect(res.headers.get("Set-Cookie")).toContain("HttpOnly");
  });

  it("rejects requests without explicit consent", async () => {
    const res = await POST(makeRequest({ body: { name: "A", email: "a@example.com" } }));
    expect(res.status).toBe(400);
    expect(prisma.visitor.upsert).not.toHaveBeenCalled();
  });

  it("records the consent timestamp", async () => {
    await POST(makeRequest({ body: VALID_BODY }));
    const args = prisma.visitor.upsert.mock.calls[0][0];
    expect(args.create.consentAt).toBeInstanceOf(Date);
    expect(args.update.consentAt).toBeInstanceOf(Date);
=======
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
>>>>>>> ac126ffb782dcf8cfd4934a50be1794cdd70c1e5
  });
});
