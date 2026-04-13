/**
 * lib/pusher.js — Server-side Pusher singleton for API routes.
 */

import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

/**
 * Emit a realtime event to both the visitor conversation channel and dashboard.
 * @param {string} conversationId
 * @param {string} eventName
 * @param {unknown} payload
 * @returns {Promise<void>}
 */
export async function emitConversationEvent(conversationId, eventName, payload) {
  await Promise.all([
    pusher.trigger(`private-conversation-${conversationId}`, eventName, payload),
    pusher.trigger("private-dashboard", eventName, payload),
  ]);
}

export default pusher;
