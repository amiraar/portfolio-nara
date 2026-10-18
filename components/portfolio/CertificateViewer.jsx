"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Full-size certificate viewer built on the native <dialog> element, which
 * handles focus trapping and Escape. Render it only while a certificate is
 * open, with key={certificate.id}, so the page index resets per certificate.
 *
 * @param {{ certificate: import("@/lib/certificates").CERTIFICATES[number], onClose: () => void }} props
 */
export default function CertificateViewer({ certificate, onClose }) {
  const dialogRef = useRef(null);
  const [page, setPage] = useState(0);
  const pages = certificate.pages;
  const current = pages[page];
  const hasMultiple = pages.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // No dialog.close() here: its async "close" event would call onClose again
    // (e.g. on React Strict Mode's re-run). Unmounting removes the dialog anyway.
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function step(delta) {
    setPage((p) => (p + delta + pages.length) % pages.length);
  }

  function handleKeyDown(e) {
    if (!hasMultiple) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="certificate-viewer-title"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      // A click on the dialog element itself (not its content) is a backdrop click.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-4xl p-0 bg-transparent text-text-primary backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="warm-card rounded-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
          <div className="min-w-0">
            <h3 id="certificate-viewer-title" className="font-display text-lg font-medium leading-snug">
              {certificate.title}
            </h3>
            <p className="font-mono text-[10px] text-text-muted mt-1">
              {certificate.issuer} · {certificate.date}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate"
            className="flex-shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent/40 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="bg-white">
          <Image
            key={current.src}
            src={current.src}
            width={current.width}
            height={current.height}
            alt={`${certificate.title} certificate — ${current.caption}`}
            sizes="(min-width: 960px) 896px, 100vw"
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <p className="text-[12px] text-text-muted leading-snug">{current.caption}</p>
            {current.courses?.length ? (
              <ul className="mt-2 space-y-1" aria-label="Courses assisted">
                {current.courses.map((course) => (
                  <li key={course.name} className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                    <span className="text-text-primary">{course.name}</span>
                    <span className="font-mono text-[10px] text-text-muted">{course.lab}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {hasMultiple ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous certificate"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
              >
                ‹
              </button>
              <span className="font-mono text-[10px] text-text-muted tabular-nums" aria-live="polite">
                {page + 1} / {pages.length}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next certificate"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
