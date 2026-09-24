/** @type {import('next').NextConfig} */

/**
 * HTTP security headers applied to every response.
 * Tighten the CSP if you add third-party script/style sources.
 */
const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * script-src needs 'unsafe-inline' because Next.js inlines its hydration
 * payload and app/layout.jsx inlines the anti-flash theme script. Removing it
 * would require nonce-based CSP via middleware. The policy still blocks the
 * parts that matter most for exfiltration: no third-party script origins, no
 * arbitrary connect targets, no plugins, no framing, no base-tag hijacking.
 *
 * Dev additionally needs 'unsafe-eval' (React Refresh) and ws: (HMR socket).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  // Pusher realtime (REST + websocket); ws: locally for Next.js HMR.
  `connect-src 'self' https://*.pusher.com wss://*.pusher.com${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

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
  // Restrict where scripts, styles, fonts and network calls may come from.
  // frame-ancestors is the primary clickjacking control (X-Frame-Options kept as legacy fallback).
  // TODO: replace 'unsafe-inline' in script-src with nonces once inline scripts are nonce-aware.
  { key: "Content-Security-Policy", value: csp },
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
