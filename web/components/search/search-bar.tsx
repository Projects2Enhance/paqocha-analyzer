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

// All of QUECHUA_WORDS, shown in a shuffled order each time the pill opens —
// kept as a count (not a hardcoded 3) so the suggestion chips always match
// the same word set cycling through the collapsed pill's placeholder.
const SUGGESTION_COUNT = QUECHUA_WORDS.length;
const TOUR_START_DELAY_MS = 2800;
const TOUR_REPLAY_SETTLE_MS = 480;
const WORD_DISPLAY_MS = 3000;
const WORD_FADE_MS = 350;

// Strips every whitespace character (space, tab, newline — including a
// pasted-in multi-word string), not just leading/trailing, so the query can
// only ever be a single token. Shared conceptually with
// PlayerSearchOverlay's identical helper, not literally — see that file.
function sanitizeSingleWord(value: string): string {
  return value.replace(/\s+/g, "");
}

// Fisher-Yates over a copy, so QUECHUA_WORDS itself is never mutated. Only
// called from event handlers (never during render), so Math.random can't
// cause a server/client hydration mismatch.
function pickRandomWords(count: number): string[] {
  const pool = [...QUECHUA_WORDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// Styled inline / with a scoped <style> tag on purpose — see DESIGN.md's
// "Known build constraint" on why *.module.css doesn't work in this project.
export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // First visit only: walk the viewer through the pill once the hero's
  // entrance animation has settled. driver.js is loaded on demand so it
  // never weighs on the initial bundle.
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const { hasSeenSearchTour, startSearchTour } = await import(
        "./search-tour"
      );
      if (hasSeenSearchTour()) return;
      startSearchTour({ openSearch, closeSearch });
    }, TOUR_START_DELAY_MS);
    return () => clearTimeout(timeoutId);
    // Mount-only on purpose: openSearch/closeSearch only call stable state
    // setters, so the first-render closures stay valid for the tour's life.
  }, []);

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
  function openSearch() {
    setSuggestions(pickRandomWords(SUGGESTION_COUNT));
    setIsOpen(true);
  }

  // Manual replay from the "?" button. Closes the pill first (and waits out
  // its 420ms width transition) so step 1 measures the collapsed pill.
  async function replayTour() {
    closeSearch();
    const { startSearchTour } = await import("./search-tour");
    setTimeout(
      () => startSearchTour({ openSearch, closeSearch }),
      TOUR_REPLAY_SETTLE_MS,
    );
  }

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
  function handleSearch(word?: string) {
    const term = word ?? (query.trim() || currentWord);
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
              onClick={openSearch}
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
            onClick={() => handleSearch()}
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

        {/* Known-to-exist words (see QUECHUA_WORDS), so a tap always lands on
            real results. Always mounted so the fade can run both ways;
            tabIndex/aria-hidden keep it out of reach while closed. */}
        <div
          className="paqocha-search-suggestions"
          aria-hidden={!isOpen}
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(-0.5rem)",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <span className="paqocha-search-suggestions-label">Prueba con</span>
          {suggestions.map((word) => (
            <button
              key={word}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              className="paqocha-search-chip"
              onClick={() => handleSearch(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="paqocha-tour-help"
        aria-label="Ver tutorial"
        title="Ver tutorial"
        onClick={replayTour}
      >
        ?
      </button>

      <style>{`
        .paqocha-tour-help {
          position: fixed;
          right: max(1rem, env(safe-area-inset-right));
          bottom: max(1rem, env(safe-area-inset-bottom));
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
          border: none;
          border-radius: 999px;
          background: var(--brand-ink);
          color: var(--brand-cream);
          font-size: 1.25rem;
          font-weight: 600;
          cursor: pointer;
          opacity: 1;
          transition: opacity 200ms ease, background 200ms ease, color 200ms ease, transform 150ms ease;
        }

        .paqocha-tour-help:hover {
          opacity: 1;
          background: rgba(158, 161, 224, 0.25);
          color: var(--brand-periwinkle-light);
          backdrop-filter: blur(12px);
        }

        .paqocha-tour-help:active {
          transform: scale(0.92);
        }

        .paqocha-tour-help:focus-visible {
          opacity: 1;
          outline: 2px solid var(--brand-periwinkle-light);
          outline-offset: 2px;
        }

        /* First-visit tour (driver.js) — same ink/cream/periwinkle language as
           the pill, so it reads as part of the interface, not a third-party
           widget. */
        .driver-popover.paqocha-tour-popover {
          max-width: min(320px, calc(100vw - 2rem));
          padding: 1.25rem 1.375rem;
          border-radius: 1.5rem;
          background: var(--brand-ink);
          color: var(--brand-cream);
          box-shadow: 0 14px 44px rgba(31, 33, 80, 0.45);
          font-family: inherit;
        }

        .paqocha-tour-popover .driver-popover-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--brand-cream);
        }

        .paqocha-tour-popover .driver-popover-description {
          margin-top: 0.4rem;
          font-size: 0.95rem;
          line-height: 1.45;
          color: var(--brand-cream);
          opacity: 0.85;
        }

        .paqocha-tour-popover .driver-popover-description strong {
          font-weight: 700;
          color: var(--brand-cream);
        }

        .paqocha-tour-popover .driver-popover-progress-text {
          font-size: 0.8rem;
          color: var(--brand-cream);
          opacity: 0.6;
        }

        .paqocha-tour-popover .driver-popover-close-btn {
          color: var(--brand-cream);
          opacity: 0.7;
        }

        .paqocha-tour-popover .driver-popover-footer button {
          min-height: 2.5rem;
          padding: 0 1.1rem;
          border: none;
          border-radius: 999px;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 500;
          text-shadow: none;
          cursor: pointer;
          transition: background 200ms ease, color 200ms ease, transform 150ms ease;
        }

        .paqocha-tour-popover .driver-popover-prev-btn {
          background: transparent;
          color: var(--brand-cream);
        }

        .paqocha-tour-popover .driver-popover-next-btn {
          background: var(--brand-periwinkle-light);
          color: var(--brand-ink);
        }

        .paqocha-tour-popover .driver-popover-next-btn:hover {
          background: var(--brand-cream);
        }

        .paqocha-tour-popover .driver-popover-prev-btn:hover {
          background: rgba(158, 161, 224, 0.25);
        }

        .paqocha-tour-popover .driver-popover-footer button:active {
          transform: scale(0.95);
        }

        .paqocha-tour-popover .driver-popover-arrow-side-top.driver-popover-arrow {
          border-top-color: var(--brand-ink);
        }
        .paqocha-tour-popover .driver-popover-arrow-side-bottom.driver-popover-arrow {
          border-bottom-color: var(--brand-ink);
        }
        .paqocha-tour-popover .driver-popover-arrow-side-left.driver-popover-arrow {
          border-left-color: var(--brand-ink);
        }
        .paqocha-tour-popover .driver-popover-arrow-side-right.driver-popover-arrow {
          border-right-color: var(--brand-ink);
        }

        .paqocha-search-suggestions {
          position: absolute;
          top: calc(100% + 0.875rem);
          left: 0;
          right: 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: opacity 320ms ease 120ms, transform 320ms ease 120ms;
        }

        .paqocha-search-suggestions-label {
          width: 100%;
          text-align: center;
          font-size: 0.8rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--brand-cream);
          opacity: 0.85;
          text-shadow: 0 1px 8px rgba(31, 33, 80, 0.6);
        }

        .paqocha-search-chip {
          min-height: 2.75rem;
          padding: 0 1.25rem;
          border: none;
          border-radius: 999px;
          background: var(--brand-ink);
          color: var(--brand-cream);
          font-size: 1.05rem;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(31, 33, 80, 0.3);
          transition: background 200ms ease, color 200ms ease, transform 150ms ease;
        }

        .paqocha-search-chip:hover {
          background: rgba(158, 161, 224, 0.25);
          color: var(--brand-periwinkle-light);
          backdrop-filter: blur(12px);
        }

        .paqocha-search-chip:active {
          transform: scale(0.95);
        }

        .paqocha-search-chip:focus-visible {
          outline: 2px solid var(--brand-periwinkle-light);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .paqocha-search-suggestions {
            transition: none;
          }
        }

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
