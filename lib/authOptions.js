/**
 * lib/authOptions.js — NextAuth.js configuration, extracted so it can be
 * imported by API routes without violating Next.js Route export constraints.
 */

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { logError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";
import { verifyTotp } from "@/lib/totp";

/** Brute-force limits for the owner login. */
const LOGIN_IP_LIMIT = { maxRequests: 5, windowSec: 15 * 60, scope: "login-ip" };
const LOGIN_EMAIL_LIMIT = { maxRequests: 10, windowSec: 60 * 60, scope: "login-email" };

/**
 * Owner session lifetime. NextAuth re-encodes the JWT (with a fresh exp) on
 * every session read, so `maxAge` alone is a sliding idle timeout; the jwt
 * callback enforces this as an absolute limit from the login time.
 */
const SESSION_MAX_AGE_SEC = 8 * 60 * 60;

/** Primary key of the single OwnerAuthState row. */
const OWNER_STATE_ID = "owner";

/**
 * Valid bcrypt hash (cost 12) compared against when the email is wrong, so a
 * failed login always costs one full bcrypt round. It must be a well-formed
 * 60-character hash: bcryptjs returns immediately for malformed input, which
 * would make a wrong email measurably faster than a wrong password.
 */
const DUMMY_HASH = bcrypt.hashSync(randomUUID(), 12);

/**
 * Read a header from NextAuth's authorize() request, which may carry either a
 * Fetch `Headers` instance or a plain object.
 * @param {any} req
 * @param {string} name
 * @returns {string | undefined}
 */
function readHeader(req, name) {
  const headers = req?.headers;
  if (!headers) return undefined;
  if (typeof headers.get === "function") return headers.get(name) ?? undefined;
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Resolve the client IP for login throttling. Mirrors getClientIP() in
 * lib/apiRouteUtils.js (cf-connecting-ip only when TRUST_CLOUDFLARE=true).
 * @param {any} req
 * @returns {string}
 */
function getLoginIP(req) {
  if (process.env.TRUST_CLOUDFLARE === "true") {
    const cf = readHeader(req, "cf-connecting-ip")?.trim();
    if (cf) return cf;
  }
  const real = readHeader(req, "x-real-ip")?.trim();
  if (real) return real;
  const first = readHeader(req, "x-forwarded-for")?.split(",")[0].trim();
  return first || "unknown";
}

/**
 * Throttle login attempts per IP and per submitted email.
 * @param {any} req
 * @param {string | undefined} email
 * @returns {Promise<boolean>} true when the attempt may proceed
 */
async function isLoginAllowed(req, email) {
  const checks = [
    checkRateLimit(getLoginIP(req), LOGIN_IP_LIMIT.maxRequests, LOGIN_IP_LIMIT.windowSec, LOGIN_IP_LIMIT.scope),
  ];
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (normalizedEmail) {
    // Hash the email so the address never lands in the rate-limit table or logs.
    const emailKey = createHash("sha256").update(normalizedEmail).digest("hex");
    checks.push(
      checkRateLimit(emailKey, LOGIN_EMAIL_LIMIT.maxRequests, LOGIN_EMAIL_LIMIT.windowSec, LOGIN_EMAIL_LIMIT.scope)
    );
  }
  const results = await Promise.all(checks);
  return results.every((r) => r.allowed);
}

/**
 * Verify the TOTP second factor and burn its time step so the same code cannot
 * be replayed (RFC 6238 §5.2).
 *
 * Production requires OWNER_TOTP_SECRET (same rule as the bcrypt requirement
 * for OWNER_PASSWORD); development skips the factor when it is unset.
 *
 * @param {unknown} code
 * @param {string} ip
 * @returns {Promise<boolean>}
 */
async function isSecondFactorValid(code, ip) {
  const secret = process.env.OWNER_TOTP_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      await logError("auth", "OWNER_TOTP_SECRET is not set. Login rejected. Run: node scripts/totp-setup.mjs");
      return false;
    }
    return true;
  }

  const step = verifyTotp(code, secret);
  if (step === null) {
    await recordAuditEvent({ actor: "anonymous", action: "auth.totp_failed", ip });
    return false;
  }

  // Atomic compare-and-set: accept only a step newer than the last one used.
  await prisma.ownerAuthState.upsert({
    where: { id: OWNER_STATE_ID },
    create: { id: OWNER_STATE_ID },
    update: {},
  });
  const { count } = await prisma.ownerAuthState.updateMany({
    where: {
      id: OWNER_STATE_ID,
      OR: [{ lastTotpStep: null }, { lastTotpStep: { lt: step } }],
    },
    data: { lastTotpStep: step },
  });
  if (count === 0) {
    await recordAuditEvent({ actor: "anonymous", action: "auth.totp_replayed", ip });
    return false;
  }
  return true;
}

