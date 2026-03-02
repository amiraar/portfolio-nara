/**
 * app/api/auth/[...nextauth]/route.js — NextAuth.js config for owner dashboard.
 * Single-user credentials auth: compares against OWNER_EMAIL + OWNER_PASSWORD env vars.
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
