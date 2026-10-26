/**
 * __tests__/logs.test.js — GET /api/logs
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({ default: { appLog: { findMany: vi.fn(), create: vi.fn() } } }));
vi.mock("@/lib/authOptions", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { GET } from "../app/api/logs/route.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/logs", () => {
  it("rejects a request without an owner session", async () => {
    getServerSession.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
    expect(prisma.appLog.findMany).not.toHaveBeenCalled();
  });

  it("returns the newest 100 logs for the owner", async () => {
    getServerSession.mockResolvedValue({ user: { email: "owner@example.com" } });
    const rows = [{ id: "l1", source: "POST /api/chat", message: "boom" }];
    prisma.appLog.findMany.mockResolvedValue(rows);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ logs: rows });
    expect(prisma.appLog.findMany).toHaveBeenCalledWith({ orderBy: { at: "desc" }, take: 100 });
  });

  it("returns 500 when the query fails", async () => {
    getServerSession.mockResolvedValue({ user: { email: "owner@example.com" } });
    prisma.appLog.findMany.mockRejectedValue(new Error("db down"));

    const res = await GET();

    expect(res.status).toBe(500);
  });
});
