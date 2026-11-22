// The Meritum interface as plain React, drawn frame by frame. Markup and classes follow the merged web app
// (meritum-frontend, src/components/meritum: claim-row, citation-item, strength-meter, verdict-badge,
// analysis-steps, check-form) in its narrow layout, where the verdict label stands over the claim.
// Texts come from copy/pl.json and results from contracts/examples.json. What the app does with Radix state
// and CSS transitions is done here with the frame number.
import {ArrowUpIcon, CheckIcon, LoaderCircleIcon, MinusIcon} from 'lucide-react';
import type {CSSProperties, ReactNode} from 'react';
import {useCurrentFrame} from 'remotion';
import examples from './data/examples.json';
import pl from './data/pl.json';
import {ramp, Rise, Slam} from './motion';

type Verdict = keyof typeof pl.verdict;
type Level = keyof typeof pl.strength;
type Citation = (typeof examples)['CheckResult.done']['claims'][number]['citations'][number];
export type Claim = {claim: string; verdict: string; explanation: string; citations: Citation[]; strength?: {level: string}; unresolved?: string};

export const done = examples['CheckResult.done'].claims as Claim[];
export const abstain = examples['CheckResult.abstain'].claims as Claim[];
const {result: t, analysis} = pl;
const day = new Intl.DateTimeFormat('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'});

/** The page ground with its theme: white and ink, or the dark theme of the same tokens. */
export const Surface = ({dark = false, style, children}: {dark?: boolean; style?: CSSProperties; children: ReactNode}) => (
  <div className={`absolute inset-0 isolate overflow-hidden bg-background font-sans text-foreground antialiased ${dark ? 'dark' : ''}`} style={style}>
    {children}
  </div>
);

/** The mark in one colour (brand/meritum-mark-mono.svg). `draw` runs 0 to 1 for the end card. */
export const Mark = ({size, draw = 1}: {size: number; draw?: number}) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" width={size} height={size} className="shrink-0" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 40V25c0-5.5 3.1-9 7-9s7 3.5 7 9v15M24 25c0-5.5 3.1-9 7-9s7 3.5 7 9v15" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <path d="M24 25v15" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <circle cx="24" cy="7.6" r="3.5" fill="currentColor" stroke="none" style={{opacity: Math.max(0, draw * 3 - 2)}} />
  </svg>
);

/** The word "meritum": Archivo 650 at 112% width, tracking -0.02em (DESIGN_SYSTEM.md section 2). */
export const Logotype = ({size}: {size: number}) => (
  <span className="font-logo" style={{fontSize: size, lineHeight: 1, fontWeight: 650, fontStretch: '112%', letterSpacing: '-0.02em'}}>
    meritum
  </span>
);

/** Mark and word side by side, sized by the mark. */
export const Lockup = ({size, draw}: {size: number; draw?: number}) => (
  <span className="flex items-center" style={{gap: size * 0.2}}>
    <Mark size={size} draw={draw} />
    <Logotype size={size * 0.82} />
  </span>
);

const TONE: Record<string, string> = {
  confirmed: 'bg-verified-surface text-verified-foreground',
  misleading: 'bg-contested-surface text-contested-foreground',
  false: 'bg-scam-surface text-scam-foreground',
  insufficient_evidence: 'bg-secondary text-muted-foreground',
  not_verifiable: 'bg-secondary text-muted-foreground',
};

/** The verdict as a word in its colours, the small pill of the claim list. */
export const VerdictBadge = ({verdict}: {verdict: string}) => (
  <span className={`inline-flex shrink-0 items-center rounded-pill px-2 py-0.5 text-meta font-semibold whitespace-nowrap ${TONE[verdict]}`}>{pl.verdict[verdict as Verdict]}</span>
);

const Badge = ({children}: {children: ReactNode}) => (
  <span className="inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-4xl bg-secondary px-2 py-0.5 text-xs font-normal whitespace-nowrap text-muted-foreground">{children}</span>
);

/** Marks `words` inside `text` with a band that grows from the left as `p` goes 0 to 1. */
const Marked = ({text, words, p}: {text: string; words?: string; p: number}) => {
  const i = words ? text.indexOf(words) : -1;
  if (!words || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="rounded-sm" style={{backgroundImage: 'linear-gradient(color-mix(in srgb, var(--scam) 24%, transparent), color-mix(in srgb, var(--scam) 24%, transparent))', backgroundRepeat: 'no-repeat', backgroundSize: `${p * 100}% 100%`, padding: '0.1rem 0.15rem', margin: '0 -0.15rem'}}>
        {words}
      </span>
      {text.slice(i + words.length)}
    </>
  );
};

/** One source as evidence: the verbatim fragment first, then the linked title, publisher and date, kind and tier. */
const CitationItem = ({c, at, mark, markAt, sourceAt}: {c: Citation; at?: number; mark?: string; markAt?: number; sourceAt?: number}) => {
  const frame = useCurrentFrame();
  const line = sourceAt === undefined ? 0 : ramp(frame, sourceAt, 10);
  return (
    <div className="grid gap-1.5 py-2 pl-6">
      <Rise at={at}>
        <blockquote className="relative text-body text-pretty">
          <span aria-hidden="true" className="absolute -top-1 -left-6 text-title leading-none font-bold text-link">
            „
          </span>
          <Marked text={c.fragment} words={mark} p={markAt === undefined ? 0 : ramp(frame, markAt, 10)} />”
        </blockquote>
      </Rise>
      <Rise at={at === undefined ? undefined : at + 4} className="grid gap-1.5">
        <p className="text-small text-muted-foreground">
          <span className="relative font-semibold text-link underline decoration-current/35 underline-offset-3">
            {c.source.title}
            <span className="absolute -bottom-0.5 left-0 h-0.5 bg-foreground" style={{width: `${line * 100}%`}} />
          </span>
          . {c.source.publisher}, {day.format(new Date(c.source.published_at))}.
        </p>
        <p className="flex flex-wrap gap-1.5">
          <Badge>{pl.source_kind[c.source.kind as keyof typeof pl.source_kind]}</Badge>
          <Badge>{pl.source_tier[c.source.tier as keyof typeof pl.source_tier]}</Badge>
        </p>
      </Rise>
    </div>
  );
};

