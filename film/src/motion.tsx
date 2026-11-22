// Motion pieces shared by the scenes. Everything is driven by the frame number, never by CSS
// transitions, so a frame renders the same on every machine.
import {type CSSProperties, type ReactNode, type RefObject, useLayoutEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {fontsReady} from './fonts';

/** The curve from tokens/meritum.css (--ease-out-meritum): fast start, long soft landing. */
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
/** For moves that start and stop on screen: the camera and the pointer. */
export const EASE_IN_OUT = Easing.bezier(0.6, 0, 0.2, 1);
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 before `at`, 1 after `at + d`. */
export const ramp = (frame: number, at: number, d = 16, easing = EASE) => interpolate(frame, [at, at + d], [0, 1], {...CLAMP, easing});
/** 1 between `from` and `to`, with soft edges. */
export const span = (frame: number, from: number, to: number, d = 12) => ramp(frame, from, d) - ramp(frame, to - d, d, Easing.in(Easing.cubic));

type Timed = {at?: number; className?: string; style?: CSSProperties; children: ReactNode};

/** Fades in and settles from a little below. Without `at` it is simply there. */
export const Rise = ({at, d = 18, y = 0.6, className, style, children}: Timed & {d?: number; y?: number}) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : ramp(frame, at, d);
  return (
    <div className={className} style={{...style, opacity: p, translate: `0 ${(1 - p) * y}rem`}}>
      {children}
    </div>
  );
};

/** A label landing: it grows the last few percent while it fades in. */
export const Pop = ({at, className, children}: Timed) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : ramp(frame, at, 14);
  return (
    <span className={className} style={{display: 'inline-flex', opacity: p, scale: 0.9 + 0.1 * p, transformOrigin: 'left center'}}>
      {children}
    </span>
  );
};

/** Text uncovered from the left, the way a line is read. */
export const Wipe = ({at, d = 30, className, children}: Timed & {d?: number}) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : ramp(frame, at, d, Easing.bezier(0.3, 0, 0.2, 1));
  return (
    <div className={className} style={{clipPath: `inset(-0.2rem ${(1 - p) * 100}% -0.2rem -0.2rem)`}}>
      {children}
    </div>
  );
};

