/**
 * app/api/auth/[...nextauth]/route.js — NextAuth.js config for owner dashboard.
 * Single-user credentials auth: compares against OWNER_EMAIL + OWNER_PASSWORD env vars.
 */

import NextAuth from "next-auth";
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
       */
      async authorize(credentials) {
        const ownerEmail = process.env.OWNER_EMAIL;
        const ownerPassword = process.env.OWNER_PASSWORD;

        if (!ownerEmail || !ownerPassword) {
          throw new Error("Owner credentials not configured");
        }

        if (credentials?.email !== ownerEmail) {
          return null;
        }

        // Support both plain-text (dev) and bcrypt-hashed passwords
        const isHashed = ownerPassword.startsWith("$2");
        const isValid = isHashed
          ? await bcrypt.compare(credentials.password, ownerPassword)
          : credentials.password === ownerPassword;

        if (!isValid) return null;

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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
