// Generates the voice-over with ElevenLabs (with-timestamps endpoint), cuts the take into one clip per
// script line and writes the word timings the film is timed to. The render never calls the API: the
// clips and src/data/voice.json are committed.
//
// Run from this folder, with the key coming from an env file that stays outside the repo:
//   node --env-file=/path/to/elevenlabs.env scripts/make-voice.mjs            full take from scenariusz.json
//   node --env-file=... scripts/make-voice.mjs --test "Meritum. Prawdowid."   short pronunciation test
//   node scripts/make-voice.mjs --recut take-1                                 cut a saved take again, no API call
// Options: --voice <id>  --take <label>  --budget <credits left for this variant>
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';

const here = (p) => new URL(`../${p}`, import.meta.url).pathname;
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};

const recut = arg('recut');
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !recut) throw new Error('ELEVENLABS_API_KEY is not set (use node --env-file=...)');
const VOICE = arg('voice', 'TX3LPaxmHKxFdv7VOQHJ'); // Liam, a premade voice: the Free plan allows only those over the API
const MODEL = 'eleven_multilingual_v2';
const BUDGET = Number(arg('budget', '400'));
const test = arg('test');
const take = recut ?? arg('take', test ? 'test' : 'take');

const lines = JSON.parse(readFileSync(here('scenariusz.json'), 'utf8')).lines;
const text = test ?? lines.join(' ');
if (text.length > BUDGET) throw new Error(`${text.length} characters is over the budget of ${BUDGET}`);

mkdirSync(here('lektor'), {recursive: true});
const raw = here(`lektor/${take}.mp3`);
if (!recut) {
  const api = (path, init = {}) => fetch(`https://api.elevenlabs.io${path}`, {...init, headers: {'xi-api-key': KEY, 'content-type': 'application/json'}});
  const left = async () => {
    const s = await (await api('/v1/user/subscription')).json();
    return s.character_limit - s.character_count;
  };
  const before = await left();
  if (before < text.length) throw new Error(`only ${before} credits left on the account, need ${text.length}`);
  const res = await api(`/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    body: JSON.stringify({text, model_id: MODEL, voice_settings: {stability: 0.45, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1.0}}),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = await res.json();
  writeFileSync(raw, Buffer.from(body.audio_base64, 'base64'));
  writeFileSync(here(`lektor/${take}.alignment.json`), JSON.stringify(body.alignment));
  // this model charges one credit per character; the account counter can lag behind
  console.log(`${take}: ${text.length} characters sent, ${before} credits were left on the account before the call`);
}
const a = JSON.parse(readFileSync(here(`lektor/${take}.alignment.json`), 'utf8'));

// characters -> words; a word runs from its first to its last non-space character
const words = [];
let cur = null;
a.characters.forEach((c, i) => {
  if (/\s/.test(c)) return void (cur = null);
  if (!cur) words.push((cur = {text: '', start: a.character_start_times_seconds[i], end: 0, at: i}));
  cur.text += c;
  cur.end = a.character_end_times_seconds[i];
});
if (test) {
  for (const w of words) console.log(`${w.start.toFixed(2)}-${w.end.toFixed(2)}  ${w.text}`);
  process.exit(0);
}

// level the whole take once (gentle compression, then -16 LUFS with peaks under -2 dBTP), so every clip matches
const level = here(`lektor/${take}.level.wav`);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af', 'acompressor=threshold=0.05:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-2:LRA=7', '-ar', '48000', '-ac', '1', level]);
// one clip per script line, cut in the silence between sentences
mkdirSync(here('public/audio/lektor'), {recursive: true});
const ms = (s) => Math.round(s * 1000);
let offset = 0;
const spans = lines.map((line) => {
  const mine = words.filter((w) => w.at >= offset && w.at < offset + line.length);
  offset += line.length + 1;
  return {line, mine};
});
const out = spans.map(({line, mine}, i) => {
  const prevEnd = i ? spans[i - 1].mine.at(-1).end : 0;
  const nextStart = spans[i + 1] ? spans[i + 1].mine[0].start : mine.at(-1).end + 0.4;
  const from = Math.max(mine[0].start - 0.06, (prevEnd + mine[0].start) / 2);
  const to = Math.min(mine.at(-1).end + 0.25, (mine.at(-1).end + nextStart) / 2);
  const file = `audio/lektor/linia-${String(i + 1).padStart(2, '0')}.wav`;
  const d = to - from;
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', from.toFixed(3), '-t', d.toFixed(3), '-i', level, '-af', `afade=t=in:d=0.02,afade=t=out:st=${(d - 0.05).toFixed(3)}:d=0.05`, '-ac', '1', here(`public/${file}`)]);
  return {text: line, file, durationMs: ms(d), words: mine.map((w) => ({text: w.text, startMs: ms(w.start - from), endMs: ms(w.end - from)}))};
});
rmSync(level);
writeFileSync(here('src/data/voice.json'), JSON.stringify({voice: VOICE, model: MODEL, lines: out}, null, 1) + '\n');
for (const l of out) console.log(`${(l.durationMs / 1000).toFixed(2)} s  ${l.text}`);
