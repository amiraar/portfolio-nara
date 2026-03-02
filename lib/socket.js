/**
 * lib/socket.js — Socket.io client singleton for browser-side usage.
 * Reuses a single connection across component re-renders.
 */

import { io } from "socket.io-client";

/** @type {import('socket.io-client').Socket | null} */
let socket = null;

/**
 * Get or create the Socket.io client connection.
 * Safe to call multiple times — returns the same instance.
 * @returns {import('socket.io-client').Socket}
 */
export function getSocket() {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SITE_URL || "";
    socket = io(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

/**
 * Disconnect and reset the socket instance (call on logout / page unload).
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
