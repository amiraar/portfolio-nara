import { describe, it, expect, vi, afterEach } from "vitest";
import { createHash } from "crypto";

vi.mock("@/lib/prisma", () => ({ default: { visitor: { findUnique: vi.fn() } } }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

import prisma from "@/lib/prisma";
import {
  findVisitorByToken,
  getClientIP,
  hashVisitorToken,
  isTrustedOrigin,
  issueVisitorToken,
} from "../lib/apiRouteUtils.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

function makeReq(headers) {
  return { headers: new Headers(headers) };
}

describe("getClientIP", () => {
  it("ignores a client-supplied cf-connecting-ip unless TRUST_CLOUDFLARE=true", () => {
    delete process.env.TRUST_CLOUDFLARE;
    const req = makeReq({ "cf-connecting-ip": "1.1.1.1", "x-real-ip": "203.0.113.7" });
    expect(getClientIP(req)).toBe("203.0.113.7");
  });

  it("uses cf-connecting-ip when TRUST_CLOUDFLARE=true", () => {
    process.env.TRUST_CLOUDFLARE = "true";
    const req = makeReq({ "cf-connecting-ip": "1.1.1.1", "x-real-ip": "203.0.113.7" });
    expect(getClientIP(req)).toBe("1.1.1.1");
  });

  it("falls back to the first x-forwarded-for hop", () => {
    const req = makeReq({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" });
    expect(getClientIP(req)).toBe("198.51.100.2");
  });
});

describe("isTrustedOrigin", () => {
  it("accepts the exact configured origin", () => {
    process.env.NEXTAUTH_URL = "https://nara.vercel.app";
    expect(isTrustedOrigin(makeReq({ origin: "https://nara.vercel.app" }))).toBe(true);
  });

  it("rejects a look-alike host that merely starts with the configured URL", () => {
    process.env.NEXTAUTH_URL = "https://nara.vercel.app";
    expect(isTrustedOrigin(makeReq({ origin: "https://nara.vercel.app.evil.com" }))).toBe(false);
  });

  it("rejects a missing or malformed origin", () => {
    process.env.NEXTAUTH_URL = "https://nara.vercel.app";
    expect(isTrustedOrigin(makeReq({}))).toBe(false);
    expect(isTrustedOrigin(makeReq({ origin: "null" }))).toBe(false);
  });
});

describe("visitor tokens", () => {
  it("hashes tokens with SHA-256 hex (matches the SQL migration's sha256 digest)", () => {
    const expected = createHash("sha256").update("abc", "utf8").digest("hex");
    expect(hashVisitorToken("abc")).toBe(expected);
  });

  it("issues a raw token whose hash is what gets stored, with a future expiry", () => {
    const { raw, hash, expiresAt } = issueVisitorToken();
    expect(hash).toBe(hashVisitorToken(raw));
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("looks visitors up by the token hash, never the raw value", async () => {
    prisma.visitor.findUnique.mockResolvedValue({ id: "v1", tokenExpiresAt: null });
    await findVisitorByToken("raw-token");
    expect(prisma.visitor.findUnique).toHaveBeenCalledWith({
      where: { token: hashVisitorToken("raw-token") },
    });
  });

  it("rejects an expired token", async () => {
    prisma.visitor.findUnique.mockResolvedValue({
      id: "v1",
      tokenExpiresAt: new Date(Date.now() - 1000),
    });
    expect(await findVisitorByToken("raw-token")).toBeNull();
  });

  it("returns null for a missing token without querying", async () => {
    prisma.visitor.findUnique.mockClear();
    expect(await findVisitorByToken(undefined)).toBeNull();
    expect(prisma.visitor.findUnique).not.toHaveBeenCalled();
  });
});
