/**
 * components/chat/ChatWidget.jsx — Main chat widget: bubble + window + state machine.
 *
 * Behavior:
 * - Bubble appears after 3s delay with fade-in animation
 * - Tooltip "Chat with Kaia" shown before first click
 * - VisitorForm shown once; result cached in localStorage
 * - Realtime messages via Socket.io
 * - Typing indicator emitted as "kaia_typing" event
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import VisitorForm from "./VisitorForm";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { getSocket } from "@/lib/socket";

export default function ChatWidget() {
  /** @type {["hidden"|"bubble"|"open"]} */
  const [widgetState, setWidgetState] = useState("hidden");
  const [hasSession, setHasSession] = useState(false);
  const [visitor, setVisitor] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

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

  // Check localStorage for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem("nara_visitor");
    if (stored) {
      try {
        const { visitor: v, conversationId } = JSON.parse(stored);
        setVisitor(v);
        setHasSession(true);
        // Load conversation from server
        fetch(`/api/conversations/${conversationId}`)
          .then((r) => r.json())
          .then(({ conversation: c }) => {
            if (c) {
              setConversation(c);
              setMessages(c.messages || []);
            }
          })
          .catch(console.error);
      } catch {
        localStorage.removeItem("nara_visitor");
      }
    }
  }, []);

  // Set up Socket.io listeners when conversation is available
  useEffect(() => {
    if (!conversation?.id) return;

    const socket = getSocket();
    socket.emit("join_conversation", conversation.id);

    function onNewMessage({ message }) {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setIsTyping(false);
    }

    function onKaiaTyping() {
      setIsTyping(true);
    }

    socket.on("new_message", onNewMessage);
    socket.on("kaia_typing", onKaiaTyping);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("kaia_typing", onKaiaTyping);
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

      // Optimistic UI: add visitor message immediately
      const optimistic = {
        id: `opt-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: conversation.id, content }),
        });
        const data = await res.json();

        if (!res.ok) {
          // Remove optimistic message and show error
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          setSendError(data.error ?? "Gagal mengirim pesan. Coba lagi.");
          return;
        }

        if (data.message) {
          // Replace optimistic message with real one from DB
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimistic.id ? { ...data.message } : m
            )
          );
        }
        // aiReply arrives via Socket.io ("new_message" event)
      } catch (err) {
        console.error("Send error:", err);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setSendError("Gagal mengirim pesan. Periksa koneksi internet Anda.");
      } finally {
        setSending(false);
      }
    },
    [conversation?.id, sending]
  );

  function openWidget() {
    setWidgetState("open");
  }

  function closeWidget() {
    setWidgetState("bubble");
  }

  // --- Bubble ---
  if (widgetState === "hidden") return null;

  return (
    <>
      {/* Chat window — full-screen on mobile, floating on desktop */}
      {widgetState === "open" && (
        <div
          className="fixed z-50 bg-surface border border-border shadow-2xl flex flex-col overflow-hidden animate-slide-up
            inset-0 rounded-none
            sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[360px] sm:max-w-[calc(100vw-20px)] sm:h-[520px] sm:max-h-[calc(100vh-120px)] sm:rounded-2xl"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,169,110,0.08)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface/80 backdrop-blur-sm flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <span className="font-mono text-accent text-xs font-medium">K</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-medium text-text-primary leading-none">
                Kaia
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Amirul&apos;s assistant · Usually replies instantly
              </p>
            </div>
            <button
              onClick={closeWidget}
              className="w-7 h-7 rounded-lg hover:bg-border flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Close chat"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="#6B6B6B"
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
          className="w-14 h-14 rounded-full bg-accent hover:bg-accent-hover transition-all duration-300 shadow-lg flex items-center justify-center group animate-fade-in"
          style={{ boxShadow: "0 4px 24px rgba(201,169,110,0.35)" }}
          aria-label={widgetState === "open" ? "Close chat" : "Open chat"}
        >
          {widgetState === "open" ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 2l14 14M16 2L2 16"
                stroke="#0A0A0A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M19 3H3a1 1 0 00-1 1v12a1 1 0 001 1h3l3 3 3-3h7a1 1 0 001-1V4a1 1 0 00-1-1z"
                stroke="#0A0A0A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 9h8M7 13h5"
                stroke="#0A0A0A"
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
