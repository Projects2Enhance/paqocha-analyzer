"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AlignmentSegment } from "./types";

type KaraokeTranscriptProps = {
  segments: AlignmentSegment[];
  activeWordIndex: number;
  matchWordIndices: number[];
  onWordClick: (startSeconds: number) => void;
};

// Renders the transcript as clickable words, flattening `segments` into one
// running index so it lines up with the flat `word_segments` timeline the
// parent uses to compute `activeWordIndex` from audio.currentTime.
export function KaraokeTranscript({
  segments,
  activeWordIndex,
  matchWordIndices,
  onWordClick,
}: KaraokeTranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const matchIndexSet = useMemo(
    () => new Set(matchWordIndices),
    [matchWordIndices],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLElement>(
      `[data-word-index="${activeWordIndex}"]`,
    );
    activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeWordIndex]);

  // Prefix sum of each segment's word count, so a word's global index (which
  // must line up with the flat `word_segments` timeline activeWordIndex is
  // computed from) can be read directly instead of mutating a running
  // counter across the render — the latter trips react-hooks/immutability.
  const segmentStartIndex = useMemo(() => {
    const starts: number[] = [];
    let total = 0;
    for (const segment of segments) {
      starts.push(total);
      total += segment.words.length;
    }
    return starts;
  }, [segments]);

  return (
    <div
      ref={containerRef}
      className="paqocha-scroll paqocha-reveal-fade"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "0.25rem 0.25rem 1rem",
      }}
    >
      {segments.map((segment, segmentIndex) => (
        <p
          key={segmentIndex}
          style={{
            margin: "0 0 1.4rem",
            fontSize: "clamp(1.15rem, 2.4vw, 1.6rem)",
            lineHeight: 1.65,
            fontWeight: 500,
          }}
        >
          {segment.words.map((word, wordIndexInSegment) => {
            const index = segmentStartIndex[segmentIndex] + wordIndexInSegment;
            const isActive = index === activeWordIndex;
            const isPast = index < activeWordIndex;
            const isMatch = matchIndexSet.has(index);
            const className = [
              "paqocha-karaoke-word",
              isActive ? "is-active" : isPast ? "is-past" : "",
              isMatch ? "is-match" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <span key={wordIndexInSegment}>
                <span
                  data-word-index={index}
                  onClick={() => onWordClick(word.start)}
                  className={className}
                >
                  {word.word}
                </span>
                {wordIndexInSegment < segment.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </p>
      ))}

      <style>{`
        /* Base + state colors all live here, as classes, not inline style —
           an inline background/color would always outrank :hover below
           regardless of specificity (see DESIGN.md's note on this same bug
           in SearchBar), so the active/past states are classes too. */
        .paqocha-karaoke-word {
          cursor: pointer;
          border-radius: 0.3rem;
          padding: 0.05rem 0.2rem;
          color: var(--color-text);
          background: transparent;
          transition: background 220ms ease, color 220ms ease;
        }

        .paqocha-karaoke-word.is-past {
          color: var(--color-text-muted);
        }

        .paqocha-karaoke-word.is-active {
          color: var(--color-on-highlight);
          background: var(--color-highlight);
        }

        /* Every occurrence of the searched term, independent of playback
           position — lime (is-active) already means "playing right now,"
           so reusing it here would blur that meaning; this is a separate,
           persistent marker using --color-primary instead, the same
           tinted-fill idiom as MatchCard's selected state. Suppressed
           while a matched word also happens to be the active one, so lime
           still wins there. */
        .paqocha-karaoke-word.is-match:not(.is-active) {
          background: color-mix(in srgb, var(--color-primary) 18%, transparent);
        }

        .paqocha-karaoke-word:not(.is-active):hover {
          background: var(--color-border-subtle);
        }
      `}</style>
    </div>
  );
}
