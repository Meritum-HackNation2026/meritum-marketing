// Synthesises the whole soundtrack of the film (music and interface sounds) into public/audio/sciezka.m4a.
// No samples and no recordings: every sound is computed here. Cue frames come from src/timeline.json, the
// same file the picture reads. Needs ffmpeg for the loudness pass (-14 LUFS) and the AAC encode.
// Usage: node scripts/make-audio.mjs
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const {fps, scenes, cues} = JSON.parse(readFileSync(join(root, 'src/timeline.json'), 'utf8'));

const SR = 48000;
const start = {};
let total = 0;
for (const [name, frames] of Object.entries(scenes)) {
  start[name] = total;
  total += frames;
}
/** Seconds of a cue frame inside a scene. */
const at = (scene, frame = 0) => (start[scene] + frame) / fps;
const N = Math.round((total / fps) * SR);
const dry = [new Float32Array(N), new Float32Array(N)];
const wet = new Float32Array(N); // what goes to the reverb

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

/** Adds `fn(t)` (t in seconds from the start of the sound) for `dur` seconds at `t0`. */
function add(t0, dur, fn, {gain = 1, pan = 0, send = 0} = {}) {
  const from = Math.round(t0 * SR);
  const len = Math.round(dur * SR);
  for (let i = 0; i < len && from + i < N; i++) {
    if (from + i < 0) continue;
    const s = fn(i / SR) * gain;
    dry[0][from + i] += s * (1 - Math.max(0, pan));
    dry[1][from + i] += s * (1 + Math.min(0, pan));
    wet[from + i] += s * send;
  }
}
const sin = (f, t) => Math.sin(2 * Math.PI * f * t);
/** Attack and exponential decay. */
const env = (t, a, d) => Math.min(1, t / a) * Math.exp(-t / d);

// --- the voices -------------------------------------------------------------------------------------------
/** The pulse: a heartbeat, two soft low hits. Saturated a little so small speakers still carry it. */
const thump = (t0, gain) => {
  for (const [dt, g] of [[0, 1], [0.17, 0.6]]) {
    let phase = 0;
    add(t0 + dt, 0.5, (t) => {
      phase += (2 * Math.PI * (46 + 60 * Math.exp(-t / 0.03))) / SR;
      return Math.tanh(2.2 * Math.sin(phase)) * env(t, 0.004, 0.11);
    }, {gain: gain * g * 0.55, send: 0.08});
  }
};
/** A forward: a short dry tick. */
const tick = (t0, gain, pan = 0) => add(t0, 0.06, (t) => (rnd() * 0.5 + sin(2600, t)) * env(t, 0.001, 0.008), {gain: gain * 0.3, pan, send: 0.15});
/** A step of the check: a soft tone. */
const blip = (t0, midi, gain = 1) => add(t0, 0.3, (t) => (sin(hz(midi), t) + 0.3 * sin(hz(midi) * 2, t)) * env(t, 0.004, 0.07), {gain: gain * 0.16, send: 0.4});
/** A struck note with a long tail, for chords and verdicts. */
const note = (t0, midi, dur, gain, pan = 0) =>
  add(t0, dur, (t) => (sin(hz(midi), t) + 0.35 * sin(hz(midi) * 2.001, t) + 0.12 * sin(hz(midi) * 3, t)) * env(t, 0.006, dur / 4), {gain: gain * 0.2, pan, send: 0.5});
/** A held chord that swells in and out: the bed under the scenes. */
const pad = (t0, dur, midis, gain, attack = 0.6, release = 0.6) => {
  for (const [k, m] of midis.entries()) {
    const f = hz(m);
    add(t0, dur, (t) => {
      const e = Math.min(1, t / attack) * Math.min(1, (dur - t) / release);
      return (sin(f, t) + sin(f * 1.004, t) + 0.25 * sin(f * 2, t)) * e * (0.8 + 0.2 * sin(0.21 + k * 0.07, t));
    }, {gain: gain * 0.05, pan: (k % 2 ? 0.3 : -0.3), send: 0.5});
  }
};
/** Filtered noise whose colour moves from `f0` to `f1`: reading a quote, a cut, a rise. */
const sweep = (t0, dur, f0, f1, gain, shape = (t) => Math.sin((Math.PI * t) / dur)) => {
  let lp = 0;
  let bp = 0;
  add(t0, dur, (t) => {
    const f = f0 * (f1 / f0) ** (t / dur);
    const k = 2 * Math.sin((Math.PI * f) / SR);
    // state variable filter, band output
    lp += k * bp;
    const hp = rnd() - lp - 0.5 * bp;
    bp += k * hp;
    return bp * shape(t);
  }, {gain: gain * 0.3, send: 0.3});
};
/** The snip of the cut: very short, bright. */
const snip = (t0, pan = 0) => {
  sweep(t0, 0.05, 6000, 9000, 1.6, (t) => Math.exp(-t / 0.012));
  tick(t0, 1.2, pan);
};

