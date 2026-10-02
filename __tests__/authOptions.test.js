import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the authorize() logic extracted from authOptions.
// We import authOptions directly and call the authorize function via the provider config.

const { checkRateLimit, ownerAuthState } = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  ownerAuthState: { upsert: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
}));
vi.mock("@/lib/rateLimit", () => ({ checkRateLimit }));
vi.mock("@/lib/prisma", () => ({ default: { ownerAuthState } }));

import { base32Decode, generateTotpSecret, totpAt } from "../lib/totp.js";

/** Current valid 6-digit code for a base32 secret. */
function currentCode(secret) {
  return totpAt(base32Decode(secret), Math.floor(Date.now() / 30000));
}

let authOptions;
let originalEnv;

beforeEach(async () => {
  vi.resetModules();
  originalEnv = { ...process.env };
  checkRateLimit.mockReset();
  checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });
  delete process.env.OWNER_TOTP_SECRET;
  ownerAuthState.upsert.mockReset().mockResolvedValue({});
  ownerAuthState.updateMany.mockReset().mockResolvedValue({ count: 1 });
  ownerAuthState.findUnique.mockReset().mockResolvedValue(null);
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

  it("accepts bcrypt-hashed password plus a valid TOTP code in production", async () => {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("securepassword", 10);
    const secret = generateTotpSecret();
    process.env.NODE_ENV = "production";
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = hash;
    process.env.OWNER_TOTP_SECRET = secret;
    const authorize = await getAuthorize();
    const result = await authorize({
      email: "owner@example.com",
      password: "securepassword",
      totp: currentCode(secret),
    });
    expect(result).toMatchObject({ id: "owner" });
  });

  it("runs a full bcrypt comparison against a well-formed hash when the email is wrong", async () => {
    const bcrypt = (await import("bcryptjs")).default;
    const hash = await bcrypt.hash("securepassword", 10);
    process.env.NODE_ENV = "production";
    process.env.OWNER_EMAIL = "owner@example.com";
    process.env.OWNER_PASSWORD = hash;
    const authorize = await getAuthorize();
    const compareSpy = vi.spyOn(bcrypt, "compare");

    const result = await authorize({ email: "wrong@example.com", password: "securepassword" });

    expect(result).toBeNull();
    expect(compareSpy).toHaveBeenCalledTimes(1);
    // A malformed hash makes bcryptjs return instantly, leaking the email via timing.
    expect(compareSpy.mock.calls[0][1]).toMatch(/^\$2[aby]\$12\$[./A-Za-z0-9]{53}$/);
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

describe("authOptions.authorize — TOTP second factor", () => {
  const OWNER = { email: "owner@example.com", password: "correctpassword" };

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    process.env.OWNER_EMAIL = OWNER.email;
    process.env.OWNER_PASSWORD = OWNER.password;
  });

  it("rejects production logins when OWNER_TOTP_SECRET is not configured", async () => {
    const bcrypt = await import("bcryptjs");
    process.env.NODE_ENV = "production";
    process.env.OWNER_PASSWORD = await bcrypt.hash(OWNER.password, 10);
    const authorize = await getAuthorize();
    expect(await authorize({ ...OWNER, totp: "123456" })).toBeNull();
  });

  it("rejects a correct password with a missing or wrong code", async () => {
    process.env.OWNER_TOTP_SECRET = generateTotpSecret();
    const authorize = await getAuthorize();
    expect(await authorize(OWNER)).toBeNull();
    expect(await authorize({ ...OWNER, totp: "000000" })).toBeNull();
  });

  it("burns the accepted time step so the code cannot be replayed", async () => {
    const secret = generateTotpSecret();
    process.env.OWNER_TOTP_SECRET = secret;
    const authorize = await getAuthorize();

    expect(await authorize({ ...OWNER, totp: currentCode(secret) })).toMatchObject({ id: "owner" });
    const { where, data } = ownerAuthState.updateMany.mock.calls[0][0];
    expect(where.OR).toEqual([{ lastTotpStep: null }, { lastTotpStep: { lt: data.lastTotpStep } }]);

    // Same step again: the conditional update matches no row → replay.
    ownerAuthState.updateMany.mockResolvedValue({ count: 0 });
    expect(await authorize({ ...OWNER, totp: currentCode(secret) })).toBeNull();
  });

  it("does not consult TOTP state when the password is wrong", async () => {
    process.env.OWNER_TOTP_SECRET = generateTotpSecret();
    const authorize = await getAuthorize();
    expect(await authorize({ ...OWNER, password: "nope", totp: "123456" })).toBeNull();
    expect(ownerAuthState.updateMany).not.toHaveBeenCalled();
  });
});

describe("authOptions session revocation", () => {
  async function getAuthOptions() {
    return (await import("../lib/authOptions.js")).authOptions;
  }

  it("stamps loginAt on sign-in", async () => {
    const { callbacks } = await getAuthOptions();
    const token = await callbacks.jwt({ token: {}, user: { id: "owner" } });
    expect(token.loginAt).toBeCloseTo(Date.now(), -3);
  });

  it("rejects a session without loginAt (issued before this check existed)", async () => {
    const { callbacks } = await getAuthOptions();
    await expect(callbacks.jwt({ token: { sub: "owner" } })).rejects.toThrow();
  });

  it("rejects a session older than the 8h absolute lifetime", async () => {
    const { callbacks } = await getAuthOptions();
    const loginAt = Date.now() - 8 * 60 * 60 * 1000 - 1;
    await expect(callbacks.jwt({ token: { loginAt } })).rejects.toThrow();
  });

  it("rejects a session issued before the last sign-out", async () => {
    const { callbacks } = await getAuthOptions();
    const loginAt = Date.now() - 60_000;
    ownerAuthState.findUnique.mockResolvedValue({ revokedBefore: new Date(loginAt + 1000) });
    await expect(callbacks.jwt({ token: { loginAt } })).rejects.toThrow();
  });

  it("keeps a session issued after the last sign-out", async () => {
    const { callbacks } = await getAuthOptions();
    const loginAt = Date.now() - 60_000;
    ownerAuthState.findUnique.mockResolvedValue({ revokedBefore: new Date(loginAt - 1000) });
    await expect(callbacks.jwt({ token: { loginAt } })).resolves.toMatchObject({ loginAt });
  });

  it("records the revocation time on sign-out", async () => {
    const { events } = await getAuthOptions();
    await events.signOut({ token: {} });
    const { update } = ownerAuthState.upsert.mock.calls[0][0];
    expect(update.revokedBefore).toBeInstanceOf(Date);
  });
});
