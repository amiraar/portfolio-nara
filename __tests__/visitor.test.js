/**
 * __tests__/visitor.test.js — POST /api/visitor
 *
 * Covers the impersonation fix: knowing a visitor's email must not disclose
 * their conversation history or token, and consent must be explicit.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    visitor: { upsert: vi.fn(), update: vi.fn() },
    conversation: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { POST } from "../app/api/visitor/route.js";

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
    },
  };
}

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
  });
});
