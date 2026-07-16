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
import ContactEditor from "./editors/ContactEditor";
import KaiaConfigEditor from "./editors/KaiaConfigEditor";

const DEFAULTS = PORTFOLIO_DEFAULTS;

/**
 * Section renderer + load/save/validate shell.
 *
 * Props
 * - section:       display key — "hero" | "about" | "experience" | "projects" |
 *                  "skills" | "education" | "contact" | "kaia_config"
 * - apiSection:    API key used for GET/PATCH — "contact" maps to "education"
 * - onDirtyChange: (isDirty: boolean) => void
 */
export default function ContentEditor({ section, apiSection, onDirtyChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "saved" | "error"
  const [validationErrors, setValidationErrors] = useState([]);
  const timerRef = useRef(null);

  const loadSection = useCallback(async () => {
    setLoading(true);
    setData(null);
    setSaveStatus(null);
    setDirty(false);
    onDirtyChange?.(false);
    try {
      const res = await fetch(`/api/portfolio?section=${apiSection}`);
      const { content } = await res.json();
      setData(content ?? DEFAULTS[apiSection]);
    } catch {
      setData(DEFAULTS[apiSection]);
    } finally {
      setLoading(false);
    }
  }, [apiSection, onDirtyChange]);

  useEffect(() => {
    loadSection();
  }, [loadSection]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function handleChange(newData) {
    setData(newData);
    setDirty(true);
    setSaveStatus(null);
    onDirtyChange?.(true);
  }

  function validate(sectionKey, sectionData) {
    const errors = [];

    if (sectionKey === "hero") {
      if (!sectionData?.name?.trim()) errors.push("Name is required.");
      if (!sectionData?.tagline?.trim()) errors.push("Tagline is required.");
    }

    if (sectionKey === "about") {
      if (!sectionData?.heading?.trim()) errors.push("Heading is required.");
      if (!(sectionData?.paragraphs ?? []).some((p) => String(p || "").trim()))
        errors.push("At least one paragraph is required.");
    }

    if (sectionKey === "experience") {
      (sectionData ?? []).forEach((item, idx) => {
        if (!item?.role?.trim()) errors.push(`Experience #${idx + 1}: role is required.`);
        if (!item?.company?.trim()) errors.push(`Experience #${idx + 1}: company is required.`);
        if (!item?.period?.trim()) errors.push(`Experience #${idx + 1}: period is required.`);
      });
    }

    if (sectionKey === "projects") {
      (sectionData ?? []).forEach((item, idx) => {
        if (!item?.name?.trim()) errors.push(`Project #${idx + 1}: name is required.`);
        if (!item?.type?.trim()) errors.push(`Project #${idx + 1}: type is required.`);
        if (!item?.description?.trim()) errors.push(`Project #${idx + 1}: description is required.`);
        if (item?.link?.trim()) {
          try {
            const parsed = new URL(item.link.trim());
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
              errors.push(`Project #${idx + 1}: link must use http or https.`);
          } catch {
            errors.push(`Project #${idx + 1}: invalid link format.`);
          }
        }
      });
    }

    if (sectionKey === "skills") {
      if (Object.keys(sectionData?.skills ?? {}).length === 0)
        errors.push("At least one skill category is required.");
      (sectionData?.languages ?? []).forEach((lang, idx) => {
        if (!lang?.name?.trim()) errors.push(`Language #${idx + 1}: name is required.`);
        if (!lang?.level?.trim()) errors.push(`Language #${idx + 1}: level is required.`);
      });
    }

    if (sectionKey === "education") {
      if (!sectionData?.university?.trim()) errors.push("University is required.");
      if (!sectionData?.degree?.trim()) errors.push("Degree is required.");
    }

    if (sectionKey === "contact") {
      if (!sectionData?.email?.trim()) errors.push("Email is required.");
      if (sectionData?.linkedin?.trim()) {
        try {
          new URL(sectionData.linkedin.trim());
        } catch {
          errors.push("LinkedIn URL format is invalid.");
        }
      }
      if (sectionData?.github?.trim()) {
        try {
          new URL(sectionData.github.trim());
        } catch {
          errors.push("GitHub URL format is invalid.");
        }
      }
    }

    return errors;
  }

  async function handleSave() {
    if (!data) return;
    const errors = validate(section, data);
    setValidationErrors(errors);
    if (errors.length > 0) {
      setSaveStatus("error");
      return;
    }
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: apiSection, data }),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
      setDirty(false);
      setValidationErrors([]);
      onDirtyChange?.(false);
      notifyPortfolioUpdate(apiSection, data);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    loadSection();
    setValidationErrors([]);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-surface/30">
        <div className="flex items-center gap-2 min-w-0">
          {dirty && (
            <span className="font-mono text-[10px] text-accent/80">● Unsaved changes</span>
          )}
          {saveStatus === "saved" && (
            <span className="font-mono text-[10px] text-success">✓ Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="font-mono text-[10px] text-red-400">✗ Failed to save</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleReset}
            disabled={loading}
            className="font-mono text-[11px] text-text-muted border border-border px-3 py-1.5 rounded-lg hover:border-text-muted/40 transition-colors disabled:opacity-40"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || !dirty}
            className="font-mono text-[11px] bg-accent text-background px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 lg:p-6">
        {validationErrors.length > 0 && (
          <div className="mb-5 border border-red-400/25 bg-red-400/8 rounded-xl p-4">
            <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-2">
              Fix before saving:
            </p>
            <ul className="space-y-1">
              {validationErrors.map((err) => (
                <li key={err} className="text-xs text-red-300 flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">·</span>
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex items-center gap-2 text-text-muted">
              <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: "0.15s" }} />
              <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        ) : data ? (
          <>
            {section === "hero"        && <HeroEditor       data={data} onChange={handleChange} />}
            {section === "about"       && <AboutEditor      data={data} onChange={handleChange} />}
            {section === "experience"  && <ExperienceEditor data={data} onChange={handleChange} />}
            {section === "projects"    && <ProjectsEditor   data={data} onChange={handleChange} />}
            {section === "skills"      && <SkillsEditor     data={data} onChange={handleChange} />}
            {section === "education"   && <EducationEditor  data={data} onChange={handleChange} />}
            {section === "contact"     && <ContactEditor    data={data} onChange={handleChange} />}
            {section === "kaia_config" && <KaiaConfigEditor data={data} onChange={handleChange} />}
          </>
        ) : null}
      </div>
    </div>
  );
}
