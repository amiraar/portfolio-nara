/**
 * components/ThemeProvider.jsx — Dark/light theme context.
 * Persists to localStorage, respects prefers-color-scheme on first visit.
 * Applies "dark" or "light" class to <html>.
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }) {
  // null until the saved theme is read on mount. The inline script in app/layout.jsx
  // has already set the <html> class, so nothing is applied before then; starting
  // at "dark" flashed the dark theme for light-theme visitors on every load.
  const [theme, setTheme] = useState(null);

  // Read persisted theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("nara-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else {
      // Respect OS preference on first visit
      const preferLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      setTheme(preferLight ? "light" : "dark");
    }
  }, []);

  // Apply class to <html> whenever theme changes
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("nara-theme", theme);
    // Update meta theme-color
    document.querySelector("meta[name='theme-color']")?.setAttribute(
      "content",
      theme === "dark" ? "#0B0907" : "#FCF8EE"
    );
  }, [theme]);

  function toggle() {
    setTheme((t) => {
      const current = t ?? (document.documentElement.classList.contains("light") ? "light" : "dark");
      return current === "dark" ? "light" : "dark";
    });
  }

  return (
    <ThemeContext.Provider value={{ theme: theme ?? "dark", toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
