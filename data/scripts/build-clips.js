"use strict";

// Step 2 of the data pipeline (see ../README.md). Run once, offline, by
// hand, after build-audios.js. For every transcribed audio, bundles its
// metadata (from audios.json), its real forced-alignment timestamps (from
// raw/timestamps/<audio>/alignment.json — already generated, not recomputed
// here), and a word-by-word morphosyntactic breakdown assembled from
// inverted_index.json, into one combined JSON file the frontend can fetch
// directly and completely — no index lookup, no join, at request time.
//
// Usage: node build-clips.js

const fs = require("fs");
const path = require("path");
const { normalizeWord } = require("./lib/normalize-word");

const AUDIOS_PATH = path.join(__dirname, "..", "processed", "audios.json");
const INVERTED_INDEX_PATH = path.join(__dirname, "..", "raw", "inverted_index.json");
const TIMESTAMPS_DIR = path.join(__dirname, "..", "raw", "timestamps");
const OUT_DIR = path.join(__dirname, "..", "..", "web", "public", "data", "clips");

// A word that IS in the index: root first (index 0 of morpheme_chain),
// then each remaining piece matched back to its own entry in `suffixes` by
// the morpheme string itself (morpheme_chain and suffixes are expected to
// agree, but matching by value rather than assuming the same order is
// cheap insurance). gloss/meaning reuse the index's own Spanish
// linguistic-register fields as-is (name/role for suffixes; pos/first
// sense definition for the root) — there's no English gloss in this real
// data, unlike the earlier hand-authored example fixture.
function buildMatchedMorphemes(morphology) {
  const chain =
    Array.isArray(morphology.morpheme_chain) && morphology.morpheme_chain.length > 0
      ? morphology.morpheme_chain
      : [morphology.root];
  const suffixByMorpheme = new Map(
    (morphology.suffixes || []).map((suffix) => [suffix.morpheme, suffix]),
  );

  return chain.map((piece, i) => {
    if (i === 0) {
      return {
        text: morphology.root,
        type: "root",
        gloss: morphology.pos || "—",
        meaning: morphology.senses?.[0]?.definition || "—",
      };
    }
    const suffix = suffixByMorpheme.get(piece);
    return {
      text: piece,
      type: "suffix",
      gloss: suffix?.name || "—",
      meaning: suffix?.role || "—",
    };
  });
}

// A word NOT in the index (proper nouns, loanwords, anything the corpus
// processing didn't recognize): shown as its own unanalyzed root rather
// than dropped, so this array stays the same length/order as
// alignment.word_segments — KaraokePlayer indexes into it with the same
// activeWordIndex it derives from audio.currentTime, and a shorter array
// would desync that the moment an unmatched word appears.
function buildFallbackMorphemes(normalized, raw) {
  return [{ text: normalized || raw, type: "root", gloss: "—", meaning: "—" }];
}

function buildWordAnalysis(alignment, wordsIndex) {
  const words = alignment.word_segments.map((segment) => {
    const normalized = normalizeWord(segment.word);
    const entry = normalized ? wordsIndex[normalized] : undefined;
    const morphemes = entry
      ? buildMatchedMorphemes(entry.morphology)
      : buildFallbackMorphemes(normalized, segment.word);
    return { word: segment.word, morphemes };
  });
  return { audio_file: alignment.audio_file, words };
}

function main() {
  const audios = JSON.parse(fs.readFileSync(AUDIOS_PATH, "utf8"));
  const { words_index: wordsIndex } = JSON.parse(
    fs.readFileSync(INVERTED_INDEX_PATH, "utf8"),
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });

  let written = 0;
  let missingAlignment = 0;
  for (const metadata of audios) {
    const stem = metadata.audio_file.replace(/\.mp3$/, "");
    const alignmentPath = path.join(TIMESTAMPS_DIR, stem, "alignment.json");
    if (!fs.existsSync(alignmentPath)) {
      missingAlignment += 1;
      console.warn(`No alignment.json for ${metadata.audio_file}, skipped`);
      continue;
    }

    const alignment = JSON.parse(fs.readFileSync(alignmentPath, "utf8"));
    const wordAnalysis = buildWordAnalysis(alignment, wordsIndex);
    const clip = { metadata, alignment, wordAnalysis };

    fs.writeFileSync(
      path.join(OUT_DIR, `${metadata.audio_id}.json`),
      JSON.stringify(clip),
    );
    written += 1;
  }

  console.log(
    `clips: ${written} files written -> ${OUT_DIR} (${missingAlignment} skipped, no alignment.json)`,
  );
}

main();
