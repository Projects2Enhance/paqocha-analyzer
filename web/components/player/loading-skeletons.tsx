import type { CSSProperties } from "react";

// Shared "bone" shape for every skeleton below — a muted, gently pulsing
// rounded block standing in for text/shapes that haven't loaded. Width is
// a fixed value per instance (not randomized per render), so the skeleton
// doesn't visually jitter on re-render, only its own pulse animates.
function Bone({
  width,
  height = "1rem",
  radius = "0.3rem",
  style,
}: {
  width: string;
  height?: string;
  radius?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className="paqocha-skeleton-bone"
      style={{
        display: "inline-block",
        width,
        height,
        borderRadius: radius,
        background: "var(--color-border-subtle)",
        ...style,
      }}
    />
  );
}

// Word-shaped blocks of varying width, grouped into two "paragraphs" of a
// few lines each — a rough approximation of this example's actual
// transcript shape, not a literal placeholder for its real word count.
const TRANSCRIPT_PARAGRAPHS: number[][][] = [
  [
    [62, 44, 78, 52, 66, 40, 58, 70],
    [48, 60, 54, 68, 46],
  ],
  [
    [58, 42, 66, 50, 74, 48, 62],
    [56, 40, 68, 52, 60, 46],
    [70, 54, 64, 50],
  ],
];

export function TranscriptSkeleton() {
  return (
    <div
      className="flex flex-col min-h-0 flex-1"
      style={{
        overflow: "hidden",
        padding: "0.25rem 0.25rem 1rem",
        gap: "1.4rem",
      }}
      aria-hidden="true"
    >
      {TRANSCRIPT_PARAGRAPHS.map((rows, paragraphIndex) => (
        <div
          key={paragraphIndex}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {rows.map((widths, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex", gap: "0.5rem" }}>
              {widths.map((width, i) => (
                <Bone key={i} width={`${width}px`} height="1.4rem" />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        width: "100%",
        borderRadius: "1rem",
        padding: "1rem 1.1rem",
        background: "var(--color-surface)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Bone width="76px" height="0.7rem" />
        <Bone width="1.6rem" height="1.6rem" radius="999px" />
      </div>
      <Bone width="94%" height="0.95rem" />
      <Bone width="68%" height="0.95rem" />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Bone width="64px" height="0.8rem" />
        <Bone width="34px" height="0.8rem" />
      </div>
    </div>
  );
}

export function WordAnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div style={{ display: "flex", gap: "0.3rem" }}>
        <Bone width="4.6rem" height="2.2rem" radius="0.5rem" />
        <Bone width="3.2rem" height="2.2rem" radius="0.5rem" />
        <Bone width="3.7rem" height="2.2rem" radius="0.5rem" />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", gap: "0.65rem" }}>
            <Bone
              width="0.55rem"
              height="0.55rem"
              radius="999px"
              style={{ marginTop: "0.4rem", flexShrink: 0 }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                flex: 1,
              }}
            >
              <Bone width="55%" height="0.9rem" />
              <Bone width="85%" height="0.8rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hoisted and rendered once by KaraokePlayer (same reasoning as
// MATCH_CARD_STYLES: N skeleton instances shouldn't inject N copies of the
// same rules). The pulse is a slow, gentle opacity breathe — not a hard
// blink — matching the "soft, minimal" brief; `paqocha-reveal-fade` is the
// shared one-shot fade/rise used wherever skeleton content is replaced by
// the real thing, played once on mount since each of those only ever
// mounts right when it's ready to replace its skeleton.
export const SKELETON_STYLES = `
  @keyframes paqocha-skeleton-pulse {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 1; }
  }

  .paqocha-skeleton-bone {
    animation: paqocha-skeleton-pulse 1.6s ease-in-out infinite;
  }

  @keyframes paqocha-reveal-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .paqocha-reveal-fade {
    animation: paqocha-reveal-in 420ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .paqocha-skeleton-bone {
      animation: none;
      opacity: 0.75;
    }

    .paqocha-reveal-fade {
      animation: none;
    }
  }
`;
