// The ten shots. Type shots set a voice line; proof shots show the interface with sample results.
import type {CSSProperties, FC, ReactNode} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import pl from './data/pl.json';
import {BEAT, type ShotId, toFrames, type VoiceLine} from './timeline';
import {SIDE, Spoken} from './type';
import {abstain, Bug, done, EDGE, Lockup, Message, ramp, request, SampleLabel, VerdictBadge, WIDTH} from './ui';

/** The voice lines of a shot with the frame, inside the shot, at which each starts. */
export type ShotProps = {lines: {line: VoiceLine; at: number}[]};

const Page = ({dark = false, children}: {dark?: boolean; children: ReactNode}) => (
  <AbsoluteFill className={`bg-background font-sans text-foreground antialiased ${dark ? 'dark' : ''}`}>{children}</AbsoluteFill>
);
const block = (top: number): CSSProperties => ({position: 'absolute', left: EDGE, top, width: WIDTH});
/** The frame, inside the shot, at which word `n` of a line is spoken. */
const wordAt = ({line, at}: ShotProps['lines'][number], n: number) => at + toFrames(line.words[n].startMs);
const day = new Intl.DateTimeFormat('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'});

/** „Ktoś to napisał. Ktoś podał dalej.” over the message itself. */
const Hook: FC<ShotProps> = ({lines}) => (
  <Page>
    <Bug />
    <Message>„{request}”</Message>
    <div style={block(480)}>
      <Spoken {...lines[0]} rows={[3]} />
      <Spoken {...lines[1]} rows={[3]} />
    </div>
  </Page>
);

/** „A skąd to wiadomo?” */
const Turn: FC<ShotProps> = ({lines}) => (
  <Page>
    <Bug />
    <Message>„{request}”</Message>
    <div style={block(554)}>
      <Spoken {...lines[0]} rows={[4]} />
    </div>
  </Page>
);

/** The name as the answer: the logo at full size stands for the first word of the line. */
const Name: FC<ShotProps> = ({lines}) => {
  const p = ramp(useCurrentFrame(), 0);
  return (
    <Page>
      <div style={{...block(300), overflow: 'hidden', paddingBottom: 20}}>
        <Lockup size={220} style={{translate: `0 ${(1 - p) * 105}%`}} />
      </div>
      <div style={block(590)}>
        <Spoken {...lines[0]} skip={1} rows={[4]} />
      </div>
    </Page>
  );
};

/** „Każde twierdzenie dostaje osobny werdykt.” */
const Claims: FC<ShotProps> = ({lines}) => (
  <Page>
    <Bug />
    <div style={block(392)}>
      <Spoken {...lines[0]} rows={[2, 3]} />
    </div>
  </Page>
);

const Row = ({verdict, at, children}: {verdict: 'false' | 'confirmed'; at: number; children: ReactNode}) => (
  <div className="grid items-center" style={{gridTemplateColumns: '400px 1fr', padding: '26px 0'}}>
    <span className="flex">
      <VerdictBadge verdict={verdict} size={46} at={at} />
    </span>
    <span className="font-semibold" style={{fontSize: 52, lineHeight: 1.22}}>
      „{children}”
    </span>
  </div>
);

/** Proof of the line before: the message is two claims, and each has its own verdict. */
const ClaimsProof: FC = () => (
  <Page>
    <Bug />
    <Message>„{request}”</Message>
    <div style={block(480)}>
      <Row verdict="false" at={4}>
        {done[0].claim}
      </Row>
      <Row verdict="confirmed" at={BEAT}>
        {done[1].claim}
      </Row>
    </div>
    <SampleLabel />
  </Page>
);

