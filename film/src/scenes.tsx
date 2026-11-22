// The nine scenes. Each one is a page of the interface (or a title) with its own clock starting at 0.
// The interface itself is in ui.tsx; here are only the timings: what appears when, where the camera
// looks, where the pointer goes.
import {type ReactNode, useRef} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import pl from './data/pl.json';
import {camera, Caption, Cursor, Dim, EASE_IN_OUT, MaskLine, point, ramp, Rise, SampleLabel, type Shot, span, useAnchors} from './motion';
import {PHASE, QUESTION, TYPE_CADENCE, WORD_CADENCE} from './timeline';
import {abstain, Bar, Columns, done, Field, Home, ListProgress, ListResult, Logotype, Mark, NewCheck, phases, Quoted, Rail, STRENGTH_AT, Surface, type Theme, VerdictBadge} from './ui';

const CENTRE: [number, number] = [960, 540];
const BANKOMATY = abstain[0].claim;
const earlier = {claim: BANKOMATY, verdict: 'insufficient_evidence', at: '13:47'};
const checked = {claim: QUESTION, verdict: 'false', at: '14:02'};

/** A page under the camera. The bar stays; the content below it fades at both ends of the scene. */
const Page = ({pageRef, shots, bar, children, over}: {pageRef: React.RefObject<HTMLDivElement | null>; shots: Shot[]; bar: ReactNode; children: ReactNode; over?: ReactNode}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div ref={pageRef} className="absolute top-0 left-0" style={{width: 1920, minHeight: 1080, ...camera(frame, shots)}}>
      {bar}
      <div style={{opacity: span(frame, 0, durationInFrames, 9)}}>{children}</div>
      {over}
    </div>
  );
};

/** 1. A forwarded message, word by word, and the question everyone asks themselves. */
export const Hook = () => {
  const frame = useCurrentFrame();
  const words = QUESTION.split(' ');
  const away = ramp(frame, 106, 26);
  return (
    <Surface>
      <AbsoluteFill style={{left: 132, width: 1560, justifyContent: 'center', opacity: 1 - ramp(frame, 184, 14), translate: `0 ${-40 * ramp(frame, 184, 16)}px`}}>
        <Dim k={away}>
          <Rise at={4} className="font-mono text-muted-foreground" style={{fontSize: 26}}>
            wiadomość przesłana dalej
          </Rise>
          <p className="font-semibold text-pretty" style={{fontSize: 88, lineHeight: 1.1, letterSpacing: '-0.025em', marginTop: 28}}>
            „
            {words.map((w, i) => {
              const p = ramp(frame, 14 + i * WORD_CADENCE, 12);
              return (
                <span key={i} style={{opacity: p, filter: `blur(${(1 - p) * 10}px)`}}>
                  {w}
                  {i < words.length - 1 ? ' ' : '”'}
                </span>
              );
            })}
          </p>
        </Dim>
        <MaskLine at={110} d={24} className="font-bold" style={{fontSize: 176, lineHeight: 1, letterSpacing: '-0.035em', marginTop: 72}}>
          Podać dalej?
        </MaskLine>
      </AbsoluteFill>
    </Surface>
  );
};

/** 2. The home page: the tagline, a real result beside it, and the one button. */
export const HomeScene = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const a = useAnchors(ref);
  const cta = point(a, 'cta');
  return (
    <Surface>
      <Page
        pageRef={ref}
        bar={<Bar />}
        shots={[
          {f: 0, s: 1, at: CENTRE},
          {f: 78, s: 1, at: CENTRE},
          {f: 128, s: 1.1, at: [960, 510]},
          {f: 200, s: 1.1, at: [960, 510]},
          {f: 232, s: 1, at: CENTRE},
        ]}
        over={<Cursor from={96} to={236} clicks={[166]} moves={[{f: 100, to: [1180, 900]}, {f: 152, to: cta}]} />}
      >
        <Home at={2} press={span(frame, 163, 173, 4)} />
      </Page>
      <Caption from={48} to={204}>
        Bez konta i bez instalacji.
      </Caption>
      <SampleLabel from={24} to={240} />
    </Surface>
  );
};

