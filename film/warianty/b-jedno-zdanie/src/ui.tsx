// Fragments of the Meritum result, enlarged for a 1920 px frame. Structure and wording follow the merged
// components (meritum-frontend: claim-row.tsx, citation-item.tsx, verdict-badge.tsx, strength-meter.tsx,
// analysis-steps.tsx); texts come from copy/pl.json and results from contracts/examples.json.
import {interpolate, useCurrentFrame} from 'remotion';
import examples from './data/examples.json';
import pl from './data/pl.json';
import {C, Caption, enter, Lockup, Marked, MONO, Reveal, Rise, Stage, TONE} from './parts';

type Citation = (typeof examples)['CheckResult.done']['claims'][number]['citations'][number];
export type Claim = {claim: string; verdict: string; citations: Citation[]; strength?: {level: string}; unresolved?: string};

export const done = examples['CheckResult.done'].claims as Claim[];
export const abstain = examples['CheckResult.abstain'].claims[0] as Claim;
/** The sentence as it was sent in: the two claims of `done` come from it. */
export const asked = examples.CheckRequest.text;

const day = new Intl.DateTimeFormat('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'});
const STEPS = (['search_corpus', 'search_web', 'assess_evidence', 'verify_citations'] as const).map((k) => pl.analysis.steps[k]);
const BARS = {weak: 1, moderate: 2, strong: 3} as Record<string, number>;

