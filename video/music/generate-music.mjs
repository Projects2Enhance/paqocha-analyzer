// Procedural, royalty-free underscore for the LinkedIn cut, written to the
// edit in video/remotion/src/timeline.ts. Pure synthesis (no samples), so the
// track has no third-party rights attached.
//
// Usage: node generate-music.mjs <out.wav>
import fs from "node:fs";

const SR = 48000;
// Cue times (s) — must match START in timeline.ts.
const CUE = { tagline: 2.467, search: 5.633, player: 9.433, list: 20.8, suffix: 28.1, dark: 33.067, end: 34.867, total: 39.367 };
const LEN = CUE.total + 0.25;
const N = Math.ceil(LEN * SR);

// 10 bars between the player cut and the end card, so both land on downbeats.
const BAR = (CUE.end - CUE.player) / 10;
const BEAT = BAR / 4;
const barStart = (k) => CUE.player + k * BAR; // k may be negative

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (a, b, t) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// D major: Dmaj7 | Bm9 | Gmaj7 | A6sus4, pentatonic arpeggios on top.
const CHORDS = [
  { pad: [50, 57, 61, 66], bass: 38, arp: [74, 81, 78, 86, 81, 78, 76, 81] },
  { pad: [47, 54, 57, 61, 62], bass: 35, arp: [71, 78, 74, 81, 78, 74, 76, 78] },
  { pad: [43, 50, 54, 59], bass: 31, arp: [71, 74, 78, 83, 78, 74, 71, 74] },
  { pad: [45, 52, 62, 66], bass: 33, arp: [69, 74, 76, 81, 76, 74, 69, 76] },
];
const FINAL = [50, 57, 64, 66, 73]; // Dmaj9

const L = new Float32Array(N);
const R = new Float32Array(N);
const sendL = new Float32Array(N); // reverb send
const sendR = new Float32Array(N);

function addPadNote(m, t0, t1, gain, attack = 0.7, release = 1.1) {
  const f = midi(m);
  const s0 = Math.max(0, Math.floor(t0 * SR));
  const s1 = Math.min(N, Math.ceil((t1 + release) * SR));
  const detune = [Math.pow(2, -5 / 1200), Math.pow(2, 4 / 1200)];
  const pan = 0.5 + (rand() - 0.5) * 0.5;
  const ph = [rand() * 6.28, rand() * 6.28];
  for (let i = s0; i < s1; i++) {
    const t = i / SR;
    const env = smooth(t0, t0 + attack, t) * (1 - smooth(t1, t1 + release, t));
    if (env <= 0) continue;
    let v = 0;
    for (let d = 0; d < 2; d++) {
      const w = 2 * Math.PI * f * detune[d] * t + ph[d];
      v += Math.sin(w) + 0.42 * Math.sin(2 * w) + 0.2 * Math.sin(3 * w) + 0.09 * Math.sin(4 * w);
    }
    const trem = 1 + 0.06 * Math.sin(2 * Math.PI * 0.23 * t + f);
    const s = v * env * trem * gain * 0.5;
    L[i] += s * (1 - pan);
    R[i] += s * pan;
    sendL[i] += s * 0.55 * (1 - pan);
    sendR[i] += s * 0.55 * pan;
  }
}

function addPluck(m, t0, gain, pan) {
  const f = midi(m);
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(N, s0 + Math.floor(1.6 * SR));
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.33);
    const w = 2 * Math.PI * f * t;
    const v = Math.sin(w) + 0.3 * Math.sin(2 * w) * Math.exp(-t / 0.12) + 0.12 * Math.sin(3 * w) * Math.exp(-t / 0.06);
    const s = v * env * gain;
    L[i] += s * (1 - pan);
    R[i] += s * pan;
    sendL[i] += s * 0.7 * (1 - pan);
    sendR[i] += s * 0.7 * pan;
  }
}

function addBass(m, t0, gain) {
  const f = midi(m);
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(N, s0 + Math.floor(BEAT * 1.1 * SR));
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const env = Math.min(1, t / 0.012) * Math.exp(-t / 0.32);
    const w = 2 * Math.PI * f * t;
    const s = (Math.sin(w) + 0.35 * Math.sin(2 * w)) * env * gain;
    L[i] += s;
    R[i] += s;
  }
}

function addKick(t0, gain) {
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(N, s0 + Math.floor(0.5 * SR));
  let phase = 0;
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    phase += (2 * Math.PI * (48 + 75 * Math.exp(-t / 0.028))) / SR;
    const s = Math.sin(phase) * Math.exp(-t / 0.2) * gain;
    L[i] += s;
    R[i] += s;
  }
}

function addHat(t0, gain, pan) {
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(N, s0 + Math.floor(0.09 * SR));
  let prev = 0;
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const n = rand() * 2 - 1;
    const hp = n - prev;
    prev = n;
    const s = hp * Math.exp(-t / 0.022) * gain;
    L[i] += s * (1 - pan);
    R[i] += s * pan;
  }
}

function addBell(m, t0, gain, pan) {
  const f = midi(m);
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(N, s0 + Math.floor(4 * SR));
  const partials = [
    [1, 1, 2.6],
    [2.76, 0.35, 1.2],
    [5.4, 0.12, 0.5],
  ];
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    let v = 0;
    for (const [r, a, d] of partials) v += a * Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t / d);
    const s = v * Math.min(1, t / 0.003) * gain;
    L[i] += s * (1 - pan);
    R[i] += s * pan;
    sendL[i] += s * 0.8 * (1 - pan);
    sendR[i] += s * 0.8 * pan;
  }
}

