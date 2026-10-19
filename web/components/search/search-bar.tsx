"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "./search-icon";

// Top-center search pill, modeled on compasspathways.com's dark expanding
// navbar (see web/DESIGN.md -> Components -> SearchBar for the full writeup).
//
// Real Quechua words, each confirmed present in the real generated
// search-index.json (not just plausible-looking) — a word that isn't
// indexed would send a user straight to NoResultsState the moment they hit
// search without typing anything, by coincidence of word choice alone.
const QUECHUA_WORDS = ["P'unchaykuna", "Mikhuy", "T'anta", "Wasi", "P'unchay"];

const WORD_DISPLAY_MS = 3000;
const WORD_FADE_MS = 350;

// Strips every whitespace character (space, tab, newline — including a
// pasted-in multi-word string), not just leading/trailing, so the query can
// only ever be a single token. Shared conceptually with
// PlayerSearchOverlay's identical helper, not literally — see that file.
function sanitizeSingleWord(value: string): string {
  return value.replace(/\s+/g, "");
}

// Styled inline / with a scoped <style> tag on purpose — see DESIGN.md's
// "Known build constraint" on why *.module.css doesn't work in this project.
export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Also resets wordVisible to true, in case the pill is closing mid
  // fade-out — otherwise the rotation effect below could restart with the
  // word stuck invisible until its next 3s tick. Done here, in the event
  // handlers that close the pill, rather than as a synchronous setState at
  // the top of an effect (react-hooks/set-state-in-effect).
  function closeSearch() {
    setIsOpen(false);
    setWordVisible(true);
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Cycles the default word every WORD_DISPLAY_MS, looping forever. Paused
  // while open so the placeholder doesn't shift under the user while they
  // type.
  useEffect(() => {
    if (isOpen) return;
    const intervalId = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % QUECHUA_WORDS.length);
        setWordVisible(true);
      }, WORD_FADE_MS);
    }, WORD_DISPLAY_MS);
    return () => clearInterval(intervalId);
  }, [isOpen]);

  const currentWord = QUECHUA_WORDS[wordIndex];

  // No real search/backend yet (see web/DESIGN.md -> Components ->
  // KaraokePlayer) — this always opens the same example clip, regardless of
  // the term, but still carries it through as `?q=` for the results page's
  // header.
  //
  // A full navigation (window.location, not next/link's client-side
  // router.push) is deliberate: Next's instant-navigation/router cache
  // (cacheComponents + partialPrefetching in next.config.ts) was observed
  // keeping component state alive across client-side transitions between
  // "/" and "/search" — a typed-but-unsent query surviving a round trip to
  // the player and back, audio surviving a navigation away. Every visit to
  // either route must start genuinely fresh, so both directions use a real
  // page load instead of fighting the cache's edge cases. See
  // web/DESIGN.md -> Components -> KaraokePlayer.
  function handleSearch() {
    const term = query.trim() || currentWord;
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate, see the comment above.
    window.location.href = `/search?q=${encodeURIComponent(term)}`;
  }

  return (
    <>
      {/* Blurs everything behind it (hero video + tagline) while open. Always
          mounted so opacity/blur can transition smoothly in both directions. */}
      <div
        aria-hidden="true"
        onClick={closeSearch}
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
              value={query}
              onChange={(event) =>
                setQuery(sanitizeSingleWord(event.target.value))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder={currentWord}
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
                overflow: "hidden",
              }}
            >
              <span
                className="paqocha-search-word"
                style={{
                  display: "inline-block",
                  opacity: wordVisible ? 1 : 0,
                  transform: wordVisible ? "translateY(0)" : "translateY(-0.5rem)",
                }}
              >
                {currentWord}
              </span>
            </button>
          )}

          <button
            type="button"
            className="paqocha-search-icon-button"
            aria-label="Buscar"
            onClick={handleSearch}
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

        .paqocha-search-word {
          transition: opacity ${WORD_FADE_MS}ms ease, transform ${WORD_FADE_MS}ms ease;
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
