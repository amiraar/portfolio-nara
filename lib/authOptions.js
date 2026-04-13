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

        if (credentials?.email !== ownerEmail) {
          return null;
        }

        // Production must use bcrypt. Plain-text is allowed in development only
        // so local setup can run without generating a hash.
        const isHashed = ownerPassword.startsWith("$2");
        const isDevelopment = process.env.NODE_ENV === "development";

        if (!isHashed && !isDevelopment) {
          return null;
        }

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