/** 3. The form: the message goes into the field and is sent. */
export const FormScene = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const a = useAnchors(ref);
  const typed = Math.max(0, Math.min(QUESTION.length, Math.floor((frame - 46) / TYPE_CADENCE)));
  const typing = typed > 0 && typed < QUESTION.length;
  const field = point(a, 'field', 0.5, 0.55);
  return (
    <Surface>
      <Page
        pageRef={ref}
        bar={<Bar current="sprawdz" />}
        shots={[
          {f: 0, s: 1, at: CENTRE},
          {f: 28, s: 1, at: CENTRE},
          {f: 64, s: 1.34, at: field},
          {f: 236, s: 1.34, at: field},
          {f: 268, s: 1, at: CENTRE},
        ]}
        over={
          <Cursor
            from={6}
            to={262}
            clicks={[38, 234]}
            moves={[
              {f: 8, to: [1150, 820]},
              {f: 34, to: point(a, 'field', 0.3, 0.3)},
              {f: 198, to: point(a, 'field', 0.3, 0.3)},
              {f: 226, to: point(a, 'submit')},
            ]}
          />
        }
      >
        <Columns rail={<Rail items={[earlier]} at={8} />}>
          <NewCheck at={0} field={<Field value={QUESTION.slice(0, typed)} focus={frame >= 38} caret={frame >= 38 && (typing || frame % 20 < 12)} press={span(frame, 231, 241, 4)} />} />
        </Columns>
      </Page>
      <Caption from={52} to={218}>
        Wklejasz tekst albo link.
      </Caption>
    </Surface>
  );
};

/** 4. The check runs: seven phases, the three searches side by side. */
export const ProgressScene = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const a = useAnchors(ref);
  const start = 24;
  const phase = Math.max(0, Math.min(phases.length, Math.floor((frame - start) / PHASE)));
  const total = phases.flat().length;
  const over = (n: number) => phases.slice(0, n).flat().length / total;
  const value = over(Math.max(0, phase - 1)) + (over(phase) - over(Math.max(0, phase - 1))) * ramp(frame, start + phase * PHASE, 16);
  // the open list ends 19.5rem under the „Pokaż kroki” line; keep its last row above the caption
  const steps: [number, number] = [960, point(a, 'show-steps', 0.5, 1)[1] + 468 - 282];
  return (
    <Surface>
      <Page
        pageRef={ref}
        bar={<Bar current="sprawdz" />}
        shots={[
          {f: 0, s: 1, at: CENTRE},
          {f: 40, s: 1, at: CENTRE},
          {f: 84, s: 1.1, at: steps},
          {f: 276, s: 1.1, at: steps},
          {f: 308, s: 1, at: CENTRE},
        ]}
        over={<Cursor from={4} to={70} clicks={[30]} moves={[{f: 6, to: [1100, 760]}, {f: 27, to: point(a, 'show-steps', 0.5, 0.6)}]} />}
      >
        <Columns rail={<Rail withNew items={[{claim: QUESTION, at: '14:02'}, earlier]} at={6} />}>
          <Quoted at={0}>{QUESTION}</Quoted>
          <Rise at={8}>
            <ListProgress phase={phase} value={value} open={ramp(frame, 31, 24)} />
          </Rise>
        </Columns>
      </Page>
      <Caption from={44} to={174}>
        Każde sprawdzenie przechodzi przez te same kroki.
      </Caption>
      <Caption from={186} to={300}>
        Cytat przechodzi dalej tylko wtedy, gdy jest dosłownie w źródle.
      </Caption>
    </Surface>
  );
};

