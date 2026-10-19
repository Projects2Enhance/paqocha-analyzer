"use client";

import { useTheme } from "./theme-provider";

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

// Icon-only circular toggle — plain button, no self-positioning. Originally
// lived fixed top-right on the home page (over the hero video, hence a
// `--brand-ink` fill matching SearchBar's pill); moved to KaraokePlayer's
// header instead, a normal themed page with no video underneath, so it
// takes `--color-primary`/`--color-on-primary` — the same fill as that
// page's back/play buttons — from its caller instead of carrying its own
// fixed color or fixed positioning. See web/DESIGN.md's Theme-independent
// UI section.
//
// Both icons are always rendered; which one is visible is decided by a
// `[data-theme="dark"]` CSS rule, not a JS/React branch on the current
// theme. That's deliberate: ThemeScript sets `data-theme` on <html>
// synchronously before first paint, so the right icon is already showing
// in that very first paint, from pure CSS, with nothing to hydrate — a
// version that picked the icon in JSX from `useTheme()`'s value visibly
// flashed the wrong one on every navigation instead (see DESIGN.md).
export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Cambiar tema"
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
        <span className="paqocha-theme-icon paqocha-theme-icon-moon" aria-hidden="true">
          <MoonIcon />
        </span>
        <span className="paqocha-theme-icon paqocha-theme-icon-sun" aria-hidden="true">
          <SunIcon />
        </span>
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

        /* Shows the icon for the theme a click would switch *to* — moon
           (switch to dark) by default/light, sun (switch to light) once
           [data-theme="dark"] is present — the common convention (GitHub,
           etc.), driven entirely by the attribute, not React state. */
        .paqocha-theme-icon {
          display: none;
          line-height: 0;
        }

        .paqocha-theme-icon-moon {
          display: inline-flex;
        }

        [data-theme="dark"] .paqocha-theme-icon-moon {
          display: none;
        }

        [data-theme="dark"] .paqocha-theme-icon-sun {
          display: inline-flex;
        }
      `}</style>
    </>
  );
}
