import type React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_OUT_EXPO, fontFamily } from "../theme";

const easeOut = Easing.bezier(...EASE_OUT_EXPO);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Morpheme = {
  text: string;
  gloss: string;
  kind: "root" | "suffix";
  at: number;
};

// The app's own breakdown, restated large: root underlined in cream, suffixes
// in lime (the app's suffix color). Glosses are condensed from the app's own
// analysis text, never invented.
export const MorphemeRow: React.FC<{
  items: Morpheme[];
  exit?: number;
  vertical?: boolean;
}> = ({ items, exit, vertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inDur = Math.round(0.7 * fps);
  const out =
    exit == null ? 0 : interpolate(frame, [exit - 8, exit], [0, 1], clamp);
  if (exit != null && frame >= exit) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: vertical ? 22 : 28,
        fontFamily,
        color: C.cream,
        opacity: 1 - out,
        filter: `blur(${out * 8}px)`,
      }}
    >
      {items.map((m, i) => {
        const p = easeOut(
          interpolate(frame, [m.at, m.at + inDur], [0, 1], clamp),
        );
        const line = easeOut(
          interpolate(frame, [m.at + 8, m.at + 24], [0, 1], clamp),
        );
        return (
          <div
            key={m.text}
            style={{ display: "flex", alignItems: "flex-start", gap: 28 }}
          >
            {i > 0 && !vertical ? (
              <span
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  opacity: 0.55 * p,
                  lineHeight: 1.15,
                }}
              >
                +
              </span>
            ) : null}
            <div
              style={{
                display: "flex",
                flexDirection: vertical ? "row" : "column",
                alignItems: vertical ? "baseline" : "center",
                gap: vertical ? 28 : 0,
                opacity: p,
                translate: `0px ${(1 - p) * 36}px`,
                filter: `blur(${(1 - p) * 16}px)`,
              }}
            >
              <span
                style={{
                  fontSize: 92,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  position: "relative",
                }}
              >
                {m.text}
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -4,
                    height: 10,
                    borderRadius: 999,
                    width: `${line * 100}%`,
                    background: m.kind === "root" ? C.cream : C.lime,
                  }}
                />
              </span>
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 600,
                  marginTop: vertical ? 0 : 18,
                  opacity: 0.9,
                }}
              >
                {m.gloss}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
