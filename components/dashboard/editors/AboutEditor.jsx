/**
 * components/dashboard/editors/AboutEditor.jsx
 * CMS editor for the About section, including the headingAccent split rendering.
 */

"use client";

import { Field, inputCls, textareaCls, TagInput, BtnDanger, Divider } from "./primitives";

export default function AboutEditor({ data, onChange }) {
  function set(k, v) { onChange({ ...data, [k]: v }); }

  function updateParagraph(i, val) {
    const next = [...(data.paragraphs ?? [])]; next[i] = val; set("paragraphs", next);
  }
  function addParagraph() { set("paragraphs", [...(data.paragraphs ?? []), ""]); }
  function removeParagraph(i) { set("paragraphs", (data.paragraphs ?? []).filter((_, idx) => idx !== i)); }

  function updateInfo(i, key, val) {
    const next = [...(data.info ?? [])]; next[i] = { ...next[i], [key]: val }; set("info", next);
  }
  function addInfo() { set("info", [...(data.info ?? []), { label: "", value: "" }]); }
  function removeInfo(i) { set("info", (data.info ?? []).filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-6">
      <Field label="Heading">
        <input className={inputCls} value={data.heading ?? ""} onChange={(e) => set("heading", e.target.value)}
          placeholder="Building systems that" />
      </Field>
      <Field label="Heading Accent (italic gold text)">
        <input className={inputCls} value={data.headingAccent ?? ""} onChange={(e) => set("headingAccent", e.target.value)}
          placeholder="actually work." />
        <p className="font-mono text-[10px] text-text-muted mt-1">
          Rendered as: <span className="italic text-accent">&quot;{data.headingAccent || "actually work."}&quot;</span> setelah heading biasa.
        </p>
      </Field>

      <div>
        <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mb-2">Paragraphs</p>
        <div className="space-y-3">
          {(data.paragraphs ?? []).map((p, i) => (
            <div key={i} className="flex gap-2">
              <textarea className={`${textareaCls} flex-1`} rows={3} value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
                placeholder={`Paragraph ${i + 1}...`} />
              <BtnDanger onClick={() => removeParagraph(i)}>×</BtnDanger>
            </div>
          ))}
        </div>
        <button type="button" onClick={addParagraph}
          className="mt-2 w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-2 rounded-xl hover:bg-accent/5 transition-colors">
          + Tambah Paragraph
        </button>
      </div>

      <Divider />

      <div>
        <p className="font-mono text-[11px] text-text-muted uppercase tracking-wider mb-2">Info Rows</p>
        <div className="space-y-2">
          {(data.info ?? []).map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputCls} w-28 flex-shrink-0`} value={row.label}
                onChange={(e) => updateInfo(i, "label", e.target.value)} placeholder="Label" />
              <input className={`${inputCls} flex-1`} value={row.value}
                onChange={(e) => updateInfo(i, "value", e.target.value)} placeholder="Value" />
              <BtnDanger onClick={() => removeInfo(i)}>×</BtnDanger>
            </div>
          ))}
        </div>
        <button type="button" onClick={addInfo}
          className="mt-2 w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-2 rounded-xl hover:bg-accent/5 transition-colors">
          + Tambah Row
        </button>
      </div>
    </div>
  );
}
