// Synthesises the music bed and the interface sounds of variant A. No samples, no recordings, no
// dependencies: plain Node writes WAV files, ffmpeg packs the music into AAC. The voice-over is made
// separately by scripts/make-voice.mjs.
// Run: node scripts/make-audio.mjs   (from the variant folder). Output: public/audio/.
// The numbers mirror src/timeline.ts: 30 fps, 120 bpm, a beat is 15 frames, the film is 80 beats.
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';

const SR = 48000;
const BEAT = 60 / 120;
const BEATS = 80;
const OUT = new URL('../public/audio/', import.meta.url).pathname;
mkdirSync(OUT, {recursive: true});

// deterministic noise, so a rerun gives the same files
let seed = 20261122;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const buf = (seconds) => ({l: new Float32Array(Math.ceil(seconds * SR)), r: new Float32Array(Math.ceil(seconds * SR))});

/** Adds one voice to a stereo buffer. `fn(t)` is the sample at t seconds after `at`. */
function add(b, at, dur, gain, pan, fn) {
  const start = Math.round(at * SR);
  const n = Math.min(Math.round(dur * SR), b.l.length - start);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4);
  const gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR);
    b.l[start + i] += v * gl;
    b.r[start + i] += v * gr;
  }
}

const TAU = Math.PI * 2;
/** Soft bell: a sine with a little FM that dies fast, so the attack has an edge and the tail is pure. */
const bell = (f, decay = 5) => (t) =>
  Math.sin(TAU * f * t + 0.9 * Math.exp(-t * 14) * Math.sin(TAU * f * 2 * t)) * Math.exp(-t * decay) * Math.min(1, t * 400);
/** Pad partial: three harmonics under a slow swell. */
const pad = (f, dur) => (t) => {
  const e = Math.min(1, t / 1.4) * Math.min(1, (dur - t) / 1.6);
  return (Math.sin(TAU * f * t) + 0.22 * Math.sin(TAU * 2 * f * t) + 0.06 * Math.sin(TAU * 3 * f * t)) * e * e;
};
const bass = (f, dur) => (t) => {
  const e = Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.3);
  return (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2 * f * t)) * e;
};
const kick = () => {
  let ph = 0;
  return (t) => {
    ph += (TAU * (46 + 70 * Math.exp(-t * 38))) / SR;
    return Math.sin(ph) * Math.exp(-t * 13);
  };
};
/** Noise through a one-pole high-pass: a hat when short, air when long. */
const hiss = (decay, cut = 0.75) => {
  let last = 0;
  let lp = 0;
  return (t) => {
    const n = rnd();
    lp += cut * (n - lp);
    const hp = n - lp;
    last = hp;
    return last * Math.exp(-t * decay) * Math.min(1, t * 2000);
  };
};

/** Small Schroeder reverb on a send bus; returns the wet signal. */
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
        d[i] = x[n] + damp * 0.86;
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

/** Ping-pong delay, in place. */
function delay(b, time, feedback, mix) {
  const d = Math.round(time * SR);
  const dl = new Float32Array(b.l.length);
  const dr = new Float32Array(b.l.length);
  for (let n = d; n < b.l.length; n++) {
    dl[n] = b.r[n - d] * mix + dr[n - d] * feedback;
    dr[n] = b.l[n - d] * mix * 0.0 + dl[n - d] * feedback;
  }
  for (let n = 0; n < b.l.length; n++) {
    b.l[n] += dl[n];
    b.r[n] += dr[n];
  }
}

function mixInto(dst, src, gain = 1) {
  for (let n = 0; n < src.l.length && n < dst.l.length; n++) {
    dst.l[n] += src.l[n] * gain;
    dst.r[n] += src.r[n] * gain;
  }
}

