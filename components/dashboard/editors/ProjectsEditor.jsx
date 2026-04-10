/**
 * components/dashboard/editors/ProjectsEditor.jsx
 * CMS editor for the Projects section.
 */

"use client";

import { useState, useEffect } from "react";
import { Field, inputCls, textareaCls, TagInput, BtnDanger, BtnSecondary } from "./shared";

const EMPTY_PROJECT = { name: "", type: "", company: "", description: "", tags: [], link: "", highlight: false, metric: "" };

export default function ProjectsEditor({ data, onChange }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [pendingScrollIdx, setPendingScrollIdx] = useState(null);

  useEffect(() => {
    if (pendingScrollIdx === null) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(`project-item-${pendingScrollIdx}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setPendingScrollIdx(null);
    });
  }, [pendingScrollIdx, data.length]);

  function updateItem(i, updated) { const next = [...data]; next[i] = updated; onChange(next); }
  function deleteItem(i) {
    const item = data[i];
    const label = item?.name || item?.company || `item #${i + 1}`;
    if (!window.confirm(`Hapus project "${label}"?`)) return;
    onChange(data.filter((_, idx) => idx !== i));
    if (expandedIdx === i) setExpandedIdx(null);
  }
  function addItem() {
    const nextIdx = data.length;
    onChange([...data, { ...EMPTY_PROJECT, tags: [] }]);
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
      {data.map((project, i) => (
        <div id={`project-item-${i}`} key={i} className="border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface/40 cursor-pointer select-none"
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium truncate">{project.name || <span className="text-text-muted italic">Untitled Project</span>}</p>
              <p className="font-mono text-xs text-accent truncate">{project.type}{project.company ? ` · ${project.company}` : ""}</p>
            </div>
            {project.highlight && <span className="font-mono text-[10px] text-accent border border-accent/30 px-1.5 py-0.5 rounded-full bg-accent/5 flex-shrink-0">Featured</span>}
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
                <Field label="Project Name">
                  <input className={inputCls} value={project.name} onChange={(e) => updateItem(i, { ...project, name: e.target.value })} placeholder="Racker" />
                </Field>
                <Field label="Type">
                  <input className={inputCls} value={project.type} onChange={(e) => updateItem(i, { ...project, type: e.target.value })} placeholder="Web App / AI Product / UX Design" />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company / Context">
                  <input className={inputCls} value={project.company} onChange={(e) => updateItem(i, { ...project, company: e.target.value })} placeholder="SoftwareSeni" />
                </Field>
                <Field label="Metric (opsional)">
                  <input className={inputCls} value={project.metric ?? ""} onChange={(e) => updateItem(i, { ...project, metric: e.target.value })} placeholder="+30% engagement" />
                </Field>
              </div>
              <Field label="Description">
                <textarea className={textareaCls} rows={4} value={project.description}
                  onChange={(e) => updateItem(i, { ...project, description: e.target.value })} placeholder="Deskripsi project..." />
              </Field>
              <Field label="Link (opsional)">
                <input className={inputCls} value={project.link ?? ""} onChange={(e) => updateItem(i, { ...project, link: e.target.value })} placeholder="https://..." />
              </Field>
              <Field label="Tags / Tech Stack">
                <TagInput tags={project.tags ?? []} onChange={(tags) => updateItem(i, { ...project, tags })} />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={!!project.highlight}
                  onChange={(e) => updateItem(i, { ...project, highlight: e.target.checked })}
                  className="accent-[#C9A96E] w-4 h-4" />
                <span className="text-sm text-text-muted">Featured project (border gold)</span>
              </label>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addItem}
        className="w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-3 rounded-xl hover:bg-accent/5 transition-colors">
        + Tambah Project
      </button>
    </div>
  );
}
