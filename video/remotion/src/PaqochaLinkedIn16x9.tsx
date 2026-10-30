import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { blurFade } from "./components/BlurFade";
import { Headline } from "./components/Headline";
import { MorphemeRow } from "./components/MorphemeRow";
import type { Move } from "./components/Shot";
import timing from "./data/timing-16x9.json";
import takes16x9 from "./data/takes-16x9.json";
import { type Format, FormatProvider } from "./format";
import { CardScene, EndCard, FullScene, Voice } from "./scenes/scenes";
import { C, fontFamily } from "./theme";
import { SCENES, START, TOTAL_FRAMES, TRANSITIONS } from "./timeline";

// Same scene lengths, captions timing and music as the 4:5 cut; only the
// framing changes: full-bleed hero at 1280x720, and the app's desktop
// two-column layout (1100x932) in a card right of a text column.
const FORMAT_16X9: Format = {
  takes: takes16x9,
  takesDir: "takes-16x9",
  frame: { width: 1920, height: 1080 },
  card: { left: 760, top: 74, width: 1100, height: 932 },
};

// Take C's audio started almost with the first frame, so its anchored in-point
// fell before the recording began; 0.2s is the first frame with content.
const TRIM = { ...timing.trim, player: Math.max(timing.trim.player, 0.2) };
const VOICE = timing.voice;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const t = (frames: number) => linearTiming({ durationInFrames: frames });
// Camera moves written relative to a scene's in-point (seconds).
const rel = (trim: number, moves: Move[]): Move[] =>
  moves.map((m) => ({ ...m, at: trim + m.at }));

const TRANSCRIPT = { z: 1.6, cx: 374, cy: 250 };
// Left edge lands in the gutter between transcript (ends x=711) and sidebar.
const ANALYSIS = { z: 2.85, cx: 908, cy: 320 };

// Text column left of the card.
const Column: React.FC<{
  from: number;
  to: number;
  name: string;
  children: React.ReactNode;
}> = ({ from, to, name, children }) => (
  <Sequence name={name} from={from} durationInFrames={to - from} layout="none">
    <AbsoluteFill
      style={{
        left: 100,
        width: 600,
        right: "auto",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {children}
    </AbsoluteFill>
  </Sequence>
);

const Captions: React.FC = () => {
  const p = START.player;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sequence name="Hook" durationInFrames={START.tagline + 8} layout="none">
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 120,
          }}
        >
          <Headline
            text="Paqocha Analyzer · Quechua de Puno"
            enter={null}
            exit={START.tagline + 8}
            size={44}
            weight={700}
            style={{ opacity: 0.85, marginBottom: 36 }}
          />
          <Headline
            text="¿Cómo suena el quechua de verdad?"
            enter={null}
            exit={START.tagline + 8}
            size={112}
            style={{ maxWidth: 1300 }}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence
        name="Search caption"
        from={START.search + 42}
        durationInFrames={p + 6 - START.search - 42}
        layout="none"
      >
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 110,
          }}
        >
          <Headline
            text="Busca una palabra en quechua."
            enter={0}
            exit={p + 6 - START.search - 42}
            size={84}
          />
        </AbsoluteFill>
      </Sequence>

      <Column name="Listen" from={p + 6} to={p + 84}>
        <Headline
          text="Escúchala en voces reales."
          enter={0}
          exit={78}
          align="left"
        />
      </Column>
      <Column name="Synced" from={p + 88} to={p + 168}>
        <Headline
          text="Sincronizada palabra por palabra."
          enter={0}
          exit={80}
          align="left"
        />
      </Column>
      <Column name="sunquyta breakdown" from={p + 210} to={p + 300}>
        <MorphemeRow
          vertical
          exit={90}
          items={[
            { text: "sunqu", gloss: "corazón", kind: "root", at: 0 },
            { text: "-y", gloss: "mi", kind: "suffix", at: 18 },
            { text: "-ta", gloss: "objeto directo", kind: "suffix", at: 36 },
          ]}
        />
      </Column>
      <Column name="Structure" from={p + 304} to={START.listA + 16}>
        <Headline
          text="Una palabra. Toda su estructura."
          enter={0}
          exit={START.listA + 16 - p - 304}
          align="left"
        />
      </Column>
      <Column name="Recordings" from={START.listA + 22} to={START.listB + 10}>
        <Headline
          text="14 grabaciones de sunquyta"
          enter={0}
          exit={START.listB + 10 - START.listA - 22}
          marks={{ sunquyta: C.lime }}
          align="left"
        />
      </Column>
      <Column name="Voices" from={START.listB + 14} to={START.suffixA + 6}>
        <Headline
          text="Distintas voces, distintos pueblos."
          enter={0}
          exit={START.suffixA + 6 - START.listB - 14}
          align="left"
        />
      </Column>
      <Column
        name="Search again"
        from={START.suffixA + 8}
        to={START.suffixB + 8}
      >
        <Headline
          text="Busca otra palabra."
          enter={0}
          exit={START.suffixB + 8 - START.suffixA - 8}
          align="left"
        />
      </Column>
      <Column name="Stacking" from={START.suffixB + 10} to={START.suffixC + 18}>
        <Headline
          text="Los sufijos se apilan."
          enter={0}
          exit={START.suffixC + 18 - START.suffixB - 10}
          align="left"
        />
      </Column>
      <Column
        name="llaqtakunapi breakdown"
        from={START.suffixC + 20}
        to={START.dark + 6}
      >
        <MorphemeRow
          vertical
          exit={START.dark + 6 - START.suffixC - 20}
          items={[
            { text: "llaqta", gloss: "pueblo", kind: "root", at: 0 },
            { text: "-kuna", gloss: "plural", kind: "suffix", at: 14 },
            { text: "-pi", gloss: "en", kind: "suffix", at: 28 },
          ]}
        />
      </Column>
      <Column name="Dark mode" from={START.dark + 10} to={START.end + 4}>
        <Headline
          text="De día o de noche."
          enter={0}
          exit={START.end + 4 - START.dark - 10}
          align="left"
        />
      </Column>
    </AbsoluteFill>
  );
};

