// Generates the voice-over with ElevenLabs and writes the audio plus word timings.
// Run from the variant folder:  ELEVENLABS_API_KEY=... node scripts/make-voice.mjs [--budget 500] [--out lektor] [--text "…"] [--reslice]
// The key comes from the environment only. The render never calls this: public/audio/lektor.mp3 and
// src/data/lektor.json are committed.
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !process.argv.includes('--reslice')) throw new Error('ELEVENLABS_API_KEY is not set');
const VOICE = arg('voice', 'Xb7hH8MSUJpSbSDYk0k2'); // Alice, a premade voice (the Free plan allows only those over the API)
const MODEL = 'eleven_multilingual_v2';
const out = arg('out', 'lektor');
const budget = Number(arg('budget', '500'));
const here = (p) => new URL(`../${p}`, import.meta.url);

// one spoken line per non-empty line of lektor.txt; lines starting with # are notes
const lines = (arg('text') ?? readFileSync(here('lektor.txt'), 'utf8'))
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));
const text = lines.join('\n\n');

const api = (path, init = {}) => fetch(`https://api.elevenlabs.io${path}`, {...init, headers: {'xi-api-key': KEY, 'content-type': 'application/json'}});
const quota = async () => {
  const s = await (await api('/v1/user/subscription')).json();
  return {used: s.character_count, limit: s.character_limit};
};

const reuse = process.argv.includes('--reslice'); // cut the committed take again from its word timings, no API call
const before = reuse ? null : await quota();
let words = [];
if (reuse) {
  words = JSON.parse(readFileSync(here(`src/data/${out}.json`), 'utf8')).words;
} else {
  if (text.length > budget) throw new Error(`text is ${text.length} characters, over the budget of ${budget}`);
  if (before.used + text.length > before.limit) throw new Error(`not enough quota: ${before.limit - before.used} left`);
  const res = await api(`/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    body: JSON.stringify({text, model_id: MODEL, voice_settings: {stability: 0.45, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1.0}}),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const {audio_base64, alignment: a} = await res.json();
  writeFileSync(here(`public/audio/${out}.mp3`), Buffer.from(audio_base64, 'base64'));

  // characters -> words -> lines. A double newline in the text ends a line.
  let w = '';
  let start = 0;
  let line = 0;
  const flush = (end) => {
    if (w) words.push({text: w, line, start: +start.toFixed(3), end: +end.toFixed(3)});
    w = '';
  };
  a.characters.forEach((c, i) => {
    if (c === '\n') {
      flush(a.character_start_times_seconds[i]);
      if (a.characters[i - 1] === '\n') line++;
    } else if (c === ' ') {
      flush(a.character_start_times_seconds[i]);
    } else {
      if (!w) start = a.character_start_times_seconds[i];
      w += c;
      if (i === a.characters.length - 1) flush(a.character_end_times_seconds[i]);
    }
  });
  if (line !== lines.length - 1) throw new Error(`expected ${lines.length} lines in the alignment, found ${line + 1}`);
}

// one file per line, cut in the silence between lines, so the film can place each line on its own beat
const clips = lines.map((_, i) => {
  const mine = words.filter((x) => x.line === i);
  const prev = words.filter((x) => x.line === i - 1).at(-1);
  const next = words.find((x) => x.line === i + 1);
  const start = prev ? Math.max((prev.end + mine[0].start) / 2, mine[0].start - 0.1) : 0;
  const end = next ? Math.min((mine.at(-1).end + next.start) / 2, mine.at(-1).end + 0.25) : mine.at(-1).end;
  const d = end - start;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', here(`public/audio/${out}.mp3`).pathname, '-ss', String(start), '-t', String(d), '-af', `afade=t=in:d=0.015,afade=t=out:st=${d - 0.03}:d=0.03`, '-ar', '48000', here(`public/audio/${out}-${i + 1}.wav`).pathname]);
  return {start: +start.toFixed(3), end: +end.toFixed(3)};
});
writeFileSync(here(`src/data/${out}.json`), JSON.stringify({voice: VOICE, model: MODEL, lines, clips, words}, null, 1) + '\n');

const after = reuse ? null : await quota();
console.log(`${out}: ${text.length} characters, ${words.at(-1).end} s` + (after ? `, account ${after.used}/${after.limit} (the counter can lag)` : ', resliced'));