// --- the score --------------------------------------------------------------------------------------------
const beat = 0.5; // 120 bpm: 15 frames
const Dm = [38, 45, 50, 53]; // D2 A2 D3 F3
const D = [38, 45, 50, 54, 57]; // D major

// 1 Zdanie: the pulse starts alone, every forward ticks.
for (let t = 0; t < at('nazwa'); t += 2 * beat) thump(t, 1);
pad(0, at('nazwa'), [38, 45], 0.9, 1.5, 0.05);
cues.zdanie.ticks.forEach((f, i) => tick(at('zdanie', f), 0.6 + i * 0.05, i % 2 ? 0.4 : -0.4));

// 2 Nazwa: the hit.
add(at('nazwa'), 1.4, (t) => sin(55 + 30 * Math.exp(-t / 0.05), t) * env(t, 0.003, 0.35), {gain: 0.6, send: 0.2});
[50, 57, 62, 69].forEach((m, i) => note(at('nazwa'), m, 2.2, 1, i % 2 ? 0.35 : -0.35));
sweep(at('nazwa'), 0.25, 3000, 800, 1, (t) => Math.exp(-t / 0.05));

// 3 Cięcie: one snip on the cut mark, two on the split.
snip(at('ciecie'));
snip(at('ciecie', cues.ciecie.split), -0.6);
snip(at('ciecie', cues.ciecie.split) + 0.04, 0.6);
for (let t = at('ciecie'); t < at('werdykt') - 0.01; t += 2 * beat) thump(t, 0.9);
pad(at('ciecie'), at('werdykt') - at('ciecie'), Dm, 1, 1, 0.03);

// 4 Szukanie: steps, then the reading of the quote; ticks crowd in and a tone climbs until the cut to silence.
cues.szukanie.steps.forEach((f, i) => blip(at('szukanie', f), [74, 76, 77, 81][i]));
const found = at('szukanie', cues.szukanie.found);
const lock = at('szukanie', cues.szukanie.lock);
sweep(found, lock - found, 700, 3200, 0.9);
blip(lock, 86, 1.4);
tick(lock, 1.4);
for (let t = found, i = 0; t < at('werdykt') - 0.01; t += beat / 2, i++) tick(t, 0.25 + i * 0.045, i % 2 ? 0.5 : -0.5);
{
  const from = lock;
  const dur = at('werdykt') - from;
  let phase = 0;
  add(from, dur, (t) => {
    phase += (2 * Math.PI * (147 * 2 ** (t / dur))) / SR;
    return (Math.sin(phase) + 0.4 * Math.sin(2 * phase)) * (t / dur) ** 2;
  }, {gain: 0.16, send: 0.3});
}

// 5 Werdykt: nothing for half a second, one low verdict tone, then only a quiet room.
const fals = at('werdykt', cues.werdykt.verdict);
thump(fals, 1.3);
note(fals, 50, 3.2, 1.5, -0.2);
note(fals + 0.22, 46, 3.4, 1.6, 0.2);
note(fals + 0.22, 34, 3.4, 1.2);
tick(at('werdykt', cues.werdykt.mark), 0.7);
tick(at('werdykt', cues.werdykt.source), 0.5, -0.3);
tick(at('werdykt', cues.werdykt.strength), 0.5, 0.3);
pad(fals + 1.2, at('drugie') - fals - 1.2, [38, 45], 0.55, 1.5, 0.4);

// 6 Drugie twierdzenie: the pulse comes back lighter; the same path at speed, three notes up.
for (let t = at('drugie'); t < at('zwrot') - 0.01; t += 2 * beat) thump(t, 0.6);
cues.drugie.steps.forEach((f, i) => blip(at('drugie', f), [74, 76, 77, 81][i], 0.8));
sweep(at('drugie', cues.drugie.found), (cues.drugie.lock - cues.drugie.found) / fps, 900, 3600, 0.7);
blip(at('drugie', cues.drugie.lock), 86, 1.2);
const conf = at('drugie', cues.drugie.verdict);
[62, 66, 69].forEach((m, i) => note(conf + i * 0.11, m, 2.4, 1.3, (i - 1) * 0.3));
pad(conf, at('zwrot') - conf, D, 0.9, 0.3, 0.3);

