/**
 * app/dashboard/layout.jsx — Dashboard layout.
 * The auth guard (redirect to /login) is handled inside the page itself via useSession.
 */

export default function DashboardLayout({ children }) {
  return <>{children}</>;
}
