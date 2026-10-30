// Records the takes defined in video/PROMPT.md §5 against the local
// production build. Usage: node record.mjs [A B C D E F M]  (default: all)
//
// Capture is a CDP screencast (JPEG q95 at full device resolution) rather
// than Playwright's recordVideo, whose fixed ~1 Mbps VP8 encode is too soft
// for 1.8x zooms. Frames are re-timed to constant 60 fps by ffmpeg from their
// real swap timestamps, so event timings map 1:1 onto the output video.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const BASE = "http://localhost:3000";
// FORMAT=16x9 records the landscape set into takes-16x9/ + events-16x9.json.
const FORMAT = process.env.FORMAT ?? "4x5";
const SUFFIX = FORMAT === "4x5" ? "" : `-${FORMAT}`;
const TAKES_DIR = path.resolve(`takes${SUFFIX}`);
const FRAMES_DIR = path.resolve("frames");
const EVENTS_PATH = path.resolve(`events${SUFFIX}.json`);
const FPS = 60;

// Viewports fit each output frame using the app's own responsive layout.
// 4x5 (1080x1350): HERO fills the frame; CARD fills the 968x941 card under
// the text band (stacked layout, below the app's lg breakpoint).
// 16x9 (1920x1080): HERO fills the frame; CARD fills the 1100x932 card right
// of the text column (desktop two-column layout).
const VIEWPORTS = {
  "4x5": { hero: { width: 864, height: 1080 }, card: { width: 800, height: 778 } },
  "16x9": { hero: { width: 1280, height: 720 }, card: { width: 1100, height: 932 } },
};
const HERO = { viewport: VIEWPORTS[FORMAT].hero, deviceScaleFactor: 2.5 };
const CARD = { viewport: VIEWPORTS[FORMAT].card, deviceScaleFactor: 2.5 };
const MOBILE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

class Take {
  constructor(name, page, cdp, device) {
    this.name = name;
    this.page = page;
    this.cdp = cdp;
    this.device = device;
    this.frames = [];
    this.events = [];
    this.cursorPath = [];
    this.audio = [];
    this.cursor = { x: device.viewport.width * 0.5, y: device.viewport.height * 0.78 };
  }

  log(type, extra = {}) {
    this.events.push({ t: Date.now(), type, ...extra });
  }

  // Time-based so the move lasts `ms` regardless of per-step CDP latency.
  async moveTo(x, y, ms = 750) {
    const from = { ...this.cursor };
    const start = Date.now();
    for (;;) {
      const p = Math.min(1, (Date.now() - start) / ms);
      const e = easeInOutCubic(p);
      const px = from.x + (x - from.x) * e;
      const py = from.y + (y - from.y) * e;
      await this.page.mouse.move(px, py);
      this.cursorPath.push({ t: Date.now(), x: px, y: py });
      if (p >= 1) break;
      await sleep(12);
    }
    this.cursor = { x, y };
  }

  async center(selector) {
    const loc = this.page.locator(selector).first();
    await loc.waitFor({ state: "visible", timeout: 20000 });
    const box = await loc.boundingBox();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
  }

  async hover(selector, ms = 700) {
    const { x, y, box } = await this.center(selector);
    await this.moveTo(x, y, ms);
    this.log("hover", { selector, x, y, box });
  }

  async click(selector, { moveMs = 750, settleMs = 320 } = {}) {
    const { x, y, box } = await this.center(selector);
    if (this.device.hasTouch) {
      await sleep(settleMs);
      this.log("tap", { selector, x, y, box });
      await this.page.touchscreen.tap(x, y);
      return;
    }
    await this.moveTo(x, y, moveMs);
    await sleep(settleMs);
    this.log("click", { selector, x, y, box });
    await this.page.mouse.down();
    await sleep(70);
    await this.page.mouse.up();
  }

  // Smooth wheel scroll of whatever is under the cursor, eased over `ms`.
  async scroll(dy, ms = 800) {
    this.log("scroll", { dy, ms, x: this.cursor.x, y: this.cursor.y });
    const steps = Math.max(20, Math.round(ms / 16));
    let done = 0;
    const start = Date.now();
    for (let i = 1; i <= steps; i++) {
      const target = Math.round(dy * easeInOutCubic(i / steps));
      await this.page.mouse.wheel(0, target - done);
      done = target;
      const wait = start + (ms * i) / steps - Date.now();
      if (wait > 0) await sleep(wait);
    }
  }

  async type(text, delay = 110) {
    this.log("type", { text, delay });
    await this.page.keyboard.type(text, { delay });
  }

  async press(key) {
    this.log("key", { key });
    await this.page.keyboard.press(key);
  }

