/**
 * __tests__/retention.test.js — GET /api/cron/retention
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  default: {
    visitor: { findMany: vi.fn() },
    auditEvent: { deleteMany: vi.fn() },
  },
}));

vi.mock("@/lib/apiRouteUtils", () => ({
  deleteVisitorData: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { deleteVisitorData } from "@/lib/apiRouteUtils";
import { GET } from "../app/api/cron/retention/route.js";

const SECRET = "test-cron-secret-1234567890";

function makeRequest(authorization) {
  return { headers: new Headers(authorization ? { authorization } : {}) };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = SECRET;
  prisma.visitor.findMany.mockResolvedValue([]);
  prisma.auditEvent.deleteMany.mockResolvedValue({ count: 0 });
  deleteVisitorData.mockResolvedValue({ messages: 0, conversations: 0, visitors: 0 });
});

afterEach(() => {
  delete process.env.CRON_SECRET;
});

describe("GET /api/cron/retention — auth", () => {
  it("rejects a request without the bearer secret", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect(prisma.visitor.findMany).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret", async () => {
    const res = await GET(makeRequest("Bearer wrong"));
    expect(res.status).toBe(401);
  });

  it("rejects everything when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(makeRequest("Bearer undefined"));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/cron/retention — deletion", () => {
  it("selects only visitors inactive for 90 days", async () => {
    const before = Date.now();
    await GET(makeRequest(`Bearer ${SECRET}`));

    const { where } = prisma.visitor.findMany.mock.calls[0][0];
    const cutoff = where.createdAt.lt.getTime();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    expect(before - cutoff).toBeGreaterThanOrEqual(ninetyDays - 1000);
    expect(before - cutoff).toBeLessThanOrEqual(ninetyDays + 1000);
    expect(where.OR).toEqual([{ consentAt: null }, { consentAt: { lt: where.createdAt.lt } }]);
    expect(where.conversations).toEqual({ none: { updatedAt: { gte: where.createdAt.lt } } });
  });

  it("deletes the stale visitors' data and old audit events, and reports counts", async () => {
    prisma.visitor.findMany.mockResolvedValueOnce([{ id: "v1" }, { id: "v2" }]);
    deleteVisitorData.mockResolvedValue({ messages: 7, conversations: 2, visitors: 2 });
    prisma.auditEvent.deleteMany.mockResolvedValue({ count: 3 });

    const res = await GET(makeRequest(`Bearer ${SECRET}`));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(deleteVisitorData).toHaveBeenCalledWith(["v1", "v2"]);
    expect(prisma.auditEvent.deleteMany).toHaveBeenCalledWith({
      where: { at: { lt: expect.any(Date) } },
    });
    expect(data.deleted).toEqual({ visitors: 2, conversations: 2, messages: 7, auditEvents: 3 });
  });

  it("keeps going in batches until fewer than a full batch remain", async () => {
    const fullBatch = Array.from({ length: 500 }, (_, i) => ({ id: `v${i}` }));
    prisma.visitor.findMany
      .mockResolvedValueOnce(fullBatch)
      .mockResolvedValueOnce([{ id: "last" }]);

    await GET(makeRequest(`Bearer ${SECRET}`));

    expect(deleteVisitorData).toHaveBeenCalledTimes(2);
    expect(prisma.visitor.findMany).toHaveBeenCalledTimes(2);
  });
});
