// The manifesto type. A line of the voice-over is on screen from the cut as a pale ghost, so it reads with
// the sound off; each word turns to ink in the frame the voice starts it. Nothing moves after it lands.
import {useCurrentFrame} from 'remotion';
import {toFrames, type VoiceLine} from './timeline';
import {ramp} from './ui';

/** Size of the statements. The film uses this, `SIDE` for the column next to the proof, and small UI text. */
export const DISPLAY = 140;
export const SIDE = 96;

type Props = {
  line: VoiceLine;
  /** Frame, inside the shot, at which the line's audio starts. */
  at: number;
  /** How many words go in each row. Words left out of the rows are spoken but not set. */
  rows: number[];
  /** Words to leave out at the start (the name, when the logo stands for it). */
  skip?: number;
  size?: number;
};

export const Spoken = ({line, at, rows, skip = 0, size = DISPLAY}: Props) => {
  const frame = useCurrentFrame();
  const starts = rows.map((_, r) => skip + rows.slice(0, r).reduce((a, b) => a + b, 0));
  return (
    <div className="font-sans font-bold" style={{fontSize: size, lineHeight: 1.06, letterSpacing: '-0.035em'}}>
      {rows.map((n, r) => (
        <div key={starts[r]} className="flex whitespace-nowrap" style={{gap: '0.23em'}}>
          {line.words.slice(starts[r], starts[r] + n).map((w) => {
            const p = ramp(frame, at + toFrames(w.startMs), 7);
            return (
              <span key={w.startMs} style={{position: 'relative'}}>
                <span style={{opacity: 0.14}}>{w.text}</span>
                {/* the ink copy is uncovered from the baseline up; the outsets keep ogonki and accents whole */}
                <span style={{position: 'absolute', left: 0, top: 0, clipPath: `inset(${(1 - p) * 130 - 15}% -10% -15% -10%)`}}>{w.text}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