  async wait(ms, label) {
    this.log("wait", { ms, label });
    await sleep(ms);
  }

  async waitAudioAt(seconds) {
    await this.page.waitForFunction(
      (s) => {
        const a = document.querySelector("audio");
        return a && a.currentTime >= s;
      },
      seconds,
      { polling: 30, timeout: 60000 },
    );
  }

  async waitPlayerReady() {
    await this.page.waitForSelector(".paqocha-karaoke-word", { timeout: 30000 });
    await this.page.waitForFunction(
      () => {
        const a = document.querySelector("audio");
        return a && !a.paused && a.currentTime > 0;
      },
      null,
      { polling: 50, timeout: 30000 },
    );
    this.log("player-ready", { audio: await this.audioSrc() });
  }

  async audioSrc() {
    return this.page.evaluate(() => document.querySelector("audio")?.src ?? null);
  }

  // Starts moving toward pause ~1s early so the click lands on `seconds`.
  async pauseAt(seconds) {
    await this.waitAudioAt(seconds - 1.0);
    const { x, y } = await this.center(".paqocha-play-button");
    if (!this.device.hasTouch) await this.moveTo(x, y, 700);
    await this.waitAudioAt(seconds);
    const box = (await this.center(".paqocha-play-button")).box;
    this.log(this.device.hasTouch ? "tap" : "click", { selector: ".paqocha-play-button", x, y, box });
    if (this.device.hasTouch) {
      await this.page.touchscreen.tap(x, y);
    } else {
      await this.page.mouse.down();
      await this.page.mouse.up();
    }
  }
}

async function startScreencast(take, dir) {
  let n = 0;
  take.cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = path.join(dir, `${String(n++).padStart(6, "0")}.jpg`);
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    take.frames.push({ file, t: metadata.timestamp * 1000, arrived: Date.now() });
    take.cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  const { width, height } = take.device.viewport;
  const dpr = take.device.deviceScaleFactor;
  await take.cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 95,
    maxWidth: width * dpr,
    maxHeight: height * dpr,
    everyNthFrame: 1,
  });
}

function startAudioSampler(take) {
  let stopped = false;
  (async () => {
    while (!stopped) {
      try {
        const s = await take.page.evaluate(() => {
          const a = document.querySelector("audio");
          return a ? { currentTime: a.currentTime, paused: a.paused, src: a.src } : null;
        });
        if (s) take.audio.push({ t: Date.now(), ...s });
      } catch {
        // page navigating — keep sampling
      }
      await sleep(100);
    }
  })();
  return () => (stopped = true);
}

