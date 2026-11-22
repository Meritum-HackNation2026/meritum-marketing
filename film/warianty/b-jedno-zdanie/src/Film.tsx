// „Jedno zdanie”: one sentence followed through Meritum. Ten scenes, hard cuts only, every cut on the beat grid
// of the soundtrack (120 bpm, 15 frames per beat, 60 per bar). Scene lengths and cue frames live in
// timeline.json, which scripts/make-audio.mjs reads too, so picture and sound cannot drift apart.
import {Audio} from '@remotion/media';
import {AbsoluteFill, Interactive, interpolate, Series, staticFile, useCurrentFrame} from 'remotion';
import {C, Caption, enter, Lockup, MONO, Reveal, Stage} from './parts';
import timeline from './timeline.json';
import {abstain, asked, done, Pill, Proof, Search} from './ui';

const {scenes: S, cues: Q} = timeline;
// the request as sent, cut at its comma: the two halves the claims come from
const [first, second] = [asked.slice(0, asked.indexOf(',') + 1), asked.slice(asked.indexOf(',') + 2)];

const SENTENCE = {fontSize: 124, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.08, textWrap: 'balance'} as const;

/** The sentence as it travels: alone on black, with the count of forwards ticking next to it. */
const Rumor = ({text, ticks}: {text: string; ticks: number[]}) => {
  const frame = useCurrentFrame();
  const past = ticks.filter((t) => t <= frame);
  const bump = interpolate(frame - (past.at(-1) ?? -99), [0, 5], [1.25, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Stage dark>
      <div style={{position: 'absolute', left: 160, top: 150, bottom: 60, width: 1600, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 64}}>
        <Reveal style={SENTENCE}>„{text}”</Reveal>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, fontFamily: MONO, fontSize: 40, color: C.mutedOnBlack, opacity: past.length ? 1 : 0}}>
          podano dalej:
          <span style={{display: 'inline-block', color: C.onBlack, scale: bump, transformOrigin: '0 80%'}}>{past.length}</span>
        </div>
      </div>
    </Stage>
  );
};

/** The name, early and large, with the one sentence that says what it does. */
const Name = () => {
  const frame = useCurrentFrame();
  return (
    <Stage bug={false}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'grid', gap: 26}}>
          <Lockup size={190} draw={enter(frame, 0, 10)} />
          <Interactive.Div name="Co robi" style={{fontSize: 64, fontWeight: 600, letterSpacing: '-0.02em', paddingLeft: 250}}>
            sprawdza to w źródłach
          </Interactive.Div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/** The sentence under Meritum: cut at the comma, then the two claims it holds. */
const Cut = () => {
  const frame = useCurrentFrame();
  const {split} = Q.ciecie;
  const p = enter(frame, split);
  if (frame < split) {
    return (
      <Stage>
        <div style={{position: 'absolute', left: 160, top: 150, bottom: 60, width: 1600, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 64}}>
          <div style={SENTENCE}>
            „{first}
            <span style={{display: 'inline-block', width: 10, height: '1em', margin: '0 0.1em -0.14em', backgroundColor: C.ink, scale: `1 ${enter(frame, 0, 6)}`}} />
            {second}”
          </div>
          <div style={{fontFamily: MONO, fontSize: 40, color: C.faint}}>podano dalej: {Q.zdanie.ticks.length}</div>
        </div>
      </Stage>
    );
  }
  return (
    <Stage sample>
      <div style={{position: 'absolute', left: 160, top: 196, width: 1600, display: 'grid', gap: 64}}>
        {done.map((c, i) => (
          <div key={c.claim} style={{display: 'grid', gap: 14, translate: `0 ${(1 - p) * (i ? -36 : 36)}px`}}>
            <span style={{fontFamily: MONO, fontSize: 28, color: C.muted}}>twierdzenie {i + 1} z 2</span>
            <span style={{fontSize: 78, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1, textWrap: 'balance'}}>„{c.claim}”</span>
          </div>
        ))}
      </div>
      <Caption at={split}>Dwa twierdzenia.</Caption>
    </Stage>
  );
};

/** What Meritum does when nothing is found, as one sentence on an empty page. */
const Principle = () => (
  <Stage>
    <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 160}}>
      <Reveal>
        <Interactive.Div name="Zasada" style={{fontSize: 168, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.02, width: 1300}}>
          Nie wiemy, więc nie zgadujemy.
        </Interactive.Div>
      </Reveal>
    </AbsoluteFill>
  </Stage>
);

