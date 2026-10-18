import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({ default: { auditEvent: { create: vi.fn() } } }));

import prisma from "@/lib/prisma";
import { recordAuditEvent } from "../lib/audit.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("recordAuditEvent", () => {
  it("persists the event to the AuditEvent table", async () => {
    prisma.auditEvent.create.mockResolvedValue({});

    await recordAuditEvent({ actor: "owner@example.com", action: "portfolio.update", details: { section: "hero" } });

    expect(prisma.auditEvent.create).toHaveBeenCalledWith({
      data: { actor: "owner@example.com", action: "portfolio.update", ip: null, details: { section: "hero" } },
    });
  });

  it("never throws when the database write fails", async () => {
    prisma.auditEvent.create.mockRejectedValue(new Error("db down"));

    await expect(recordAuditEvent({ actor: "anonymous", action: "auth.login_failed", ip: "203.0.113.7" }))
      .resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
