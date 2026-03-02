/**
 * components/chat/VisitorForm.jsx — Collect visitor name + email before chat starts.
 * Shown only once; subsequent visits load history directly via localStorage cache.
 */

"use client";

import { useState } from "react";

/**
 * @param {{ onSubmit: (visitor: object, conversation: object) => void }} props
 */
export default function VisitorForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start chat");

      // Persist to localStorage so we don't show the form again this session
      localStorage.setItem(
        "nara_visitor",
        JSON.stringify({
          visitor: data.visitor,
          conversationId: data.conversation.id,
        })
      );

      onSubmit(data.visitor, data.conversation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <p className="font-display text-base text-text-primary leading-snug">
          Hei! Saya Kaia 👋
        </p>
        <p className="text-sm text-text-muted mt-1">
          Perkenalkan dirimu dulu, ya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nama kamu"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
          disabled={loading}
          autoFocus
        />
        <input
          type="email"
          placeholder="Email kamu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
          disabled={loading}
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-background font-medium text-sm rounded-lg py-2.5 hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting..." : "Mulai Chat →"}
        </button>
      </form>

      <p className="text-xs text-text-muted text-center">
        Email digunakan untuk melanjutkan percakapan sebelumnya.
      </p>
    </div>
  );
}
