import type { Morpheme, WordAnalysisEntry } from "./types";

const TYPE_COLOR: Record<Morpheme["type"], { bg: string; fg: string }> = {
  root: { bg: "var(--color-gloss-root)", fg: "var(--color-on-primary)" },
  suffix: { bg: "var(--color-gloss-suffix)", fg: "var(--color-on-highlight)" },
};

type WordAnalysisProps = {
  words: WordAnalysisEntry[];
  activeWordIndex: number;
  isPlaying: boolean;
};

// Shows the morphosyntactic breakdown of whichever word is currently
// playing in the karaoke transcript — see web/DESIGN.md -> Components ->
// KaraokePlayer. The per-word data (public/example/word-analysis.json) is
// hand-authored for this one provisional example, not a real analysis
// backend; [TO BE DEFINED] once one exists.
//
// While playing, only the colored root/suffix chips show — advancing a
// couple of times a second in fast speech, there's no time to read prose
// alongside them, and showing/hiding it on every word would be noisy, not
// informative. The gloss/meaning "detail" list only appears once playback
// actually stops on a word (paused, or the clip ended) — i.e. the one
// moment someone has time to read it — with a soft height+fade reveal
// (a CSS grid-template-rows trick, not a JS-measured height) rather than
// snapping in.
export function WordAnalysis({
  words,
  activeWordIndex,
  isPlaying,
}: WordAnalysisProps) {
  const displayIndex = Math.min(
    Math.max(activeWordIndex, 0),
    words.length - 1,
  );
  const entry = words[displayIndex];
  if (!entry) return null;

  return (
    <div className="flex flex-col gap-5 min-h-0 overflow-y-auto paqocha-scroll paqocha-reveal-fade">
      {/* Remounting on word change (via `key`) restarts the CSS fade-in
          below each time, instead of needing JS-tracked transition state. */}
      <div
        key={displayIndex}
        className="paqocha-word-chips"
        aria-label={entry.word}
        style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}
      >
        {entry.morphemes.map((morpheme, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              padding: "0.3rem 0.6rem",
              borderRadius: "0.5rem",
              background: TYPE_COLOR[morpheme.type].bg,
              color: TYPE_COLOR[morpheme.type].fg,
              fontSize: "1.4rem",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {morpheme.text}
          </span>
        ))}
      </div>

      <div className={`paqocha-detail-wrap${isPlaying ? "" : " is-visible"}`}>
        <div className="paqocha-detail-inner">
          <div key={displayIndex} className="flex flex-col gap-4 pt-1">
            {entry.morphemes.map((morpheme, i) => (
              <div key={i} style={{ display: "flex", gap: "0.65rem" }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: "0.55rem",
                    height: "0.55rem",
                    marginTop: "0.4rem",
                    borderRadius: "999px",
                    background: TYPE_COLOR[morpheme.type].bg,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: "0.95rem" }}>
                    <span
                      style={{
                        color: TYPE_COLOR[morpheme.type].bg,
                        fontWeight: 700,
                      }}
                    >
                      {morpheme.text}
                    </span>{" "}
                    <span style={{ color: "var(--color-text-muted)" }}>
                      — {morpheme.gloss}
                    </span>
                  </p>
                  <p
                    style={{
                      margin: "0.2rem 0 0",
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.45,
                    }}
                  >
                    {morpheme.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes paqocha-word-chips-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .paqocha-word-chips {
          animation: paqocha-word-chips-in 220ms ease;
        }

        /* grid-template-rows 0fr -> 1fr animates height smoothly without
           measuring pixel heights in JS — the inner wrapper clips the
           content while collapsed. */
        .paqocha-detail-wrap {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 360ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 280ms ease;
        }

        .paqocha-detail-wrap.is-visible {
          grid-template-rows: 1fr;
          opacity: 1;
        }

        .paqocha-detail-inner {
          overflow: hidden;
          min-height: 0;
        }
      `}</style>
    </div>
  );
}
