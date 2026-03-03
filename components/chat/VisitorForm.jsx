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
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  /** Validate any valid email address (not restricted to Gmail). */
  function isValidEmail(value) {
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value.trim());
  }

  function validateName(val) {
    if (!val.trim()) return "Nama tidak boleh kosong.";
    if (val.trim().length < 2) return "Nama terlalu pendek.";
    return "";
  }

  function validateEmail(val) {
    if (!val.trim()) return "Email tidak boleh kosong.";
    if (!isValidEmail(val)) return "Format email tidak valid.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const ne = validateName(name);
    const ee = validateEmail(email);
    setNameError(ne);
    setEmailError(ee);
    if (ne || ee) return;

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
        {/* Name field */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Nama kamu"
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(validateName(e.target.value)); }}
              onBlur={(e) => setNameError(validateName(e.target.value))}
              className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors ${
                nameError ? "border-red-400/60" : "border-border"
              }`}
              disabled={loading}
              autoFocus
              maxLength={60}
            />
            {name.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-text-muted">
                {name.length}/60
              </span>
            )}
          </div>
          {nameError && <p className="text-[11px] text-red-400 pl-1">{nameError}</p>}
        </div>

        {/* Email field */}
        <div className="flex flex-col gap-1">
          <input
            type="email"
            placeholder="Email kamu (Gmail, Yahoo, dsb)"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
            onBlur={(e) => setEmailError(validateEmail(e.target.value))}
            className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors ${
              emailError ? "border-red-400/60" : "border-border"
            }`}
            disabled={loading}
            autoComplete="email"
          />
          {emailError && <p className="text-[11px] text-red-400 pl-1">{emailError}</p>}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
              <circle cx="6" cy="6" r="5" stroke="#f87171" strokeWidth="1.4"/>
              <path d="M6 4v3M6 8.5v.1" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p className="text-[11px] text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-background font-medium text-sm rounded-lg py-2.5 hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#0A0A0A" strokeWidth="1.5" strokeOpacity="0.3"/>
                <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Connecting...
            </>
          ) : "Mulai Chat →"}
        </button>
      </form>

      <p className="text-xs text-text-muted text-center">
        Email digunakan untuk melanjutkan percakapan sebelumnya.{" "}
        <span className="text-accent/70">Semua domain didukung.</span>
      </p>
    </div>
  );
}
