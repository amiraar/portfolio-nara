/**
 * proxy.js — Per-request nonce-based Content-Security-Policy (Next.js 16 Proxy).
 *
 * script-src allows only scripts carrying this request's nonce ('strict-dynamic'
 * extends trust to the chunks those scripts load). Next.js reads the nonce from
 * the request's CSP header and applies it to its own framework and page scripts;
 * app/layout.jsx applies it to the inline anti-flash theme script.
 *
 * Trade-off (documented by Next.js): nonces require dynamic rendering, so every
 * page is rendered per request — no static optimization or CDN page caching.
 *
 * The remaining security headers stay in next.config.js.
 * Docs: https://nextjs.org/docs/app/guides/content-security-policy
 */

import { NextResponse } from "next/server";

/**
 * @param {string} nonce
 * @param {boolean} isDev
 * @returns {string}
 */
function buildCsp(nonce, isDev) {
  return [
    "default-src 'self'",
    // Dev additionally needs 'unsafe-eval' (React debugging / Fast Refresh).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // 'unsafe-inline' stays for styles: React `style` attributes cannot carry a nonce.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    // Pusher realtime (REST + websocket); ws: locally for Next.js HMR.
    `connect-src 'self' https://*.pusher.com wss://*.pusher.com${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    // No upgrade-insecure-requests: HSTS (next.config.js) already forces HTTPS in
    // production, and the directive would break `next start` over plain http.
  ].join("; ");
}

/**
 * @param {import("next/server").NextRequest} request
 */
export function proxy(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * All paths except API routes (JSON, no scripts), static assets, the image
     * optimizer and the favicon; prefetches are skipped as the docs recommend.
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