const Check = () => (
  <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const Row = ({done: isDone, label}: {done: boolean; label: string}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 40, height: 64, color: isDone ? C.ink : C.muted}}>
    <span style={{width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {isDone ? <Check /> : <span style={{width: 14, height: 14, borderRadius: 7, backgroundColor: C.ink}} />}
    </span>
    {label}
  </div>
);

/** Title, publisher and date of a source, then its kind and tier as two labels. */
const Source = ({c, at, labels = true}: {c: Citation; at: number; labels?: boolean}) => (
  <Rise at={at} style={{display: 'grid', gap: 14, paddingLeft: 56}}>
    <div style={{fontSize: 34, color: C.muted}}>
      <span style={{fontWeight: 600, color: C.ink, textDecoration: 'underline', textDecorationColor: 'rgba(10,10,10,0.35)', textUnderlineOffset: 6}}>{c.source.title}</span>
      <div style={{marginTop: 6}}>
        {c.source.publisher}, {day.format(new Date(c.source.published_at))}
      </div>
    </div>
    <div style={{display: labels ? 'flex' : 'none', gap: 10}}>
      {[pl.source_kind[c.source.kind as keyof typeof pl.source_kind], pl.source_tier[c.source.tier as keyof typeof pl.source_tier]].map((label) => (
        <span key={label} style={{fontSize: 28, color: C.muted, backgroundColor: C.secondary, borderRadius: 999, padding: '5px 20px'}}>
          {label}
        </span>
      ))}
    </div>
  </Rise>
);

/** The verbatim fragment with its opening mark hanging in the margin. `children` is the fragment's text. */
const Quote = ({children}: {children: React.ReactNode}) => (
  <div style={{position: 'relative', paddingLeft: 56, fontSize: 54, lineHeight: 1.26, maxWidth: 1600, textWrap: 'balance'}}>
    <span style={{position: 'absolute', left: 0, top: -4, fontSize: 104, lineHeight: 1, fontWeight: 700}}>„</span>
    {children}”
  </div>
);

/**
 * A claim being checked. The steps cascade on `steps`; with a source, the fragment arrives at `found` and is read
 * word by word until `lock`, when its source line appears. Without one, the place for a quote stays empty.
 */
export const Search = ({claim, n, steps, found, lock, caption}: {claim: Claim; n: string; steps: number[]; found?: number; lock?: number; caption?: string}) => {
  const frame = useCurrentFrame();
  const c = claim.citations[0];
  const reading = found !== undefined && lock !== undefined && frame >= found;
  const words = c ? c.fragment.split(' ') : [];
  // the reading head: how many words have been compared with the source so far
  const head = reading ? interpolate(frame, [found, lock], [0, words.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <Stage sample>
      <div style={{position: 'absolute', left: 160, top: 176, width: 1600, display: 'grid', gap: 20}}>
        <div style={{fontFamily: MONO, fontSize: 28, color: C.muted}}>twierdzenie {n}</div>
        <div style={{fontSize: 78, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1, textWrap: 'balance'}}>„{claim.claim}”</div>
      </div>
      <div style={{position: 'absolute', left: 160, top: 460, width: 1600}}>
        {reading ? (
          <div style={{display: 'grid', gap: 22}}>
            <Row done={frame >= lock} label={STEPS[3]} />
            <Quote>
              {words.map((w, i) => (
                <span key={i} style={{color: i < head ? C.ink : C.faint, backgroundColor: i < head && i >= head - 3 && frame < lock ? C.secondary : 'transparent', borderRadius: 6}}>
                  {w}
                  {i < words.length - 1 && ' '}
                </span>
              ))}
            </Quote>
            <Source c={c} at={lock} labels={false} />
          </div>
        ) : (
          <div style={{display: 'grid'}}>
            {STEPS.map((label, i) => (
              <Rise key={label} at={steps[i]}>
                <Row done={frame >= (steps[i + 1] ?? Infinity)} label={label} />
              </Rise>
            ))}
            {found === undefined && (
              <Rise at={steps[3]} style={{marginTop: 26, height: 170, width: 1600, borderRadius: 8, border: `3px dashed ${C.faint}`}}>
                <span />
              </Rise>
            )}
          </div>
        )}
      </div>
      {caption && reading && <Caption at={found}>{caption}</Caption>}
    </Stage>
  );
};

/**
 * The result of one claim: the verdict as a large word in its ink, the claim, the fragment with the words that
 * decide marked, the source and the strength of the basis. `brand` puts the logo at full size above the verdict.
 */
export const Proof = ({claim, at, mark, sourceAt, strengthAt, hit, miss, brand = false, push = 0}: {claim: Claim; at: number; mark?: number; sourceAt?: number; strengthAt?: number; hit?: string; miss?: string; brand?: boolean; push?: number}) => {
  const frame = useCurrentFrame();
  const tone = TONE[claim.verdict];
  const c = claim.citations[0];
  const v = enter(frame, at, 6);
  const m = mark === undefined ? 1 : enter(frame, mark, 10);
  const long = claim.verdict === 'insufficient_evidence';
  return (
    <Stage sample bug={!brand}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '18% 42%', scale: interpolate(frame, [0, push || 1], [1, push ? 1.03 : 1], {extrapolateRight: 'clamp'})}}>
        <div style={{position: 'absolute', left: 160, top: brand ? 40 : 150, bottom: 40, width: 1600, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28}}>
          {brand && (
            <div style={{marginBottom: 10, marginLeft: -8}}>
              <Lockup size={88} />
            </div>
          )}
          <div style={{fontSize: long ? 116 : 200, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1, color: tone.ink, opacity: v, scale: 1.05 - 0.05 * v, transformOrigin: '0 60%'}}>
            {pl.verdict[claim.verdict as keyof typeof pl.verdict]}
          </div>
          <div style={{fontSize: 50, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.2}}>
            „<Marked text={claim.claim} needle={miss ?? ''} p={miss ? m : 0} color={tone.ink} strike />”
          </div>
          {c && (
            <div style={{display: 'grid', gap: 20, marginTop: 10}}>
              <Quote>
                <Marked text={c.fragment} needle={hit ?? ''} p={hit ? m : 0} color={tone.surface} ink={tone.ink} />
              </Quote>
              <Source c={c} at={sourceAt ?? at} />
            </div>
          )}
          {claim.strength && (
            <Rise at={strengthAt ?? at} style={{display: 'flex', alignItems: 'center', gap: 18, fontSize: 34, color: C.muted, paddingLeft: 56}}>
              {pl.result.strength_title}
              <span style={{display: 'flex', alignItems: 'flex-end', gap: 4}}>
                {[1, 2, 3].map((k) => (
                  <span key={k} style={{width: 12, height: 6 + k * 9, borderRadius: 3, backgroundColor: k <= BARS[claim.strength!.level] ? C.ink : C.border}} />
                ))}
              </span>
              <span style={{fontWeight: 600, color: C.ink}}>{pl.strength[claim.strength.level as keyof typeof pl.strength]}</span>
            </Rise>
          )}
          {claim.unresolved && (
            <Rise at={at + 8} style={{display: 'grid', gap: 10, fontSize: 44, marginTop: 20}}>
              <span style={{fontWeight: 600}}>{pl.result.unresolved}</span>
              <span style={{color: C.muted}}>{claim.unresolved}</span>
            </Rise>
          )}
        </div>
      </div>
    </Stage>
  );
};

/** The verdict as the small label of a result row. */
export const Pill = ({verdict, at}: {verdict: string; at: number}) => {
  const p = enter(useCurrentFrame(), at, 6);
  const tone = TONE[verdict];
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', fontSize: 40, fontWeight: 600, color: tone.pill, backgroundColor: tone.surface, borderRadius: 999, padding: '8px 30px', whiteSpace: 'nowrap', opacity: p, scale: 0.92 + 0.08 * p}}>
      {pl.verdict[verdict as keyof typeof pl.verdict]}
    </span>
  );
};

export {Reveal};
