"use client";

import { Field, inputCls, textareaCls } from "./primitives";

function GroupTitle({ title }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="font-mono text-[10px] text-accent uppercase tracking-widest">{title}</span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

export default function ContactEditor({ data, onChange }) {
  function set(k, v) {
    onChange({ ...data, [k]: v });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* ── Contact Section ─────────────────────────────────────── */}
      <GroupTitle title="Contact Section" />

      <p className="text-xs text-text-muted leading-relaxed">
        These fields control the "Let's work together" section at the bottom of your portfolio.
      </p>

      <Field label="Section Heading">
        <input
          type="text"
          className={inputCls}
          value={data.contactHeading ?? ""}
          onChange={(e) => set("contactHeading", e.target.value)}
          placeholder="Let's work together."
        />
      </Field>

      <Field label="Subtext">
        <textarea
          className={textareaCls}
          rows={2}
          value={data.contactSubtext ?? ""}
          onChange={(e) => set("contactSubtext", e.target.value)}
          placeholder="Short description under the heading…"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email">
          <input
            type="email"
            className={inputCls}
            value={data.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="your@email.com"
          />
        </Field>
        <Field label="LinkedIn URL">
          <input
            type="url"
            className={inputCls}
            value={data.linkedin ?? ""}
            onChange={(e) => set("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
        </Field>
      </div>

      <Field label="LinkedIn Display Label">
        <input
          type="text"
          className={inputCls}
          value={data.linkedinLabel ?? ""}
          onChange={(e) => set("linkedinLabel", e.target.value)}
          placeholder="e.g. Mohammad Amirul Kurniawan"
        />
      </Field>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <GroupTitle title="Footer" />

      <p className="text-xs text-text-muted leading-relaxed">
        These fields appear in the site footer at the very bottom of every page.
      </p>

      <Field label="GitHub URL">
        <input
          type="url"
          className={inputCls}
          value={data.github ?? ""}
          onChange={(e) => set("github", e.target.value)}
          placeholder="https://github.com/username"
        />
      </Field>

      <Field label="Footer Copyright Text">
        <input
          type="text"
          className={inputCls}
          value={data.footerCopy ?? ""}
          onChange={(e) => set("footerCopy", e.target.value)}
          placeholder="© 2026 Mohammad Amirul. All rights reserved."
        />
      </Field>
    </div>
  );
}
