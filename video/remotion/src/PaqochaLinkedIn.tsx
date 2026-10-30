import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { blurFade } from "./components/BlurFade";
import { Headline } from "./components/Headline";
import { MorphemeRow } from "./components/MorphemeRow";
import { CardScene, EndCard, FullScene, Voice } from "./scenes/scenes";
import { C, CARD, fontFamily } from "./theme";
import { SCENES, START, TOTAL_FRAMES, TRANSITIONS, TRIM, VOICE } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const t = (frames: number) => linearTiming({ durationInFrames: frames });

// Text band above the app card (y 0..CARD.top), centered in its safe area.
const Band: React.FC<{ from: number; to: number; name: string; children: React.ReactNode }> = ({
  from,
  to,
  name,
  children,
}) => (
  <Sequence name={name} from={from} durationInFrames={to - from} layout="none">
    <AbsoluteFill
      style={{
        top: 96,
        height: CARD.top - 96 - 28,
        bottom: "auto",
        paddingLeft: 80,
        paddingRight: 80,
        alignItems: "center",
        justifyContent: "center",
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
      {/* Hook: legible from frame 0 (LinkedIn uses it as the thumbnail). */}
      <Sequence name="Hook" durationInFrames={START.tagline + 8} layout="none">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
          <Headline
            text="Paqocha Analyzer · Quechua de Puno"
            enter={null}
            exit={START.tagline + 8}
            size={44}
            weight={700}
            style={{ opacity: 0.85, marginBottom: 36 }}
          />
          <Headline text="¿Cómo suena el quechua de verdad?" enter={null} exit={START.tagline + 8} size={104} />
        </AbsoluteFill>
      </Sequence>

      {/* Starts once the pill is open and the hero behind it is blurred, so
          it never sits on top of the app's own tagline. */}
      <Sequence name="Search caption" from={START.search + 42} durationInFrames={p + 6 - START.search - 42} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150, paddingLeft: 80, paddingRight: 80 }}>
          <Headline text="Busca una palabra en quechua." enter={0} exit={p + 6 - START.search - 42} size={84} />
        </AbsoluteFill>
      </Sequence>

      <Band name="Listen" from={p + 6} to={p + 84}>
        <Headline text="Escúchala en voces reales." enter={0} exit={78} />
      </Band>
      <Band name="Synced" from={p + 88} to={p + 168}>
        <Headline text="Sincronizada palabra por palabra." enter={0} exit={80} size={80} />
      </Band>
      <Band name="sunquyta breakdown" from={p + 210} to={p + 300}>
        <MorphemeRow
          exit={90}
          items={[
            { text: "sunqu", gloss: "corazón", kind: "root", at: 0 },
            { text: "-y", gloss: "mi", kind: "suffix", at: 18 },
            { text: "-ta", gloss: "objeto directo", kind: "suffix", at: 36 },
          ]}
        />
      </Band>
      <Band name="Structure" from={p + 304} to={START.listA + 16}>
        <Headline text="Una palabra. Toda su estructura." enter={0} exit={START.listA + 16 - p - 304} />
      </Band>
      <Band name="Recordings" from={START.listA + 22} to={START.listB + 10}>
        <Headline
          text="14 grabaciones de sunquyta"
          enter={0}
          exit={START.listB + 10 - START.listA - 22}
          marks={{ sunquyta: C.lime }}
        />
      </Band>
      <Band name="Voices" from={START.listB + 14} to={START.suffixA + 6}>
        <Headline text="Distintas voces, distintos pueblos." enter={0} exit={START.suffixA + 6 - START.listB - 14} />
      </Band>
      <Band name="Search again" from={START.suffixA + 8} to={START.suffixB + 8}>
        <Headline text="Busca otra palabra." enter={0} exit={START.suffixB + 8 - START.suffixA - 8} />
      </Band>
      <Band name="Stacking" from={START.suffixB + 10} to={START.suffixC + 18}>
        <Headline text="Los sufijos se apilan." enter={0} exit={START.suffixC + 18 - START.suffixB - 10} />
      </Band>
      <Band name="llaqtakunapi breakdown" from={START.suffixC + 20} to={START.dark + 6}>
        <MorphemeRow
          exit={START.dark + 6 - START.suffixC - 20}
          items={[
            { text: "llaqta", gloss: "pueblo", kind: "root", at: 0 },
            { text: "-kuna", gloss: "plural", kind: "suffix", at: 14 },
            { text: "-pi", gloss: "en", kind: "suffix", at: 28 },
          ]}
        />
      </Band>
      <Band name="Dark mode" from={START.dark + 10} to={START.end + 4}>
        <Headline text="De día o de noche." enter={0} exit={START.end + 4 - START.dark - 10} />
      </Band>
    </AbsoluteFill>
  );
};

// Music ducks under the speakers' voices (frames from VOICE + START).
const duckWindows = (() => {
  const v1 = VOICE.player;
  const v2 = VOICE.listB;
  return [
    [START.player + (v1.takeAt - TRIM.player) * 30, START.player + (v1.stopTakeAt - TRIM.player) * 30],
    [START.listB + (v2.takeAt - TRIM.listB) * 30, START.listB + SCENES.listB],
  ];
})();

