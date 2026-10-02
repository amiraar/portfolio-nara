/**
 * __tests__/visitor.test.js — Security tests for POST /api/visitor
 *
 * Identity is the server-issued cookie token, never the email address — an
 * email is an unverified claim that anyone can type. These tests pin the rules
 * that follow from that:
 *   - a caller without a valid token always gets a NEW visitor and thread,
 *     even when the email belongs to an existing visitor
 *   - an existing visitor's row (token, consent record) is never modified by
 *     someone who does not hold their token
 *   - tokens are stored hashed and expire server-side
 *   - the token itself is never returned in the response body
 *   - consent must be explicit and its timestamp is recorded
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

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(),
}));

// Real token helpers (hashing, expiry, cookie format); only the IP lookup is stubbed.
vi.mock("@/lib/apiRouteUtils", async (importOriginal) => ({
  ...(await importOriginal()),
  getClientIP: vi.fn(() => "127.0.0.1"),
}));

// ─── Imports (after mocks are registered) ─────────────────────────────────────

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { hashVisitorToken } from "@/lib/apiRouteUtils";
import { POST } from "../app/api/visitor/route.js";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VICTIM_TOKEN = "victim-token-secret-abc123";
const VICTIM_EMAIL = "victim@example.com";

const VICTIM_VISITOR = {
  id: "victim-visitor-id",
  name: "Victim",
  email: VICTIM_EMAIL,
  token: hashVisitorToken(VICTIM_TOKEN),
  tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
  visitorId: "new-visitor-id",
  status: "active",
  messages: [],
};

const ATTACKER_BODY = { name: "Attacker", email: VICTIM_EMAIL, consent: true };
const VICTIM_BODY = { name: "Victim", email: VICTIM_EMAIL, consent: true };

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

/** Raw token value from the response's Set-Cookie header. */
function cookieToken(res) {
  return /visitor-token=([^;]*)/.exec(res.headers.get("Set-Cookie"))?.[1];
}

beforeEach(() => {
  vi.clearAllMocks();

  checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });

  // Only the hash of the victim's raw token resolves to the victim.
  prisma.visitor.findUnique.mockImplementation(({ where }) =>
    Promise.resolve(where?.token === VICTIM_VISITOR.token ? VICTIM_VISITOR : null)
  );
  prisma.visitor.update.mockImplementation(({ data }) =>
    Promise.resolve({ ...VICTIM_VISITOR, ...data })
  );
  prisma.visitor.create.mockImplementation(({ data }) =>
    Promise.resolve({ id: "new-visitor-id", createdAt: new Date(), ...data })
  );
  prisma.conversation.findFirst.mockResolvedValue(VICTIM_CONVERSATION);
  prisma.conversation.create.mockResolvedValue(FRESH_CONVERSATION);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/visitor — someone else's email, no valid token", () => {
  it("creates a new visitor instead of touching the existing one", async () => {
    const res = await POST(makeRequest({ body: ATTACKER_BODY })); // no cookie

    expect(res.status).toBe(200);
    expect(prisma.visitor.create).toHaveBeenCalledOnce();
    // The victim's row — token and consent record — is never modified.
    expect(prisma.visitor.update).not.toHaveBeenCalled();
  });

  it("never looks a visitor up by email", async () => {
    await POST(makeRequest({ body: ATTACKER_BODY }));

    for (const [args] of prisma.visitor.findUnique.mock.calls) {
      expect(args.where).not.toHaveProperty("email");
    }
  });

  it("returns a fresh empty thread, not the victim's history or thread id", async () => {
    const res = await POST(makeRequest({ body: ATTACKER_BODY }));
    const data = await res.json();

    expect(data.conversation.id).toBe(FRESH_CONVERSATION.id);
    expect(data.conversation.messages).toEqual([]);
    expect(JSON.stringify(data)).not.toContain(SECRET_MESSAGE);
    expect(prisma.conversation.findFirst).not.toHaveBeenCalled();
  });

  it("treats a wrong token exactly like no token", async () => {
    const res = await POST(makeRequest({ body: ATTACKER_BODY, cookie: "not-the-real-token" }));
    const data = await res.json();

    expect(prisma.visitor.update).not.toHaveBeenCalled();
    expect(data.conversation.id).toBe(FRESH_CONVERSATION.id);
    expect(cookieToken(res)).not.toBe(VICTIM_TOKEN);
  });

  it("treats an expired token like no token", async () => {
    prisma.visitor.findUnique.mockResolvedValue({
      ...VICTIM_VISITOR,
      tokenExpiresAt: new Date(Date.now() - 1000),
    });

    const res = await POST(makeRequest({ body: VICTIM_BODY, cookie: VICTIM_TOKEN }));
    const data = await res.json();

    expect(prisma.visitor.update).not.toHaveBeenCalled();
    expect(data.conversation.id).toBe(FRESH_CONVERSATION.id);
  });
});

