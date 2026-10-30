import type React from "react";
import type { TakeData } from "../format";
import { C } from "../theme";

const PULSE_MS = 320;

function positionAt(data: TakeData, ms: number) {
  const { cursor, start } = data;
  if (cursor.length === 0 || ms <= cursor[0][0]) return start;
  let lo = 0;
  let hi = cursor.length - 1;
  if (ms >= cursor[hi][0]) return { x: cursor[hi][1], y: cursor[hi][2] };
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cursor[mid][0] <= ms) lo = mid;
    else hi = mid;
  }
  const [t0, x0, y0] = cursor[lo];
  const [t1, x1, y1] = cursor[hi];
  const p = (ms - t0) / Math.max(1, t1 - t0);
  return { x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p };
}

// Minimal pointer drawn from the recorded mouse path (the headless capture
// has no OS cursor). Lives inside the camera layer; counter-scaled so it
// keeps a constant on-screen size while the camera zooms.
export const Cursor: React.FC<{
  data: TakeData;
  timeMs: number;
  scale: number;
  zoom: number;
}> = ({ data, timeMs, scale, zoom }) => {
  const { x, y } = positionAt(data, timeMs);
  const click = data.clicks.find((c) => timeMs >= c && timeMs - c < PULSE_MS);
  const press = data.clicks.some((c) => Math.abs(timeMs - c) < 90);
  const p = click == null ? 1 : (timeMs - click) / PULSE_MS;

  return (
    <div
      style={{
        position: "absolute",
        left: x * scale,
        top: y * scale,
        width: 0,
        height: 0,
        scale: String(1 / zoom),
        transformOrigin: "0 0",
        pointerEvents: "none",
      }}
    >
      {click != null ? (
        <div
          style={{
            position: "absolute",
            left: -40,
            top: -40,
            width: 80,
            height: 80,
            borderRadius: 999,
            border: `5px solid ${C.periwinkleLight}`,
            opacity: 0.85 * (1 - p),
            scale: String(0.3 + 0.9 * p),
          }}
        />
      ) : null}
      <svg
        width={40}
        height={40}
        viewBox="0 0 28 28"
        style={{
          position: "absolute",
          left: -5,
          top: -3,
          scale: press ? "0.86" : "1",
          transformOrigin: "5px 3px",
          filter: "drop-shadow(0 3px 6px rgba(31,33,80,0.35))",
        }}
      >
        <path
          d="M5 3 L5 22 L10.2 17.4 L13.6 25 L17 23.5 L13.7 16 L20.5 15.6 Z"
          fill={C.ink}
          stroke={C.cream}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
