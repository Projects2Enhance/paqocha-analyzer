// Shapes matching the provisional example data in public/example/
// (metadata.json + alignment.json) — see web/DESIGN.md -> Components ->
// KaraokePlayer. Only the fields the player actually reads are typed.

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

export type AudioMetadata = {
  audio_id: number;
  audio_file: string;
  duration_ms: number;
  prompt: string;
  transcription: string;
  age: string;
  gender: string;
  accents: string;
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
