"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Full-size photo viewer on the native <dialog> element (focus trap + Escape).
 * Render it only while open; `startIndex` picks the first photo shown.
 *
 * @param {{
 *   photos: { src: import("next/image").StaticImageData, alt: string, caption?: string }[],
 *   startIndex: number,
 *   title: string,
 *   onClose: () => void,
 * }} props
 */
export default function PhotoViewer({ photos, startIndex, title, onClose }) {
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(startIndex);
  const current = photos[index];
  const hasMultiple = photos.length > 1;

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
    setIndex((i) => (i + delta + photos.length) % photos.length);
  }

  function handleKeyDown(e) {
    if (!hasMultiple) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      // A click on the dialog element itself (not its content) is a backdrop click.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-3xl p-0 bg-transparent text-text-primary backdrop:bg-black/85 backdrop:backdrop-blur-sm"
    >
      <figure className="relative">
        <Image
          key={index}
          src={current.src}
          alt={current.alt}
          placeholder="blur"
          sizes="(min-width: 800px) 768px, 100vw"
          className="mx-auto w-auto h-auto max-w-full max-h-[78vh] rounded-2xl object-contain"
        />
        <figcaption className="mt-3 flex items-center justify-between gap-3 px-1">
          <span className="text-[12px] text-white/75 leading-snug">{current.caption ?? current.alt}</span>
          {hasMultiple ? (
            <span className="font-mono text-[10px] text-white/60 tabular-nums flex-shrink-0" aria-live="polite">
              {index + 1} / {photos.length}
            </span>
          ) : null}
        </figcaption>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/55 backdrop-blur text-white flex items-center justify-center hover:bg-black/75 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-[calc(50%-1.5rem)] w-10 h-10 rounded-full bg-black/55 backdrop-blur text-white text-lg flex items-center justify-center hover:bg-black/75 transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-3 top-[calc(50%-1.5rem)] w-10 h-10 rounded-full bg-black/55 backdrop-blur text-white text-lg flex items-center justify-center hover:bg-black/75 transition-colors"
            >
              ›
            </button>
          </>
        ) : null}
      </figure>
    </dialog>
  );
}