/** 5. The result: two claims, each with its verdict, the quote, the source and the strength. */
export const ResultScene = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const a = useAnchors(ref);
  const first = 36;
  const gap = 384;
  const evidence = point(a, 'c0.evidence', 0.5, 0.45);
  const strength = point(a, 'c0.strength', 1.6, -1.4);
  const second = point(a, 'c1', 0.55, 0.5);
  const away = span(frame, 84, 392, 22);
  return (
    <Surface>
      <Page
        pageRef={ref}
        bar={<Bar current="sprawdz" />}
        shots={[
          {f: 0, s: 1, at: CENTRE},
          {f: 56, s: 1, at: CENTRE},
          {f: 96, s: 1.5, at: evidence},
          {f: 236, s: 1.5, at: evidence},
          {f: 268, s: 1.95, at: strength},
          {f: 372, s: 1.95, at: strength},
          {f: 412, s: 1.3, at: second},
          {f: 516, s: 1.3, at: second},
          {f: 550, s: 1, at: CENTRE},
        ]}
        over={
          <Cursor
            from={250}
            to={380}
            moves={[
              {f: 252, to: [strength[0] + 260, strength[1] + 150]},
              {f: 278, to: point(a, 'c0.strength', 0.3, 0.7)},
            ]}
          />
        }
      >
        <Columns
          rail={
            <Dim k={away}>
              <Rail withNew items={[checked, earlier]} at={6} />
            </Dim>
          }
        >
          <Dim k={away}>
            <Quoted at={2}>{QUESTION}</Quoted>
          </Dim>
          <ListResult
            list={done}
            at={first - 20}
            gap={gap}
            footAt={first + gap + 110}
            note={span(frame, 282, 372, 10)}
            dim={(part) => (part === 'c0' ? 0 : away)}
          />
        </Columns>
      </Page>
      <Caption from={100} to={228}>
        Każdy werdykt ma cytat, wydawcę i datę.
      </Caption>
      <Caption from={272} to={368}>
        Siła wynika z tego, co widzisz.
      </Caption>
      <Caption from={first + gap + 14} to={524}>
        Dwa twierdzenia, dwa werdykty.
      </Caption>
      <SampleLabel from={10} to={560} />
    </Surface>
  );
};

/** How long the strength line of the first claim takes to arrive, for the sound of its bars. */
export const RESULT_BARS = 36 + STRENGTH_AT + 6;

/** 6. No sources, no verdict: the system says what it could not establish. */
export const AbstainScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const a = useAnchors(ref);
  const claim = point(a, 'c0', 0.5, 0.15);
  return (
    <Surface>
      <Page
        pageRef={ref}
        bar={<Bar current="sprawdz" />}
        shots={[
          {f: 0, s: 1, at: CENTRE},
          {f: 44, s: 1, at: CENTRE},
          {f: 84, s: 1.3, at: claim},
          {f: 198, s: 1.3, at: claim},
          {f: 230, s: 1, at: CENTRE},
        ]}
      >
        <Columns rail={<Rail withNew items={[checked, earlier]} at={6} />}>
          <Quoted at={2}>{BANKOMATY}</Quoted>
          <ListResult list={abstain} at={12} footAt={96} />
        </Columns>
      </Page>
      <Caption from={74} to={214}>
        Nie wiemy, więc nie zgadujemy.
      </Caption>
      <SampleLabel from={10} to={240} />
    </Surface>
  );
};

/** 7. The display menu: the same page in the dark theme, then in high contrast. */
export const DisplayScene = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const ref = useRef<HTMLDivElement>(null);
  const a = useAnchors(ref);
  const display = point(a, 'display');
  const dark = point(a, 'theme.dark', 0.3, 0.5);
  const contrast = point(a, 'theme.contrast', 0.3, 0.5);
  const menu = span(frame, 34, 74, 9) + span(frame, 132, 170, 9);
  const hover: Theme | undefined = frame >= 52 && frame < 74 ? 'dark' : frame >= 150 && frame < 170 ? 'contrast' : undefined;
  const layer = (theme: Theme, measured: boolean) => (
    <>
      <Page pageRef={measured ? ref : {current: null}} bar={<Bar current="sprawdz" theme={theme} menu={menu} hover={hover} />} shots={[{f: 0, s: 1, at: CENTRE}]}>
        <Columns rail={<Rail withNew items={[checked, earlier]} />}>
          <Quoted>{QUESTION}</Quoted>
          <ListResult list={done} />
        </Columns>
      </Page>
      <Caption from={78} to={durationInFrames - 14}>
        Tryb ciemny i wysoki kontrast.
      </Caption>
      <SampleLabel from={-20} to={durationInFrames + 20} />
    </>
  );
  // the new theme opens as a circle from the spot that was clicked
  const iris = (from: number, at: [number, number]) => `circle(${interpolate(frame, [from, from + 44], [0, 2300], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT})}px at ${at[0]}px ${at[1]}px)`;
  return (
    <AbsoluteFill>
      <Surface>{layer('light', true)}</Surface>
      {frame >= 62 && (
        <Surface theme="dark" style={{clipPath: iris(62, dark)}}>
          {layer('dark', false)}
        </Surface>
      )}
      {frame >= 160 && (
        <Surface theme="contrast" style={{clipPath: iris(160, contrast)}}>
          {layer('contrast', false)}
        </Surface>
      )}
      <Surface className="bg-transparent!" theme={frame < 80 ? 'light' : 'dark'}>
        <Cursor
          from={6}
          to={196}
          clicks={[34, 62, 132, 160]}
          moves={[
            {f: 8, to: [1420, 520]},
            {f: 30, to: display},
            {f: 40, to: display},
            {f: 58, to: dark},
            {f: 108, to: dark},
            {f: 128, to: display},
            {f: 138, to: display},
            {f: 156, to: contrast},
          ]}
        />
      </Surface>
    </AbsoluteFill>
  );
};

