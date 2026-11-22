// One clock for picture and sound: 30 fps, 120 bpm, so a beat is 15 frames. Every shot starts on a beat.
// The shot lengths are not typed in: they follow from the length of the voice clips in src/data/voice.json.
export const FPS = 30;
export const BEAT = 15;

export type Word = {text: string; startMs: number; endMs: number};
export type VoiceLine = {text: string; file: string; durationMs: number; words: Word[]};

/** The order of the film. `lines` are spoken in the shot, `lead` and `tail` are silent beats around them, `beats` is a silent insert. */
export const PLAN = [
  {id: 'hook', lines: [0, 1]},
  {id: 'turn', lines: [2]},
  {id: 'name', lines: [3], tail: 1},
  {id: 'claims', lines: [4]},
  {id: 'claimsProof', beats: 4},
  {id: 'proof', lines: [5], lead: 2, tail: 1},
  {id: 'honest', lines: [6]},
  {id: 'abstain', beats: 4},
  {id: 'channels', lines: [7]},
  {id: 'end', lines: [8], tail: 4},
] as const satisfies readonly {id: string; lines?: readonly number[]; lead?: number; tail?: number; beats?: number}[];

export type ShotId = (typeof PLAN)[number]['id'];
/** A voice clip on the film's clock: `from` is the frame its audio starts. */
export type Placed = {index: number; from: number; frames: number};
export type Shot = {id: ShotId; from: number; duration: number; lines: Placed[]};

export const toFrames = (ms: number) => Math.round((ms * FPS) / 1000);
const nextBeat = (frame: number) => Math.ceil(frame / BEAT) * BEAT;

/**
 * Lays the plan on the beat grid. A line starts on a beat; the next line or shot starts on the first beat
 * after the clip ends, so a longer take moves everything after it and nothing overlaps.
 */
export function buildTimeline(voice: VoiceLine[]): {shots: Shot[]; total: number} {
  const shots: Shot[] = [];
  let at = 0;
  for (const p of PLAN) {
    const plan: {lines?: readonly number[]; lead?: number; tail?: number; beats?: number} = p;
    let cursor = at + (plan.lead ?? 0) * BEAT;
    const lines = (plan.lines ?? []).map((index) => {
      const placed = {index, from: cursor, frames: toFrames(voice[index].durationMs)};
      cursor = nextBeat(cursor + placed.frames);
      return placed;
    });
    const duration = cursor - at + ((plan.beats ?? 0) + (plan.tail ?? 0)) * BEAT;
    shots.push({id: p.id, from: at, duration, lines});
    at += duration;
  }
  return {shots, total: at};
}
