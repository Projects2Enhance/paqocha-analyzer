"use client";

import { useTheme } from "./theme-provider";

/** Minimal toggle for verifying the theme system. Will be redesigned later. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      style={{
        alignSelf: "flex-start",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        color: "var(--color-text)",
        cursor: "pointer",
      }}
    >
      {isDark ? "Switch to light theme" : "Switch to dark theme"}
    </button>
  );
}
