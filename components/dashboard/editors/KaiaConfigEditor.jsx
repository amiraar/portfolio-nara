/**
 * components/dashboard/editors/KaiaConfigEditor.jsx
 * CMS editor for Kaia's AI system prompt.
 */

"use client";

import { useState, useCallback } from "react";
import { Field, textareaCls } from "./primitives";
import { ModalShell } from "../ConfirmModal";

export default function KaiaConfigEditor({ data, onChange }) {
  const [showPreview, setShowPreview] = useState(false);
  const closePreview = useCallback(() => setShowPreview(false), []);

  function handleChange(e) {
    onChange({ ...data, systemPrompt: e.target.value });
  }

  return (
    <div className="space-y-4">
      <Field label="Kaia System Prompt">
        <textarea
          className={textareaCls}
          rows={20}
          value={data.systemPrompt ?? ""}
          onChange={handleChange}
          placeholder="Tulis system prompt Kaia di sini…"
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] text-text-muted">
          Gunakan \n untuk line break baru. Perubahan aktif dalam 5 menit.
        </p>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="font-mono text-xs px-3 py-1.5 border border-border text-text-muted rounded-lg hover:border-accent/40 hover:text-accent transition-colors flex-shrink-0"
        >
          Preview
        </button>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <ModalShell
          onClose={closePreview}
          labelledBy="kaia-preview-title"
          className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        >
          {/* Modal header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-shrink-0">
            <h3 id="kaia-preview-title" className="font-display text-base font-medium text-text-primary">
              System Prompt Preview
            </h3>
            <button
              type="button"
              onClick={closePreview}
              className="font-mono text-xs text-text-muted border border-border px-3 py-1.5 rounded-lg hover:border-text-muted/40 transition-colors"
            >
              Tutup
            </button>
          </div>

          {/* Modal body */}
          <div className="overflow-y-auto p-5 flex-1">
            <pre className="font-mono text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
              {(data.systemPrompt ?? "").replace(/\\n/g, "\n") || (
                <span className="text-text-muted italic">Prompt kosong.</span>
              )}
            </pre>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
