"use strict";

// Mirrors web/components/player/karaoke-player.tsx's normalizeWord() exactly
// — lowercases and strips only leading/trailing non-letter characters (so
// "hampiqmi," and the index key "hampiqmi" compare equal, while an internal
// character like the hyphen in "ayllu-ayllunta" survives). Duplicated here
// rather than imported: this script and the Next.js app aren't part of the
// same module graph, and it's one line — if that frontend function ever
// changes, this one must change with it, or search results will silently
// stop matching the real inverted_index.json keys.
function normalizeWord(word) {
  return word.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
}

module.exports = { normalizeWord };
