/**
 * components/SessionProvider.jsx — Thin wrapper around next-auth SessionProvider.
 * Marked "use client" so it can be used inside the server-component root layout.
 */

"use client";

import { SessionProvider } from "next-auth/react";

/** @param {{ children: React.ReactNode, session?: any }} props */
export default function NextAuthSessionProvider({ children, session }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
