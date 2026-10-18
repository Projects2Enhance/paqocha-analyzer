// Shapes matching the real generated data in public/data/ (clips/<id>.json,
// search-index.json) — see ../../../data/README.md for how they're built,
// and web/DESIGN.md -> Components -> KaraokePlayer for how the player
// consumes them. Only the fields the player actually reads are typed.

export type AlignmentWord = {
  word: string;
  start: number;
  end: number;
  score: number;
};

export type AlignmentSegment = {
  start: number;
  end: number;
  text: string;
  words: AlignmentWord[];
};

export type Alignment = {
  audio_file: string;
  duration_s: number;
  segments: AlignmentSegment[];
  word_segments: AlignmentWord[];
};

// `gender`/`accents` are `null` for a real, non-trivial share of the
// generated dataset (30/1222 and 384/1222 respectively) — checked against
// data/processed/audios.json, not assumed. Every TSV column build-audios.js
// writes empty as `null` rather than `""`, so treat any field here as
// nullable unless it's been checked, the way these two have.
export type AudioMetadata = {
  audio_id: number;
  audio_file: string;
  duration_ms: number;
  prompt: string;
  transcription: string;
  age: string;
  gender: string | null;
  accents: string | null;
  language: string;
};

export type Morpheme = {
  text: string;
  type: "root" | "suffix";
  gloss: string;
  meaning: string;
};

// One entry per word_segments entry in alignment.json, same order/count —
// see public/example/word-analysis.json's own "note" field.
export type WordAnalysisEntry = {
  word: string;
  morphemes: Morpheme[];
};

export type WordAnalysisData = {
  audio_file: string;
  words: WordAnalysisEntry[];
};

// One combined file per clip — public/data/clips/<audio_id>.json, built by
// data/scripts/build-clips.js. Replaces separately fetching metadata.json/
// alignment.json/word-analysis.json for a given audio.
export type ClipData = {
  metadata: AudioMetadata;
  alignment: Alignment;
  wordAnalysis: WordAnalysisData;
};

// public/data/search-index.json, built by data/scripts/build-search-index.js
// — normalized word -> every audio_id whose transcript contains it.
export type SearchIndex = Record<string, number[]>;
