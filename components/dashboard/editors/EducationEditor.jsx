/**
 * components/dashboard/editors/EducationEditor.jsx
 * CMS editor for the Education section (education card + contact/footer fields).
 */

"use client";

import { Field, inputCls, textareaCls, Divider } from "./primitives";

export default function EducationEditor({ data, onChange }) {
  function set(k, v) { onChange({ ...data, [k]: v }); }
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Education</p>
        <div className="space-y-4">
          <Field label="Universitas">
            <input className={inputCls} value={data.university ?? ""} onChange={(e) => set("university", e.target.value)} placeholder="Ahmad Dahlan University" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Jurusan / Gelar">
              <input className={inputCls} value={data.degree ?? ""} onChange={(e) => set("degree", e.target.value)} placeholder="Informatics · S.Kom" />
            </Field>
            <Field label="GPA">
              <input className={inputCls} value={data.gpa ?? ""} onChange={(e) => set("gpa", e.target.value)} placeholder="3.82 / 4.00" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Periode">
              <input className={inputCls} value={data.period ?? ""} onChange={(e) => set("period", e.target.value)} placeholder="2020 – 2024" />
            </Field>
            <Field label="Lokasi">
              <input className={inputCls} value={data.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="Yogyakarta, Indonesia" />
            </Field>
          </div>
        </div>
      </div>

      <Divider />

      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Contact Section</p>
        <div className="space-y-4">
          <Field label="Heading">
            <input className={inputCls} value={data.contactHeading ?? ""} onChange={(e) => set("contactHeading", e.target.value)} placeholder="Let's work together." />
          </Field>
          <Field label="Subtext">
            <textarea className={textareaCls} rows={2} value={data.contactSubtext ?? ""} onChange={(e) => set("contactSubtext", e.target.value)} placeholder="Deskripsi singkat..." />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input className={inputCls} type="email" value={data.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="email@gmail.com" />
            </Field>
            <Field label="LinkedIn URL">
              <input className={inputCls} value={data.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
            </Field>
          </div>
          <Field label="LinkedIn Display Name">
            <input className={inputCls} value={data.linkedinLabel ?? ""} onChange={(e) => set("linkedinLabel", e.target.value)} placeholder="Mohammad Amirul Kurniawan" />
          </Field>
          <Field label="Footer Copyright">
            <input className={inputCls} value={data.footerCopy ?? ""} onChange={(e) => set("footerCopy", e.target.value)} placeholder="© 2026 ..." />
          </Field>
        </div>
      </div>
    </div>
  );
}
