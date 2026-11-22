// One clock for picture, voice and music: 30 fps, 120 bpm, so a beat is 15 frames and a bar is 60 (2 s).
// scripts/make-audio.mjs writes the music on the same grid. Scenes are hard cuts on beats.
import voice from './data/lektor.json';

export const FPS = 30;
export const BEAT = 15;

/** The scenes in order with their lengths in frames. Film.tsx lays them out with <Series>. */
export const SCENES = {
  hook: 10 * BEAT, // three messages on three beats, then „Podać dalej?” on beat 6
  name: 2 * BEAT, // the wordmark, full frame
  paste: 4 * BEAT,
  steps: 4 * BEAT,
  proof: 12 * BEAT, // the held beat: verdict, quote, source
  second: 8 * BEAT,
  abstain: 7 * BEAT,
  principle: 7 * BEAT,
  channels: 10 * BEAT,
  payoff: 6 * BEAT,
  end: 10 * BEAT,
} as const;
export type Scene = keyof typeof SCENES;

const names = Object.keys(SCENES) as Scene[];
/** Absolute frame at which a scene starts. */
export const START = Object.fromEntries(names.map((n, i) => [n, names.slice(0, i).reduce((sum, k) => sum + SCENES[k], 0)])) as Record<Scene, number>;
export const TOTAL = names.reduce((sum, k) => sum + SCENES[k], 0);

/** Where each spoken line starts: the scene it belongs to and the offset inside it. Order as in lektor.txt. */
const PLACED: [Scene, number][] = [
  ['hook', 6], // Dostajesz to codziennie.
  ['hook', 96], // Podać dalej?
  ['name', 3], // Meritum sprawdza takie wiadomości w źródłach.
  ['proof', 30], // Każde twierdzenie dostaje werdykt, z cytatem i ze źródłem.
  ['second', 6], // A drugie zdanie z tej samej wiadomości się zgadza.
  ['abstain', 8], // Kiedy źródeł brakuje, Meritum mówi wprost: nie wiemy, więc nie zgadujemy.
  ['channels', 6], // Na stronie, na Discordzie i we wtyczce wynik jest ten sam.
  ['payoff', 8], // Sprawdź, zanim podasz dalej.
  ['end', 6], // Meritum. Obywatelski radar dezinformacji.
];

/** The spoken lines on the film's clock: file, first frame and length. */
export const LINES = voice.clips.map((clip, i) => {
  const [scene, offset] = PLACED[i];
  return {text: voice.lines[i], src: `audio/lektor-${i + 1}.wav`, from: START[scene] + offset, frames: Math.ceil((clip.end - clip.start) * FPS), clipStart: clip.start};
});

/** Frame, counted from the start of `scene`, at which the given word of a spoken line begins. */
export const cue = (scene: Scene, line: number, word: string): number => {
  const w = voice.words.find((x) => x.line === line && x.text.replace(/[.,:?]/g, '') === word);
  if (!w) throw new Error(`no word „${word}” in line ${line}`);
  return Math.round(LINES[line].from + (w.start - LINES[line].clipStart) * FPS) - START[scene];
};

// fail the build, not the film: a line may not run into the next one or past the end
LINES.forEach((l, i) => {
  const limit = LINES[i + 1]?.from ?? TOTAL;
  if (l.from + l.frames > limit) throw new Error(`line ${i + 1} ends at ${l.from + l.frames}, after ${limit}`);
});

export const MESSAGE = 'Prezydent w Polsce może rządzić przez trzy kadencje, a językiem urzędowym jest polski.';

/** Moments that follow the voice, in frames from the start of their scene. */
export const CUE = {
  quote: cue('proof', 3, 'cytatem'), // the two words of the quote that settle the claim
  source: cue('proof', 3, 'źródłem'),
  know: cue('principle', 5, 'nie'),
  guess: cue('principle', 5, 'więc'),
  web: cue('channels', 6, 'stronie') - 4,
  discord: cue('channels', 6, 'Discordzie') - 4,
  extension: cue('channels', 6, 'wtyczce') - 4,
};
