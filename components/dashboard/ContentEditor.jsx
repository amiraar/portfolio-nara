/**
 * components/dashboard/ContentEditor.jsx
 * Thin shell — section routing, load/save, validation.
 * Each section's editor lives in ./editors/.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PORTFOLIO_DEFAULTS } from "@/lib/portfolioDefaults";
import { notifyPortfolioUpdate } from "@/lib/usePortfolioContent";
import HeroEditor from "./editors/HeroEditor";
import AboutEditor from "./editors/AboutEditor";
import ExperienceEditor from "./editors/ExperienceEditor";
import ProjectsEditor from "./editors/ProjectsEditor";
import SkillsEditor from "./editors/SkillsEditor";
import EducationEditor from "./editors/EducationEditor";
import KaiaConfigEditor from "./editors/KaiaConfigEditor";

const DEFAULTS = PORTFOLIO_DEFAULTS;

const SECTIONS = [
  { key: "hero",        label: "Hero"       },
  { key: "about",       label: "About"      },
  { key: "experience",  label: "Experience" },
  { key: "projects",    label: "Projects"   },
  { key: "skills",      label: "Skills"     },
  { key: "education",   label: "Education"  },
  { key: "kaia_config", label: "Kaia AI"    },
];

export default function ContentEditor() {
  const [activeSection, setActiveSection] = useState("hero");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState(null); // "saved" | "error"
  const [validationErrors, setValidationErrors] = useState([]);
  const [pendingAction, setPendingAction] = useState(null); // { type: "switch" | "reset", section?: string }
  const timerRef = useRef(null);

  const loadSection = useCallback(async (section) => {
    setLoading(true);
    setData(null);
    setStatus(null);
    setDirty(false);
    try {
      const res = await fetch(`/api/portfolio?section=${section}`);
      const { content } = await res.json();
      setData(content ?? DEFAULTS[section]);
    } catch {
      setData(DEFAULTS[section]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSection(activeSection); }, [activeSection, loadSection]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function handleChange(newData) { setData(newData); setDirty(true); setStatus(null); }

  function validateSection(section, sectionData) {
    const errors = [];

    if (section === "hero") {
      if (!sectionData?.name?.trim()) errors.push("Hero name wajib diisi.");
      if (!sectionData?.tagline?.trim()) errors.push("Hero tagline wajib diisi.");
      if (!sectionData?.email?.trim()) errors.push("Hero email wajib diisi.");
    }

    if (section === "about") {
      if (!sectionData?.heading?.trim()) errors.push("About heading wajib diisi.");
      if (!(sectionData?.paragraphs ?? []).some((p) => String(p || "").trim())) {
        errors.push("About minimal memiliki 1 paragraph.");
      }
    }

    if (section === "experience") {
      (sectionData ?? []).forEach((item, idx) => {
        if (!item?.role?.trim()) errors.push(`Experience #${idx + 1}: role wajib diisi.`);
        if (!item?.company?.trim()) errors.push(`Experience #${idx + 1}: company wajib diisi.`);
        if (!item?.period?.trim()) errors.push(`Experience #${idx + 1}: period wajib diisi.`);
      });
    }

    if (section === "projects") {
      (sectionData ?? []).forEach((item, idx) => {
        if (!item?.name?.trim()) errors.push(`Project #${idx + 1}: name wajib diisi.`);
        if (!item?.type?.trim()) errors.push(`Project #${idx + 1}: type wajib diisi.`);
        if (!item?.description?.trim()) errors.push(`Project #${idx + 1}: description wajib diisi.`);
        if (item?.link?.trim()) {
          try {
            const parsed = new URL(item.link.trim());
            if (!(parsed.protocol === "http:" || parsed.protocol === "https:")) {
              errors.push(`Project #${idx + 1}: link harus menggunakan http/https.`);
            }
          } catch {
            errors.push(`Project #${idx + 1}: format link tidak valid.`);
          }
        }
      });
    }

    if (section === "skills") {
      const categories = Object.keys(sectionData?.skills ?? {});
      if (categories.length === 0) errors.push("Skills harus punya minimal 1 category.");
      (sectionData?.languages ?? []).forEach((lang, idx) => {
        if (!lang?.name?.trim()) errors.push(`Language #${idx + 1}: nama wajib diisi.`);
        if (!lang?.level?.trim()) errors.push(`Language #${idx + 1}: level wajib dipilih.`);
      });
    }

    if (section === "education") {
      if (!sectionData?.university?.trim()) errors.push("Education university wajib diisi.");
      if (!sectionData?.degree?.trim()) errors.push("Education degree wajib diisi.");
      if (!sectionData?.email?.trim()) errors.push("Contact email wajib diisi.");
    }

    return errors;
  }

  function trySwitchSection(nextSection) {
    if (nextSection === activeSection) return;
    if (!dirty) {
      setData(null);
      setValidationErrors([]);
      setActiveSection(nextSection);
      return;
    }
    setPendingAction({ type: "switch", section: nextSection });
  }

  function requestResetSection() {
    if (!dirty) {
      loadSection(activeSection);
      setValidationErrors([]);
      return;
    }
    setPendingAction({ type: "reset" });
  }

  function handleConfirmPending() {
    if (!pendingAction) return;
    if (pendingAction.type === "switch") {
      setData(null);
      setValidationErrors([]);
      setActiveSection(pendingAction.section);
    }
    if (pendingAction.type === "reset") {
      loadSection(activeSection);
      setValidationErrors([]);
    }
    setPendingAction(null);
  }

  function handleCancelPending() {
    setPendingAction(null);
  }

  async function handleSave() {
    if (!data) return;
    const errors = validateSection(activeSection, data);
    setValidationErrors(errors);
    if (errors.length > 0) {
      setStatus("error");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeSection, data }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      setDirty(false);
      setValidationErrors([]);
      notifyPortfolioUpdate(activeSection, data);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {pendingAction && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-4 shadow-lg">
            <h3 className="font-display text-sm text-text-primary">Discard unsaved changes?</h3>
            <p className="text-xs text-text-muted mt-1">
              {pendingAction.type === "switch"
                ? "Perubahan belum disimpan. Pindah section dan buang perubahan?"
                : "Reset section ini dan buang perubahan yang belum disimpan?"}
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={handleCancelPending}
                className="font-mono text-xs text-text-muted border border-border px-3 py-1.5 rounded-lg hover:border-text-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPending}
                className="font-mono text-xs bg-accent text-background px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Section tabs + save */}
      <div className="flex-shrink-0 flex items-center justify-between gap-2 p-3 border-b border-border bg-surface/40">
        <div className="flex gap-1 overflow-x-auto">
          {SECTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => trySwitchSection(key)}
              className={`font-mono text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === key
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "text-text-muted hover:text-text-primary border border-transparent"
              }`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {dirty && <span className="font-mono text-xs text-amber-300">● Belum disimpan</span>}
          {status === "saved" && <span className="font-mono text-xs text-green-400">✓ Tersimpan</span>}
          {status === "error" && <span className="font-mono text-xs text-red-400">✗ Gagal simpan</span>}
          <button
            onClick={requestResetSection}
            disabled={loading}
            className="font-mono text-xs text-text-muted border border-border px-3 py-1.5 rounded-lg hover:border-text-muted/50 transition-colors disabled:opacity-50">
            Reset
          </button>
          <button onClick={handleSave} disabled={saving || loading || !dirty}
            className="font-mono text-xs bg-accent text-background px-4 py-1.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto p-4">
        {validationErrors.length > 0 && (
          <div className="mb-4 border border-red-400/30 bg-red-400/10 rounded-xl p-3">
            <p className="font-mono text-[11px] text-red-300 uppercase tracking-wider mb-2">Perbaiki dulu sebelum simpan:</p>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((err) => (
                <li key={err} className="text-xs text-red-200">{err}</li>
              ))}
            </ul>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="font-mono text-xs text-text-muted">Loading...</p>
          </div>
        ) : data ? (
          <>
            {activeSection === "hero"        && <HeroEditor       data={data} onChange={handleChange} />}
            {activeSection === "about"       && <AboutEditor      data={data} onChange={handleChange} />}
            {activeSection === "experience"  && <ExperienceEditor  data={data} onChange={handleChange} />}
            {activeSection === "projects"    && <ProjectsEditor    data={data} onChange={handleChange} />}
            {activeSection === "skills"      && <SkillsEditor      data={data} onChange={handleChange} />}
            {activeSection === "education"   && <EducationEditor   data={data} onChange={handleChange} />}
            {activeSection === "kaia_config" && <KaiaConfigEditor  data={data} onChange={handleChange} />}
          </>
        ) : null}
      </div>
    </div>
  );
}