/** The held beat, on ink: the verdict lands first, then the quote and the source come up with their words. */
const Proof: FC<ShotProps> = ({lines}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {fragment, source} = done[0].citations[0];
  const [before, after] = fragment.split('tylko raz');
  const quote = 0.4 + 0.6 * ramp(frame, wordAt(lines[0], 3));
  const mark = ramp(frame, wordAt(lines[0], 4), 10);
  const cited = ramp(frame, wordAt(lines[0], 8));
  return (
    <Page dark>
      <Lockup size={84} style={{position: 'absolute', left: EDGE, top: 130}} />
      <div style={{position: 'absolute', left: EDGE, top: 350}}>
        <Spoken {...lines[0]} rows={[2, 2, 3, 2]} size={SIDE} />
      </div>
      <div
        className="bg-muted"
        style={{position: 'absolute', left: 900, top: 96, width: 1920 - EDGE - 900, borderRadius: 24, padding: '52px 64px 52px', scale: interpolate(frame, [0, durationInFrames], [1, 1.03]), transformOrigin: 'right center'}}
      >
        <div className="font-bold text-scam-foreground" style={{fontSize: 104, lineHeight: 1, letterSpacing: '-0.03em', opacity: ramp(frame, 0), scale: 0.9 + 0.1 * ramp(frame, 0), transformOrigin: 'left center'}}>
          {pl.verdict.false}
        </div>
        <div className="font-semibold" style={{fontSize: 38, lineHeight: 1.3, marginTop: 26}}>
          „{done[0].claim}”
        </div>
        <blockquote style={{fontSize: 44, lineHeight: 1.34, marginTop: 48, opacity: quote}}>
          „{before}
          <span style={{position: 'relative', whiteSpace: 'nowrap'}}>
            <span className="bg-foreground" style={{position: 'absolute', inset: '0.08em -0.14em', borderRadius: 6, scale: `${mark} 1`, transformOrigin: 'left center'}} />
            <span className={mark > 0.5 ? 'text-background' : ''} style={{position: 'relative', fontWeight: 600}}>
              tylko raz
            </span>
          </span>
          {after}”
        </blockquote>
        <div style={{marginTop: 36, opacity: 0.4 + 0.6 * cited}}>
          <div className="font-semibold" style={{fontSize: 32, lineHeight: 1.3, width: 'fit-content', position: 'relative'}}>
            {source.title}
            <span className="bg-foreground" style={{position: 'absolute', left: 0, right: 0, bottom: -4, height: 3, scale: `${cited} 1`, transformOrigin: 'left center'}} />
          </div>
          <div className="text-muted-foreground" style={{fontSize: 27, marginTop: 16}}>
            {source.publisher}, {day.format(new Date(source.published_at))} · <span className="font-mono">{source.domain}</span>
          </div>
        </div>
      </div>
      <SampleLabel />
    </Page>
  );
};

/** „Jak nie wiemy, to nie zgadujemy.” */
const Honest: FC<ShotProps> = ({lines}) => (
  <Page>
    <Bug />
    <div style={block(392)}>
      <Spoken {...lines[0]} rows={[3, 3]} />
    </div>
  </Page>
);

/** Proof of the line before: a claim with no publication behind it gets no guess. */
const Abstain: FC = () => (
  <Page>
    <Bug />
    <Message>„{abstain.claim}”</Message>
    <div style={block(498)}>
      <VerdictBadge verdict="insufficient_evidence" size={72} at={4} />
      <div className="font-semibold" style={{fontSize: 46, marginTop: 60}}>
        {pl.result.unresolved}
      </div>
      <div className="text-muted-foreground" style={{fontSize: 46, lineHeight: 1.3, marginTop: 10}}>
        {abstain.unresolved}
      </div>
    </div>
    <SampleLabel />
  </Page>
);

// the word of the voice line each channel lands on: „na stronie”, „na Discordzie”, „we wtyczce”
const CHANNELS = [
  {name: 'strona WWW', word: 3},
  {name: 'Discord', word: 5},
  {name: 'wtyczka Chrome', word: 8},
];

/** „Ten sam wynik” and the three channels, each landing on its word with the same verdict. */
const Channels: FC<ShotProps> = ({lines}) => {
  const frame = useCurrentFrame();
  return (
    <Page>
      <Bug />
      <div style={block(200)}>
        <Spoken {...lines[0]} rows={[3]} />
        <div className="text-muted-foreground" style={{fontSize: 40, marginTop: 20}}>
          „{done[0].claim}”
        </div>
        <div style={{marginTop: 64}}>
          {CHANNELS.map((c) => {
            const at = wordAt(lines[0], c.word);
            return (
              <div key={c.name} className="grid items-center" style={{gridTemplateColumns: '760px 1fr', height: 150}}>
                <span className="font-bold" style={{fontSize: 88, letterSpacing: '-0.03em', opacity: 0.14 + 0.86 * ramp(frame, at)}}>
                  {c.name}
                </span>
                <span className="flex">
                  <VerdictBadge verdict="false" size={52} at={at + 3} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <SampleLabel />
    </Page>
  );
};

/** The end card: logo, subtitle, the last line of the voice, the competition and the voice credit. */
const End: FC<ShotProps> = ({lines}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, 0);
  return (
    <Page>
      <div style={{...block(190), overflow: 'hidden', paddingBottom: 16}}>
        <Lockup size={150} style={{translate: `0 ${(1 - p) * 105}%`}} />
      </div>
      <div className="font-logo text-muted-foreground" style={{...block(366), fontSize: 46, opacity: ramp(frame, 6)}}>
        {pl.brand.subtitle}
      </div>
      <div style={block(520)}>
        <Spoken {...lines[0]} skip={1} rows={[1, 3]} />
      </div>
      <div className="flex items-baseline justify-between text-muted-foreground" style={{...block(0), top: undefined, bottom: 60}}>
        <span style={{fontSize: 28}}>Projekt konkursowy · Prawdowid · HackNation 2026</span>
        <span style={{fontSize: 22}}>Lektor: ElevenLabs (elevenlabs.io)</span>
      </div>
    </Page>
  );
};

export const SHOTS: Record<ShotId, FC<ShotProps>> = {
  hook: Hook,
  turn: Turn,
  name: Name,
  claims: Claims,
  claimsProof: ClaimsProof,
  proof: Proof,
  honest: Honest,
  abstain: Abstain,
  channels: Channels,
  end: End,
};