const musicVolume = (f: number) => {
  let duck = 0;
  for (const [a, b] of duckWindows) duck = Math.max(duck, interpolate(f, [a - 8, a, b, b + 10], [0, 1, 1, 0], clamp));
  const base = 0.62;
  return base * (1 - 0.62 * duck);
};

export const PaqochaLinkedIn: React.FC = () => (
  <AbsoluteFill style={{ background: C.periwinkle, fontFamily }}>
    <TransitionSeries name="Shots">
      <TransitionSeries.Sequence name="Hook" durationInFrames={SCENES.hook}>
        <FullScene take="A" trim={TRIM.hook} veil={0.5} blur={18} moves={[{ at: 4.5, dur: 2.8, z: 1.08, cx: 432, cy: 520 }]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={blurFade()} timing={t(TRANSITIONS.hookToTagline)} />

      <TransitionSeries.Sequence name="Tagline" durationInFrames={SCENES.tagline}>
        <FullScene take="A" trim={TRIM.tagline} moves={[{ at: 0.65, dur: 3.6, z: 1.05, cx: 432, cy: 520 }]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={blurFade()} timing={t(TRANSITIONS.taglineToSearch)} />

      <TransitionSeries.Sequence name="Search" durationInFrames={SCENES.search}>
        <FullScene take="B" trim={TRIM.search} cursor moves={[{ at: 4.85, dur: 0.9, z: 1.25, cx: 432, cy: 300 }]} />
        <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(31,33,80,0.55), rgba(31,33,80,0) 38%)" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={blurFade()} timing={t(TRANSITIONS.searchToPlayer)} />

      <TransitionSeries.Sequence name="Player: listen + analyze" durationInFrames={SCENES.player}>
        <CardScene
          take="C"
          trim={TRIM.player}
          moves={[
            { at: 2.0, dur: 0.8, z: 1.6, cx: 270, cy: 190 },
            { at: 3.0, dur: 1.5, z: 1.6, cx: 520, cy: 190 },
            { at: 4.6, dur: 0.8, z: 1, cx: 400, cy: 389 },
            { at: 7.95, dur: 0.9, z: 1.5, cx: 300, cy: 640 },
            { at: 10.6, dur: 2.0, z: 1.32, cx: 330, cy: 600 },
          ]}
        >
          <Voice {...VOICE.player} trim={TRIM.player} sceneFrames={SCENES.player} />
        </CardScene>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t(TRANSITIONS.playerToList)} />

      <TransitionSeries.Sequence name="List" durationInFrames={SCENES.listA}>
        <CardScene take="D" trim={TRIM.listA} moves={[{ at: 3.0, dur: 0.8, z: 1.1, cx: 400, cy: 560 }]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t(TRANSITIONS.listAToListB)} />

      <TransitionSeries.Sequence name="Second voice" durationInFrames={SCENES.listB}>
        <CardScene
          take="D"
          trim={TRIM.listB}
          moves={[
            { at: 10.1, dur: 0.01, z: 1.1, cx: 400, cy: 560 },
            { at: 10.75, dur: 0.9, z: 1.55, cx: 290, cy: 230 },
          ]}
        >
          <Voice {...VOICE.listB} trim={TRIM.listB} sceneFrames={SCENES.listB} fadeOutFrames={TRANSITIONS.listToSuffix} />
        </CardScene>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t(TRANSITIONS.listToSuffix)} />

      <TransitionSeries.Sequence name="Search again" durationInFrames={SCENES.suffixA}>
        <CardScene
          take="E"
          trim={TRIM.suffixA}
          moves={[
            { at: 4.8, dur: 0.01, z: 1.35, cx: 400, cy: 0 },
            { at: 5.95, dur: 0.5, z: 1, cx: 400, cy: 389 },
          ]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t(TRANSITIONS.suffixAToB)} />

      <TransitionSeries.Sequence name="llaqtakunapi karaoke" durationInFrames={SCENES.suffixB}>
        <CardScene take="E" trim={TRIM.suffixB} moves={[{ at: 8.3, dur: 0.01, z: 1.6, cx: 250, cy: 259 }]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t(TRANSITIONS.suffixBToC)} />

      <TransitionSeries.Sequence name="llaqtakunapi analysis" durationInFrames={SCENES.suffixC}>
        <CardScene
          take="E"
          trim={TRIM.suffixC}
          moves={[
            { at: 11.0, dur: 0.01, z: 1.6, cx: 250, cy: 259 },
            { at: 11.45, dur: 0.9, z: 1.5, cx: 300, cy: 640 },
          ]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t(TRANSITIONS.suffixToDark)} />

      <TransitionSeries.Sequence name="Dark mode" durationInFrames={SCENES.dark}>
        <CardScene take="F" trim={TRIM.dark} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={t(TRANSITIONS.darkToEnd)} />

      <TransitionSeries.Sequence name="End card" durationInFrames={SCENES.end}>
        <EndCard />
      </TransitionSeries.Sequence>
    </TransitionSeries>

    <Captions />

    <Audio name="Music" src={staticFile("music.wav")} durationInFrames={TOTAL_FRAMES} volume={musicVolume} />
  </AbsoluteFill>
);
