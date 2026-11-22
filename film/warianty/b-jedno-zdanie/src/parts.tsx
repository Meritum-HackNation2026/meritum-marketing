// Shared pieces: the motion curve, the logo, the stage every scene stands on, and the text marks.
// Colours are the "Atrament" values from design-system/tokens/meritum.css (see src/data/SOURCE).
import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {mono, sans} from './fonts';

export const SANS = sans.fontFamily;
export const MONO = mono.fontFamily;

export const C = {
  paper: '#FFFFFF',
  ink: '#0A0A0A',
  muted: '#5A5D62',
  secondary: '#EEF0F2',
  border: '#E3E5E8',
  faint: '#A9AEB5',
  black: '#0A0A0A',
  onBlack: '#EDEDED',
  mutedOnBlack: '#A1A1A1',
} as const;

/** Verdict inks and surfaces; the two verdicts that do not settle a claim stay neutral. */
export const TONE: Record<string, {ink: string; surface: string; pill: string}> = {
  false: {ink: '#9E1A2E', surface: '#FBE6E9', pill: '#9E1A2E'},
  confirmed: {ink: '#0A6240', surface: '#E4F4EC', pill: '#0A6240'},
  insufficient_evidence: {ink: C.ink, surface: C.secondary, pill: C.muted},
};

/** One curve for every entrance (--ease-out-meritum). */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 before `at`, 1 from `at + d`. Entrances take 8 frames unless a scene says otherwise. */
export const enter = (frame: number, at: number, d = 8) => interpolate(frame, [at, at + d], [0, 1], {...CLAMP, easing: EASE});

/** The film's one reveal: a block rises out of its own baseline. */
export const Reveal = ({at = 0, style, children}: {at?: number; style?: CSSProperties; children: ReactNode}) => {
  const p = enter(useCurrentFrame(), at);
  return (
    <div style={{...style, overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em'}}>
      <div style={{translate: `0 ${(1 - p) * 105}%`}}>{children}</div>
    </div>
  );
};

/** Fades in and settles from 14 px below; used for interface rows, never for headlines. */
export const Rise = ({at, style, children}: {at: number; style?: CSSProperties; children: ReactNode}) => {
  const p = enter(useCurrentFrame(), at);
  return <div style={{...style, opacity: p, translate: `0 ${(1 - p) * 14}px`}}>{children}</div>;
};

/** The mark in one colour, as on the web page (brand/meritum-mark-mono.svg). */
const Mark = ({size, draw = 1}: {size: number; draw?: number}) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
    <path d="M10 40V25c0-5.5 3.1-9 7-9s7 3.5 7 9v15M24 25c0-5.5 3.1-9 7-9s7 3.5 7 9v15" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <path d="M24 25v15" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <circle cx="24" cy="7.6" r="3.5" fill="currentColor" stroke="none" opacity={draw} />
  </svg>
);

/** Mark and the word "meritum" (Archivo 650, width 112%), in the proportions of brand/exports/meritum-lockup-light.svg. */
export const Lockup = ({size, draw = 1}: {size: number; draw?: number}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.08}}>
    <Mark size={size * 1.2} draw={draw} />
    <span style={{fontFamily: 'Archivo', fontWeight: 650, fontStretch: '112%', letterSpacing: '-0.02em', fontSize: size, lineHeight: 1, marginTop: size * 0.12}}>meritum</span>
  </div>
);

/**
 * The ground of a scene. Black is the sentence as it travels unchecked, white is the sentence under Meritum.
 * `bug` is the corner logo, on from the first frame; `sample` is the honest label on every shot with a result.
 */
export const Stage = ({dark = false, bug = true, sample = false, children}: {dark?: boolean; bug?: boolean; sample?: boolean; children: ReactNode}) => (
  <AbsoluteFill style={{backgroundColor: dark ? C.black : C.paper, color: dark ? C.onBlack : C.ink, fontFamily: SANS}}>
    {children}
    {bug && (
      <div style={{position: 'absolute', left: 160, top: 60}}>
        <Lockup size={44} />
      </div>
    )}
    {sample && (
      <div style={{position: 'absolute', right: 160, top: 78, fontFamily: MONO, fontSize: 22, color: C.muted}}>przykład do pokazu · dane przykładowe</div>
    )}
  </AbsoluteFill>
);

/** The film's own sentence, bottom left. Each one is on screen for at least chars / 17 + 0.5 s. */
export const Caption = ({at = 0, children}: {at?: number; children: ReactNode}) => (
  <div style={{position: 'absolute', left: 160, bottom: 84}}>
    <Reveal at={at} style={{fontSize: 64, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15}}>
      {children}
    </Reveal>
  </div>
);

/** `text` with `needle` wrapped in a mark whose background grows from the left as `p` goes 0 to 1. */
export const Marked = ({text, needle, p, color, ink, strike = false}: {text: string; needle: string; p: number; color: string; ink?: string; strike?: boolean}) => {
  const i = text.indexOf(needle);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span
        style={{
          backgroundImage: `linear-gradient(${color}, ${color})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: strike ? '0 58%' : '0 0',
          backgroundSize: strike ? `${p * 100}% 0.09em` : `${p * 100}% 100%`,
          color: p > 0.5 ? ink : undefined,
          whiteSpace: 'nowrap',
          borderRadius: strike ? 0 : 6,
          padding: strike ? 0 : '0 0.12em',
          margin: strike ? 0 : '0 -0.12em',
        }}
      >
        {needle}
      </span>
      {text.slice(i + needle.length)}
    </>
  );
};