/** Scales to a peak in dBFS after a gentle tanh, so nothing clips. */
function master(b, peakDb, fadeIn = 0, fadeOut = 0) {
  let peak = 0;
  for (let n = 0; n < b.l.length; n++) peak = Math.max(peak, Math.abs(b.l[n]), Math.abs(b.r[n]));
  const target = 10 ** (peakDb / 20);
  const drive = 1.4 / (peak || 1);
  const norm = target / Math.tanh(1.4);
  const len = b.l.length;
  for (let n = 0; n < len; n++) {
    let g = norm;
    if (fadeIn && n < fadeIn * SR) g *= n / (fadeIn * SR);
    if (fadeOut && n > len - fadeOut * SR) g *= ((len - n) / (fadeOut * SR)) ** 2;
    b.l[n] = Math.tanh(b.l[n] * drive) * g;
    b.r[n] = Math.tanh(b.r[n] * drive) * g;
  }
  return b;
}

function wav(name, b) {
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
  writeFileSync(OUT + name, out);
}

// ---------------------------------------------------------------- music

const CHORD = {
  D: {pad: [50, 57, 64, 66], bass: 38, arp: [62, 69, 74, 76, 78, 76, 74, 69]},
  Bm: {pad: [47, 54, 62, 69], bass: 35, arp: [59, 66, 71, 74, 78, 74, 71, 66]},
  G: {pad: [43, 50, 59, 66], bass: 43, arp: [55, 62, 67, 71, 78, 71, 67, 62]},
  A: {pad: [45, 52, 62, 64], bass: 45, arp: [57, 64, 69, 74, 76, 74, 69, 64]},
};
// [first beat, chord]: the changes sit on the scene cuts of src/timeline.ts
const CHANGES = [
  [0, 'D'], // hook: three messages and the question
  [8, 'Bm'], // the question hangs, the name lands on beat 10
  [12, 'G'], // paste
  [16, 'A'], // the check runs
  [20, 'D'], // verdict: the held beat
  [28, 'Bm'],
  [32, 'G'], // second claim
  [36, 'A'],
  [40, 'Bm'], // no evidence
  [47, 'G'], // the principle
  [54, 'A'], // channels
  [58, 'D'],
  [62, 'Bm'],
  [64, 'G'], // back to the message
  [68, 'A'],
  [70, 'D'], // end card
];
const within = (beat, spans) => spans.some(([a, b]) => beat >= a && beat < b);
const PULSE = [[0, 20], [32, 40], [54, 70]]; // off under the verdict, the abstention and the end card
const ARP = [[10, 20], [26, 40], [54, 70]];
const BASS = [[0, 40], [54, 70]];
const SPARSE = [[20, 26], [40, 54], [70, 76]];

function music() {
  const total = BEATS * BEAT;
  const dry = buf(total + 3);
  const wet = buf(total + 3);
  const lead = buf(total + 3);
  CHANGES.forEach(([from, name], i) => {
    const c = CHORD[name];
    const to = CHANGES[i + 1]?.[0] ?? BEATS;
    const dur = (to - from) * BEAT + 1.2;
    c.pad.forEach((m, k) => {
      for (const [cents, pan] of [[-5, -0.6], [5, 0.6]]) add(wet, from * BEAT, dur, 0.11 - k * 0.012, pan, pad(hz(m) * 2 ** (cents / 1200), dur));
    });
    for (let beat = from; beat < to; beat++) {
      const t0 = beat * BEAT;
      const n = beat - from;
      if (within(beat, BASS) && n % 2 === 0) add(dry, t0, BEAT * 1.8, 0.3, 0, bass(hz(c.bass), BEAT * 1.8));
      if (within(beat, ARP)) {
        for (const half of [0, 1]) {
          const k = (n * 2 + half) % 8;
          add(lead, t0 + half * BEAT * 0.5, 1.2, 0.12 * (k % 4 === 0 ? 1 : k % 2 === 0 ? 0.75 : 0.55), half ? 0.45 : -0.45, bell(hz(c.arp[k]), 6));
        }
      }
      if (within(beat, SPARSE) && n % 4 === 0) add(lead, t0, 2.6, 0.12, -0.3, bell(hz(c.arp[4]), 2.2));
      if (within(beat, PULSE)) {
        if (beat % 2 === 0) add(dry, t0, 0.4, 0.32, 0, kick());
        add(dry, t0 + BEAT * 0.5, 0.08, 0.04, beat % 2 ? 0.3 : -0.3, hiss(70));
      }
    }
  });
  delay(lead, BEAT * 0.75, 0.38, 0.45);
  mixInto(wet, lead, 0.7);
  reverb(wet, 1);
  mixInto(dry, wet);
  mixInto(dry, lead, 0.5);
  const out = buf(total);
  mixInto(out, dry);
  return master(out, -5, 0.02, 3);
}

