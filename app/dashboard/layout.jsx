/**
 * app/dashboard/layout.jsx — Dashboard layout with server-side auth guard.
 * Redirects to /login on the server before any HTML is sent — no flash of content.
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <>{children}</>;
}
