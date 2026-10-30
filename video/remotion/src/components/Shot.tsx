import { Video } from "@remotion/media";
import type React from "react";
import { Easing, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFormat } from "../format";
import { C, EASE_IN_OUT } from "../theme";
import { Cursor } from "./Cursor";

export type TakeId = "A" | "B" | "C" | "D" | "E" | "F";

// A camera move, in take-seconds: from `at`, ease over `dur` to zoom `z`
// centered on (cx, cy) in the take's CSS px.
export type Move = {
  at: number;
  dur: number;
  z: number;
  cx: number;
  cy: number;
};

type Props = {
  take: TakeId;
  trim: number;
  box: { left: number; top: number; width: number; height: number };
  moves?: Move[];
  cursor?: boolean;
  radius?: number;
  shadow?: string;
  videoStyle?: React.CSSProperties;
};

const ease = Easing.bezier(...EASE_IN_OUT);

function cameraAt(t: number, vw: number, vh: number, moves: Move[]) {
  let z = 1;
  let cx = vw / 2;
  let cy = vh / 2;
  for (const m of moves) {
    const p = ease(Math.min(1, Math.max(0, (t - m.at) / m.dur)));
    if (p <= 0) break;
    // Zoom interpolates in log space so it reads as constant-speed.
    z = Math.exp(Math.log(z) + (Math.log(m.z) - Math.log(z)) * p);
    cx += (m.cx - cx) * p;
    cy += (m.cy - cy) * p;
  }
  const hw = vw / (2 * z);
  const hh = vh / (2 * z);
  cx = Math.min(Math.max(cx, hw), vw - hw);
  cy = Math.min(Math.max(cy, hh), vh - hh);
  return { z, cx, cy };
}

// One recorded take, framed into `box`, with a virtual camera and the
// recorded cursor. Everything app-related comes from the recording itself.
export const Shot: React.FC<Props> = ({
  take,
  trim,
  box,
  moves = [],
  cursor = true,
  radius = 0,
  shadow,
  videoStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { takes, takesDir } = useFormat();
  const trimFrames = Math.round(trim * fps);
  const t = (trimFrames + frame) / fps;

  const { viewport } = takes[take];
  const s = box.width / viewport.width;
  const { z, cx, cy } = cameraAt(t, viewport.width, viewport.height, moves);

  return (
    <div
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        overflow: "hidden",
        borderRadius: radius,
        boxShadow: shadow,
        background: C.bg,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: viewport.width * s,
          height: viewport.height * s,
          transformOrigin: "0 0",
          translate: `${box.width / 2 - cx * s * z}px ${box.height / 2 - cy * s * z}px`,
          scale: String(z),
        }}
      >
        <Video
          src={staticFile(`${takesDir}/take-${take}.mp4`)}
          trimBefore={trimFrames}
          muted
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            ...videoStyle,
          }}
        />
        {cursor ? (
          <Cursor data={takes[take]} timeMs={t * 1000} scale={s} zoom={z} />
        ) : null}
      </div>
    </div>
  );
};
