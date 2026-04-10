/**
 * components/chat/MessageInput.jsx — Text input + send button for visitor messages.
 * Supports Enter to send (Shift+Enter for newline).
 * Enforces a 1000-character limit matching the server-side validation.
 */

"use client";

import { useState, useRef } from "react";

const MAX_LENGTH = 1000;
const WARN_THRESHOLD = 900; // show counter when approaching limit

/**
 * @param {{
 *   onSend: (content: string) => void,
 *   disabled?: boolean
 * }} props
 */
export default function MessageInput({ onSend, disabled = false }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e) {
    const newValue = e.target.value.slice(0, MAX_LENGTH);
    setValue(newValue);
    // Auto-grow textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  const remaining = MAX_LENGTH - value.length;
  const showCounter = value.length >= WARN_THRESHOLD;

  return (
    <div className="p-3 border-t border-border bg-surface">
      <div className="flex items-end gap-2 bg-background rounded-xl border border-border px-3 py-2 focus-within:border-accent/50 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan..."
          disabled={disabled}
          maxLength={MAX_LENGTH}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none resize-none leading-relaxed disabled:opacity-50"
          style={{ height: "auto", maxHeight: "120px", overflowY: "auto" }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-background"
          aria-label="Send message"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M13 1L1 5.5L6.5 7.5M13 1L8 13L6.5 7.5M13 1L6.5 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-between mt-1.5 px-0.5">
        <p className="text-[10px] text-text-muted">
          Powered by Kaia · AI Assistant
        </p>
        {showCounter && (
          <p className={`font-mono text-[10px] ${remaining <= 50 ? "text-red-400" : "text-text-muted"}`}>
            {remaining}
          </p>
        )}
      </div>
    </div>
  );
}
