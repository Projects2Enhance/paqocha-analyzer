"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "./search-icon";

// Top-center search pill, modeled on compasspathways.com's dark expanding
// navbar (see web/DESIGN.md -> Components -> SearchBar for the full writeup).
//
// "Maskhay" (Southern/Cusco-Collao Quechua for "to search") is a real word,
// not invented, but its spelling hasn't been checked by a Puno Quechua
// speaker yet — flag for review before this ships for real.
const QUECHUA_WORD = "Maskhay";

// Styled inline / with a scoped <style> tag on purpose — see DESIGN.md's
// "Known build constraint" on why *.module.css doesn't work in this project.
export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Blurs everything behind it (hero video + tagline) while open. Always
          mounted so opacity/blur can transition smoothly in both directions. */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: isOpen ? "rgba(31, 33, 80, 0.35)" : "rgba(31, 33, 80, 0)",
          backdropFilter: isOpen ? "blur(18px)" : "blur(0px)",
          WebkitBackdropFilter: isOpen ? "blur(18px)" : "blur(0px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition:
            "opacity 420ms ease, backdrop-filter 420ms ease, background 420ms ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "clamp(1rem, 3vw, 1.75rem)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
        }}
      >
        <div
          className="paqocha-search-pill"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            height: "3.25rem",
            width: isOpen
              ? "clamp(280px, 90vw, 440px)"
              : "clamp(190px, 46vw, 230px)",
            padding: "0 0.375rem 0 1.25rem",
            borderRadius: "999px",
            background: "var(--brand-ink)",
            color: "var(--brand-cream)",
            boxShadow: "0 8px 30px rgba(31, 33, 80, 0.35)",
            transition: "width 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            overflow: "hidden",
          }}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              placeholder={QUECHUA_WORD}
              className="paqocha-search-input"
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                background: "transparent",
                color: "var(--brand-cream)",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
            />
          ) : (
            <button
              type="button"
              className="paqocha-search-word-button"
              onClick={() => setIsOpen(true)}
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: "left",
                border: "none",
                background: "transparent",
                color: "var(--brand-cream)",
                fontSize: "0.95rem",
                fontWeight: 500,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {QUECHUA_WORD}
            </button>
          )}

          {/* Visual/button only — does not search or navigate anywhere yet. */}
          <button
            type="button"
            className="paqocha-search-icon-button"
            aria-label="Search"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "999px",
              border: "none",
              background: "transparent",
              color: "var(--brand-cream)",
              cursor: "pointer",
              transition: "background 200ms ease, color 200ms ease, transform 150ms ease",
            }}
          >
            <SearchIcon />
          </button>
        </div>
      </div>

      <style>{`
        .paqocha-search-input::placeholder {
          color: var(--brand-cream);
          opacity: 0.6;
        }

        .paqocha-search-icon-button:hover {
          background: rgba(207, 210, 36, 0.18);
          color: var(--color-highlight);
        }

        .paqocha-search-icon-button:active {
          transform: scale(0.9);
        }

        /* Reset mouse-click focus first, then restore it for keyboard focus
           below — order matters, :focus-visible must come after this to win. */
        .paqocha-search-input:focus {
          outline: none;
        }

        /* This component sits on the video, not the page background, and
           keeps a fixed dark pill regardless of the site's light/dark theme
           — so its focus ring is pinned to the brand lime instead of the
           theme-dependent --color-focus token (see DESIGN.md). */
        .paqocha-search-input:focus-visible,
        .paqocha-search-word-button:focus-visible,
        .paqocha-search-icon-button:focus-visible {
          outline: 2px solid var(--color-highlight);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}
