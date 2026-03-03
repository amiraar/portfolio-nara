/**
 * components/ThemeProvider.jsx — Dark/light theme context.
 * Persists to localStorage, respects prefers-color-scheme on first visit.
 * Applies "dark" or "light" class to <html>.
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");

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
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("nara-theme", theme);
    // Update meta theme-color
    document.querySelector("meta[name='theme-color']")?.setAttribute(
      "content",
      theme === "dark" ? "#0A0A0A" : "#F8F6F1"
    );
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