/** A line rising out of its own baseline: the reveal for headlines and captions. */
export const MaskLine = ({at, d = 20, className, style, children}: Timed & {d?: number}) => {
  const frame = useCurrentFrame();
  const p = at === undefined ? 1 : ramp(frame, at, d);
  return (
    <div className={className} style={{...style, overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em'}}>
      <div style={{translate: `0 ${(1 - p) * 105}%`}}>{children}</div>
    </div>
  );
};

/** Pulls focus away: `k` from 0 (sharp) to 1 (soft and quiet). */
export const Dim = ({k, className, children}: {k: number; className?: string; children: ReactNode}) => (
  <div className={className} style={k > 0.001 ? {filter: `blur(${k * 0.14}rem)`, opacity: 1 - 0.62 * k} : undefined}>
    {children}
  </div>
);

export type Rect = {x: number; y: number; w: number; h: number};
export type Anchors = Record<string, Rect>;

/**
 * Where the elements marked `data-a` sit inside the page, in layout pixels. offsetLeft and offsetTop ignore
 * transforms, so the numbers hold while the camera moves. Measured once the fonts are in.
 */
export function useAnchors(ref: RefObject<HTMLElement | null>): Anchors {
  const [anchors, setAnchors] = useState<Anchors>({});
  const [handle] = useState(() => delayRender('measure anchors'));
  useLayoutEffect(() => {
    let stale = false;
    fontsReady.then(() => {
      const root = ref.current;
      if (stale || !root) return;
      const found: Anchors = {};
      root.querySelectorAll<HTMLElement>('[data-a]').forEach((el) => {
        let x = 0;
        let y = 0;
        for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
          x += n.offsetLeft;
          y += n.offsetTop;
        }
        found[el.dataset.a as string] = {x, y, w: el.offsetWidth, h: el.offsetHeight};
      });
      setAnchors(found);
      continueRender(handle);
    });
    return () => {
      stale = true;
    };
  }, [ref, handle]);
  return anchors;
}

/** A point of an anchor: fx and fy pick the spot inside it (0.5 is the middle). */
export const point = (anchors: Anchors, key: string, fx = 0.5, fy = 0.5): [number, number] => {
  const r = anchors[key];
  return r ? [r.x + r.w * fx, r.y + r.h * fy] : [960, 540];
};

export type Shot = {f: number; s: number; at: [number, number]};

/** The camera: at each keyframe the point `at` of the page sits in the middle of the frame at scale `s`. */
export function camera(frame: number, shots: Shot[]): CSSProperties {
  const frames = shots.map((k) => k.f);
  const pick = (get: (k: Shot) => number) => interpolate(frame, frames, shots.map(get), {...CLAMP, easing: EASE_IN_OUT});
  const s = shots.length > 1 ? pick((k) => k.s) : shots[0].s;
  const x = shots.length > 1 ? pick((k) => k.at[0]) : shots[0].at[0];
  const y = shots.length > 1 ? pick((k) => k.at[1]) : shots[0].at[1];
  return {transformOrigin: '0 0', translate: `${960 - x * s}px ${540 - y * s}px`, scale: s};
}

export type Move = {f: number; to: [number, number]};

/** The pointer. It travels between the moves, dips on each click and leaves a ring that fades. */
export const Cursor = ({moves, clicks = [], from, to}: {moves: Move[]; clicks?: number[]; from: number; to: number}) => {
  const frame = useCurrentFrame();
  const frames = moves.map((m) => m.f);
  const pick = (i: 0 | 1) => (moves.length > 1 ? interpolate(frame, frames, moves.map((m) => m.to[i]), {...CLAMP, easing: EASE_IN_OUT}) : moves[0].to[i]);
  const press = clicks.reduce((acc, c) => Math.max(acc, span(frame, c - 3, c + 7, 4)), 0);
  const last = clicks.filter((c) => c <= frame).pop();
  const ring = last === undefined ? 0 : ramp(frame, last, 16);
  return (
    <div className="absolute top-0 left-0" style={{translate: `${pick(0)}px ${pick(1)}px`, opacity: span(frame, from, to, 8), zIndex: 50}}>
      {last !== undefined && ring < 1 && (
        <span
          className="absolute rounded-full border-2 border-foreground"
          style={{width: '2.4rem', height: '2.4rem', left: '-1.2rem', top: '-1.2rem', scale: 0.3 + 0.7 * ring, opacity: 0.5 * (1 - ring)}}
        />
      )}
      <svg viewBox="0 0 24 24" style={{width: '1.5rem', height: '1.5rem', marginLeft: '-0.2rem', marginTop: '-0.12rem', scale: 1 - 0.14 * press, transformOrigin: '15% 10%'}}>
        <path d="M4.5 2.5v17.2l4.7-4.4 3 6.6 2.7-1.2-3-6.6h6.4z" fill="#0A0A0A" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** One sentence over the picture, bottom left, on a band of the page colour so it never fights the interface. */
export const Caption = ({from, to, children}: {from: number; to: number; children: ReactNode}) => {
  const frame = useCurrentFrame();
  const on = span(frame, from, to, 10);
  if (on <= 0) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', opacity: Math.min(1, on * 1.4)}}>
      <div style={{height: 250, background: 'linear-gradient(to top, var(--background) 62%, transparent)'}} />
      <MaskLine at={from} className="absolute font-sans font-semibold text-foreground" style={{left: 132, bottom: 78, fontSize: 50, lineHeight: 1.15, letterSpacing: '-0.015em'}}>
        {children}
      </MaskLine>
    </AbsoluteFill>
  );
};

/** The honest label: every result in the film is sample data from the contracts, not a live answer. */
export const SampleLabel = ({from, to}: {from: number; to: number}) => {
  const frame = useCurrentFrame();
  return (
    <div
      className="absolute rounded-pill bg-background font-mono text-muted-foreground"
      style={{right: 120, bottom: 34, padding: '6px 12px', fontSize: 19, opacity: span(frame, from, to, 12), zIndex: 40}}
    >
      przykład do pokazu · dane przykładowe, nie wynik na żywo
    </div>
  );
};

/** Light film grain over everything. `difference` keeps it visible on white and on black alike. */
export const Grain = () => {
  const frame = useCurrentFrame();
  // a 512px tile laid 5 by 4 and shifted every frame, so the grain never sits still
  const dx = (frame * 197) % 512;
  const dy = (frame * 331) % 512;
  return (
    <AbsoluteFill style={{mixBlendMode: 'difference', pointerEvents: 'none', overflow: 'hidden'}}>
      {Array.from({length: 20}, (_, i) => (
        <Img key={i} src={staticFile('grain.png')} className="absolute max-w-none" style={{left: (i % 5) * 512 - dx, top: Math.floor(i / 5) * 512 - dy, width: 512, height: 512}} />
      ))}
    </AbsoluteFill>
  );
};
