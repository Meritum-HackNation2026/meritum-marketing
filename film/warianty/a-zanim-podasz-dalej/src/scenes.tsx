// The scenes, each with its own clock starting at 0. Lengths and voice cues are in timeline.ts,
// the interface in ui.tsx. No pointer anywhere: the film shows results, not the way to the button.
import type {ReactNode} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import pl from './data/pl.json';
import {EASE, MaskLine, ramp, Rise, SampleLabel, Slam} from './motion';
import {CUE, MESSAGE, SCENES} from './timeline';
import {abstain, ClaimBlock, done, Field, Lockup, Progress, Surface, VerdictBadge} from './ui';

const LEFT = 132;
const [FIRST, SECOND] = MESSAGE.split(/(?<=,) /);

/** A piece of the interface laid out at `width` rem-pixels and enlarged, so the crop stays sharp. */
const Zoom = ({top, width, scale, children}: {top: number; width: number; scale: number; children: ReactNode}) => (
  <div className="absolute" style={{left: LEFT, top, width, scale, transformOrigin: '0 0'}}>
    {children}
  </div>
);

const Tag = ({children}: {children: ReactNode}) => (
  <p className="font-mono text-muted-foreground" style={{fontSize: 24, marginBottom: 14}}>
    {children}
  </p>
);

/** The forwarded message of the film, as a chat bubble. */
const Bubble = () => (
  <div style={{width: 1060}}>
    <Tag>przesłano dalej</Tag>
    <p className="bg-secondary font-semibold text-pretty" style={{fontSize: 50, lineHeight: 1.22, letterSpacing: '-0.015em', padding: '34px 44px', borderRadius: '36px 36px 36px 8px'}}>
      {MESSAGE}
    </p>
  </div>
);

/** 1. Three things that arrive every day, on three beats, and the question everyone asks themselves. */
export const Hook = () => {
  const frame = useCurrentFrame();
  const away = ramp(frame, 88);
  return (
    <Surface>
      <AbsoluteFill style={{filter: away > 0 ? `blur(${away * 14}px)` : undefined, opacity: 1 - 0.86 * away}}>
        <Slam at={0} className="absolute" style={{left: LEFT, top: 150, transformOrigin: 'left top'}}>
          <Bubble />
        </Slam>
        <Slam at={15} className="absolute rounded-xl border-2 border-border bg-card" style={{left: 800, top: 500, width: 990, padding: '32px 40px', transformOrigin: 'right center'}}>
          <Tag>post</Tag>
          <p className="font-semibold text-pretty" style={{fontSize: 54, lineHeight: 1.18, letterSpacing: '-0.02em'}}>
            {abstain[0].claim}
          </p>
        </Slam>
        <Slam at={30} className="absolute" style={{left: LEFT, top: 770, width: 1180, transformOrigin: 'left bottom'}}>
          <Tag>nagłówek</Tag>
          <p className="font-bold text-pretty" style={{fontSize: 74, lineHeight: 1.08, letterSpacing: '-0.03em'}}>
            {pl.conversation.examples[1]}
          </p>
        </Slam>
      </AbsoluteFill>
      <AbsoluteFill style={{left: LEFT, justifyContent: 'center'}}>
        {frame >= 90 && (
          <MaskLine at={90} className="font-bold" style={{fontSize: 230, lineHeight: 1, letterSpacing: '-0.04em'}}>
            Podać dalej?
          </MaskLine>
        )}
      </AbsoluteFill>
    </Surface>
  );
};

/** 2. The name, full frame, for one second. */
export const Name = () => (
  <Surface>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Slam at={0} from={1.06}>
        <Lockup size={250} />
      </Slam>
    </AbsoluteFill>
  </Surface>
);

