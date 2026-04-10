/**
 * components/dashboard/editors/HeroEditor.jsx
 * CMS editor for the Hero section.
 */

"use client";

import { Field, inputCls, textareaCls } from "./shared";

export default function HeroEditor({ data, onChange }) {
  function set(k, v) { onChange({ ...data, [k]: v }); }
  return (
    <div className="space-y-4">
      <Field label="Full Name">
        <input className={inputCls} value={data.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Mohammad Amirul Kurniawan Putranto" />
      </Field>
      <Field label="Tagline">
        <textarea className={textareaCls} rows={3} value={data.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} placeholder="Deskripsi singkat tentang diri kamu" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Location">
          <input className={inputCls} value={data.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="Yogyakarta, Indonesia" />
        </Field>
        <Field label="Email">
          <input className={inputCls} type="email" value={data.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="email@gmail.com" />
        </Field>
      </div>
      <Field label="LinkedIn URL">
        <input className={inputCls} value={data.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
      </Field>
    </div>
  );
}
