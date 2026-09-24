/** @type {import('next').NextConfig} */

/**
 * HTTP security headers applied to every response.
 * Tighten the CSP if you add third-party script/style sources.
 */
const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow embedding in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Legacy XSS auditor is deprecated and can itself introduce leaks — explicitly disable (OWASP).
  { key: "X-XSS-Protection", value: "0" },
  // Force HTTPS for two years, including subdomains (SSL-stripping protection)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Low-risk CSP directives that never break Next.js. frame-ancestors is the primary
  // clickjacking control (X-Frame-Options kept as legacy fallback).
  // TODO: add a nonce-based script-src once inline scripts are nonce-aware.
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  // Isolate the browsing context from cross-origin popups/openers
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Only send full referrer to same origin; strip for cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy — disable unused browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
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
