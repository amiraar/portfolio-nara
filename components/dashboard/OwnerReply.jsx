/**
 * components/dashboard/OwnerReply.jsx — Reply input for owner manual messages.
 * Only active when conversation mode is "human".
 */

"use client";

import { useState, useRef } from "react";

/**
 * @param {{
 *   conversationId: string,
 *   disabled?: boolean,
 *   onSent?: (message: any) => void,
 * }} props
 */
export default function OwnerReply({ conversationId, disabled = false, onSent }) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  async function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      setValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onSent?.(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e) {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  if (disabled) {
    return (
      <div className="p-4 border-t border-border bg-surface/40">
        <p className="text-xs text-text-muted text-center italic">
          Kaia is handling this conversation. Click "Takeover" to reply manually.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border bg-surface flex-shrink-0">
      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}
      <div className="flex items-end gap-2 bg-background rounded-xl border border-border px-3 py-2 focus-within:border-accent/40 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Reply as Amirul... (Enter to send)"
          disabled={sending}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none resize-none leading-relaxed disabled:opacity-50"
          style={{ height: "auto", maxHeight: "120px", overflowY: "auto" }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !value.trim()}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-400/80 hover:bg-orange-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Send reply"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M13 1L1 5.5L6.5 7.5M13 1L8 13L6.5 7.5M13 1L6.5 7.5"
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-text-muted mt-1.5">
        Replying as{" "}
        <span className="text-orange-400">Amirul</span> · visible to visitor in realtime
      </p>
    </div>
  );
}
