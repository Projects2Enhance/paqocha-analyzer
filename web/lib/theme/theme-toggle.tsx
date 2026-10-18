"use client";

import { useTheme } from "./theme-provider";

// Shows the icon for the theme a click would switch *to* — moon (switch to
// dark) while light, sun (switch to light) while dark — the common
// convention (GitHub, etc.), rather than an icon for the current theme.
function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <line x1="12" y1="2.5" x2="12" y2="4.8" />
      <line x1="12" y1="19.2" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="4.8" y2="12" />
      <line x1="19.2" y1="12" x2="21.5" y2="12" />
      <line x1="5.1" y1="5.1" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="18.9" y2="18.9" />
      <line x1="5.1" y1="18.9" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="18.9" y2="5.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z" />
    </svg>
  );
}

// Icon-only, fixed top-right on the home page — see app/page.tsx. Filled
// --color-primary circle, the same visual language as KaraokePlayer's back
// and play buttons. Deliberately uses the theme-switching semantic tokens
// even though it sits over the hero video (where SearchBar/Hero
// deliberately use the theme-independent --brand-* primitives instead) —
// this component's whole job is to reflect/control theme state, so reacting
// to the theme is correct here, not an oversight. See web/DESIGN.md.
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        position: "fixed",
        top: "clamp(1.1rem, 3.2vw, 2rem)",
        right: "clamp(1.1rem, 3.2vw, 2rem)",
        zIndex: 50,
      }}
    >
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        className="paqocha-theme-toggle"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "999px",
          border: "none",
          background: "var(--color-primary)",
          color: "var(--color-on-primary)",
          cursor: "pointer",
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

      <style>{`
        .paqocha-theme-toggle {
          transition: filter 160ms ease, transform 120ms ease;
        }

        .paqocha-theme-toggle:hover {
          filter: brightness(1.08);
        }

        .paqocha-theme-toggle:active {
          transform: scale(0.94);
        }
      `}</style>
    </div>
  );
}