// 7 Zwrot: the first scene again, then a search that thins out and finds nothing.
const turn = at('zwrot');
for (let t = turn, i = 0; t < at('zwrot', cues.zwrot.verdict) - 0.01; t += 2 * beat, i++) thump(t, 1 - i * 0.22);
pad(turn, at('zwrot', cues.zwrot.result) - turn, [38, 45], 0.9, 0.2, 0.8);
cues.zwrot.ticks.forEach((f, i) => tick(at('zwrot', f), 0.6 + i * 0.05, i % 2 ? 0.4 : -0.4));
cues.zwrot.steps.forEach((f, i) => blip(at('zwrot', f), [74, 76, 77, 81][i], 0.8));
sweep(at('zwrot', cues.zwrot.steps[3]), 0.9, 2400, 500, 0.7, (t) => 1 - t / 0.9);
// one tone that does not resolve, held through the sentence that follows
const open = at('zwrot', cues.zwrot.verdict);
note(open, 57, 4.5, 1.2, -0.2);
note(open, 64, 4.5, 0.9, 0.2);

// 8 Zasada: the same open fifth, restated.
note(at('zasada'), 45, 3.5, 1.3);
note(at('zasada'), 64, 3.5, 0.8, 0.3);
pad(at('zasada'), at('puenta') - at('zasada'), [45, 52], 0.6, 0.8, 0.5);

// 9 Puenta: the pulse returns and the harmony resolves to D major.
for (let t = at('puenta'); t < at('plansza') - 0.01; t += 2 * beat) thump(t, 0.9);
pad(at('puenta'), at('plansza') - at('puenta'), D, 1.1, 0.4, 0.2);
[62, 69].forEach((m) => note(at('puenta'), m, 2, 0.8));
[66, 74].forEach((m, i) => note(at('puenta', cues.puenta.line), m, 2.4, 1, i ? 0.3 : -0.3));

// 10 Plansza: the final chord with a tail to the last frame.
thump(at('plansza'), 1.2);
[38, 50, 57, 62, 66, 69, 74].forEach((m, i) => note(at('plansza'), m, 4, 1.3, ((i % 3) - 1) * 0.35));
pad(at('plansza'), 4, D, 1, 0.05, 2.6);

// --- reverb (four combs and two allpasses), mix, file ---------------------------------------------------
function reverb(input, shift) {
  const out = new Float32Array(N);
  for (const [ms, fb] of [[29.7, 0.82], [37.1, 0.8], [41.1, 0.78], [43.7, 0.76]]) {
    const d = Math.round(((ms + shift) / 1000) * SR);
    const buf = new Float32Array(d);
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[i % d];
      lp += 0.35 * (y - lp); // damping: the tail gets darker
      buf[i % d] = input[i] + lp * fb;
      out[i] += y * 0.25;
    }
  }
  for (const ms of [5, 1.7]) {
    const d = Math.round((ms / 1000) * SR);
    const buf = new Float32Array(d);
    for (let i = 0; i < N; i++) {
      const b = buf[i % d];
      const x = out[i] + 0.5 * b;
      buf[i % d] = x;
      out[i] = b - 0.5 * x;
    }
  }
  return out;
}
const tails = [reverb(wet, 0), reverb(wet, 1.3)];
const fade = Math.round(0.05 * SR);
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const edge = Math.min(1, i / 64, (N - 1 - i) / fade); // no click at either end
  for (let ch = 0; ch < 2; ch++) {
    const s = Math.tanh((dry[ch][i] + 0.6 * tails[ch][i]) * 1.4) * edge;
    pcm.writeInt16LE(Math.round(s * 32000), i * 4 + ch * 2);
  }
}
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);
const wav = join(mkdtempSync(join(tmpdir(), 'meritum-film-b-')), 'raw.wav');
writeFileSync(wav, Buffer.concat([header, pcm]));

// Two passes of loudnorm: measure, then apply the measured values so the gain stays linear where it can.
const target = 'I=-14:LRA=11:TP=-1.5';
const log = spawnSync('ffmpeg', ['-hide_banner', '-i', wav, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']).stderr.toString();
const m = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));
const out = join(root, 'public/audio/sciezka.m4a');
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', wav, '-af',
  `loudnorm=${target}:measured_I=${m.input_i}:measured_LRA=${m.input_lra}:measured_TP=${m.input_tp}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  '-ar', String(SR), '-c:a', 'aac', '-b:a', '256k', out]);
console.log(`sciezka.m4a: ${(N / SR).toFixed(2)} s, przed normalizacją ${m.input_i} LUFS, szczyt ${m.input_tp} dBTP`);
