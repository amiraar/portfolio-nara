/**
 * components/dashboard/editors/KaiaConfigEditor.jsx
 * CMS editor for Kaia's AI system prompt.
 */

"use client";

import { useState } from "react";
import { Field, textareaCls } from "./primitives";

export default function KaiaConfigEditor({ data, onChange }) {
  const [showPreview, setShowPreview] = useState(false);

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
              <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
                System Prompt Preview
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="font-mono text-xs text-text-muted hover:text-text-primary transition-colors"
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
          </div>
        </div>
      )}
    </div>
  );
}