/** 3. The message lands in the field whole and is sent. */
export const Paste = () => {
  const frame = useCurrentFrame();
  const pasted = frame >= 15;
  return (
    <Surface>
      <Zoom top={300} width={960} scale={1.7}>
        <div className="grid gap-6">
          <h1 className="text-headline font-bold tracking-tight">{pl.form.title}</h1>
          <Field value={pasted ? MESSAGE : ''} flash={pasted ? 1 - ramp(frame, 17, 12) : 0} press={interpolate(frame, [44, 47, 53], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
        </div>
      </Zoom>
    </Surface>
  );
};

/** 4. The check runs: nine steps tick off on sixteenth notes. */
export const Steps = () => {
  const frame = useCurrentFrame();
  return (
    <Surface>
      <Zoom top={140} width={900} scale={1.55}>
        <Progress doneCount={Math.max(0, Math.floor((frame - 2) / 4.5))} />
      </Zoom>
    </Surface>
  );
};

/** The checked message over a result, with the sentence in question in ink and the rest quiet. */
const Checked = ({part, at}: {part: 0 | 1; at?: number}) => (
  <Rise at={at} y={0} className="absolute font-medium" style={{left: LEFT, top: 176, fontSize: 30}}>
    <span className={part === 0 ? '' : 'text-muted-foreground'}>„{FIRST} </span>
    <span className={part === 1 ? '' : 'text-muted-foreground'}>{SECOND}”</span>
  </Rise>
);

/**
 * 5. The held beat. The verdict lands alone and close; the frame opens to the whole answer as the voice starts,
 * then the voice points at the quote and at the source. The only slow move of the film is the 3% push-in here.
 */
export const Proof = () => {
  const frame = useCurrentFrame();
  const close = interpolate(frame, [26, 38], [1.4, 1], {easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Surface>
      <AbsoluteFill style={{scale: close * interpolate(frame, [38, SCENES.proof], [1, 1.03], {extrapolateLeft: 'clamp'}), transformOrigin: `${LEFT}px 300px`}}>
        <Checked part={0} at={30} />
        <Zoom top={236} width={1104} scale={1.45}>
          <ClaimBlock claim={done[0]} at={4} rest={30} mark="tylko raz" markAt={CUE.quote} sourceAt={CUE.source} />
        </Zoom>
      </AbsoluteFill>
      <SampleLabel />
    </Surface>
  );
};

/** 6. The second sentence of the same message gets its own verdict. */
export const Second = () => (
  <Surface>
    <Checked part={1} />
    <Zoom top={236} width={1104} scale={1.45}>
      <ClaimBlock claim={done[1]} at={15} />
    </Zoom>
    <SampleLabel />
  </Surface>
);

/** 7. Another message, and no publication about it: the answer says so. */
export const Abstain = () => (
  <Surface>
    <Zoom top={310} width={900} scale={1.8}>
      <ClaimBlock claim={abstain[0]} at={15} />
    </Zoom>
    <SampleLabel />
  </Surface>
);

/** 8. The principle, in the words the voice is saying. */
export const Principle = () => (
  <Surface dark>
    <AbsoluteFill className="font-bold" style={{left: LEFT, justifyContent: 'center', fontSize: 168, lineHeight: 1.04, letterSpacing: '-0.04em'}}>
      <MaskLine at={CUE.know}>Nie wiemy,</MaskLine>
      <MaskLine at={CUE.guess}>więc nie zgadujemy.</MaskLine>
    </AbsoluteFill>
  </Surface>
);

const channels = [
  {name: 'strona WWW', how: 'formularz, bez konta', at: CUE.web},
  {name: 'Discord', how: 'komenda /sprawdz', at: CUE.discord},
  {name: 'wtyczka Chrome', how: 'przycisk „Sprawdź” pod postem', at: CUE.extension},
];

/** 9. Three ways in, one answer: each row lands as the voice names it. */
export const Channels = () => {
  const frame = useCurrentFrame();
  return (
    <Surface>
      <p className="absolute text-muted-foreground" style={{left: LEFT, top: 184, fontSize: 40}}>
        „{done[0].claim}”
      </p>
      <div className="absolute grid" style={{left: LEFT, right: LEFT, top: 300}}>
        {channels.map((c) => (
          <Rise key={c.name} at={c.at} className="flex items-center border-t border-border" style={{height: 196}}>
            <span className="font-semibold" style={{fontSize: 88, letterSpacing: '-0.03em', width: 800}}>
              {c.name}
            </span>
            <span className="font-mono text-muted-foreground" style={{fontSize: 26}}>
              {c.how}
            </span>
            <span className="ml-auto flex" style={{zoom: 2.2, scale: 1.25 - 0.25 * ramp(frame, c.at, 7), transformOrigin: 'right center'}}>
              <VerdictBadge verdict="false" />
            </span>
          </Rise>
        ))}
      </div>
      <SampleLabel />
    </Surface>
  );
};

/** 10. Back to the first message, now with what was found about each sentence. */
export const Payoff = () => (
  <Surface>
    <div className="absolute" style={{left: LEFT, top: 150}}>
      <Bubble />
    </div>
    <div className="absolute grid" style={{left: LEFT + 44, top: 498, rowGap: 18}}>
      {done.map((c, i) => (
        <Slam key={c.claim} at={15 + i * 15} from={1.15} className="flex items-center" style={{gap: 22, transformOrigin: 'left center'}}>
          <span className="flex" style={{zoom: 2}}>
            <VerdictBadge verdict={c.verdict} />
          </span>
          <span className="text-muted-foreground" style={{fontSize: 32}}>
            {i === 0 ? '…trzy kadencje' : '…językiem urzędowym jest polski'}
          </span>
        </Slam>
      ))}
    </div>
    <MaskLine at={8} className="absolute font-bold" style={{left: LEFT, top: 730, fontSize: 124, lineHeight: 1.05, letterSpacing: '-0.035em'}}>
      {pl.brand.taglines[0]}
    </MaskLine>
    <SampleLabel />
  </Surface>
);

/** 11. The end card: the logo, the subtitle and one line. Everything is still from frame 24. */
export const End = () => {
  const frame = useCurrentFrame();
  return (
    <Surface>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Lockup size={210} draw={ramp(frame, 0, 14)} />
        <Rise at={8} className="font-logo text-muted-foreground" style={{fontSize: 58, marginTop: 30}}>
          {pl.brand.subtitle}
        </Rise>
        <Rise at={14} className="font-mono" style={{fontSize: 30, marginTop: 110}}>
          Projekt konkursowy · Prawdowid · HackNation 2026
        </Rise>
      </AbsoluteFill>
      <Rise at={14} className="absolute w-full text-center font-mono text-muted-foreground" style={{bottom: 56, fontSize: 20}}>
        Lektor: ElevenLabs (elevenlabs.io)
      </Rise>
    </Surface>
  );
};
