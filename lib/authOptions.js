/**
 * lib/authOptions.js — NextAuth.js configuration, extracted so it can be
 * imported by API routes without violating Next.js Route export constraints.
 */

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
        * @returns {Promise<{ id: string, name: string, email: string } | null>}
       */
      async authorize(credentials) {
        const ownerEmail = process.env.OWNER_EMAIL;
        const ownerPassword = process.env.OWNER_PASSWORD;

        if (!ownerEmail || !ownerPassword) {
          throw new Error("Owner credentials not configured");
        }

        // Always run bcrypt.compare to prevent timing attacks that could reveal
        // whether the email exists. Use a dummy hash when password is not hashed
        // so the comparison takes the same time regardless of the input.
        const DUMMY_HASH = "$2b$12$invalidhashusedfortimingprotectiononly000000000000000000";
        const isHashed = ownerPassword.startsWith("$2");

        if (!isHashed) {
          // Plain-text passwords are never accepted — require bcrypt hash always.
          console.error("[auth] OWNER_PASSWORD is not bcrypt-hashed. Login rejected. " +
            "Run: node -e \"console.log(require('bcryptjs').hashSync('yourpassword', 12))\"");
          // Still run bcrypt to avoid timing difference
          await bcrypt.compare(credentials?.password ?? "", DUMMY_HASH);
          return null;
        }

        const emailMatch = credentials?.email === ownerEmail;
        // Always run bcrypt regardless of email match to prevent timing attacks.
        const hashToCompare = emailMatch ? ownerPassword : DUMMY_HASH;
        const passwordValid = await bcrypt.compare(credentials?.password ?? "", hashToCompare);

        if (!emailMatch || !passwordValid) return null;

        return { id: "owner", name: "Amirul", email: ownerEmail };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
