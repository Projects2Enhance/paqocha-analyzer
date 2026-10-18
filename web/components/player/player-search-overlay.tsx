"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "../search/search-icon";

// Strips every whitespace character (space, tab, newline — including a
// pasted-in multi-word string), not just leading/trailing, so the query can
// only ever be a single token. Shared conceptually with SearchBar's
// identical helper, not literally — see that file.
function sanitizeSingleWord(value: string): string {
  return value.replace(/\s+/g, "");
}

type PlayerSearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (term: string) => void;
};

// The same backdrop-blur + expanding-pill search interaction as
// SearchBar on the home page, triggered from the magnifying-glass button
// in KaraokePlayer's header instead of a word button — see web/DESIGN.md
// -> Components -> KaraokePlayer. Deliberately its own component, not a
// reuse of SearchBar itself: SearchBar is tailored to sitting over the
// hero video (theme-independent --brand-* colors, a collapsed state that's
// a rotating word button, hero-scale sizing) none of which applies on a
// normal page with no video — this uses the semantic tokens and is sized
// down to fit this page's denser chrome instead.
export function PlayerSearchOverlay({
  isOpen,
  onClose,
  onSubmit,
}: PlayerSearchOverlayProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Clears the typed value on every path that closes the overlay (Escape,
  // backdrop click, submit) rather than resetting it synchronously inside
  // an effect on open — same reasoning as SearchBar's closeSearch() on the
  // home page: setState belongs in the event handler that triggers the
  // change, not in an effect reacting to it afterward
  // (react-hooks/set-state-in-effect). Used by the backdrop's onClick below.
  function closeAndReset() {
    setValue("");
    onClose();
  }

  useEffect(() => {
    if (!isOpen) return;
    // Inlined rather than calling closeAndReset(): that calls the `onClose`
    // prop, which (unlike SearchBar's closeSearch, which only touches
    // local setState) isn't guaranteed stable across renders, so the lint
    // rule wants it listed as a dependency — simpler to just depend on
    // `onClose` directly here than on a wrapper function around it.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setValue("");
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function handleSubmit() {
    const term = value.trim();
    if (!term) return;
    setValue("");
    onSubmit(term);
  }

  return (
    <>
      {/* Always mounted, like SearchBar's backdrop, so opacity/blur can
          transition smoothly in both directions instead of popping. */}
      <div
        aria-hidden="true"
        onClick={closeAndReset}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: isOpen
            ? "color-mix(in srgb, var(--color-bg) 45%, transparent)"
            : "transparent",
          backdropFilter: isOpen ? "blur(18px)" : "blur(0px)",
          WebkitBackdropFilter: isOpen ? "blur(18px)" : "blur(0px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition:
            "opacity 380ms ease, backdrop-filter 380ms ease, background 380ms ease",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "clamp(1.1rem, 3.2vw, 2rem)",
          left: "50%",
          zIndex: 70,
          transform: `translate(-50%, ${isOpen ? "0" : "-10px"})`,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition:
            "opacity 320ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            height: "3.25rem",
            width: "clamp(260px, 70vw, 420px)",
            padding: "0 0.35rem 0 1.1rem",
            borderRadius: "999px",
            background: "var(--color-surface)",
            color: "var(--color-text)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) =>
              setValue(sanitizeSingleWord(event.target.value))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
            placeholder="Search a word"
            className="paqocha-player-search-input"
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              background: "transparent",
              color: "var(--color-text)",
              fontSize: "1.05rem",
              fontWeight: 500,
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            aria-label="Search"
            className="paqocha-player-search-submit"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "999px",
              border: "none",
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
              cursor: "pointer",
            }}
          >
            <SearchIcon size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .paqocha-player-search-input::placeholder {
          color: var(--color-text-muted);
        }

        .paqocha-player-search-submit {
          transition: filter 160ms ease, transform 120ms ease;
        }

        .paqocha-player-search-submit:hover {
          filter: brightness(1.08);
        }

        .paqocha-player-search-submit:active {
          transform: scale(0.94);
        }

        .paqocha-player-search-input:focus-visible,
        .paqocha-player-search-submit:focus-visible {
          outline: none;
        }
      `}</style>
    </>
  );
}