describe("POST /api/visitor — valid token (same browser)", () => {
  it("resumes the existing thread with its history", async () => {
    const res = await POST(makeRequest({ body: VICTIM_BODY, cookie: VICTIM_TOKEN }));
    const data = await res.json();

    expect(data.conversation.id).toBe(VICTIM_CONVERSATION.id);
    expect(data.conversation.messages).toHaveLength(1);
    expect(prisma.visitor.create).not.toHaveBeenCalled();
  });

  it("keeps the token value and slides its expiry", async () => {
    const res = await POST(makeRequest({ body: VICTIM_BODY, cookie: VICTIM_TOKEN }));

    const { data } = prisma.visitor.update.mock.calls[0][0];
    expect(data).not.toHaveProperty("token");
    expect(data.tokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(cookieToken(res)).toBe(VICTIM_TOKEN);
  });
});

describe("POST /api/visitor — token storage and confidentiality", () => {
  it("stores only the SHA-256 hash of the token it sets in the cookie", async () => {
    const res = await POST(makeRequest({ body: ATTACKER_BODY }));

    const raw = cookieToken(res);
    const { data } = prisma.visitor.create.mock.calls[0][0];
    expect(raw).toEqual(expect.any(String));
    expect(data.token).toBe(hashVisitorToken(raw));
    expect(data.token).not.toBe(raw);
    expect(data.tokenExpiresAt).toBeInstanceOf(Date);
  });

  it("never includes the token or its hash in the response body", async () => {
    const res = await POST(makeRequest({ body: VICTIM_BODY, cookie: VICTIM_TOKEN }));
    const data = await res.json();

    expect(Object.keys(data.visitor).sort()).toEqual(["createdAt", "email", "id", "name"]);
    expect(JSON.stringify(data)).not.toContain(VICTIM_TOKEN);
    expect(JSON.stringify(data)).not.toContain(VICTIM_VISITOR.token);
  });

  it("sets the token as an HttpOnly, SameSite=Strict cookie", async () => {
    const res = await POST(makeRequest({ body: VICTIM_BODY, cookie: VICTIM_TOKEN }));

    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Strict");
  });
});

describe("POST /api/visitor — consent", () => {
  it("rejects requests without explicit consent", async () => {
    const res = await POST(makeRequest({ body: { name: "A", email: "a@example.com" } }));

    expect(res.status).toBe(400);
    expect(prisma.visitor.create).not.toHaveBeenCalled();
  });

  it("records the consent timestamp for new visitors", async () => {
    await POST(makeRequest({ body: { name: "New", email: "new@example.com", consent: true } }));

    expect(prisma.visitor.create.mock.calls[0][0].data.consentAt).toBeInstanceOf(Date);
  });

  it("refreshes the consent timestamp for returning visitors", async () => {
    await POST(makeRequest({ body: VICTIM_BODY, cookie: VICTIM_TOKEN }));

    expect(prisma.visitor.update.mock.calls[0][0].data.consentAt).toBeInstanceOf(Date);
  });
});

describe("POST /api/visitor — input validation", () => {
  it("rejects non-string input with 400 rather than throwing a 500", async () => {
    const res = await POST(
      makeRequest({ body: { name: { $ne: null }, email: ["a@b.com"], consent: true } })
    );

    expect(res.status).toBe(400);
  });

  it("stores names verbatim (no character stripping)", async () => {
    await POST(makeRequest({ body: { name: "Sinéad O'Brien", email: "s@example.com", consent: true } }));

    expect(prisma.visitor.create.mock.calls[0][0].data.name).toBe("Sinéad O'Brien");
  });

  it("rejects an email containing HTML or quote characters", async () => {
    const res = await POST(
      makeRequest({ body: { name: "Tester", email: "a<script>@example.com", consent: true } })
    );

    expect(res.status).toBe(400);
  });

  it("rejects a malformed email address", async () => {
    const res = await POST(
      makeRequest({ body: { name: "Tester", email: "not-an-email", consent: true } })
    );

    expect(res.status).toBe(400);
  });
});
