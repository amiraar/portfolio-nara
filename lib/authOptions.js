/**
 * lib/authOptions.js — NextAuth.js configuration, extracted so it can be
 * imported by API routes without violating Next.js Route export constraints.
 */

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { checkRateLimit } from "@/lib/rateLimit";

/** Brute-force limits for the owner login. */
const LOGIN_IP_LIMIT = { maxRequests: 5, windowSec: 15 * 60, scope: "login-ip" };
const LOGIN_EMAIL_LIMIT = { maxRequests: 10, windowSec: 60 * 60, scope: "login-email" };

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

/** @type {import("next-auth").AuthOptions} */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Validate owner credentials against environment variables.
       * @param {{ email: string, password: string }} credentials
       * @param {any} req
        * @returns {Promise<{ id: string, name: string, email: string } | null>}
       */
      async authorize(credentials, req) {
        const ip = getLoginIP(req);
        if (!(await isLoginAllowed(req, credentials?.email))) {
          console.warn("[auth] Login rate limit hit", { ip });
          return null;
        }

        const ownerEmail = process.env.OWNER_EMAIL;
        const ownerPassword = process.env.OWNER_PASSWORD;

        if (!ownerEmail || !ownerPassword) {
          throw new Error("Owner credentials not configured");
        }

        const DUMMY_HASH = "$2b$12$invalidhashusedfortimingprotectiononly000000000000000000";
        const isHashed = ownerPassword.startsWith("$2");
        const isProduction = process.env.NODE_ENV === "production";

        if (!isHashed) {
          if (isProduction) {
            // Production: never allow plain-text passwords — timing-safe reject.
            console.error("[auth] OWNER_PASSWORD is not bcrypt-hashed. Login rejected. " +
              "Run: node -e \"console.log(require('bcryptjs').hashSync('yourpassword', 12))\"");
            await bcrypt.compare(credentials?.password ?? "", DUMMY_HASH);
            return null;
          }

          // Development: allow plain-text direct comparison for convenience.
          const emailMatch = credentials?.email === ownerEmail;
          const passMatch = credentials?.password === ownerPassword;
          if (!emailMatch || !passMatch) {
            console.warn("[auth] Failed owner login", { ip });
            return null;
          }
          return { id: "owner", name: "Amirul", email: ownerEmail };
        }

        // Hashed password path (always used in production).
        // Always run bcrypt regardless of email match to prevent timing attacks.
        const emailMatch = credentials?.email === ownerEmail;
        const hashToCompare = emailMatch ? ownerPassword : DUMMY_HASH;
        const passwordValid = await bcrypt.compare(credentials?.password ?? "", hashToCompare);

        if (!emailMatch || !passwordValid) {
          // Security event — never log the submitted email or password.
          console.warn("[auth] Failed owner login", { ip });
          return null;
        }

        return { id: "owner", name: "Amirul", email: ownerEmail };
      },
    }),
  ],
  // 8h instead of NextAuth's 30-day default — this session grants full access
  // to the dashboard (all visitor conversations and site content).
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
