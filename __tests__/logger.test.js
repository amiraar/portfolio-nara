import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({ default: { appLog: { create: vi.fn() } } }));

import prisma from "@/lib/prisma";
import { logError } from "../lib/logger.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  prisma.appLog.create.mockResolvedValue({});
});

describe("logError", () => {
  it("logs to the console and persists source, message, context and stack", async () => {
    const error = new Error("boom");

    await logError("GET /api/analytics", error, { correlationId: "c1" });

    expect(console.error).toHaveBeenCalledWith("[GET /api/analytics]", error, { correlationId: "c1" });
    const { data } = prisma.appLog.create.mock.calls[0][0];
    expect(data.source).toBe("GET /api/analytics");
    expect(data.message).toBe("boom");
    expect(data.details.correlationId).toBe("c1");
    expect(data.details.stack).toContain("boom");
  });

  it("truncates long messages to 500 characters", async () => {
    await logError("kaia", new Error("x".repeat(800)));

    expect(prisma.appLog.create.mock.calls[0][0].data.message).toHaveLength(500);
  });

  it("stores only name and code for Prisma errors, whose message echoes query data", async () => {
    const error = new Error("Invalid `prisma.visitor.create()` invocation: email: \"someone@example.com\"");
    error.name = "PrismaClientKnownRequestError";
    error.code = "P2002";

    await logError("POST /api/visitor", error);

    const { data } = prisma.appLog.create.mock.calls[0][0];
    expect(data.message).toBe("PrismaClientKnownRequestError P2002");
    expect(data.details).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain("someone@example.com");
  });

  it("accepts a plain string", async () => {
    await logError("auth", "OWNER_TOTP_SECRET is not set.");

    const { data } = prisma.appLog.create.mock.calls[0][0];
    expect(data.message).toBe("OWNER_TOTP_SECRET is not set.");
    expect(data.details).toBeUndefined();
  });

  it("never throws when the database write fails", async () => {
    prisma.appLog.create.mockRejectedValue(new Error("db down"));

    await expect(logError("GET /api/logs", new Error("boom"))).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledTimes(2);
  });
});
