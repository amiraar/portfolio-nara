/**
 * lib/useRevealOnScroll.js — Reusable reveal-on-intersection helper.
 */

"use client";

import { useEffect } from "react";

/**
 * Add the "revealed" class to an element once it enters the viewport.
 * @param {import("react").RefObject<HTMLElement>} ref
 * @param {number} [threshold]
 * @returns {void}
 */
export function useRevealOnScroll(ref, threshold = 0.1) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("revealed");
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);
}
