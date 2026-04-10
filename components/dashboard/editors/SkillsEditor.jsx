/**
 * components/dashboard/editors/SkillsEditor.jsx
 * CMS editor for the Skills section (categories, languages, quick stats).
 */

"use client";

import { useState, useEffect } from "react";
import { Field, inputCls, TagInput, BtnDanger, BtnSecondary, Divider } from "./shared";

const LANGUAGE_LEVELS = [
  { label: "Native",             pct: 100 },
  { label: "Fluent",             pct: 90  },
  { label: "Advanced",           pct: 80  },
  { label: "Upper-Intermediate", pct: 70  },
  { label: "Intermediate",       pct: 60  },
  { label: "Elementary",         pct: 40  },
  { label: "Beginner",           pct: 20  },
];

export default function SkillsEditor({ data, onChange }) {
  const [newCat, setNewCat] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState({});
  const skills = data.skills ?? {};
  const skillKeysSignature = Object.keys(skills).sort().join("||");
  const languages = data.languages ?? [];
  const stats = data.stats ?? [];

  function setSkills(s) { onChange({ ...data, skills: s }); }
  function setLanguages(l) { onChange({ ...data, languages: l }); }
  function setStats(s) { onChange({ ...data, stats: s }); }

  function moveStat(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= stats.length) return;
    const next = [...stats]; [next[i], next[j]] = [next[j], next[i]]; setStats(next);
  }

  function addCategory() {
    const k = newCat.trim();
    if (!k || skills[k]) return;
    setSkills({ ...skills, [k]: [] });
    setCategoryDrafts((prev) => ({ ...prev, [k]: k }));
    setNewCat("");
  }
  function deleteCategory(k) {
    const next = { ...skills }; delete next[k]; setSkills(next);
    setCategoryDrafts((prev) => { const d = { ...prev }; delete d[k]; return d; });
  }
  function renameCategory(oldKey, newKey) {
    if (!newKey.trim() || newKey === oldKey || skills[newKey.trim()]) return;
    const entries = Object.entries(skills);
    const idx = entries.findIndex(([k]) => k === oldKey);
    entries[idx] = [newKey.trim(), entries[idx][1]];
    setSkills(Object.fromEntries(entries));
    setCategoryDrafts((prev) => { const next = { ...prev }; delete next[oldKey]; return next; });
  }

  useEffect(() => {
    setCategoryDrafts((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(skills)) { if (next[k] === undefined) next[k] = k; }
      for (const k of Object.keys(next)) { if (!(k in skills)) delete next[k]; }
      return next;
    });
  }, [skillKeysSignature]);

  return (
    <div className="space-y-8">
      {/* Skill categories */}
      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Skill Categories</p>
        <div className="space-y-4">
          {Object.entries(skills).map(([cat, items]) => (
            <div key={cat} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input className={`${inputCls} flex-1 font-mono text-xs`}
                  value={categoryDrafts[cat] ?? cat}
                  onChange={(e) => setCategoryDrafts((prev) => ({ ...prev, [cat]: e.target.value }))}
                  onBlur={() => renameCategory(cat, categoryDrafts[cat] ?? cat)}
                  placeholder="Category name" />
                <BtnDanger onClick={() => deleteCategory(cat)}>Hapus</BtnDanger>
              </div>
              <TagInput tags={items} onChange={(tags) => setSkills({ ...skills, [cat]: tags })} />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input className={`${inputCls} flex-1`} value={newCat} onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
            placeholder="Nama kategori baru..." />
          <button type="button" onClick={addCategory}
            className="font-mono text-xs text-accent border border-accent/30 border-dashed px-4 py-2 rounded-lg hover:bg-accent/5 transition-colors">
            + Kategori
          </button>
        </div>
      </div>

      <Divider />

      {/* Languages */}
      <div>
        <p className="font-mono text-xs text-accent mb-3 uppercase tracking-wider">Languages</p>
        <div className="space-y-3">
          {languages.map((lang, i) => (
            <div key={i} className="border border-border rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bahasa">
                  <input className={inputCls} value={lang.name} onChange={(e) => {
                    const next = [...languages]; next[i] = { ...lang, name: e.target.value }; setLanguages(next);
                  }} placeholder="English" />
                </Field>
                <Field label="Level">
                  <select className={inputCls + " cursor-pointer"} value={lang.level}
                    onChange={(e) => {
                      const found = LANGUAGE_LEVELS.find((l) => l.label === e.target.value);
                      const next = [...languages];
                      next[i] = { ...lang, level: e.target.value, pct: found?.pct ?? 50 };
                      setLanguages(next);
                    }}>
                    <option value="" disabled>Pilih level...</option>
                    {LANGUAGE_LEVELS.map((lvl) => <option key={lvl.label} value={lvl.label}>{lvl.label}</option>)}
                  </select>
                </Field>
              </div>
              {lang.level && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-text-muted">Preview proficiency</span>
                    <span className="font-mono text-[10px] text-accent">
                      {LANGUAGE_LEVELS.find((l) => l.label === lang.level)?.pct ?? lang.pct}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent/80 to-accent transition-all duration-500"
                      style={{ width: `${LANGUAGE_LEVELS.find((l) => l.label === lang.level)?.pct ?? lang.pct}%` }} />
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <BtnDanger onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}>Hapus</BtnDanger>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setLanguages([...languages, { name: "", level: "Intermediate", pct: 60 }])}
          className="mt-3 w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-3 rounded-xl hover:bg-accent/5 transition-colors">
          + Tambah Bahasa
        </button>
      </div>

      <Divider />

      {/* Quick Stats */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="font-mono text-xs text-accent uppercase tracking-wider">Quick Stats</p>
          <span className="font-mono text-[9px] text-text-muted border border-border px-1.5 py-0.5 rounded-full bg-surface/60">Skills → Sidebar</span>
        </div>
        <p className="font-mono text-[10px] text-text-muted mb-3">Statistik singkat di sidebar section Skills (contoh: Projects shipped, GPA, dll)</p>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {["Projects shipped", "Students mentored", "Years experience", "GPA", "Certifications"].map((preset) => (
            <button key={preset} type="button"
              disabled={stats.some((s) => s.label === preset)}
              onClick={() => setStats([...stats, { label: preset, value: "" }])}
              className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-accent/25 text-accent/70 bg-accent/5 hover:bg-accent/15 hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              + {preset}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {stats.map((stat, i) => (
            <div key={i} className="border border-border rounded-xl p-4 space-y-3 bg-surface/20">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-text-muted border border-border px-2 py-0.5 rounded-md bg-background">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-1">
                  <BtnSecondary onClick={() => moveStat(i, -1)} disabled={i === 0}>↑</BtnSecondary>
                  <BtnSecondary onClick={() => moveStat(i, 1)} disabled={i === stats.length - 1}>↓</BtnSecondary>
                  <BtnDanger onClick={() => setStats(stats.filter((_, idx) => idx !== i))}>Hapus</BtnDanger>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Label">
                  <input className={`${inputCls} sm:col-span-2`} value={stat.label}
                    onChange={(e) => { const next = [...stats]; next[i] = { ...stat, label: e.target.value }; setStats(next); }}
                    placeholder="cth: Projects shipped" />
                </Field>
                <Field label="Nilai">
                  <input className={inputCls} value={stat.value}
                    onChange={(e) => { const next = [...stats]; next[i] = { ...stat, value: e.target.value }; setStats(next); }}
                    placeholder="cth: 7+" />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={() => setStats([...stats, { label: "", value: "" }])}
          className="mt-3 w-full font-mono text-xs text-accent border border-accent/30 border-dashed py-3 rounded-xl hover:bg-accent/5 transition-colors">
          + Tambah Stat
        </button>

        {stats.length > 0 && (
          <div className="mt-5">
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-2">Preview tampilan di portfolio</p>
            <div className="p-4 rounded-xl border border-border bg-surface/60 space-y-2">
              <p className="font-mono text-xs text-accent mb-3">Quick Stats</p>
              {stats.map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">{s.label || <span className="italic opacity-40">Label kosong</span>}</span>
                  <span className="font-mono text-sm text-accent">{s.value || <span className="italic opacity-40 text-xs">—</span>}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
