/**
 * components/chat/MessageList.jsx — Renders all chat messages + typing indicator.
 * Handles role-based bubble styling: user (right), assistant/owner (left).
 */

"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";

/**
 * @param {{
 *   messages: Array<{ id: string, role: string, content: string, timestamp: string }>,
 *   isTyping: boolean
 * }} props
 */
export default function MessageList({ messages, isTyping }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 flex-1 py-8">
          <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
              <path d="M17 3H3a1 1 0 00-1 1v10a1 1 0 001 1h3l3 3 3-3h5a1 1 0 001-1V4a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7"/>
              <path d="M6 8h8M6 11.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-primary font-medium">Halo! Saya Kaia 👋</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[200px]">
              Ada yang ingin kamu tanyakan tentang Amirul?
            </p>
          </div>
          {/* Suggested starters */}
          <div className="flex flex-col gap-1.5 w-full px-1 mt-1">
            {["Apa tech stack utama Amirul?", "Apakah Amirul open to work?", "Ceritakan pengalaman kerja Amirul"].map((q) => (
              <button
                key={q}
                onClick={() => {
                  const ev = new CustomEvent("kaia_suggested_message", { detail: q });
                  window.dispatchEvent(ev);
                }}
                className="text-left text-xs text-text-muted border border-border hover:border-accent/40 hover:text-accent rounded-lg px-3 py-2 transition-colors bg-background/50 hover:bg-accent/5"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-end gap-2">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent text-[10px] font-mono">K</span>
          </div>
          <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3">
            <TypingDots />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isOwner = message.role === "owner";
  const time = message.timestamp
    ? format(new Date(message.timestamp), "HH:mm")
    : "";

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="bg-accent/15 border border-accent/20 rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
          <p className="text-sm text-text-primary leading-relaxed">{message.content}</p>
        </div>
        <span className="text-[11px] text-text-muted pr-1">{time}</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      {/* Avatar */}
      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
        <span className="text-accent text-[10px] font-mono">
          {isOwner ? "A" : "K"}
        </span>
      </div>
      <div className="flex flex-col gap-1 max-w-[80%]">
        {isOwner && (
          <span className="text-[10px] text-accent font-mono pl-1">Amirul</span>
        )}
        <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-2.5">
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <span className="text-[11px] text-text-muted pl-1">{time}</span>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse-dot"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}
