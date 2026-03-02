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
        <p className="text-xs text-text-muted text-center mt-4">
          Percakapan belum dimulai. Kirim pesan pertamamu!
        </p>
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