/** @type {import("next-auth").AuthOptions} */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "Kode 2FA", type: "text" },
      },
      /**
       * Validate owner credentials against environment variables, then the
       * TOTP second factor.
       * @param {{ email: string, password: string, totp?: string }} credentials
       * @param {any} req
       * @returns {Promise<{ id: string, name: string, email: string } | null>}
       */
      async authorize(credentials, req) {
        const ip = getLoginIP(req);
        if (!(await isLoginAllowed(req, credentials?.email))) {
          await recordAuditEvent({ actor: "anonymous", action: "auth.login_rate_limited", ip });
          return null;
        }

        const ownerEmail = process.env.OWNER_EMAIL;
        const ownerPassword = process.env.OWNER_PASSWORD;

        if (!ownerEmail || !ownerPassword) {
          throw new Error("Owner credentials not configured");
        }

        const isHashed = ownerPassword.startsWith("$2");
        const isProduction = process.env.NODE_ENV === "production";

        if (!isHashed) {
          if (isProduction) {
            // Production: never allow plain-text passwords — timing-safe reject.
            await logError("auth", "OWNER_PASSWORD is not bcrypt-hashed. Login rejected. " +
              "Run: node -e \"console.log(require('bcryptjs').hashSync('yourpassword', 12))\"");
            await bcrypt.compare(credentials?.password ?? "", DUMMY_HASH);
            return null;
          }

          // Development: allow plain-text direct comparison for convenience.
          const emailMatch = credentials?.email === ownerEmail;
          const passMatch = credentials?.password === ownerPassword;
          if (!emailMatch || !passMatch) {
            await recordAuditEvent({ actor: "anonymous", action: "auth.login_failed", ip });
            return null;
          }
          if (!(await isSecondFactorValid(credentials?.totp, ip))) return null;
          await recordAuditEvent({ actor: ownerEmail, action: "auth.login_success", ip });
          return { id: "owner", name: "Amirul", email: ownerEmail };
        }

        // Hashed password path (always used in production).
        // Always run bcrypt regardless of email match to prevent timing attacks.
        const emailMatch = credentials?.email === ownerEmail;
        const hashToCompare = emailMatch ? ownerPassword : DUMMY_HASH;
        const passwordValid = await bcrypt.compare(credentials?.password ?? "", hashToCompare);

        if (!emailMatch || !passwordValid) {
          // Security event — never record the submitted email or password.
          await recordAuditEvent({ actor: "anonymous", action: "auth.login_failed", ip });
          return null;
        }

        if (!(await isSecondFactorValid(credentials?.totp, ip))) return null;
        await recordAuditEvent({ actor: ownerEmail, action: "auth.login_success", ip });
        return { id: "owner", name: "Amirul", email: ownerEmail };
      },
    }),
  ],
  // 8h instead of NextAuth's 30-day default — this session grants full access
  // to the dashboard (all visitor conversations and site content).
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SEC },
  callbacks: {
    /**
     * Stamp the login time on sign-in; on every later read, reject sessions
     * that are too old or were issued before the last sign-out. Throwing here
     * makes NextAuth clear the cookie and getServerSession() return null.
     * (jti/iat cannot be used: NextAuth regenerates both on each re-encode.)
     */
    async jwt({ token, user }) {
      if (user) {
        token.loginAt = Date.now();
        return token;
      }
      if (typeof token.loginAt !== "number") {
        throw new Error("Session has no loginAt claim");
      }
      if (Date.now() - token.loginAt > SESSION_MAX_AGE_SEC * 1000) {
        throw new Error("Session exceeded its absolute lifetime");
      }
      const state = await prisma.ownerAuthState.findUnique({
        where: { id: OWNER_STATE_ID },
        select: { revokedBefore: true },
      });
      if (state?.revokedBefore && state.revokedBefore.getTime() >= token.loginAt) {
        throw new Error("Session was revoked by sign-out");
      }
      return token;
    },
  },
  events: {
    /** Single owner: signing out revokes every owner session, on all devices. */
    async signOut({ token }) {
      const now = new Date();
      await prisma.ownerAuthState.upsert({
        where: { id: OWNER_STATE_ID },
        create: { id: OWNER_STATE_ID, revokedBefore: now },
        update: { revokedBefore: now },
      });
      await recordAuditEvent({ actor: token?.email ?? "owner", action: "auth.logout" });
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
