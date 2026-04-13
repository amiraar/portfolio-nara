/**
 * components/dashboard/editors/ExperienceEditor.jsx
 * CMS editor for the Experience (work history) section.
 */

"use client";

import { useState, useEffect } from "react";
import { Field, inputCls, textareaCls, TagInput, BtnDanger, BtnSecondary, PeriodInput } from "./primitives";

const EMPTY_EXP = { company: "", role: "", period: "", description: "", tags: [], current: false };

export default function ExperienceEditor({ data, onChange }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [pendingScrollIdx, setPendingScrollIdx] = useState(null);

  useEffect(() => {
    if (pendingScrollIdx === null) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(`experience-item-${pendingScrollIdx}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setPendingScrollIdx(null);
    });
  }, [pendingScrollIdx, data.length]);

  function updateItem(i, updated) { const next = [...data]; next[i] = updated; onChange(next); }
  function deleteItem(i) {
    const item = data[i];
    const label = item?.role || item?.company || `item #${i + 1}`;
    if (!window.confirm(`Hapus experience "${label}"?`)) return;
    onChange(data.filter((_, idx) => idx !== i));
    if (expandedIdx === i) setExpandedIdx(null);
  }
  function addItem() {
    const nextIdx = data.length;
    onChange([...data, { ...EMPTY_EXP, tags: [] }]);
    setExpandedIdx(nextIdx);
    setPendingScrollIdx(nextIdx);
  }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const next = [...data];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setExpandedIdx(j);
  }

  return (
    <div className="space-y-3">
      {data.map((exp, i) => (
        <div id={`experience-item-${i}`} key={i} className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface/40 cursor-pointer select-none"
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium truncate">{exp.role || <span className="text-text-muted italic">Untitled Role</span>}</p>
              <p className="font-mono text-xs text-accent truncate">{exp.company}{exp.period ? ` · ${exp.period}` : ""}</p>
            </div>
            {exp.current && <span className="font-mono text-[10px] text-accent border border-accent/30 px-1.5 py-0.5 rounded-full bg-accent/5 flex-shrink-0">Current</span>}
            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <BtnSecondary onClick={() => move(i, -1)} disabled={i === 0}>↑</BtnSecondary>
              <BtnSecondary onClick={() => move(i, 1)} disabled={i === data.length - 1}>↓</BtnSecondary>
              <BtnDanger onClick={() => deleteItem(i)}>Hapus</BtnDanger>
            </div>
            <span className="text-text-muted text-xs">{expandedIdx === i ? "▲" : "▼"}</span>
          </div>
          {expandedIdx === i && (
            <div className="p-4 space-y-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Role / Jabatan">
                  <input className={inputCls} value={exp.role} onChange={(e) => updateItem(i, { ...exp, role: e.target.value })} placeholder="Software Developer" />
                </Field>
                <Field label="Company">
                  <input className={inputCls} value={exp.company} onChange={(e) => updateItem(i, { ...exp, company: e.target.value })} placeholder="SoftwareSeni" />
                </Field>
              </div>
              <Field label="Period">
                <PeriodInput value={exp.period} onChange={(period) => updateItem(i, { ...exp, period })}
                  current={!!exp.current} onCurrentChange={(current) => updateItem(i, { ...exp, current })} />
              </Field>
              <Field label="Description">
                <textarea className={textareaCls} rows={4} value={exp.description}
                  onChange={(e) => updateItem(i, { ...exp, description: e.target.value })} placeholder="Deskripsi pekerjaan..." />
              </Field>
              <Field label="Tags / Tech Stack">
                <TagInput tags={exp.tags ?? []} onChange={(tags) => updateItem(i, { ...exp, tags })} />
              </Field>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addItem}
        className="w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-3 rounded-xl hover:bg-accent/5 transition-colors">
        + Tambah Experience
      </button>
    </div>
  );
}