// Builds an exact constant-rate sequence: output frame k shows the latest
// captured frame whose timestamp is <= t0 + k/FPS (hardlinked, no copies).
// The concat demuxer was dropped because it gives every image a minimum
// ~40 ms duration, stretching the timeline and desyncing events.json.
function encode(take, endFrameMs) {
  const frames = take.frames;
  if (frames.length < 2) throw new Error(`${take.name}: only ${frames.length} frames captured`);
  const seqDir = path.join(FRAMES_DIR, `${take.name}-seq`);
  fs.rmSync(seqDir, { recursive: true, force: true });
  fs.mkdirSync(seqDir);
  const t0 = frames[0].t;
  const total = Math.floor(((endFrameMs - t0) / 1000) * FPS) + 1;
  let src = 0;
  for (let k = 0; k < total; k++) {
    const at = t0 + (k * 1000) / FPS;
    while (src + 1 < frames.length && frames[src + 1].t <= at) src++;
    fs.linkSync(frames[src].file, path.join(seqDir, `${String(k).padStart(6, "0")}.jpg`));
  }
  const out = path.join(TAKES_DIR, `take-${take.name}.mp4`);
  const r = spawnSync(
    "ffmpeg",
    [
      "-y", "-v", "error",
      "-framerate", String(FPS), "-i", path.join(seqDir, "%06d.jpg"),
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-c:v", "libx264", "-preset", "slow", "-crf", "14",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      out,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error(`${take.name}: ffmpeg failed`);
  return out;
}

const TAKES = {
  A: {
    device: HERO,
    async run(t) {
      await t.page.goto(`${BASE}/`);
      await t.page.waitForFunction(() => {
        const v = document.querySelector("video");
        return v && !v.paused && v.currentTime > 0;
      });
      t.log("hero-playing");
      await t.wait(7000, "tagline + rotating word");
    },
  },
  B: {
    device: HERO,
    warmup: ["sunquyta"],
    async run(t) {
      await t.page.goto(`${BASE}/`);
      await t.page.waitForSelector(".paqocha-search-word-button");
      await t.wait(3200, "tagline settles");
      await t.click(".paqocha-search-word-button", { moveMs: 900 });
      await t.wait(1200, "pill opens, chips appear");
      await t.type("sunquyta");
      await t.wait(500, "beat before submit");
      await t.press("Enter");
      await t.page.waitForURL("**/search?q=sunquyta");
      t.log("navigated", { url: t.page.url() });
      await t.waitPlayerReady();
      await t.wait(1500, "reveal");
    },
  },
  C: {
    device: CARD,
    warmup: ["sunquyta"],
    async run(t) {
      await t.page.goto(`${BASE}/search?q=sunquyta`);
      await t.waitPlayerReady();
      await t.pauseAt(4.5);
      await t.wait(700, "paused beat");
      await t.click('[data-word-index="2"]', { moveMs: 900 });
      await t.page.waitForSelector('.paqocha-word-chips[aria-label="sunquyta"]');
      t.log("analysis-shown", { word: "sunquyta" });
      await t.wait(4000, "hold on analysis detail");
    },
  },
  D: {
    device: CARD,
    warmup: ["sunquyta"],
    warmClips: [41459],
    async run(t) {
      await t.page.goto(`${BASE}/search?q=sunquyta`);
      await t.waitPlayerReady();
      await t.wait(1500, "playing");
      await t.click('.paqocha-view-switch button:has-text("Lista")');
      await t.page.waitForSelector(".paqocha-match-card >> nth=2", { state: "attached" });
      await t.wait(600, "list revealed");
      await t.hover(".paqocha-match-card >> nth=0", 650);
      await t.wait(450, "hover card 0");
      await t.scroll(320, 900);
      await t.wait(500, "list scrolled");
      await t.scroll(-320, 700);
      await t.wait(300, "list back");
      await t.hover(".paqocha-match-card >> nth=1", 600);
      await t.wait(400, "hover card 1");
      const before = await t.audioSrc();
      await t.click(".paqocha-match-card >> nth=1", { moveMs: 600 });
      await t.page.waitForFunction(
        (prev) => {
          const a = document.querySelector("audio");
          return a && a.src !== prev && !a.paused && a.currentTime > 0;
        },
        before,
        { polling: 50, timeout: 30000 },
      );
      t.log("voice-switched", { audio: await t.audioSrc() });
      await t.wait(3000, "second voice playing");
    },
  },
  E: {
    device: CARD,
    warmup: ["sunquyta", "llaqtakunapi"],
    async run(t) {
      await t.page.goto(`${BASE}/search?q=sunquyta`);
      await t.waitPlayerReady();
      await t.wait(1800, "playing");
      await t.click('header button[aria-label="Buscar"]');
      await t.page.waitForSelector(".paqocha-player-search-input", { state: "visible" });
      await t.wait(650, "overlay opens");
      await t.type("llaqtakunapi");
      await t.wait(500, "beat before submit");
      await t.press("Enter");
      await t.page.waitForFunction(
        () => document.querySelector("audio")?.src.includes("34210") ||
          document.querySelector('[data-word-index="11"]')?.textContent?.includes("llaqtakunapi"),
        null,
        { polling: 50, timeout: 30000 },
      );
      t.log("new-search-resolved", { audio: await t.audioSrc() });
      await t.pauseAt(11.8);
      await t.wait(600, "paused beat");
      await t.click('[data-word-index="11"]', { moveMs: 900 });
      await t.page.waitForSelector('.paqocha-word-chips[aria-label="llaqtakunapi"]');
      t.log("analysis-shown", { word: "llaqtakunapi" });
      await t.wait(3000, "hold on stacked suffixes");
    },
  },
  F: {
    device: CARD,
    warmup: ["sunquyta"],
    async run(t) {
      await t.page.goto(`${BASE}/search?q=sunquyta`);
      await t.waitPlayerReady();
      await t.pauseAt(2.0);
      await t.wait(900, "paused");
      await t.click('[aria-label="Cambiar tema"]', { moveMs: 900 });
      await t.page.waitForSelector('html[data-theme="dark"]');
      t.log("theme-dark");
      await t.wait(2500, "hold dark theme");
    },
  },
  M: {
    device: MOBILE,
    warmup: ["sunquyta"],
    async run(t) {
      await t.page.goto(`${BASE}/search?q=sunquyta`);
      await t.waitPlayerReady();
      await t.pauseAt(4.5);
      await t.wait(600, "paused beat");
      await t.click('[data-word-index="2"]');
      await t.page.waitForSelector('.paqocha-word-chips[aria-label="sunquyta"]');
      t.log("analysis-shown", { word: "sunquyta" });
      await t.wait(3500, "hold mobile analysis");
    },
  },
};

async function recordTake(browser, name) {
  const spec = TAKES[name];
  const context = await browser.newContext({ ...spec.device, colorScheme: "light" });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("paqocha-search-tour-seen", "1");
      if (!sessionStorage.getItem("paqocha-video-theme-set")) {
        localStorage.setItem("paqocha-theme", "light");
        sessionStorage.setItem("paqocha-video-theme-set", "1");
      }
    } catch {}
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const take = new Take(name, page, cdp, spec.device);

  const dir = path.join(FRAMES_DIR, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  // Warm the HTTP cache (clip JSON + CDN mp3) off-camera, so the recorded
  // run doesn't show a cold-CDN buffering stall with the karaoke frozen.
  for (const q of spec.warmup ?? []) {
    await page.goto(`${BASE}/search?q=${q}`);
    await page.waitForFunction(
      () => {
        const a = document.querySelector("audio");
        return a && a.readyState >= 4;
      },
      null,
      { polling: 50, timeout: 30000 },
    );
    await page.evaluate(() => document.querySelector("audio")?.pause());
  }
  for (const id of spec.warmClips ?? []) {
    await page.evaluate(async (clipId) => {
      const clip = await (await fetch(`/data/clips/${clipId}.json`)).json();
      const audio = new Audio(`https://cdn-paqocha.iampol.dev/audios/${clip.metadata.audio_file}`);
      audio.preload = "auto";
      await new Promise((res, rej) => {
        audio.oncanplaythrough = res;
        audio.onerror = rej;
      });
    }, id);
  }

  await page.goto("about:blank");
  await startScreencast(take, dir);
  const stopSampler = startAudioSampler(take);
  await page.mouse.move(take.cursor.x, take.cursor.y);
  take.log("start", { cursor: { ...take.cursor } });

  try {
    await spec.run(take);
    await sleep(1000);
  } finally {
    stopSampler();
    take.log("end");
    await cdp.send("Page.stopScreencast").catch(() => {});
    await sleep(300);
  }
  const endMs = Date.now();
  await context.close();

  // Events use Node's Date.now(); frames use the compositor's swap clock.
  // The smallest (arrival - swap) gap estimates the offset between the two
  // clocks (plus minimal delivery latency); events are mapped onto the frame
  // clock with it, so t_ms lines up with the encoded video.
  const clockOffset = Math.min(...take.frames.map((f) => f.arrived - f.t));
  const out = encode(take, endMs - clockOffset);
  // t=0 of the encoded video is the first captured frame.
  const t0 = take.frames[0].t;
  const rel = (arr) =>
    arr.map(({ t, ...rest }) => ({ t_ms: Math.round(t - clockOffset - t0), ...rest }));
  const firstAppFrame = take.frames.find((f) => f.t >= take.events[0].t - clockOffset);
  const result = {
    take: name,
    video: path.relative(path.resolve(".."), out).replace(/\\/g, "/"),
    fps: FPS,
    viewport: spec.device.viewport,
    deviceScaleFactor: spec.device.deviceScaleFactor,
    coordinates: "CSS px; multiply by deviceScaleFactor for video px",
    capturedFrames: take.frames.length,
    clockOffset_ms: Math.round(clockOffset),
    duration_ms: Math.round(endMs - clockOffset - t0),
    contentStart_ms: firstAppFrame ? Math.round(firstAppFrame.t - t0) : 0,
    events: rel(take.events),
    cursor: rel(take.cursorPath),
    audio: rel(take.audio),
  };
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(path.join(FRAMES_DIR, `${name}-seq`), { recursive: true, force: true });
  console.log(
    `take ${name}: ${result.capturedFrames} frames over ${(result.duration_ms / 1000).toFixed(1)}s ` +
      `(~${(result.capturedFrames / (result.duration_ms / 1000)).toFixed(0)} fps captured) -> ${out}`,
  );
  return result;
}

async function main() {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TAKES);
  fs.mkdirSync(TAKES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  const all = fs.existsSync(EVENTS_PATH) ? JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8")) : {};

  for (const name of names) {
    // The screencast ignores the context's deviceScaleFactor and captures at
    // CSS size; only the launch-level flag yields real 2x/3x frames.
    const browser = await chromium.launch({
      channel: "msedge",
      headless: true,
      args: [
        "--autoplay-policy=no-user-gesture-required",
        `--force-device-scale-factor=${TAKES[name].device.deviceScaleFactor}`,
      ],
    });
    try {
      all[name] = await recordTake(browser, name);
      fs.writeFileSync(EVENTS_PATH, JSON.stringify(all, null, 2));
    } finally {
      await browser.close();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