function addRiser(t0, t1, gain) {
  // Noise through a state-variable bandpass sweeping upward.
  let low = 0;
  let band = 0;
  for (let i = Math.floor(t0 * SR); i < Math.min(N, Math.floor(t1 * SR)); i++) {
    const p = (i / SR - t0) / (t1 - t0);
    const fc = 300 * Math.pow(5000 / 300, p);
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    const n = rand() * 2 - 1;
    low += f * band;
    const high = n - low - 0.35 * band;
    band += f * high;
    const s = band * gain * p * p;
    L[i] += s;
    R[i] += s;
    sendL[i] += s * 0.5;
    sendR[i] += s * 0.5;
  }
}

// --- Arrangement -----------------------------------------------------------
// Bars from before t=0 through the bar that ends at the end card.
for (let k = -4; k < 10; k++) {
  const t0 = barStart(k);
  const t1 = t0 + BAR;
  if (t1 <= 0) continue;
  const chord = CHORDS[((k % 4) + 4) % 4];
  const inDrop = t0 >= CUE.dark - 0.01;

  const padGain = t0 < CUE.player ? 0.1 : inDrop ? 0.1 : 0.07;
  for (const m of chord.pad) addPadNote(m, Math.max(0, t0), t1, padGain);

  // Arp enters with the tagline; brighter octave from the suffix scene on.
  for (let e = 0; e < 8; e++) {
    const t = t0 + e * (BEAT / 2);
    if (t < CUE.tagline || t >= CUE.end) continue;
    const intro = smooth(CUE.tagline, CUE.tagline + 2.5, t);
    const accent = e % 4 === 0 ? 1 : 0.72 + rand() * 0.12;
    const g = (t < CUE.player ? 0.13 : 0.1) * intro * accent * (inDrop ? 0.6 : 1);
    addPluck(chord.arp[e], t + (rand() - 0.5) * 0.006, g, e % 2 ? 0.68 : 0.32);
    if (t >= CUE.suffix && t < CUE.dark && e % 2 === 0) {
      addPluck(chord.arp[e] + 12, t + 0.003, g * 0.35, e % 4 ? 0.8 : 0.2);
    }
  }

  // Groove: player cut to the dark-mode drop.
  if (t0 >= CUE.player - 0.01 && !inDrop) {
    for (let b = 0; b < 4; b++) {
      const t = t0 + b * BEAT;
      addBass(chord.bass + 12, t, b === 0 ? 0.2 : 0.14);
      if (b === 0 || b === 2) addKick(t, 0.2);
      addHat(t + BEAT / 2, 0.028, b % 2 ? 0.62 : 0.38);
    }
  }
}

addRiser(CUE.dark, CUE.end, 0.07);

// Resolve on the end card: Dmaj9 + bells, then let it ring out.
for (const m of FINAL) addPadNote(m, CUE.end, CUE.total - 1.6, 0.085, 0.03, 1.8);
addKick(CUE.end, 0.18);
addBass(38 + 12, CUE.end, 0.2);
addBell(81, CUE.end, 0.12, 0.35);
addBell(78, CUE.end + BEAT, 0.09, 0.65);
addBell(86, CUE.end + 2 * BEAT, 0.07, 0.5);

// --- Reverb (Schroeder: 4 combs + 2 allpasses per channel) ----------------
function reverb(input, offset) {
  const scale = SR / 44100;
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round((d + offset) * scale));
  const aps = [225, 556].map((d) => Math.round((d + offset) * scale));
  const out = new Float32Array(N);
  for (const d of combs) {
    const buf = new Float32Array(d);
    let idx = 0;
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx];
      lp = y * 0.75 + lp * 0.25;
      buf[idx] = input[i] + lp * 0.83;
      out[i] += y * 0.25;
      idx = (idx + 1) % d;
    }
  }
  for (const d of aps) {
    const buf = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const b = buf[idx];
      const y = -out[i] + b;
      buf[idx] = out[i] + b * 0.5;
      out[i] = y;
      idx = (idx + 1) % d;
    }
  }
  return out;
}
const revL = reverb(sendL, 0);
const revR = reverb(sendR, 23);

// --- Master ------------------------------------------------------------------
const outL = new Float32Array(N);
const outR = new Float32Array(N);
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = smooth(0, 0.9, t) * (1 - smooth(CUE.total - 2.2, CUE.total, t));
  outL[i] = Math.tanh((L[i] + revL[i] * 0.45) * 1.1) * fade;
  outR[i] = Math.tanh((R[i] + revR[i] * 0.45) * 1.1) * fade;
  peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
}
const norm = Math.pow(10, -1 / 20) / peak;

const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outL[i] * norm)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outR[i] * norm)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const sections = [["hook", 0.3, CUE.tagline], ["intro", CUE.tagline, CUE.player], ["groove", CUE.player, CUE.dark], ["drop", CUE.dark, CUE.end], ["end", CUE.end, CUE.total - 2.2]];
for (const [name, a, b] of sections) {
  let sum = 0;
  const i0 = Math.floor(a * SR), i1 = Math.floor(b * SR);
  for (let i = i0; i < i1; i++) sum += ((outL[i] * norm) ** 2 + (outR[i] * norm) ** 2) / 2;
  console.log(`  ${name.padEnd(6)} RMS ${(10 * Math.log10(sum / (i1 - i0))).toFixed(1)} dBFS`);
}

const out = process.argv[2] ?? "music.wav";
fs.writeFileSync(out, Buffer.concat([header, data]));
console.log(`music: ${LEN.toFixed(2)}s, bar ${BAR.toFixed(4)}s (${(240 / BAR).toFixed(2)} bpm) -> ${out}`);
