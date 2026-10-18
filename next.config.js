/** @type {import('next').NextConfig} */

/**
 * HTTP security headers applied to every response.
 * The Content-Security-Policy is set per request (with a nonce) in proxy.js.
 */
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow embedding in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Legacy XSS auditor is deprecated and can itself introduce leaks — explicitly disable (OWASP).
  { key: "X-XSS-Protection", value: "0" },
  // Isolate the browsing context from cross-origin popups/openers
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Only send full referrer to same origin; strip for cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy — disable unused browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for two years on subsequent visits (ignored by browsers over plain http)
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework in an X-Powered-By header.
  poweredByHeader: false,
  // Keep Prisma as external package in server components.
  serverExternalPackages: ["@prisma/client", "prisma"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
