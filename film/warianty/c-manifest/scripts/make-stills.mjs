// One still per shot into kadry/, taken two thirds into the shot. Run from this folder: node scripts/make-stills.mjs
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {buildTimeline} from '../src/timeline.ts';

const voice = JSON.parse(readFileSync(new URL('../src/data/voice.json', import.meta.url), 'utf8')).lines;
buildTimeline(voice).shots.forEach((s, i) => {
  const frame = s.from + Math.round(s.duration * 0.67);
  execFileSync('pnpm', ['exec', 'remotion', 'still', 'FilmC', `kadry/${String(i + 1).padStart(2, '0')}-${s.id}.jpg`, `--frame=${frame}`, '--image-format=jpeg', '--jpeg-quality=88', '--log=error'], {stdio: 'inherit'});
});
