// The pieces of the Meritum interface the film shows, drawn as plain React at film scale. Colours, radii and
// typefaces are the design system tokens (src/tokens, theme „Atrament”); the claim row and the verdict label
// follow components/meritum/claim-row.tsx and verdict-badge.tsx of meritum-frontend. Verdict names come from
// copy/pl.json, results from contracts/examples.json.
import type {CSSProperties, ReactNode} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import examples from './data/examples.json';
import pl from './data/pl.json';

/** The curve from tokens/meritum.css (--ease-out-meritum). The only easing in the film. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
/** 0 before `at`, 1 from `at + d` on. Entrances take 8 frames unless a shot says otherwise. */
export const ramp = (frame: number, at: number, d = 8) => interpolate(frame, [at, at + d], [0, 1], {easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export type Verdict = keyof typeof pl.verdict;
export const request = examples.CheckRequest.text;
export const done = examples['CheckResult.done'].claims;
export const abstain = examples['CheckResult.abstain'].claims[0];

/** Left edge and width of everything in the frame. */
export const EDGE = 132;
export const WIDTH = 1920 - 2 * EDGE;

/** The mark in one colour (brand/meritum-mark-mono.svg). */
const Mark = ({size}: {size: number}) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
    <path d="M10 40V25c0-5.5 3.1-9 7-9s7 3.5 7 9v15M24 25c0-5.5 3.1-9 7-9s7 3.5 7 9v15" />
    <path d="M24 25v15" />
    <circle cx="24" cy="7.6" r="3.5" fill="currentColor" stroke="none" />
  </svg>
);

/** Mark and the word „meritum” (Archivo 650 at 112% width, tracking -0.02em). `size` is the height of the mark. */
export const Lockup = ({size, style}: {size: number; style?: CSSProperties}) => (
  <div className="flex items-center" style={{gap: size * 0.3, ...style}}>
    <Mark size={size} />
    <span className="font-logo" style={{fontSize: size * 0.86, lineHeight: 1, fontWeight: 650, fontStretch: '112%', letterSpacing: '-0.02em'}}>
      meritum
    </span>
  </div>
);

/** The brand in the corner, on every shot that has no full-size logo. */
export const Bug = () => <Lockup size={56} style={{position: 'absolute', left: EDGE, top: 60}} />;

const TONE: Record<Verdict, string> = {
  confirmed: 'bg-verified-surface text-verified-foreground',
  misleading: 'bg-contested-surface text-contested-foreground',
  false: 'bg-scam-surface text-scam-foreground',
  insufficient_evidence: 'bg-secondary text-muted-foreground',
  not_verifiable: 'bg-secondary text-muted-foreground',
};

/** The verdict as a word in its colours (a pill). It lands at `at`: fades in and grows the last ten percent. */
export const VerdictBadge = ({verdict, size, at = 0}: {verdict: Verdict; size: number; at?: number}) => {
  const p = ramp(useCurrentFrame(), at);
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-pill font-semibold whitespace-nowrap ${TONE[verdict]}`}
      style={{fontSize: size, lineHeight: 1.2, padding: '0.2em 0.62em', opacity: p, scale: 0.9 + 0.1 * p, transformOrigin: 'left center'}}
    >
      {pl.verdict[verdict]}
    </span>
  );
};

/** The text somebody forwarded: the one object the film follows. */
export const Message = ({children}: {children: ReactNode}) => (
  <div style={{position: 'absolute', left: EDGE, top: 176, width: WIDTH}}>
    <div className="text-muted-foreground" style={{fontSize: 24, marginBottom: 14}}>
      wiadomość przesłana dalej
    </div>
    <div className="bg-muted font-medium" style={{fontSize: 40, lineHeight: 1.3, padding: '22px 32px', borderRadius: 16, width: 'fit-content'}}>
      {children}
    </div>
  </div>
);

/** The honest label on every shot with a result: sample data from the contracts, not a live answer. */
export const SampleLabel = () => (
  <div className="font-mono text-muted-foreground" style={{position: 'absolute', right: EDGE, bottom: 56, fontSize: 22}}>
    przykład do pokazu · dane przykładowe
  </div>
);
