// Synthesises the music bed with the verdict sounds baked in. No samples and no recordings: plain Node
// writes the waveform, ffmpeg packs it into AAC. The synth voices come from the first cut
// (film/scripts/make-audio.mjs); the arrangement is new: 120 bpm, and it reads the same timeline as the
// picture, so a new voice take moves the music with the shots.
// Run from this folder: node scripts/make-audio.mjs   Output: public/audio/music.m4a
import {execFileSync} from 'node:child_process';
import {readFileSync, rmSync, writeFileSync} from 'node:fs';
import {BEAT as BEAT_FRAMES, buildTimeline, FPS, toFrames} from '../src/timeline.ts';

const here = (p) => new URL(`../${p}`, import.meta.url).pathname;
const voice = JSON.parse(readFileSync(here('src/data/voice.json'), 'utf8')).lines;
const {shots, total} = buildTimeline(voice);
const SR = 48000;
const BEAT = BEAT_FRAMES / FPS;
const sec = (frame) => frame / FPS;

let seed = 20261122;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const buf = (seconds) => ({l: new Float32Array(Math.ceil(seconds * SR)), r: new Float32Array(Math.ceil(seconds * SR))});

/** Adds one voice to a stereo buffer. `fn(t)` is the sample at t seconds after `at`. */
function add(b, at, dur, gain, pan, fn) {
  const start = Math.round(at * SR);
  const n = Math.min(Math.round(dur * SR), b.l.length - start);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR);
    b.l[start + i] += v * gl;
    b.r[start + i] += v * gr;
  }
}

const TAU = Math.PI * 2;
const bell = (f, decay = 5) => (t) =>
  Math.sin(TAU * f * t + 0.9 * Math.exp(-t * 14) * Math.sin(TAU * f * 2 * t)) * Math.exp(-t * decay) * Math.min(1, t * 400);
const pad = (f, dur) => (t) => {
  const e = Math.min(1, t / 0.5) * Math.min(1, (dur - t) / 0.6);
  return (Math.sin(TAU * f * t) + 0.22 * Math.sin(TAU * 2 * f * t) + 0.06 * Math.sin(TAU * 3 * f * t)) * e * e;
};
const bass = (f, dur) => (t) => {
  const e = Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.12);
  return (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2 * f * t)) * Math.max(0, e);
};
const kick = () => {
  let ph = 0;
  return (t) => {
    ph += (TAU * (46 + 90 * Math.exp(-t * 38))) / SR;
    return Math.sin(ph) * Math.exp(-t * 11);
  };
};
/** Noise through a one-pole high-pass: a hat when short, a clap when longer. */
const hiss = (decay, cut = 0.75) => {
  let lp = 0;
  return (t) => {
    const n = rnd();
    lp += cut * (n - lp);
    return (n - lp) * Math.exp(-t * decay) * Math.min(1, t * 2000);
  };
};

/** Small Schroeder reverb on a send bus, in place. */
function reverb(b, mix) {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116].map((n) => Math.round((n * SR) / 44100));
  const alls = [556, 441, 341, 225].map((n) => Math.round((n * SR) / 44100));
  const run = (x, spread) => {
    const out = new Float32Array(x.length);
    for (const c of combs) {
      const d = new Float32Array(c + spread);
      let i = 0;
      let damp = 0;
      for (let n = 0; n < x.length; n++) {
        const y = d[i];
        damp = y * 0.72 + damp * 0.28;
        d[i] = x[n] + damp * 0.82;
        out[n] += y;
        i = (i + 1) % d.length;
      }
    }
    for (const a of alls) {
      const d = new Float32Array(a + spread);
      let i = 0;
      for (let n = 0; n < out.length; n++) {
        const y = d[i];
        const v = out[n];
        d[i] = v + y * 0.5;
        out[n] = y - v;
        i = (i + 1) % d.length;
      }
    }
    return out;
  };
  const wl = run(b.l, 0);
  const wr = run(b.r, 23);
  for (let n = 0; n < b.l.length; n++) {
    b.l[n] += wl[n] * mix * 0.12;
    b.r[n] += wr[n] * mix * 0.12;
  }
}

function mixInto(dst, src, gain = 1) {
  for (let n = 0; n < src.l.length && n < dst.l.length; n++) {
    dst.l[n] += src.l[n] * gain;
    dst.r[n] += src.r[n] * gain;
  }
}

/** Scales to a peak in dBFS after a gentle tanh, so nothing clips. */
function master(b, peakDb, fadeOut) {
  let peak = 0;
  for (let n = 0; n < b.l.length; n++) peak = Math.max(peak, Math.abs(b.l[n]), Math.abs(b.r[n]));
  const drive = 1.4 / (peak || 1);
  const norm = 10 ** (peakDb / 20) / Math.tanh(1.4);
  const len = b.l.length;
  for (let n = 0; n < len; n++) {
    const g = n > len - fadeOut * SR ? norm * ((len - n) / (fadeOut * SR)) ** 2 : norm;
    b.l[n] = Math.tanh(b.l[n] * drive) * g;
    b.r[n] = Math.tanh(b.r[n] * drive) * g;
  }
  return b;
}

