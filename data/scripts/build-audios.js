"use strict";

// Step 1 of the data pipeline (see ../README.md). Run once, offline, by hand
// — never by the app or a server. Converts the raw TSV export into a clean,
// typed JSON array, keeping only rows that actually have a transcription:
// most rows in this corpus don't (6083 of 7305 data rows, checked against
// this exact file), and an untranscribed audio has nothing for this app to
// search, play back with a synced transcript, or analyze.
//
// Usage: node build-audios.js

const fs = require("fs");
const path = require("path");

const TSV_PATH = path.join(__dirname, "..", "raw", "ss-corpus-qxp.tsv");
const OUT_PATH = path.join(__dirname, "..", "processed", "audios.json");

// Columns whose values are numbers in the source data; everything else
// stays a string (or becomes null if empty — see parseRow below).
const NUMERIC_COLUMNS = new Set([
  "audio_id",
  "duration_ms",
  "prompt_id",
  "votes",
  "prompt_upvotes",
  "prompt_reports",
  "is_edited",
  "char_per_sec",
]);

function parseRow(header, rawCells) {
  const record = {};
  header.forEach((column, i) => {
    const raw = rawCells[i] ?? "";
    if (raw === "") {
      record[column] = null;
      return;
    }
    record[column] = NUMERIC_COLUMNS.has(column) ? Number(raw) : raw;
  });
  return record;
}

function main() {
  const text = fs.readFileSync(TSV_PATH, "utf8");
  // Handles both \n and \r\n line endings; drops the trailing blank line a
  // file ending in a newline produces.
  const lines = text.split("\n").map((l) => l.replace(/\r$/, ""));
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();

  const header = lines[0].split("\t");
  const dataLines = lines.slice(1);

  const audios = [];
  let skippedMalformed = 0;
  for (const line of dataLines) {
    const cells = line.split("\t");
    if (cells.length !== header.length) {
      skippedMalformed += 1;
      continue;
    }
    const record = parseRow(header, cells);
    if (record.transcription) audios.push(record);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(audios, null, 2));

  console.log(
    `audios.json: ${audios.length} records with transcription ` +
      `(of ${dataLines.length} total rows, ${skippedMalformed} malformed skipped) -> ${OUT_PATH}`,
  );
}

main();
