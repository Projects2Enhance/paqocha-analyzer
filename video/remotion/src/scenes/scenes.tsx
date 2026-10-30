import { Audio } from "@remotion/media";
import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Headline } from "../components/Headline";
import { type Move, Shot, type TakeId } from "../components/Shot";
import { useFormat } from "../format";
import { C, EASE_OUT_EXPO, fontFamily } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Full-bleed take (hero/search, recorded at the 4:5 HERO viewport).
export const FullScene: React.FC<{
  take: TakeId;
  trim: number;
  moves?: Move[];
  cursor?: boolean;
  veil?: number;
  blur?: number;
}> = ({ take, trim, moves, cursor = false, veil = 0, blur = 0 }) => {
  const { frame } = useFormat();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Shot
        take={take}
        trim={trim}
        box={{ left: 0, top: 0, ...frame }}
        moves={moves}
        cursor={cursor}
        videoStyle={
          blur ? { filter: `blur(${blur}px)`, scale: "1.12" } : undefined
        }
      />
      {veil ? (
        <AbsoluteFill style={{ background: `rgba(31, 33, 80, ${veil})` }} />
      ) : null}
    </AbsoluteFill>
  );
};

// App card on the periwinkle stage; the text band above it is drawn by the
// global caption layer so it stays put across cuts.
export const CardScene: React.FC<{
  take: TakeId;
  trim: number;
  moves?: Move[];
  children?: React.ReactNode;
}> = ({ take, trim, moves, children }) => {
  const { card } = useFormat();
  return (
    <AbsoluteFill style={{ background: C.periwinkle }}>
      <Shot
        take={take}
        trim={trim}
        box={card}
        moves={moves}
        radius={32}
        shadow="0 28px 70px rgba(31, 33, 80, 0.35)"
      />
      {children}
    </AbsoluteFill>
  );
};

// Speaker voice, placed so the clip's audio clock matches the recording.
export const Voice: React.FC<{
  src: string;
  trim: number;
  audioAt: number;
  takeAt: number;
  stopTakeAt?: number;
  sceneFrames: number;
  fadeOutFrames?: number;
}> = ({
  src,
  trim,
  audioAt,
  takeAt,
  stopTakeAt,
  sceneFrames,
  fadeOutFrames = 4,
}) => {
  const { fps } = useVideoConfig();
  const from = Math.round((takeAt - trim) * fps);
  const end =
    stopTakeAt == null ? sceneFrames : Math.round((stopTakeAt - trim) * fps);
  const dur = end - from;
  return (
    <Audio
      name="Speaker voice"
      src={staticFile(src)}
      from={from}
      trimBefore={Math.round(audioAt * fps)}
      durationInFrames={dur}
      volume={(f) =>
        interpolate(f, [0, 4, dur - fadeOutFrames, dur], [0, 1, 1, 0], clamp)
      }
    />
  );
};

const easeOut = Easing.bezier(...EASE_OUT_EXPO);

const Rise: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, children, style }) => {
  const frame = useCurrentFrame();
  const p = easeOut(interpolate(frame, [at, at + 21], [0, 1], clamp));
  return (
    <div
      style={{
        opacity: p,
        translate: `0px ${(1 - p) * 36}px`,
        filter: `blur(${(1 - p) * 16}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// `wide`: 16:9 layout — tagline on one line.
export const EndCard: React.FC<{ wide?: boolean }> = ({ wide = false }) => {
  const frame = useCurrentFrame();
  const logo = easeOut(interpolate(frame, [0, 22], [0, 1], clamp));
  const url = easeOut(interpolate(frame, [76, 96], [0, 1], clamp));
  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        color: C.cream,
        textAlign: "center",
      }}
    >
      <Img
        src={staticFile("icon.png")}
        style={{
          width: 168,
          height: 168,
          borderRadius: 40,
          opacity: logo,
          scale: String(0.9 + 0.1 * logo),
        }}
      />
      {wide ? (
        <div style={{ marginTop: 44 }}>
          <Headline text="Escucha. Analiza. Entiende." enter={10} size={112} />
        </div>
      ) : (
        <div style={{ marginTop: 56 }}>
          <Headline text="Escucha." enter={10} size={118} />
          <Headline text="Analiza." enter={18} size={118} />
          <Headline text="Entiende." enter={26} size={118} />
        </div>
      )}
      <Rise
        at={50}
        style={{
          marginTop: wide ? 48 : 64,
          fontSize: 42,
          fontWeight: 600,
          opacity: 0.9,
        }}
      >
        1222 audios reales · 7541 palabras
      </Rise>
      <Rise at={58} style={{ marginTop: 12, fontSize: 42, fontWeight: 600 }}>
        Quechua de Puno · Abierto y sin registro
      </Rise>
      <div
        style={{
          marginTop: wide ? 56 : 72,
          fontSize: 50,
          fontWeight: 800,
          color: C.periwinkleLight,
          opacity: url,
          translate: `0px ${(1 - url) * 24}px`,
          position: "relative",
        }}
      >
        paqocha-analyzer.vercel.app
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: -10,
            height: 8,
            borderRadius: 999,
            background: C.lime,
            width: `${100 * easeOut(interpolate(frame, [90, 110], [0, 1], clamp))}%`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