function wav(path, b) {
  const n = b.l.length;
  const out = Buffer.alloc(44 + n * 4);
  out.write('RIFF', 0);
  out.writeUInt32LE(36 + n * 4, 4);
  out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(2, 22);
  out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(SR * 4, 28);
  out.writeUInt16LE(4, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b.l[i])) * 32767), 44 + i * 4);
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b.r[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(path, out);
}

// One chord per shot, in D major. What plays in each shot: p pad, k kick on every beat, h hats, b bass, a arpeggio.
const CHORD = {
  D: {pad: [50, 57, 62, 66], bass: 38, arp: [62, 69, 74, 78]},
  Bm: {pad: [47, 54, 59, 62], bass: 35, arp: [59, 66, 71, 74]},
  G: {pad: [43, 50, 59, 62], bass: 43, arp: [55, 62, 67, 71]},
  A: {pad: [45, 52, 57, 64], bass: 45, arp: [57, 64, 69, 73]},
};
const SCORE = {
  hook: ['Bm', 'p'],
  turn: ['G', 'p'],
  name: ['D', 'pkhb'],
  claims: ['Bm', 'pkhba'],
  claimsProof: ['G', 'pkhba'],
  proof: ['Bm', 'p'], // the held beat: the pulse stops
  honest: ['G', 'phb'],
  abstain: ['A', 'p'],
  channels: ['D', 'pkhba'],
  end: ['D', 'p'],
};

// verdict sounds, one per meaning (the same three as in the first cut)
const verdict = {
  false: (b, at) => {
    add(b, at, 0.7, 0.5, 0, bell(hz(50), 7));
    add(b, at, 0.7, 0.25, 0, bell(hz(57), 8));
  },
  confirmed: (b, at) => [78, 81, 86].forEach((m, i) => add(b, at + i * 0.09, 1, 0.22, i * 0.25 - 0.25, bell(hz(m), 4.5))),
  open: (b, at) => {
    add(b, at, 1.3, 0.3, 0, bell(hz(76), 3));
    add(b, at, 1.3, 0.12, 0, bell(hz(69), 3.5));
  },
};

const len = sec(total);
const dry = buf(len);
const wet = buf(len);
for (const s of shots) {
  const [name, on] = SCORE[s.id];
  const c = CHORD[name];
  const t0 = sec(s.from);
  const dur = sec(s.duration);
  const beats = Math.round(dur / BEAT);
  if (on.includes('p')) {
    const long = dur + (s.id === 'end' ? 0 : 0.5);
    c.pad.forEach((m, i) => {
      for (const [cents, pan] of [[-5, -0.6], [5, 0.6]]) add(wet, t0, long, 0.055 - i * 0.006, pan, pad(hz(m) * 2 ** (cents / 1200), long));
    });
  }
  for (let i = 0; i < beats; i++) {
    const t = t0 + i * BEAT;
    if (on.includes('k')) add(dry, t, 0.4, 0.42, 0, kick());
    if (on.includes('h')) {
      add(dry, t + BEAT / 2, 0.08, 0.05, 0.3, hiss(70));
      if (i % 2 === 1) add(dry, t, 0.16, 0.07, -0.2, hiss(34, 0.5));
    }
    if (on.includes('b')) for (const off of [0, 0.5]) add(dry, t + off * BEAT, BEAT * 0.42, 0.26, 0, bass(hz(c.bass), BEAT * 0.42));
    if (on.includes('a')) for (const off of [0, 0.5]) add(wet, t + off * BEAT, 0.9, 0.1, off ? 0.45 : -0.45, bell(hz(c.arp[(i * 2 + off * 2) % 4]), 7));
  }
  // a line of the hook lands on a single low hit, so the grid is there before the pulse starts
  if (s.id === 'hook' || s.id === 'turn') for (const l of s.lines) add(dry, sec(l.from), 0.5, 0.36, 0, kick());
  // the name and the end card open on the full chord
  if (s.id === 'name' || s.id === 'end') {
    add(dry, t0, 0.5, 0.5, 0, kick());
    c.arp.forEach((m, i) => add(wet, t0, 2.4, 0.16, i * 0.4 - 0.6, bell(hz(m), 2.2)));
    add(dry, t0, BEAT * 3, 0.3, 0, bass(hz(c.bass), BEAT * 3));
  }
}
// verdicts land where the picture shows them (src/shots.tsx uses the same offsets)
const at = (id, frames = 0) => sec(shots.find((s) => s.id === id).from + frames);
verdict.false(dry, at('claimsProof', 4));
verdict.confirmed(dry, at('claimsProof', BEAT_FRAMES));
verdict.false(dry, at('proof'));
verdict.open(dry, at('abstain', 4));
// the three channel rows land on their words: one soft tick each
const channels = shots.find((s) => s.id === 'channels');
for (const w of [3, 5, 8]) add(wet, sec(channels.lines[0].from + toFrames(voice[channels.lines[0].index].words[w].startMs)), 0.3, 0.16, 0, bell(hz(74), 22));

reverb(wet, 1);
mixInto(dry, wet);
wav(here('public/audio/music.wav'), master(dry, -3, 2.5));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', here('public/audio/music.wav'), '-c:a', 'aac', '-b:a', '192k', here('public/audio/music.m4a')]);
rmSync(here('public/audio/music.wav'));
console.log(`music: ${len} s`);