const channels = [
  {name: 'strona WWW', how: 'Formularz, bez konta i bez instalacji.'},
  {name: 'Discord', how: '/sprawdz albo „Sprawdź w Meritum” przy wiadomości.'},
  {name: 'wtyczka Chrome', how: 'Przycisk „Sprawdź” pod postem.'},
];

/** 8. One core, several channels: the same claim gets the same verdict in each. */
export const ChannelsScene = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <Surface theme="dark">
      <AbsoluteFill style={{left: 132, width: 1656, justifyContent: 'center', opacity: span(frame, 0, durationInFrames + 30, 10)}}>
        <MaskLine at={6} className="font-bold" style={{fontSize: 104, lineHeight: 1.05, letterSpacing: '-0.03em'}}>
          Jeden rdzeń, ten sam wynik.
        </MaskLine>
        <Rise at={24} className="text-muted-foreground" style={{fontSize: 40, lineHeight: 1.3, marginTop: 28}}>
          „{done[0].claim}”
        </Rise>
        <div className="grid" style={{marginTop: 84, rowGap: 44}}>
          {channels.map((c, i) => (
            <div key={c.name} className="grid items-center" style={{gridTemplateColumns: '420px 1fr 260px', columnGap: 48}}>
              <Rise at={56 + i * 30} className="font-semibold" style={{fontSize: 52, letterSpacing: '-0.02em'}}>
                {c.name}
              </Rise>
              <Rise at={62 + i * 30} className="text-muted-foreground" style={{fontSize: 32}}>
                {c.how}
              </Rise>
              <span className="flex justify-end" style={{scale: 2.4, transformOrigin: 'right center', opacity: ramp(frame, 72 + i * 30, 12)}}>
                <VerdictBadge verdict="false" />
              </span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <SampleLabel from={30} to={durationInFrames + 30} />
    </Surface>
  );
};

/** 9. The name, the subtitle and the promise. White wipes back in from the left. */
export const Closing = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const open = ramp(frame, 0, 30, EASE_IN_OUT);
  return (
    <Surface style={{clipPath: `inset(0 ${(1 - open) * 100}% 0 0)`}}>
      <AbsoluteFill style={{left: 132, width: 1656, justifyContent: 'center', opacity: 1 - ramp(frame, durationInFrames - 18, 16)}}>
        <div className="flex items-center" style={{gap: 40}}>
          <Mark className="size-[8.5rem]" draw={ramp(frame, 22, 44, EASE_IN_OUT)} />
          <MaskLine at={40} d={26}>
            <Logotype className="text-[7rem] leading-none" />
          </MaskLine>
        </div>
        <Rise at={62} className="font-logo text-muted-foreground" style={{fontSize: 50, marginTop: 20}}>
          {pl.brand.subtitle}
        </Rise>
        <div className="font-semibold" style={{fontSize: 68, lineHeight: 1.16, letterSpacing: '-0.025em', marginTop: 96}}>
          {pl.brand.taglines[1].split(/(?<=\.) /).map((line, i) => (
            <MaskLine key={line} at={88 + i * 12}>
              {line}
            </MaskLine>
          ))}
        </div>
      </AbsoluteFill>
      <Rise at={126} className="absolute font-mono text-muted-foreground" style={{left: 132, bottom: 84, fontSize: 24}}>
        HackNation 2026 · konkurs MSZ „Prawdowid”
      </Rise>
    </Surface>
  );
};
