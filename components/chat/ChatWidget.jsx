/**
 * components/chat/ChatWidget.jsx — Main chat widget: bubble + window + state machine.
 *
 * Behavior:
 * - Bubble appears after 3s delay with fade-in animation
 * - Tooltip "Chat with Kaia" shown before first click
 * - VisitorForm shown once; result cached in localStorage
 * - Realtime messages via Pusher Channels
 * - Typing indicator emitted as "kaia_typing" event
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { clsx } from "clsx";
import VisitorForm from "./VisitorForm";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { getPusherClient } from "@/lib/pusherClient";

function createClientTempId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `tmp-${crypto.randomUUID()}`;
  }
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Monotonically-increasing counter for ordering optimistic messages when
// their timestamp equals or is close to a server response timestamp.
let _insertOrderCounter = 0;

function getStableMessageKey(message, clientTempId) {
  const messageId = message?.id;
  if (messageId !== undefined && messageId !== null && String(messageId).trim()) {
    return `id:${String(messageId)}`;
  }

  const tempId =
    clientTempId ||
    message?.clientTempId ||
    message?.tempId ||
    null;

  if (typeof tempId === "string" && tempId.trim()) {
    return `temp:${tempId.trim()}`;
  }

  return null;
}

function mergeIncomingMessage(prev, incoming, clientTempId) {
  if (!incoming || typeof incoming !== "object") return prev;

  const incomingId = incoming?.id !== undefined && incoming?.id !== null
    ? String(incoming.id)
    : "";
  const normalizedTempId =
    typeof clientTempId === "string" && clientTempId.trim()
      ? clientTempId.trim()
      : typeof incoming?.clientTempId === "string" && incoming.clientTempId.trim()
        ? incoming.clientTempId.trim()
        : null;

  let withoutOptimistic = prev;
  if (normalizedTempId) {
    withoutOptimistic = prev.filter((m) => {
      const sameTemp =
        (typeof m.clientTempId === "string" && m.clientTempId === normalizedTempId) ||
        (typeof m.tempId === "string" && m.tempId === normalizedTempId) ||
        String(m.id || "") === normalizedTempId;
      return !sameTemp;
    });
  }

  const normalizedIncoming = normalizedTempId
    ? { ...incoming, clientTempId: normalizedTempId }
    : incoming;

  if (incomingId) {
    const existingIndex = withoutOptimistic.findIndex((m) => String(m.id || "") === incomingId);
    if (existingIndex >= 0) {
      return withoutOptimistic.map((m, idx) => (idx === existingIndex ? { ...m, ...normalizedIncoming } : m));
    }
  }

  if (normalizedTempId) {
    const existingTempIndex = withoutOptimistic.findIndex(
      (m) =>
        (typeof m.clientTempId === "string" && m.clientTempId === normalizedTempId) ||
        (typeof m.tempId === "string" && m.tempId === normalizedTempId)
    );
    if (existingTempIndex >= 0) {
      return withoutOptimistic.map((m, idx) => (idx === existingTempIndex ? { ...m, ...normalizedIncoming } : m));
    }
  }

  return [...withoutOptimistic, normalizedIncoming];
}

export default function ChatWidget() {
  /*
   * Valid widget transitions:
   * hidden -> bubble -> open
   * open -> bubble
   * bubble -> open
   */
  /** @type {["hidden"|"bubble"|"open"]} */
  const [widgetState, setWidgetState] = useState("hidden");
  const [hasSession, setHasSession] = useState(false);
  const [visitor, setVisitor] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const handleSendRef = useRef(null);
  const widgetStateRef = useRef(widgetState);
  const seenEventKeysRef = useRef(new Set());
  // Cleared when a new_message arrives; auto-expires after 15s to avoid stuck indicators.
  const typingTimeoutRef = useRef(null);

  // Show bubble after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setWidgetState("bubble"), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for programmatic open from Hero CTA
  useEffect(() => {
    function onOpenRequest() {
      setWidgetState("open");
    }
    window.addEventListener("open_chat_widget", onOpenRequest);
    return () => window.removeEventListener("open_chat_widget", onOpenRequest);
  }, []);

  useEffect(() => {
    widgetStateRef.current = widgetState;
  }, [widgetState]);

  // Handle suggested message click from empty state with a stable listener.
  useEffect(() => {
    function onSuggested(e) {
      if (e.detail && typeof handleSendRef.current === "function") {
        handleSendRef.current(e.detail);
      }
    }
    window.addEventListener("kaia_suggested_message", onSuggested);
    return () => window.removeEventListener("kaia_suggested_message", onSuggested);
  }, []);

  // Check localStorage for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem("nara_visitor");
    if (stored) {
      (async () => {
        try {
          const { visitor: v, conversationId } = JSON.parse(stored);
          setVisitor(v);
          setHasSession(true);

          // Await cookie re-issue before fetching the conversation — the
          // conversation endpoint requires the HttpOnly visitor-token cookie.
          // If the cookie was cleared (different device, cleared browser data),
          // the fetch below would return 401 without this step.
          if (v?.email && v?.name) {
            try {
              await fetch("/api/visitor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: v.name, email: v.email }),
              });
            } catch {
              // Cookie refresh failed — best-effort; the conversation fetch
              // may still succeed if the cookie is present.
            }
          }

          // Load conversation from server (cookie is now set)
          try {
            const r = await fetch(`/api/conversations/${conversationId}`);
            const { conversation: c } = await r.json();
            if (c) {
              setConversation(c);
              setMessages(c.messages || []);
            }
          } catch (err) {
            console.error(err);
          }
        } catch {
          localStorage.removeItem("nara_visitor");
        }
      })();
    }
  }, []);

  // Set up Pusher listeners when conversation is available
  useEffect(() => {
    if (!conversation?.id) return;

    const pusher = getPusherClient();
    const channelName = `private-conversation-${conversation.id}`;
    const channel = pusher.subscribe(channelName);

    function rememberEvent(eventKey) {
      if (!eventKey) return false;
      if (seenEventKeysRef.current.has(eventKey)) return true;

      seenEventKeysRef.current.add(eventKey);
      if (seenEventKeysRef.current.size > 400) {
        const [firstKey] = seenEventKeysRef.current;
        if (firstKey) seenEventKeysRef.current.delete(firstKey);
      }
      return false;
    }

    function onNewMessage({ message, clientTempId, eventId, correlationId }) {
      const stableEventKey =
        (typeof eventId === "string" && eventId.trim()) ||
        getStableMessageKey(message, clientTempId);

      if (rememberEvent(stableEventKey)) {
        return;
      }

      setMessages((prev) => {
        return mergeIncomingMessage(prev, message, clientTempId);
      });
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);

      if (correlationId) {
        console.info("[chatWidget] Realtime message received", {
          correlationId,
          eventId: eventId ?? null,
          messageId: message?.id ?? null,
          clientTempId: clientTempId ?? null,
        });
      }

      // Increment unread badge only when widget is closed
      if (widgetStateRef.current !== "open") {
        setUnreadCount((c) => c + 1);
      }
    }

    function onKaiaTyping({ correlationId }) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(true);
      // Auto-clear after 15 s in case the follow-up new_message never arrives
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 15_000);
      if (correlationId) {
        console.info("[chatWidget] Typing event received", { correlationId });
      }
    }

    function onSubscriptionError(error) {
      console.error("[chatWidget] Pusher subscription error", {
        conversationId: conversation.id,
        error,
      });
      setSendError("Realtime chat sedang bermasalah. Pesan tetap dikirim lewat API.");
    }

    channel.bind("new_message", onNewMessage);
    channel.bind("kaia_typing", onKaiaTyping);
    channel.bind("pusher:subscription_error", onSubscriptionError);

    return () => {
      channel.unbind("new_message", onNewMessage);
      channel.unbind("kaia_typing", onKaiaTyping);
      channel.unbind("pusher:subscription_error", onSubscriptionError);
      pusher.unsubscribe(channelName);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [conversation?.id]);

  /** Called when VisitorForm submits successfully */
  function handleVisitorSubmit(v, conv) {
    setVisitor(v);
    setConversation(conv);
    setMessages(conv.messages || []);
    setHasSession(true);
  }

  /** Send a visitor message */
  const handleSend = useCallback(
    async (content) => {
      if (!conversation?.id || sending) return;
      setSendError(null);
      setSending(true);

      async function refreshVisitorCookie() {
        try {
          const visitorPayload =
            visitor?.name && visitor?.email
              ? { name: visitor.name, email: visitor.email }
              : (() => {
                const stored = window.localStorage.getItem("nara_visitor");
                if (!stored) return null;
                const parsed = JSON.parse(stored);
                const name = parsed?.visitor?.name;
                const email = parsed?.visitor?.email;
                if (!name || !email) return null;
                return { name, email };
              })();

          if (!visitorPayload) return false;

          const cookieRes = await fetch("/api/visitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(visitorPayload),
          });

          return cookieRes.ok;
        } catch {
          return false;
        }
      }

      async function sendChatRequest(clientTempId, retriedAuth = false) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversation.id,
            content,
            clientTempId,
          }),
        });

        if ((response.status === 401 || response.status === 403) && !retriedAuth) {
          const refreshed = await refreshVisitorCookie();
          if (refreshed) {
            return sendChatRequest(clientTempId, true);
          }
        }

        return response;
      }

      // Optimistic UI: add visitor message immediately
      const clientTempId = createClientTempId();
      const optimistic = {
        id: clientTempId,
        clientTempId,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
        _insertOrder: ++_insertOrderCounter,
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const res = await sendChatRequest(clientTempId);
        const data = await res.json();

        if (!res.ok) {
          // Remove optimistic message and show error
          setMessages((prev) => prev.filter((m) => String(m.id) !== clientTempId));
          setSendError(data.error ?? "Gagal mengirim pesan. Coba lagi.");
          return;
        }

        if (data?.correlationId) {
          console.info("[chatWidget] Chat request completed", {
            correlationId: data.correlationId,
            assistantDelivered: Boolean(data?.realtime?.assistantDelivered),
          });
        }

        if (data.message) {
          setMessages((prev) => {
            return mergeIncomingMessage(prev, data.message, clientTempId);
          });
        }

        // Fallback for missing/delayed Pusher assistant event.
        if (data.aiReply) {
          setMessages((prev) => mergeIncomingMessage(prev, data.aiReply, null));
          setIsTyping(false);
        }
      } catch (err) {
        console.error("Send error:", err);
        setMessages((prev) => prev.filter((m) => String(m.id) !== clientTempId));
        setSendError("Gagal mengirim pesan. Periksa koneksi internet Anda.");
      } finally {
        setSending(false);
      }
    },
    [conversation?.id, sending, visitor?.email, visitor?.name]
  );

  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  function openWidget() {
    setWidgetState("open");
    setUnreadCount(0);
  }

  function closeWidget() {
    setWidgetState("bubble");
    setShowResetConfirm(false);
  }

  function handleReset() {
    localStorage.removeItem("nara_visitor");
    setVisitor(null);
    setConversation(null);
    setMessages([]);
    setHasSession(false);
    setUnreadCount(0);
    setShowResetConfirm(false);
  }

  // --- Bubble ---
  if (widgetState === "hidden") return null;

  return (
    <>
      {/* Chat window — full-screen on mobile, floating on desktop */}
      {widgetState === "open" && (
        <div
          className="fixed z-50 bg-surface border border-border shadow-2xl flex flex-col overflow-hidden animate-slide-up font-sans
            inset-0 rounded-none
            sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[360px] sm:max-w-[calc(100vw-20px)] sm:h-[520px] sm:max-h-[calc(100vh-120px)] sm:rounded-2xl"
          style={{ boxShadow: "0 20px 60px rgb(var(--color-bg) / 0.5), 0 0 0 1px rgb(var(--color-accent) / 0.1)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0">
            <div className="relative w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <span className="font-mono text-accent text-xs font-medium">K</span>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-medium text-text-primary leading-none">
                Kaia
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Amirul&apos;s assistant · Usually replies instantly
              </p>
            </div>
            {/* Reset conversation */}
            {hasSession && (
              <div className="relative">
                {showResetConfirm ? (
                  <div className="absolute right-0 top-8 z-10 bg-surface border border-border rounded-xl shadow-xl p-3 w-44">
                    <p className="text-[11px] text-text-muted mb-2 leading-snug">Mulai percakapan baru? Riwayat akan dihapus.</p>
                    <div className="flex gap-2">
                      <button onClick={handleReset}
                        className="flex-1 text-[11px] font-mono bg-red-500/15 text-red-400 border border-red-400/20 rounded-lg py-1 hover:bg-red-500/25 transition-colors">
                        Reset
                      </button>
                      <button onClick={() => setShowResetConfirm(false)}
                        className="flex-1 text-[11px] font-mono border border-border text-text-muted rounded-lg py-1 hover:border-accent/30 transition-colors">
                        Batal
                      </button>
                    </div>
                  </div>
                ) : null}
                <button
                  onClick={() => setShowResetConfirm((v) => !v)}
                  className="w-7 h-7 rounded-lg hover:bg-border flex items-center justify-center transition-colors text-text-muted"
                  aria-label="Mulai percakapan baru"
                  title="Mulai percakapan baru"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M11.5 2A6 6 0 101 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M1 3.5V6.5H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
            <button
              onClick={closeWidget}
              className="w-7 h-7 rounded-lg hover:bg-border flex items-center justify-center transition-colors flex-shrink-0 text-text-muted"
              aria-label="Close chat"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          {hasSession && conversation ? (
            <>
              <MessageList messages={messages} isTyping={isTyping} />
              {sendError && (
                <div className="mx-3 mb-1 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start justify-between gap-2">
                  <p className="text-[11px] text-red-400 leading-snug">{sendError}</p>
                  <button
                    onClick={() => setSendError(null)}
                    className="flex-shrink-0 text-red-400/60 hover:text-red-400 transition-colors"
                    aria-label="Dismiss error"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              )}
              <MessageInput onSend={handleSend} disabled={sending} />
            </>
          ) : (
            <VisitorForm onSubmit={handleVisitorSubmit} />
          )}
        </div>
      )}

      {/* Floating bubble — hidden on mobile when chat is open */}
      <div className={clsx(
        "fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2",
        widgetState === "open" ? "hidden sm:flex" : "flex"
      )}>
        {/* Tooltip — shown when bubble is visible but window is closed */}
        {widgetState === "bubble" && (
          <div className="animate-fade-in bg-surface border border-border rounded-xl px-3 py-2 shadow-lg">
            <p className="text-xs text-text-primary font-medium whitespace-nowrap">
              Chat with Kaia ✨
            </p>
          </div>
        )}

        <button
          onClick={widgetState === "open" ? closeWidget : openWidget}
          className="relative w-14 h-14 rounded-full bg-accent hover:bg-accent-hover transition-all duration-300 shadow-lg flex items-center justify-center group animate-fade-in text-background"
          style={{ boxShadow: "0 4px 24px rgb(var(--color-accent) / 0.35)" }}
          aria-label={widgetState === "open" ? "Close chat" : "Open chat"}
        >
          {/* Unread badge */}
          {unreadCount > 0 && widgetState !== "open" && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold flex items-center justify-center leading-none shadow-md">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {widgetState === "open" ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 2l14 14M16 2L2 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M19 3H3a1 1 0 00-1 1v12a1 1 0 001 1h3l3 3 3-3h7a1 1 0 001-1V4a1 1 0 00-1-1z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 9h8M7 13h5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
