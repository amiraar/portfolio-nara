import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the authorize() logic extracted from authOptions.
// We import authOptions directly and call the authorize function via the provider config.

const { checkRateLimit } = vi.hoisted(() => ({ checkRateLimit: vi.fn() }));
vi.mock("@/lib/rateLimit", () => ({ checkRateLimit }));

let authOptions;
let originalEnv;

beforeEach(async () => {
  vi.resetModules();
  originalEnv = { ...process.env };
  checkRateLimit.mockReset();
  checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });
});

afterEach(() => {
  process.env = originalEnv;
  vi.restoreAllMocks();
});

async function getAuthorize() {
  const mod = await import("../lib/authOptions.js");
  const provider = mod.authOptions.providers[0];
  return provider.options?.authorize ?? provider.authorize;
}

describe("authOptions.authorize", () => {
  it("returns null when OWNER_EMAIL is not configured", async () => {
    delete process.env.OWNER_EMAIL;
    process.env.OWNER_PASSWORD = "secret";
    const authorize = await getAuthorize();
    await expect(authorize({ email: "a@a.com", password: "secret" })).rejects.toThrow();
  });

  it("returns null for wrong email", async () => {
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = "mypassword";
    const authorize = await getAuthorize();
    const result = await authorize({ email: "wrong@example.com", password: "mypassword" });
    expect(result).toBeNull();
  });

  it("returns null for wrong password (plain-text, dev env)", async () => {
    process.env.NODE_ENV = "development";
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = "correctpassword";
    const authorize = await getAuthorize();
    const result = await authorize({ email: "owner@example.com", password: "wrongpassword" });
    expect(result).toBeNull();
  });

  it("returns user object for correct credentials (plain-text, dev env)", async () => {
    process.env.NODE_ENV = "development";
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = "correctpassword";
    const authorize = await getAuthorize();
    const result = await authorize({ email: "owner@example.com", password: "correctpassword" });
    expect(result).toMatchObject({ id: "owner", email: "owner@example.com" });
  });

  it("blocks plain-text password in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = "notahash";
    const authorize = await getAuthorize();
    const result = await authorize({ email: "owner@example.com", password: "notahash" });
    expect(result).toBeNull();
  });

  it("accepts bcrypt-hashed password in production", async () => {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("securepassword", 10);
    process.env.NODE_ENV = "production";
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = hash;
    const authorize = await getAuthorize();
    const result = await authorize({ email: "owner@example.com", password: "securepassword" });
    expect(result).toMatchObject({ id: "owner" });
  });

  it("returns null without checking the password when the login rate limit is hit", async () => {
    process.env.NODE_ENV = "development";
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = "correctpassword";
    checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfter: 600 });
    const authorize = await getAuthorize();
    const result = await authorize(
      { email: "owner@example.com", password: "correctpassword" },
      { headers: { "x-real-ip": "203.0.113.7" } }
    );
    expect(result).toBeNull();
    expect(checkRateLimit).toHaveBeenCalledWith("203.0.113.7", 5, 900, "login-ip");
  });

  it("ignores a spoofed cf-connecting-ip header for login throttling", async () => {
    delete process.env.TRUST_CLOUDFLARE;
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = "x";
    const authorize = await getAuthorize();
    await authorize(
      { email: "a@b.com", password: "y" },
      { headers: { "cf-connecting-ip": "1.1.1.1", "x-real-ip": "203.0.113.7" } }
    );
    expect(checkRateLimit).toHaveBeenCalledWith("203.0.113.7", 5, 900, "login-ip");
  });
});