const BARS = {weak: 1, moderate: 2, strong: 3};

/**
 * One claim of the result, open: the verdict label, the claim in quotes, the explanation, the quote with its
 * source, the strength of the basis. `at` is the frame the verdict lands on; from `rest` the rest follows in a quick cascade.
 */
export const ClaimBlock = ({claim, at, rest = at + 8, mark, markAt, sourceAt}: {claim: Claim; at: number; rest?: number; mark?: string; markAt?: number; sourceAt?: number}) => (
  <div>
    <div className="grid gap-y-1.5 py-3">
      <span className="flex">
        <Slam at={at} from={1.5} style={{transformOrigin: 'left center'}}>
          <VerdictBadge verdict={claim.verdict} />
        </Slam>
      </span>
      <p className="text-body font-semibold text-pretty">„{claim.claim}”</p>
    </div>
    <div className="grid gap-5 pt-2 text-body">
      <Rise at={rest}>
        <p className="text-body text-pretty">{claim.explanation}</p>
      </Rise>
      {claim.citations.length > 0 ? (
        <div>
          <Rise at={rest + 4}>
            <h4 className="text-small font-semibold text-muted-foreground">{t.sources_title}</h4>
          </Rise>
          {claim.citations.map((c) => (
            <CitationItem key={c.source.id} c={c} at={rest + 6} mark={mark} markAt={markAt} sourceAt={sourceAt} />
          ))}
        </div>
      ) : (
        <Rise at={rest + 4}>
          <h4 className="text-small font-semibold">{t.unresolved}</h4>
          <p className="text-small text-pretty">{claim.unresolved}</p>
        </Rise>
      )}
      {claim.strength && (
        <Rise at={rest + 14} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-muted-foreground">
          {t.strength_title}
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="flex items-end gap-0.5">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`w-1.5 rounded-sm ${n <= BARS[claim.strength!.level as Level] ? 'bg-foreground' : 'bg-border'}`} style={{height: `${(4 + n * 4) / 16}rem`}} />
              ))}
            </span>
            <span className="font-semibold text-foreground">{pl.strength[claim.strength.level as Level]}</span>
          </span>
        </Rise>
      )}
    </div>
  </div>
);

/** The steps a text check goes through, in the order of the app's list. */
const STEPS = ['receive', 'screen_injection', 'extract_claims', 'search_corpus', 'search_web', 'search_fact_checks', 'assess_evidence', 'verify_citations', 'write_answer'] as const;

/** Progress of a running check: the bar and the list of steps. `doneCount` steps are ticked, the next one spins. */
export const Progress = ({doneCount}: {doneCount: number}) => {
  const frame = useCurrentFrame();
  const n = Math.min(doneCount, STEPS.length);
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="flex items-baseline justify-between gap-2">
          <span className="text-small font-semibold">{analysis.title}</span>
          <span className="text-small text-muted-foreground tabular-nums">{analysis.step_of.replace('{n}', String(Math.min(n + 1, STEPS.length))).replace('{of}', String(STEPS.length))}</span>
        </p>
        <div className="relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted">
          <div className="size-full flex-1 bg-primary" style={{translate: `-${100 - (n / STEPS.length) * 100}% 0`}} />
        </div>
      </div>
      <ol className="grid gap-2.5">
        {STEPS.map((code, i) => (
          <li key={code} className="flex items-center gap-3 text-body">
            {i < n ? <CheckIcon aria-hidden="true" className="size-4" /> : i === n ? <LoaderCircleIcon aria-hidden="true" className="size-4" style={{rotate: `${frame * 14}deg`}} /> : <MinusIcon aria-hidden="true" className="size-4 text-muted-foreground" />}
            <span className={i > n ? 'text-muted-foreground' : ''}>{analysis.steps[code]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

/** The field of the form: a bordered field with the counter and the submit button. */
export const Field = ({value, flash = 0, press = 0}: {value: string; flash?: number; press?: number}) => (
  <div className="grid gap-1 rounded-lg border border-input bg-card p-2">
    <div className={`min-h-11 px-2 py-2 text-body ${value ? '' : 'text-muted-foreground'}`}>
      <span style={{backgroundColor: `color-mix(in srgb, var(--foreground) ${flash * 14}%, transparent)`}}>{value || pl.form.input_placeholder}</span>
    </div>
    <div className="flex items-center gap-2">
      {value.length > 0 && (
        <span className="px-2 text-meta text-muted-foreground tabular-nums">
          {value.length} / {(4000).toLocaleString('pl-PL')}
        </span>
      )}
      <span className="ml-auto inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-pill bg-primary px-5 text-sm font-medium whitespace-nowrap text-primary-foreground" style={{scale: 1 - 0.07 * press}}>
        {pl.form.submit}
        <ArrowUpIcon aria-hidden="true" className="size-4" />
      </span>
    </div>
  </div>
);