// ---------------------------------------------------------------- interface sounds

function sfx(name, seconds, peakDb, build) {
  const b = buf(seconds);
  build(b);
  wav(name, master(b, peakDb, 0, Math.min(0.05, seconds / 4)));
}

// a message landing: a short low thump with a little air
sfx('slam.wav', 0.35, -11, (b) => {
  add(b, 0.003, 0.3, 1, 0, kick());
  add(b, 0.003, 0.05, 0.25, 0, hiss(160, 0.5));
});
// the name: the tonic and its fifth over a thump
sfx('hit.wav', 1.2, -9, (b) => {
  add(b, 0.003, 0.4, 0.9, 0, kick());
  [62, 69, 74].forEach((m, i) => add(b, 0.003, 1.1, 0.5, i * 0.3 - 0.3, bell(hz(m), 4)));
});
// one press of the button
sfx('click.wav', 0.2, -14, (b) => {
  add(b, 0.005, 0.03, 0.5, 0, hiss(220, 0.5));
  add(b, 0.005, 0.05, 0.6, 0, (t) => Math.sin(TAU * 1500 * t) * Math.exp(-t * 120));
  add(b, 0.06, 0.04, 0.35, 0, (t) => Math.sin(TAU * 1100 * t) * Math.exp(-t * 150));
});
// the nine steps of a check, 4.5 frames apart, climbing the scale
sfx('steps.wav', 9 * (4.5 / 30) + 0.5, -15, (b) => {
  [69, 71, 73, 74, 76, 78, 79, 81, 86].forEach((m, i) => add(b, 0.005 + (i + 1) * (4.5 / 30), 0.3, 0.6, (i % 3) * 0.25 - 0.25, bell(hz(m), 18)));
});
// verdict „Fałszywe”: low and plain, no buzzer
sfx('verdict-false.wav', 0.9, -9, (b) => {
  add(b, 0.005, 0.8, 1, 0, bell(hz(50), 6));
  add(b, 0.005, 0.8, 0.5, 0, bell(hz(57), 7));
});
// verdict „Potwierdzone”: a small rising figure in the key of the music
sfx('verdict-confirmed.wav', 1.2, -12, (b) => {
  [78, 81, 86].forEach((m, i) => add(b, 0.005 + i * 0.09, 1, 0.8, i * 0.25 - 0.25, bell(hz(m), 4.5)));
});
// verdict „Brak wystarczających dowodów”: one held note that does not resolve
sfx('verdict-open.wav', 1.4, -13, (b) => {
  add(b, 0.005, 1.3, 1, 0, bell(hz(76), 3));
  add(b, 0.005, 1.3, 0.4, 0, bell(hz(69), 3.5));
});
// something small landing: the pasted text, a row of the channel list
sfx('tick.wav', 0.2, -16, (b) => add(b, 0.005, 0.18, 1, 0, bell(hz(74), 30)));

wav('music.wav', music());
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', OUT + 'music.wav', '-c:a', 'aac', '-b:a', '192k', OUT + 'music.m4a']);
execFileSync('rm', [OUT + 'music.wav']);
console.log('audio written to', OUT);
