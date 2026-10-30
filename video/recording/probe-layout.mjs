// Element boxes (CSS px) at a given viewport, for the montage's camera targets.
// Usage: node probe-layout.mjs <width> <height> <out.json>
import { chromium } from "playwright";
import fs from "node:fs";
const [W, H, OUT] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
const BASE = "http://localhost:3000";
const box = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].map((el) => {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), text: el.textContent.trim().slice(0, 24) };
}), sel);
const snap = async (page) => ({
  words: await box(page, ".paqocha-karaoke-word"),
  chips: await box(page, ".paqocha-word-chips > *"),
  detail: await box(page, ".paqocha-detail-inner"),
  play: await box(page, ".paqocha-play-button"),
  viewSwitch: await box(page, ".paqocha-view-switch"),
  cards: await box(page, ".paqocha-match-card"),
});
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
const open = async (q) => { await page.goto(`${BASE}/search?q=${q}`); await page.waitForSelector(".paqocha-karaoke-word"); await page.waitForFunction(() => document.querySelector("audio")?.currentTime > 0); };
const out = {};
await open("sunquyta"); await page.waitForTimeout(500); out.playing = await snap(page);
await page.click(".paqocha-play-button"); await page.click('[data-word-index="2"]'); await page.waitForTimeout(800); out.paused = await snap(page);
await page.click('.paqocha-view-switch button:has-text("Lista")'); await page.waitForTimeout(800); out.list = await snap(page);
await open("llaqtakunapi"); await page.click(".paqocha-play-button"); await page.click('[data-word-index="11"]'); await page.waitForTimeout(800); out.llaqta = await snap(page);
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
const f = (b) => b.map((x) => `${x.text}@${x.x},${x.y} ${x.w}x${x.h}`).join(" | ");
for (const [k, s] of Object.entries(out)) {
  const ws = s.words; const ext = ws.length ? [Math.min(...ws.map(w=>w.x)), Math.min(...ws.map(w=>w.y)), Math.max(...ws.map(w=>w.x+w.w)), Math.max(...ws.map(w=>w.y+w.h))] : [];
  console.log(`\n## ${k} transcript extent ${ext}`);
  for (const n of ["chips", "detail", "play", "viewSwitch"]) if (s[n].length) console.log(` ${n}: ${f(s[n])}`);
  if (s.cards.length) console.log(` cards: ${f(s.cards.slice(0, 4))}`);
  console.log(` words: ${f(ws.slice(0, 4))}`, k === "llaqta" ? `| w11 ${f([ws[11]])}` : "");
}