const duckWindows = [
  [
    START.player + (VOICE.player.takeAt - TRIM.player) * 30,
    START.player + (VOICE.player.stopTakeAt - TRIM.player) * 30,
  ],
  [
    START.listB + (VOICE.listB.takeAt - TRIM.listB) * 30,
    START.listB + SCENES.listB,
  ],
];

const musicVolume = (f: number) => {
  let duck = 0;
  for (const [a, b] of duckWindows)
    duck = Math.max(
      duck,
      interpolate(f, [a - 8, a, b, b + 10], [0, 1, 1, 0], clamp),
    );
  return 0.62 * (1 - 0.62 * duck);
};

export const PaqochaLinkedIn16x9: React.FC = () => (
  <FormatProvider value={FORMAT_16X9}>
    <AbsoluteFill style={{ background: C.periwinkle, fontFamily }}>
      <TransitionSeries name="Shots">
        <TransitionSeries.Sequence name="Hook" durationInFrames={SCENES.hook}>
          <FullScene
            take="A"
            trim={TRIM.hook}
            veil={0.5}
            blur={18}
            moves={rel(TRIM.hook, [
              { at: 0, dur: 2.8, z: 1.08, cx: 640, cy: 340 },
            ])}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={blurFade()}
          timing={t(TRANSITIONS.hookToTagline)}
        />

        <TransitionSeries.Sequence
          name="Tagline"
          durationInFrames={SCENES.tagline}
        >
          <FullScene
            take="A"
            trim={TRIM.tagline}
            moves={rel(TRIM.tagline, [
              { at: 0, dur: 3.6, z: 1.05, cx: 640, cy: 340 },
            ])}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={blurFade()}
          timing={t(TRANSITIONS.taglineToSearch)}
        />

        <TransitionSeries.Sequence
          name="Search"
          durationInFrames={SCENES.search}
        >
          <FullScene
            take="B"
            trim={TRIM.search}
            cursor
            moves={rel(TRIM.search, [
              { at: 1.15, dur: 0.9, z: 1.25, cx: 640, cy: 0 },
            ])}
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(to top, rgba(31,33,80,0.55), rgba(31,33,80,0) 40%)",
            }}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={blurFade()}
          timing={t(TRANSITIONS.searchToPlayer)}
        />

        <TransitionSeries.Sequence
          name="Player: listen + analyze"
          durationInFrames={SCENES.player}
        >
          <CardScene
            take="C"
            trim={TRIM.player}
            moves={rel(TRIM.player, [
              { at: 0.7, dur: 0.8, ...TRANSCRIPT },
              { at: 3.25, dur: 0.8, z: 1, cx: 550, cy: 466 },
              { at: 6.58, dur: 0.9, ...ANALYSIS },
              { at: 9.6, dur: 2.0, z: 1.45, cx: 640, cy: 330 },
            ])}
          >
            <Voice
              {...VOICE.player}
              trim={TRIM.player}
              sceneFrames={SCENES.player}
            />
          </CardScene>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={t(TRANSITIONS.playerToList)}
        />

        <TransitionSeries.Sequence name="List" durationInFrames={SCENES.listA}>
          <CardScene
            take="D"
            trim={TRIM.listA}
            moves={rel(TRIM.listA, [
              { at: 0.75, dur: 0.8, z: 1.35, cx: 700, cy: 420 },
            ])}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={t(TRANSITIONS.listAToListB)}
        />

        <TransitionSeries.Sequence
          name="Second voice"
          durationInFrames={SCENES.listB}
        >
          <CardScene
            take="D"
            trim={TRIM.listB}
            moves={rel(TRIM.listB, [
              { at: 0, dur: 0.01, z: 1.35, cx: 700, cy: 420 },
              { at: 0.65, dur: 0.9, ...TRANSCRIPT },
            ])}
          >
            <Voice
              {...VOICE.listB}
              trim={TRIM.listB}
              sceneFrames={SCENES.listB}
              fadeOutFrames={TRANSITIONS.listToSuffix}
            />
          </CardScene>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={t(TRANSITIONS.listToSuffix)}
        />

        <TransitionSeries.Sequence
          name="Search again"
          durationInFrames={SCENES.suffixA}
        >
          <CardScene
            take="E"
            trim={TRIM.suffixA}
            moves={rel(TRIM.suffixA, [
              { at: 0, dur: 0.01, z: 1.5, cx: 550, cy: 0 },
              { at: 1.15, dur: 0.5, z: 1, cx: 550, cy: 466 },
            ])}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={t(TRANSITIONS.suffixAToB)}
        />

        <TransitionSeries.Sequence
          name="llaqtakunapi karaoke"
          durationInFrames={SCENES.suffixB}
        >
          <CardScene
            take="E"
            trim={TRIM.suffixB}
            moves={rel(TRIM.suffixB, [{ at: 0, dur: 0.01, ...TRANSCRIPT }])}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={t(TRANSITIONS.suffixBToC)}
        />

        <TransitionSeries.Sequence
          name="llaqtakunapi analysis"
          durationInFrames={SCENES.suffixC}
        >
          <CardScene
            take="E"
            trim={TRIM.suffixC}
            moves={rel(TRIM.suffixC, [
              { at: 0, dur: 0.01, ...TRANSCRIPT },
              { at: 0.45, dur: 0.9, ...ANALYSIS },
            ])}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={t(TRANSITIONS.suffixToDark)}
        />

        <TransitionSeries.Sequence
          name="Dark mode"
          durationInFrames={SCENES.dark}
        >
          <CardScene take="F" trim={TRIM.dark} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={t(TRANSITIONS.darkToEnd)}
        />

        <TransitionSeries.Sequence
          name="End card"
          durationInFrames={SCENES.end}
        >
          <EndCard wide />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Captions />

      <Audio
        name="Music"
        src={staticFile("music.wav")}
        durationInFrames={TOTAL_FRAMES}
        volume={musicVolume}
      />
    </AbsoluteFill>
  </FormatProvider>
);
