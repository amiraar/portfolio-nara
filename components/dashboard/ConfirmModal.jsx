/**
 * components/dashboard/ConfirmModal.jsx
 * Shared modal shell and confirm dialog for the admin dashboard, so every
 * dashboard dialog looks and behaves the same (Escape and backdrop close it).
 */

"use client";

import { useEffect, useRef } from "react";

export function ModalShell({ onClose, labelledBy, className = "max-w-sm", children }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full ${className} rounded-2xl border border-border bg-surface shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   open: boolean,
 *   title: string,
 *   message?: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   danger?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <ModalShell onClose={onCancel} labelledBy="confirm-modal-title">
      <div className="p-5">
        <h3 id="confirm-modal-title" className="font-display text-base font-medium text-text-primary">{title}</h3>
        {message && <p className="text-xs text-text-muted mt-2 leading-relaxed">{message}</p>}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel}
            className="font-mono text-xs text-text-muted border border-border px-3 py-1.5 rounded-lg hover:border-text-muted/40 transition-colors">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm}
            className={danger
              ? "font-mono text-xs bg-red-500/90 text-white px-4 py-1.5 rounded-lg hover:bg-red-500 transition-colors"
              : "font-mono text-xs bg-accent text-background px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
