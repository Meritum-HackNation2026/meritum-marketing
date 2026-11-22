// The whole film: eleven scenes cut on beats, the brand in the corner from the first frame, the voice,
// the music ducked under it and the interface sounds. Lengths and voice cues live in timeline.ts.
import {Audio} from '@remotion/media';
import {AbsoluteFill, interpolate, Sequence, Series, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {ramp} from './motion';
import {Abstain, Channels, End, Hook, Name, Paste, Payoff, Principle, Proof, Second, Steps} from './scenes';
import {CUE, LINES, SCENES, START} from './timeline';
import {Lockup} from './ui';

/** The logo in the corner. It grows when the verdict lands and stays large while results are on screen. */
const Bug = () => {
  const frame = useCurrentFrame();
  const full = frame < START.name + SCENES.name ? frame >= START.name : frame >= START.end;
  if (full) return null; // the logo fills the frame in these two scenes
  const large = frame >= START.proof && frame < START.abstain;
  const dark = frame >= START.principle && frame < START.channels;
  return (
    <div className="absolute" style={{left: 72, top: 52, color: dark ? '#EDEDED' : '#0A0A0A', scale: large ? 1 + 0.75 * ramp(frame, START.proof + 4, 7) : 1, transformOrigin: '0 0'}}>
      <Lockup size={46} />
    </div>
  );
};

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** The music, pulled down about 12 dB while the voice speaks and back up in the gaps. */
const Music = () => {
  const frame = useCurrentFrame();
  const duck = LINES.reduce((v, l) => Math.min(v, interpolate(frame, [l.from - 8, l.from, l.from + l.frames - 6, l.from + l.frames + 4], [1, 0.26, 0.26, 1], CLAMP)), 1);
  return <Audio name="Muzyka" src={staticFile('audio/music.m4a')} volume={0.62 * duck} />;
};

const sfx = (file: string) => staticFile(`audio/${file}.wav`);

export const Film = () => (
  <AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
    <Series>
      <Series.Sequence name="1 Wiadomości i pytanie" durationInFrames={SCENES.hook}>
        <Hook />
      </Series.Sequence>
      <Series.Sequence name="2 Nazwa" durationInFrames={SCENES.name}>
        <Name />
      </Series.Sequence>
      <Series.Sequence name="3 Wklejenie" durationInFrames={SCENES.paste}>
        <Paste />
      </Series.Sequence>
      <Series.Sequence name="4 Sprawdzanie" durationInFrames={SCENES.steps}>
        <Steps />
      </Series.Sequence>
      <Series.Sequence name="5 Werdykt, cytat, źródło" durationInFrames={SCENES.proof}>
        <Proof />
      </Series.Sequence>
      <Series.Sequence name="6 Drugie twierdzenie" durationInFrames={SCENES.second}>
        <Second />
      </Series.Sequence>
      <Series.Sequence name="7 Brak dowodów" durationInFrames={SCENES.abstain}>
        <Abstain />
      </Series.Sequence>
      <Series.Sequence name="8 Zasada" durationInFrames={SCENES.principle}>
        <Principle />
      </Series.Sequence>
      <Series.Sequence name="9 Kanały" durationInFrames={SCENES.channels}>
        <Channels />
      </Series.Sequence>
      <Series.Sequence name="10 Powrót do wiadomości" durationInFrames={SCENES.payoff}>
        <Payoff />
      </Series.Sequence>
      <Series.Sequence name="11 Plansza końcowa" durationInFrames={SCENES.end}>
        <End />
      </Series.Sequence>
    </Series>
    <Bug />

    <Music />
    {LINES.map((l, i) => (
      <Sequence key={l.src} name={`Lektor ${i + 1}: ${l.text}`} from={l.from} durationInFrames={l.frames} layout="none">
        <Audio src={staticFile(l.src)} />
      </Sequence>
    ))}

    <Audio name="Wiadomość 1" src={sfx('slam')} from={0} volume={0.8} />
    <Audio name="Wiadomość 2" src={sfx('slam')} from={15} volume={0.8} />
    <Audio name="Wiadomość 3" src={sfx('slam')} from={30} volume={0.8} />
    <Audio name="Nazwa" src={sfx('hit')} from={START.name} />
    <Audio name="Wklejenie" src={sfx('tick')} from={START.paste + 15} />
    <Audio name="Wyślij" src={sfx('click')} from={START.paste + 45} />
    <Audio name="Kroki" src={sfx('steps')} from={START.steps + 2} volume={0.8} />
    <Audio name="Fałszywe" src={sfx('verdict-false')} from={START.proof + 4} />
    <Audio name="Potwierdzone" src={sfx('verdict-confirmed')} from={START.second + 15} volume={0.7} />
    <Audio name="Brak dowodów" src={sfx('verdict-open')} from={START.abstain + 15} volume={0.7} />
    <Audio name="Strona WWW" src={sfx('tick')} from={START.channels + CUE.web} />
    <Audio name="Discord" src={sfx('tick')} from={START.channels + CUE.discord} />
    <Audio name="Wtyczka" src={sfx('tick')} from={START.channels + CUE.extension} />
  </AbsoluteFill>
);
