"use strict";

// Step 4 of the data pipeline (see ../README.md). Run once, offline, by
// hand, after build-audios.js. A lean catalog — every transcribed audio's
// metadata only, no alignment/wordAnalysis — fetched once by the frontend
// to render every match card a search returns. Fetching the full
// clips/<id>.json (which also carries real alignment timestamps and a
// per-word morphosyntactic breakdown) for every match, just to show a
// card, would mean downloading N clips' worth of data for a search that
// only ever plays one of them at a time; this is what lets the frontend
// fetch a full clip only for whichever match is actually selected.
//
// Usage: node build-metadata.js

const fs = require("fs");
const path = require("path");

const AUDIOS_PATH = path.join(__dirname, "..", "processed", "audios.json");
const OUT_PATH = path.join(__dirname, "..", "..", "web", "public", "data", "metadata.json");

function main() {
  const audios = JSON.parse(fs.readFileSync(AUDIOS_PATH, "utf8"));

  const catalog = {};
  for (const record of audios) {
    catalog[record.audio_id] = record;
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(catalog));

  console.log(
    `metadata.json: ${Object.keys(catalog).length} records -> ${OUT_PATH}`,
  );
}

main();
