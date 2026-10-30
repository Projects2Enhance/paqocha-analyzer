// Derives the 16:9 cut points from events-16x9.json, anchored on the same
// moments as the 4:5 edit so every scene keeps its length (and the music fits).
// Usage: node derive-timing.mjs <heroAppearSeconds> <out.json> <takes-out.json>
import fs from "node:fs";
const [appear, OUT, TAKES_OUT] = [Number(process.argv[2]), process.argv[3], process.argv[4]];
const ev = JSON.parse(fs.readFileSync("events-16x9.json", "utf8"));
const s = (ms) => ms / 1000;
const find = (k, type, i = 0, sel) => {
  const list = ev[k].events.filter((e) => e.type === type && (!sel || (e.selector || "").includes(sel)));
  if (!list[i]) throw new Error(`${k}: no ${type} #${i} ${sel ?? ""}`);
  return s(list[i].t_ms);
};
function voice(k, src) {
  const a = ev[k].audio.filter((x) => x.src.includes(src));
  const moving = a.filter((x, i) => i > 0 && !x.paused && x.currentTime > a[i - 1].currentTime + 0.01);
  const offs = moving.filter((x) => x.currentTime > moving[0].currentTime + 0.3).map((x) => x.t_ms - x.currentTime * 1000).sort((p, q) => p - q);
  const off = offs[Math.floor(offs.length / 2)];
  const leadIn = a.find((x) => !x.paused).currentTime;
  return { audioAt: +leadIn.toFixed(3), takeAt: +s(leadIn * 1000 + off).toFixed(3) };
}
const v1 = voice("C", "40546");
const v2 = voice("D", "41459");
const pauseC = find("C", "click", 0, "play-button");
const trim = {
  hook: +(find("A", "hero-playing") + 4.165).toFixed(3),
  tagline: +(appear + 0.017).toFixed(3),
  search: +(find("B", "click") - 1.103).toFixed(3),
  player: +(v1.takeAt - 0.561).toFixed(3),
  listA: +(find("D", "click", 0, "view-switch") - 0.566).toFixed(3),
  listB: +(find("D", "click", 0, "match-card") - 0.263).toFixed(3),
  suffixA: +(find("E", "key") - 1.118).toFixed(3),
  suffixB: +(find("E", "click", 0, "play-button") - 1.1).toFixed(3),
  suffixC: +(find("E", "click", 0, "data-word-index") - 0.273).toFixed(3),
  dark: +(find("F", "click", 0, "Cambiar tema") - 0.643).toFixed(3),
};
const out = {
  trim,
  voice: { player: { src: "voices/voice-40546.wav", ...v1, stopTakeAt: pauseC }, listB: { src: "voices/voice-41459.wav", ...v2 } },
  // Moments the camera keys off, in take-seconds.
  marks: {
    playerWordClick: find("C", "click", 0, "data-word-index"),
    listHover0: s(ev.D.events.find((e) => e.type === "hover").t_ms),
    suffixEnter: find("E", "key"),
    suffixPause: find("E", "click", 0, "play-button"),
    suffixWordClick: find("E", "click", 0, "data-word-index"),
  },
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
const takes = {};
for (const k of "ABCDEF") {
  const e = ev[k];
  takes[k] = {
    viewport: e.viewport,
    start: e.events.find((x) => x.type === "start").cursor,
    clicks: e.events.filter((x) => x.type === "click").map((x) => x.t_ms),
    cursor: e.cursor.map((c) => [c.t_ms, Math.round(c.x * 10) / 10, Math.round(c.y * 10) / 10]),
  };
}
fs.writeFileSync(TAKES_OUT, JSON.stringify(takes));
console.log(JSON.stringify(out, null, 1));
