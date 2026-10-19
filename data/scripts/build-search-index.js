"use strict";

// Step 3 of the data pipeline (see ../README.md). Run once, offline, by
// hand, after build-audios.js. Strips raw/inverted_index.json (33MB: full
// morphology, postings, context snippets — all of which already live
// inside each clips/<id>.json instead, see build-clips.js) down to the one
// thing a client-side search actually needs: normalized word -> which
// audio_ids contain it. Small enough to fetch whole and search in-memory
// with a plain object-key lookup, unlike the raw file.
//
// Usage: node build-search-index.js

const fs = require("fs");
const path = require("path");

const AUDIOS_PATH = path.join(__dirname, "..", "processed", "audios.json");
const INVERTED_INDEX_PATH = path.join(__dirname, "..", "raw", "inverted_index.json");
const OUT_PATH = path.join(__dirname, "..", "..", "web", "public", "data", "search-index.json");

function main() {
  const audios = JSON.parse(fs.readFileSync(AUDIOS_PATH, "utf8"));
  const validIds = new Set(audios.map((a) => a.audio_id));

  const { words_index: wordsIndex } = JSON.parse(
    fs.readFileSync(INVERTED_INDEX_PATH, "utf8"),
  );

  const searchIndex = {};
  for (const [word, entry] of Object.entries(wordsIndex)) {
    const ids = new Set();
    for (const posting of entry.postings || []) {
      const id = Number(posting.audio_id);
      // Restricts to audios we actually generated a clip for — the
      // inverted index was built from the same corpus, so in practice
      // every posting's audio_id is already one of ours, but this guards
      // against ever shipping a dead audio_id if the two datasets drift.
      if (validIds.has(id)) ids.add(id);
    }
    if (ids.size > 0) searchIndex[word] = Array.from(ids).sort((a, b) => a - b);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(searchIndex));

  console.log(
    `search-index.json: ${Object.keys(searchIndex).length} words -> ${OUT_PATH}`,
  );
}

main();
