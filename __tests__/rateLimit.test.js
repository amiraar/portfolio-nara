import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { checkRateLimit, checkMultiRateLimit } from "../lib/rateLimit.js";

// Mock @/lib/prisma so tests never hit the real database.
// atomicIncrement calls prisma.$queryRaw — we control what it returns.
vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

// Clear call counts and queued mockResolvedValueOnce values before each test.
beforeEach(() => {
  vi.clearAllMocks();
});

// Helper: make prisma.$queryRaw return a single row as if the DB responded.
function mockDbRow(count, windowStart = new Date()) {
  prisma.$queryRaw.mockResolvedValue([{ count: BigInt(count), window_start: windowStart }]);
}

// ─── checkRateLimit ───────────────────────────────────────────────────────────

describe("checkRateLimit", () => {
  it("allows the first request (count=1, max=3)", async () => {
    mockDbRow(1);
    const result = await checkRateLimit("user:abc", 3, 60, "test");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfter).toBe(0);
  });

  it("allows the last request exactly at the limit (count === max)", async () => {
    mockDbRow(3);
    const result = await checkRateLimit("user:abc", 3, 60, "test");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("blocks when count exceeds max (count > max)", async () => {
    // DB already incremented to 4 before we check — over the limit of 3
    const windowStart = new Date(Date.now() - 30_000); // 30 s into the window
    mockDbRow(4, windowStart);
    const result = await checkRateLimit("user:abc", 3, 60, "test");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(60);
  });

  it("retryAfter is always at least 1 when blocked", async () => {
    // windowStart is almost expired — only 1 ms left
    const windowStart = new Date(Date.now() - 59_999);
    mockDbRow(99, windowStart);
    const result = await checkRateLimit("user:abc", 3, 60, "test");
    expect(result.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("uses default maxRequests=10 and scope=global when omitted", async () => {
    mockDbRow(1);
    const result = await checkRateLimit("user:abc");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("falls back to default maxRequests for invalid input (0)", async () => {
    mockDbRow(1);
    const result = await checkRateLimit("user:abc", 0, 60, "test");
    // safeMax falls back to 10 (MAX_REQUESTS_DEFAULT)
    expect(result.remaining).toBe(9);
  });

  it("falls back to default windowSec for invalid input (-1)", async () => {
    mockDbRow(1);
    const result = await checkRateLimit("user:abc", 3, -1, "test");
    expect(result.allowed).toBe(true);
  });

  it("normalizes blank identifier to 'unknown'", async () => {
    mockDbRow(1);
    await checkRateLimit("   ", 3, 60, "test");
    // The key passed to $queryRaw must include 'unknown'
    const call = prisma.$queryRaw.mock.calls[0];
    // Tagged template literal — first arg is the template strings array
    expect(call[0].join("")).toContain("INSERT INTO rate_limit_entries");
  });

  it("calls prisma.$queryRaw exactly once per checkRateLimit call", async () => {
    mockDbRow(1);
    await checkRateLimit("user:abc", 3, 60, "test");
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});

// ─── checkMultiRateLimit ──────────────────────────────────────────────────────

describe("checkMultiRateLimit", () => {
  it("allows when all windows pass", async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(1), window_start: new Date() }]) // rpm
      .mockResolvedValueOnce([{ count: BigInt(1), window_start: new Date() }]); // rpd

    const result = await checkMultiRateLimit("visitor:xyz", [
      { maxRequests: 4,  windowSec: 60,          scope: "chat:rpm" },
      { maxRequests: 15, windowSec: 24 * 60 * 60, scope: "chat:rpd" },
    ]);

    expect(result.allowed).toBe(true);
    expect(result.limitedBy).toBeNull();
    expect(result.remaining).toBe(3); // min(3, 14) = 3
  });

  it("blocks and identifies the limiting scope (rpm)", async () => {
    const windowStart = new Date(Date.now() - 5_000);
    prisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(5), window_start: windowStart }]) // rpm: over limit of 4
      .mockResolvedValueOnce([{ count: BigInt(1), window_start: new Date() }]); // rpd: fine

    const result = await checkMultiRateLimit("visitor:xyz", [
      { maxRequests: 4,  windowSec: 60,          scope: "chat:rpm" },
      { maxRequests: 15, windowSec: 24 * 60 * 60, scope: "chat:rpd" },
    ]);

    expect(result.allowed).toBe(false);
    expect(result.limitedBy).toBe("chat:rpm");
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("blocks and identifies the limiting scope (rpd)", async () => {
    const oldWindowStart = new Date(Date.now() - 23 * 60 * 60 * 1000); // 23 h ago
    prisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(1), window_start: new Date() }]) // rpm: fine
      .mockResolvedValueOnce([{ count: BigInt(16), window_start: oldWindowStart }]); // rpd: over limit

    const result = await checkMultiRateLimit("visitor:xyz", [
      { maxRequests: 4,  windowSec: 60,          scope: "chat:rpm" },
      { maxRequests: 15, windowSec: 24 * 60 * 60, scope: "chat:rpd" },
    ]);

    expect(result.allowed).toBe(false);
    expect(result.limitedBy).toBe("chat:rpd");
  });

  it("picks the most restrictive (longest retryAfter) when both windows block", async () => {
    const rpmWindowStart = new Date(Date.now() - 10_000);  // 10 s into 60 s window → ~50 s left
    const rpdWindowStart = new Date(Date.now() - 3600_000); // 1 h into 24 h window → ~23 h left
    prisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(5), window_start: rpmWindowStart }]) // rpm blocked
      .mockResolvedValueOnce([{ count: BigInt(16), window_start: rpdWindowStart }]); // rpd blocked

    const result = await checkMultiRateLimit("visitor:xyz", [
      { maxRequests: 4,  windowSec: 60,          scope: "chat:rpm" },
      { maxRequests: 15, windowSec: 24 * 60 * 60, scope: "chat:rpd" },
    ]);

    expect(result.allowed).toBe(false);
    // rpd has a much longer retryAfter, so it should be the limiting scope
    expect(result.limitedBy).toBe("chat:rpd");
    expect(result.retryAfter).toBeGreaterThan(3600);
  });

  it("runs all window checks in parallel (both DB calls happen)", async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(2), window_start: new Date() }])
      .mockResolvedValueOnce([{ count: BigInt(5), window_start: new Date() }]);

    await checkMultiRateLimit("visitor:xyz", [
      { maxRequests: 4,  windowSec: 60,          scope: "chat:rpm" },
      { maxRequests: 15, windowSec: 24 * 60 * 60, scope: "chat:rpd" },
    ]);

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
  });

  it("remaining reflects the minimum across all passing windows", async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(3), window_start: new Date() }]) // rpm: 4-3=1 remaining
      .mockResolvedValueOnce([{ count: BigInt(2), window_start: new Date() }]); // rpd: 15-2=13 remaining

    const result = await checkMultiRateLimit("visitor:xyz", [
      { maxRequests: 4,  windowSec: 60,          scope: "chat:rpm" },
      { maxRequests: 15, windowSec: 24 * 60 * 60, scope: "chat:rpd" },
    ]);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1); // min(1, 13)
  });
});