/** Back to the first sentence, each half with its verdict; the count of forwards has stopped. */
const Payoff = () => (
  <Stage sample>
    <div style={{position: 'absolute', left: 160, top: 210, width: 1600, display: 'grid', gap: 44}}>
      {[first, second].map((half, i) => (
        <div key={half} style={{display: 'grid', gap: 18, justifyItems: 'start'}}>
          <Pill verdict={done[i].verdict} at={i * 8} />
          <span style={{fontSize: 70, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, whiteSpace: 'nowrap'}}>
            {i === 0 && '„'}
            {half}
            {i === 1 && '”'}
          </span>
        </div>
      ))}
      <div style={{fontFamily: MONO, fontSize: 34, color: C.faint}}>podano dalej: {Q.zdanie.ticks.length}</div>
    </div>
    <Caption at={Q.puenta.line}>Sprawdź, zanim podasz dalej.</Caption>
  </Stage>
);

/** The end card: logo, subtitle, one line. Everything is in place after 15 frames and then stands still. */
const EndCard = () => {
  const frame = useCurrentFrame();
  return (
    <Stage bug={false}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'grid', gap: 20, marginTop: -60}}>
          <Lockup size={200} draw={enter(frame, 0, 12)} />
          <Interactive.Div name="Podtytuł" style={{fontFamily: 'Archivo', fontSize: 58, color: '#5A5D62', paddingLeft: 262, opacity: enter(frame, 6)}}>
            obywatelski radar dezinformacji
          </Interactive.Div>
        </div>
      </AbsoluteFill>
      <Interactive.Div name="Linia konkursu" style={{position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', fontSize: 34, color: '#5A5D62', opacity: enter(frame, 6)}}>
        Projekt konkursowy · Prawdowid · HackNation 2026
      </Interactive.Div>
    </Stage>
  );
};

/** Second half of the first sentence: the same path at speed, then its verdict. */
const Second = () => {
  const frame = useCurrentFrame();
  const q = Q.drugie;
  if (frame < q.verdict) return <Search claim={done[1]} n="2 z 2" steps={q.steps} found={q.found} lock={q.lock} />;
  return <Proof claim={done[1]} at={q.verdict} hit="językiem urzędowym jest język polski" />;
};

/** Another sentence, and this time no source: the search comes back empty and Meritum says so. */
const Turn = () => {
  const frame = useCurrentFrame();
  const q = Q.zwrot;
  if (frame < q.search) return <Rumor text={abstain.claim} ticks={q.ticks} />;
  if (frame < q.result) return <Search claim={abstain} n="1 z 1" steps={q.steps} />;
  return <Proof claim={abstain} at={q.verdict} />;
};

export const Film = () => (
  <AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
    <Series>
      <Series.Sequence name="1 Zdanie" durationInFrames={S.zdanie}>
        <Rumor text={asked} ticks={Q.zdanie.ticks} />
      </Series.Sequence>
      <Series.Sequence name="2 Nazwa" durationInFrames={S.nazwa}>
        <Name />
      </Series.Sequence>
      <Series.Sequence name="3 Cięcie" durationInFrames={S.ciecie}>
        <Cut />
      </Series.Sequence>
      <Series.Sequence name="4 Szukanie" durationInFrames={S.szukanie}>
        <Search claim={done[0]} n="1 z 2" {...Q.szukanie} caption="Cytat musi być w źródle słowo w słowo." />
      </Series.Sequence>
      <Series.Sequence name="5 Werdykt" durationInFrames={S.werdykt}>
        <Proof claim={done[0]} at={Q.werdykt.verdict} mark={Q.werdykt.mark} sourceAt={Q.werdykt.source} strengthAt={Q.werdykt.strength} hit="tylko raz" miss="trzy kadencje" brand push={S.werdykt} />
      </Series.Sequence>
      <Series.Sequence name="6 Drugie twierdzenie" durationInFrames={S.drugie}>
        <Second />
      </Series.Sequence>
      <Series.Sequence name="7 Zwrot" durationInFrames={S.zwrot}>
        <Turn />
      </Series.Sequence>
      <Series.Sequence name="8 Zasada" durationInFrames={S.zasada}>
        <Principle />
      </Series.Sequence>
      <Series.Sequence name="9 Puenta" durationInFrames={S.puenta}>
        <Payoff />
      </Series.Sequence>
      <Series.Sequence name="10 Plansza" durationInFrames={S.plansza}>
        <EndCard />
      </Series.Sequence>
    </Series>
    <Audio name="Ścieżka dźwiękowa" src={staticFile('audio/sciezka.m4a')} />
  </AbsoluteFill>
);
