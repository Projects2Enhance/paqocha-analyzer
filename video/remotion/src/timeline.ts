// Single source of truth for scene lengths and cuts (30 fps). The music
// generator (video/music/generate-music.mjs) reads the same cue times, so
// change both together if the edit changes.
export const FPS = 30;

export const SCENES = {
  hook: 84,
  tagline: 105,
  search: 128,
  player: 351,
  listA: 111,
  listB: 126,
  suffixA: 45,
  suffixB: 40,
  suffixC: 84,
  dark: 66,
  end: 135,
} as const;

export const TRANSITIONS = {
  hookToTagline: 10,
  taglineToSearch: 10,
  searchToPlayer: 14,
  playerToList: 10,
  listAToListB: 8,
  listToSuffix: 10,
  suffixAToB: 6,
  suffixBToC: 6,
  suffixToDark: 8,
  darkToEnd: 12,
} as const;

const order = [
  ["hook", "hookToTagline"],
  ["tagline", "taglineToSearch"],
  ["search", "searchToPlayer"],
  ["player", "playerToList"],
  ["listA", "listAToListB"],
  ["listB", "listToSuffix"],
  ["suffixA", "suffixAToB"],
  ["suffixB", "suffixBToC"],
  ["suffixC", "suffixToDark"],
  ["dark", "darkToEnd"],
  ["end", null],
] as const;

export const START: Record<keyof typeof SCENES, number> = (() => {
  const out = {} as Record<keyof typeof SCENES, number>;
  let at = 0;
  for (const [scene, transition] of order) {
    out[scene] = at;
    at += SCENES[scene] - (transition ? TRANSITIONS[transition] : 0);
  }
  return out;
})();

export const TOTAL_FRAMES = START.end + SCENES.end;

// Source in-points (seconds into each take) — see video/recording/events.json.
export const TRIM = {
  hook: 4.5,
  tagline: 0.65,
  search: 3.7,
  player: 1.0,
  listA: 2.3,
  listB: 10.1,
  suffixA: 4.8,
  suffixB: 8.3,
  suffixC: 11.0,
  dark: 4.7,
} as const;

// Voice sync, measured from the audio clock samples in events.json:
// take time (s) at which the app's <audio> was at audio time `audioAt`.
export const VOICE = {
  player: { src: "voices/voice-40546.wav", audioAt: 0.441, takeAt: 1.561, stopTakeAt: 5.653 },
  listB: { src: "voices/voice-41459.wav", audioAt: 8.024, takeAt: 10.593 },
} as const;
