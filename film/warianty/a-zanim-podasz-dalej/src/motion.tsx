// Motion pieces shared by the scenes. Everything is driven by the frame number, never by CSS transitions.
// One easing family: entrances take 8 frames, nothing but the held push-in takes more than 15.
import type {CSSProperties, ReactNode} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

/** The curve from tokens/meritum.css (--ease-out-meritum): fast start, soft landing. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 before `at`, 1 after `at + d`. */
export const ramp = (frame: number, at: number, d = 8, easing = EASE) => interpolate(frame, [at, at + d], [0, 1], {...CLAMP, easing});

type Timed = {at?: number; className?: string; style?: CSSProperties; children: ReactNode};

/** Fades in and settles from a little below. Without `at` it is simply there. */
export const Rise = ({at, y = 14, className, style, children}: Timed & {y?: number}) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : ramp(frame, at);
  return (
    <div className={className} style={{...style, opacity: p, translate: `0 ${(1 - p) * y}px`}}>
      {children}
    </div>
  );
};

/** A thing landing on a beat: it arrives a little large and settles. */
export const Slam = ({at, from = 1.08, className, style, children}: Timed & {from?: number}) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : ramp(frame, at, 7);
  return (
    <div className={className} style={{...style, opacity: Math.min(1, p * 2.5), scale: from + (1 - from) * p}}>
      {children}
    </div>
  );
};

/** A line rising out of its own baseline: the one reveal for headlines. */
export const MaskLine = ({at, className, style, children}: Timed) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : ramp(frame, at, 9);
  return (
    <div className={className} style={{...style, overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em'}}>
      <div style={{translate: `0 ${(1 - p) * 105}%`}}>{children}</div>
    </div>
  );
};

/** The honest label: every result in the film is sample data from the contracts, not a live answer. No animation. */
export const SampleLabel = () => (
  <div className="absolute font-mono text-muted-foreground" style={{right: 72, bottom: 44, fontSize: 20}}>
    przykład do pokazu · dane przykładowe
  </div>
);
