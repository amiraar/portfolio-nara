/**
 * lib/useUnsavedChangesGuard.js — Reusable unsaved-changes confirmation helper.
 */

"use client";

import { useCallback } from "react";

const DEFAULT_MESSAGE = "Perubahan belum disimpan. Lanjutkan dan buang perubahan?";

/**
 * Create a guarded section-switch callback for unsaved form state.
 * @param {boolean} dirty
 * @returns {{ confirmSwitch: (onConfirm: () => void, message?: string) => void }}
 */
export function useUnsavedChangesGuard(dirty) {
  const confirmSwitch = useCallback((onConfirm, message = DEFAULT_MESSAGE) => {
    if (!dirty || window.confirm(message)) {
      onConfirm();
    }
  }, [dirty]);

  return { confirmSwitch };
}
