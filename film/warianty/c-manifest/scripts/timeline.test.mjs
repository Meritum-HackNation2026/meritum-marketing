// Run: pnpm test. Checks the timeline that the committed voice take produces against the film's rules.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {BEAT, buildTimeline, FPS, toFrames} from '../src/timeline.ts';

const voice = JSON.parse(readFileSync(new URL('../src/data/voice.json', import.meta.url), 'utf8')).lines;
const script = JSON.parse(readFileSync(new URL('../scenariusz.json', import.meta.url), 'utf8')).lines;
const {shots, total} = buildTimeline(voice);
const shot = (id) => shots.find((s) => s.id === id);

test('the voice take is the committed script, word for word', () => {
  assert.deepEqual(voice.map((l) => l.text), script);
  for (const l of voice) assert.equal(l.words.map((w) => w.text).join(' '), l.text);
});

test('the film is 30 s within a second and every shot starts on a beat', () => {
  assert.ok(Math.abs(total / FPS - 30) <= 1, `${total / FPS} s`);
  for (const s of shots) assert.equal(s.from % BEAT, 0, s.id);
});

test('voice clips never overlap and each ends inside its shot', () => {
  const placed = shots.flatMap((s) => s.lines.map((l) => ({...l, end: s.from + s.duration})));
  placed.forEach((l, i) => {
    assert.ok(l.from + l.frames <= l.end);
    if (i) assert.ok(placed[i - 1].from + placed[i - 1].frames <= l.from);
  });
});

test('no shot is longer than 6 s; the held beat is the only one over 5 s', () => {
  for (const s of shots) assert.ok(s.duration <= 6 * FPS, `${s.id} ${s.duration}`);
  assert.ok(shot('proof').duration >= 4 * FPS);
  assert.equal(shots.filter((s) => s.duration > 5 * FPS).length, 1);
});

test('the first verdict is on screen before second 15 and the name is spoken before second 10', () => {
  assert.ok(shot('claimsProof').from < 15 * FPS);
  assert.ok(shot('name').lines[0].from < 10 * FPS);
});

test('the last word of every card stays for at least 25 frames', () => {
  for (const s of shots) {
    const last = s.lines.at(-1);
    if (!last) continue;
    const landed = last.from + toFrames(voice[last.index].words.at(-1).startMs);
    assert.ok(s.from + s.duration - landed >= 25, `${s.id}: ${s.from + s.duration - landed} frames`);
  }
});
