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
          top: "clamp(1.1rem, 3.2vw, 2rem)",
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
            gap: "0.625rem",
            height: "4.5rem",
            width: isOpen
              ? "clamp(380px, 88vw, 620px)"
              : "clamp(260px, 55vw, 360px)",
            padding: "0 0.5rem 0 1.75rem",
            borderRadius: "999px",
            background: "var(--brand-ink)",
            color: "var(--brand-cream)",
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
                fontSize: "1.4rem",
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
                fontSize: "1.4rem",
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
              width: "3.25rem",
              height: "3.25rem",
              borderRadius: "999px",
              border: "none",
              color: "var(--brand-cream)",
              cursor: "pointer",
            }}
          >
            <SearchIcon size={26} />
          </button>
        </div>
      </div>

      <style>{`
        .paqocha-search-pill {
          box-shadow: 0 10px 36px rgba(31, 33, 80, 0.3);
          transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms ease;
        }

        .paqocha-search-input::placeholder {
          color: var(--brand-cream);
          opacity: 0.6;
        }

        /* Base background lives here, not inline, so :hover/:active below can
           actually override it — an inline style="background:..." always
           outranks a stylesheet rule, which was why the circle never showed. */
        .paqocha-search-icon-button {
          background: transparent;
          transition: background 200ms ease, color 200ms ease, transform 150ms ease;
        }

        .paqocha-search-icon-button:hover {
          background: rgba(158, 161, 224, 0.25);
          color: var(--brand-periwinkle-light);
        }

        .paqocha-search-icon-button:active {
          background: rgba(158, 161, 224, 0.38);
          transform: scale(0.92);
        }

        /* Suppresses the page's global :focus-visible outline (app/globals.css)
           for this component specifically — it would otherwise draw a sharp,
           square outline right on the <input>'s own box, clipped by nothing,
           since this bare input has no border-radius of its own. Removed on
           request; this component currently has no visible focus indicator
           at all as a result — see DESIGN.md's note on this trade-off. */
        .paqocha-search-input:focus-visible,
        .paqocha-search-word-button:focus-visible,
        .paqocha-search-icon-button:focus-visible {
          outline: none;
        }
      `}</style>
    </>
  );
}
