/**
 * lib/pusherClient.js — Browser-side Pusher singleton.
 */

import Pusher from "pusher-js";

/** @type {Pusher | null} */
let pusherClient = null;

/**
 * Get or create a single browser-side Pusher instance.
 * @returns {Pusher}
 */
export function getPusherClient() {
  if (typeof window === "undefined") {
    throw new Error("getPusherClient() can only be used in the browser.");
  }

  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      throw new Error("Missing NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER");
    }

    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
      enableStats: false,
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
        paramsProvider: () => {
          if (typeof window === "undefined" || !window.localStorage) return {};

          try {
            const stored = window.localStorage.getItem("nara_visitor");
            if (!stored) return {};
            const parsed = JSON.parse(stored);
            const visitorId = parsed?.visitor?.id ?? "";
            if (!visitorId) {
              console.warn("[pusherClient] Missing visitorId for private channel auth");
            }
            return { visitorId };
          } catch {
            return {};
          }
        },
      },
    });

    pusherClient.connection.bind("state_change", ({ previous, current }) => {
      console.info("[pusherClient] Connection state changed", { previous, current });
    });

    pusherClient.connection.bind("error", (error) => {
      console.error("[pusherClient] Connection error", {
        code: error?.error?.code,
        message: error?.error?.message,
      });
    });
  } else if (pusherClient.connection.state === "disconnected") {
    pusherClient.connect();
  }

  return pusherClient;
}

/**
 * Disconnect and clear the browser-side Pusher instance.
 */
export function disconnectPusherClient() {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
}
