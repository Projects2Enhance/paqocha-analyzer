import type React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE_OUT_EXPO, fontFamily } from "../theme";

const easeOut = Easing.bezier(...EASE_OUT_EXPO);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Props = {
  text: string;
  // Scene frames. `enter` null = fully visible from the first frame.
  enter: number | null;
  exit?: number;
  size?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
  // Words to underline (exact match), with the underline color.
  marks?: Record<string, string>;
  align?: "center" | "left";
};

// Word-by-word rise + blur-to-focus — the same entrance as the app's hero
// tagline, compressed to ~0.7s per word with a 3-frame stagger.
export const Headline: React.FC<Props> = ({
  text,
  enter,
  exit,
  size = 84,
  weight = 800,
  color = C.cream,
  style,
  marks = {},
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const inDur = Math.round(0.7 * fps);

  const out =
    exit == null ? 0 : interpolate(frame, [exit - 8, exit], [0, 1], clamp);
  if (exit != null && frame >= exit) return null;
  if (enter != null && frame < enter) return null;

  return (
    <div
      style={{
        fontFamily,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.1,
        letterSpacing: "-0.01em",
        color,
        textAlign: align,
        textWrap: "balance",
        opacity: 1 - out,
        filter: `blur(${out * 8}px)`,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const start = enter == null ? -1e9 : enter + i * 3;
        const p = easeOut(
          interpolate(frame, [start, start + inDur], [0, 1], clamp),
        );
        const mark = marks[w];
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: i < words.length - 1 ? "0.26em" : 0,
              opacity: p,
              translate: `0px ${(1 - p) * 36}px`,
              filter: `blur(${(1 - p) * 16}px)`,
              position: "relative",
            }}
          >
            {w}
            {mark ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "-0.06em",
                  height: "0.11em",
                  borderRadius: 999,
                  background: mark,
                  width: `${100 * easeOut(interpolate(frame, [start + 10, start + 26], [0, 1], clamp))}%`,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
