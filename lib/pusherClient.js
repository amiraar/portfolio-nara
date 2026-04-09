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
  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      throw new Error("Missing NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER");
    }

    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
        paramsProvider: () => {
          if (typeof window === "undefined") return {};

          try {
            const stored = window.localStorage.getItem("nara_visitor");
            if (!stored) return {};
            const parsed = JSON.parse(stored);
            return { visitorId: parsed?.visitor?.id ?? "" };
          } catch {
            return {};
          }
        },
      },
    });
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
