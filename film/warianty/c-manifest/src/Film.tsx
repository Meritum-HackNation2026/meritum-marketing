// The film: shots and voice clips placed by the timeline that the voice take produces, music under them.
import {Audio} from '@remotion/media';
import {AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import data from './data/voice.json';
import {SHOTS} from './shots';
import {buildTimeline} from './timeline';

const voice = data.lines;
const {shots, total} = buildTimeline(voice);
export const TOTAL = total;
const clips = shots.flatMap((s) => s.lines);

/** Music at full level in the gaps, 14 dB lower while the voice speaks. */
const Music = () => {
  const frame = useCurrentFrame();
  const duck = clips.reduce((v, c) => Math.min(v, interpolate(frame, [c.from - 8, c.from, c.from + c.frames - 6, c.from + c.frames + 4], [1, 0.2, 0.2, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})), 1);
  return <Audio name="Muzyka" src={staticFile('audio/music.m4a')} volume={0.7 * duck} />;
};

export const Film = () => (
  <AbsoluteFill className="bg-background">
    {shots.map((s) => {
      const Shot = SHOTS[s.id];
      return (
        <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.duration}>
          <Shot lines={s.lines.map((l) => ({line: voice[l.index], at: l.from - s.from}))} />
        </Sequence>
      );
    })}
    {clips.map((c) => (
      <Sequence key={c.index} name={`Lektor: ${voice[c.index].text}`} from={c.from} durationInFrames={c.frames} layout="none">
        <Audio src={staticFile(voice[c.index].file)} />
      </Sequence>
    ))}
    <Music />
  </AbsoluteFill>
);
