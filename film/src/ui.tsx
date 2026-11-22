// The Meritum interface as plain React, drawn frame by frame. The markup and the Tailwind classes follow the
// approved prototype of the new interface (meritum-frontend lab/: app.tsx, home.tsx, result.tsx, shared.tsx)
// and the shadcn/ui parts it uses; texts come from copy/pl.json and results from contracts/examples.json.
// What the prototype does with Radix state and CSS transitions is done here with the frame number.
import {
  ALargeSmallIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BellIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  FlagIcon,
  HistoryIcon,
  InfoIcon,
  LibraryIcon,
  ListChecksIcon,
  LoaderCircleIcon,
  LogInIcon,
  type LucideIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  ScaleIcon,
  SearchCheckIcon,
  TextQuoteIcon,
} from 'lucide-react';
import type {ReactNode} from 'react';
import {useCurrentFrame} from 'remotion';
import examples from './data/examples.json';
import pl from './data/pl.json';
import {Dim, Pop, ramp, Rise, Wipe} from './motion';

export type Verdict = keyof typeof pl.verdict;
export type Theme = 'light' | 'dark' | 'contrast';
type Level = keyof typeof pl.strength;
type Citation = (typeof examples)['CheckResult.done']['claims'][number]['citations'][number];
export type Claim = {
  claim: string;
  verdict: string;
  explanation: string;
  citations: Citation[];
  strength?: {level: string};
  unresolved?: string;
};

export const done = examples['CheckResult.done'].claims as Claim[];
export const abstain = examples['CheckResult.abstain'].claims as Claim[];
const limitations = examples['CheckResult.done'].limitations;
const {result: t, analysis} = pl;

const page = 'mx-auto w-full max-w-6xl px-6';
const columns = `${page} grid gap-x-16 gap-y-12 pt-14 pb-4 grid-cols-[minmax(0,45rem)_minmax(0,20rem)] justify-between`;
const button =
  'inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0';
const outline = 'border border-border bg-background dark:border-input dark:bg-input/30';
const floating = 'rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10';
const day = new Intl.DateTimeFormat('pl-PL', {day: 'numeric', month: 'long', year: 'numeric'});
const plural = new Intl.PluralRules('pl');

/** The page ground with its theme: white and ink, black, or black in high contrast (tokens/display.css). */
export const Surface = ({theme = 'light', className = '', style, children}: {theme?: Theme; className?: string; style?: React.CSSProperties; children: ReactNode}) => (
  <div
    className={`absolute inset-0 isolate bg-background font-sans text-foreground antialiased ${theme === 'light' ? '' : 'dark'} ${className}`}
    data-contrast={theme === 'contrast' ? 'more' : undefined}
    style={style}
  >
    {children}
  </div>
);

/** The mark as on the web page: one colour, ink (DESIGN_SYSTEM.md section 2, brand/meritum-mark-mono.svg). */
export const Mark = ({className = 'size-7', draw = 1}: {className?: string; draw?: number}) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 40V25c0-5.5 3.1-9 7-9s7 3.5 7 9v15M24 25c0-5.5 3.1-9 7-9s7 3.5 7 9v15" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <path d="M24 25v15" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <circle cx="24" cy="7.6" r="3.5" fill="currentColor" stroke="none" style={{opacity: Math.max(0, draw * 3 - 2), scale: 0.6 + 0.4 * Math.max(0, draw * 3 - 2), transformOrigin: '24px 7.6px'}} />
  </svg>
);

/** The word "meritum": Archivo 650 at 112% width, tracking -0.02em. */
export const Logotype = ({className = ''}: {className?: string}) => (
  <span className={`font-logo ${className}`} style={{fontWeight: 650, fontStretch: '112%', letterSpacing: '-0.02em'}}>
    meritum
  </span>
);

const Wordmark = () => (
  <span className="flex items-center gap-2.5">
    <Mark />
    <Logotype className="text-body leading-5" />
  </span>
);

const themes = Object.entries(pl.display.theme) as [Theme, string][];

/** The „Wygląd” menu: the theme and the text size as two radio groups. `open` runs from 0 to 1. */
const DisplayMenu = ({open, theme, hover}: {open: number; theme: Theme; hover?: Theme}) => {
  const row = 'relative flex items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm';
  const dot = <span className="absolute right-2 size-2 rounded-full bg-foreground" />;
  return (
    <div className={`absolute top-full right-0 z-30 mt-1 w-64 p-1 text-left ${floating}`} style={{opacity: open, scale: 0.95 + 0.05 * open, transformOrigin: 'top right'}}>
      <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">{pl.display.theme_title}</p>
      {themes.map(([id, name]) => (
        <div key={id} data-a={`theme.${id}`} className={`${row} ${hover === id ? 'bg-accent text-accent-foreground' : ''}`}>
          {name}
          {theme === id && dot}
        </div>
      ))}
      <div className="-mx-1 my-1 h-px bg-border" />
      <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">{pl.display.text_title}</p>
      {Object.entries(pl.display.text).map(([id, name]) => (
        <div key={id} className={row}>
          {name}
          {id === 'm' && dot}
        </div>
      ))}
    </div>
  );
};

const nav = [
  {id: 'sprawdz', label: pl.nav.check, icon: SearchCheckIcon},
  {id: 'jak-dziala', label: pl.nav.how, icon: BookOpenIcon},
];

/** The top bar: mark, two links with icons, the display menu, notifications, sign-in. No rule under it. */
/** `menu` is how far the display menu is open, 0 to 1; leave it out on pages that never open it. */
export const Bar = ({current, theme = 'light', menu, hover}: {current?: string; theme?: Theme; menu?: number; hover?: Theme}) => (
  <header className="relative z-20 bg-background">
    <div className={`${page} flex h-16 items-center justify-between gap-4`}>
      <div className="flex items-center gap-8">
        <Wordmark />
        <nav className="flex items-center gap-1">
          {nav.map((n) => (
            <span key={n.id} className={`flex items-center gap-2 rounded-pill px-3 py-1.5 text-small font-medium ${current === n.id ? 'text-foreground' : 'text-muted-foreground'}`}>
              <n.icon aria-hidden="true" className="size-4" />
              {n.label}
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <span data-a="display" className={`${button} relative size-8 rounded-pill text-muted-foreground ${(menu ?? 0) > 0.5 ? 'bg-muted text-foreground' : ''}`}>
          <ALargeSmallIcon />
          {menu !== undefined && <DisplayMenu open={menu} theme={theme} hover={hover} />}
        </span>
        <span className={`${button} relative size-8 rounded-pill text-muted-foreground`}>
          <BellIcon />
          <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-verified" />
        </span>
        <span className={`${button} ${outline} ml-2 h-9 gap-2 rounded-pill px-4 text-small`}>
          <LogInIcon aria-hidden="true" />
          {pl.nav.sign_in}
        </span>
      </div>
    </div>
  </header>
);

const TONE: Record<string, string> = {
  confirmed: 'bg-verified-surface text-verified-foreground',
  misleading: 'bg-contested-surface text-contested-foreground',
  false: 'bg-scam-surface text-scam-foreground',
  insufficient_evidence: 'bg-secondary text-muted-foreground',
  not_verifiable: 'bg-secondary text-muted-foreground',
};

export const VerdictBadge = ({verdict}: {verdict: string}) => (
  <span className={`inline-flex shrink-0 items-center rounded-pill px-2 py-0.5 text-meta font-semibold whitespace-nowrap ${TONE[verdict]}`}>{pl.verdict[verdict as Verdict]}</span>
);

const IconLabel = ({icon: Icon, className = 'text-small font-semibold', children}: {icon: LucideIcon; className?: string; children: ReactNode}) => (
  <p className={`flex items-center gap-2 ${className}`}>
    <Icon aria-hidden="true" className="size-4 shrink-0" />
    <span>{children}</span>
  </p>
);

const Badge = ({children}: {children: ReactNode}) => (
  <span className="inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-4xl bg-secondary px-2 py-0.5 text-xs font-normal whitespace-nowrap text-secondary-foreground">{children}</span>
);

/** The checked text as the page heading, set as a quotation. */
export const Quoted = ({at, children}: {at?: number; children: ReactNode}) => (
  <Rise at={at}>
    <h1 className="relative pl-7 text-title font-semibold tracking-tight text-pretty">
      <span aria-hidden="true" className="absolute top-0 left-0 text-headline leading-none font-bold">
        „
      </span>
      {children}”
    </h1>
  </Rise>
);

const levels = {weak: 1, moderate: 2, strong: 3};

/** Strength of the basis: three bars and a word; the note above explains the rule behind the level. */
const Strength = ({level, at, id, note = 0}: {level: Level; at?: number; id: string; note?: number}) => {
  const frame = useCurrentFrame();
  return (
    <Rise at={at} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-muted-foreground">
      {t.strength_title}
      <span data-a={`${id}.strength`} className="relative inline-flex items-center gap-2">
        <span aria-hidden="true" className="flex items-end gap-0.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`w-1.5 rounded-sm ${n <= levels[level] ? 'bg-foreground' : 'bg-border'}`}
              style={{height: `${0.25 + n * 0.25}rem`, scale: `1 ${at === undefined ? 1 : ramp(frame, at + 6 + n * 5, 12)}`, transformOrigin: 'bottom'}}
            />
          ))}
        </span>
        <span className="text-small font-semibold text-foreground">{pl.strength[level]}</span>
        {note > 0 && (
          <span className={`absolute bottom-full left-0 mb-1.5 w-64 px-3 py-2 text-small text-pretty ${floating}`} style={{opacity: note, scale: 0.95 + 0.05 * note, transformOrigin: 'bottom left'}}>
            {pl.strength_hint[level]}
          </span>
        )}
      </span>
    </Rise>
  );
};

const Evidence = ({claim, at, id}: {claim: Claim; at?: number; id: string}) => {
  const delay = (n: number) => (at === undefined ? undefined : at + n);
  if (claim.citations.length === 0) {
    return (
      <Rise at={at} className="grid gap-0.5 text-sm">
        <div data-a={`${id}.evidence`} className="font-medium">
          {t.unresolved}
        </div>
        <div className="text-muted-foreground">{claim.unresolved}</div>
      </Rise>
    );
  }
  return (
    <div data-a={`${id}.evidence`} className="grid gap-3">
      <Rise at={at}>
        <IconLabel icon={TextQuoteIcon}>{t.sources_title}</IconLabel>
      </Rise>
      {claim.citations.map((c) => (
        <div key={c.source.id} className="grid gap-2">
          <Wipe at={delay(10)}>
            <blockquote className="relative pl-6 text-body text-pretty">
              <span aria-hidden="true" className="absolute top-0 left-0 text-title leading-none font-bold">
                „
              </span>
              {c.fragment}”
            </blockquote>
          </Wipe>
          <Rise at={delay(44)} className="grid gap-1.5 pl-6">
            <span className="inline-flex w-fit items-baseline gap-1.5 text-small font-semibold underline decoration-current/30 underline-offset-3">
              {c.source.title}
              <ExternalLinkIcon aria-hidden="true" className="size-3.5 shrink-0 translate-y-0.5" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-muted-foreground">
              <span>
                {c.source.publisher}, {day.format(new Date(c.source.published_at))}
              </span>
              <Pop at={delay(56)}>
                <Badge>{pl.source_kind[c.source.kind as keyof typeof pl.source_kind]}</Badge>
              </Pop>
              <Pop at={delay(62)}>
                <Badge>{pl.source_tier[c.source.tier as keyof typeof pl.source_tier]}</Badge>
              </Pop>
            </div>
          </Rise>
        </div>
      ))}
    </div>
  );
};

/** How many frames after a claim starts its strength line comes in. */
export const STRENGTH_AT = 84;

/** One claim of the result: verdict label, the claim, then the explanation, the quote with its source, the strength. */
export const ClaimBlock = ({claim, id, at, note}: {claim: Claim; id: string; at?: number; note?: number}) => {
  const delay = (n: number) => (at === undefined ? undefined : at + n);
  return (
    <div data-a={id}>
      <div data-a={`${id}.row`} className="grid gap-x-4 gap-y-1 rounded-xl px-4 py-3 @xl:grid-cols-[17rem_1fr] @xl:items-center">
        <span className="flex">
          <Pop at={at}>
            <VerdictBadge verdict={claim.verdict} />
          </Pop>
        </span>
        <Rise at={delay(5)} className="flex items-center justify-between gap-4 text-body font-semibold text-pretty">
          <span>„{claim.claim}”</span>
          <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 rotate-180 text-muted-foreground" />
        </Rise>
      </div>
      <div className="grid gap-5 px-4 pt-3 pb-6 @xl:pl-[19rem]">
        <Rise at={delay(16)}>
          <p className="text-body text-pretty">{claim.explanation}</p>
        </Rise>
        <Evidence claim={claim} at={delay(30)} id={id} />
        {claim.strength && <Strength level={claim.strength.level as Level} at={delay(STRENGTH_AT)} id={id} note={note} />}
      </div>
    </div>
  );
};

const count = (n: number) => t.claims_count[plural.select(n) as 'one' | 'few' | 'many'].replace('{count}', String(n));

/** The result of a check: a summary, every claim open, the limitations and the two actions. */
export const ListResult = ({list, at, gap = 100, footAt, note, dim = () => 0}: {list: Claim[]; at?: number; gap?: number; footAt?: number; note?: number; dim?: (part: string) => number}) => {
  const delay = (n: number) => (at === undefined ? undefined : at + n);
  const verdicts = [...new Set(list.map((c) => c.verdict))];
  return (
    <div className="@container grid gap-8">
      <Dim k={dim('summary')}>
      <Rise at={at} className="grid gap-2">
        <IconLabel icon={ListChecksIcon}>
          {t.claims_title}: {count(list.length)}
        </IconLabel>
        <ul className="flex flex-wrap gap-2">
          {verdicts.map((v) => (
            <li key={v} className="flex items-center gap-1.5 text-small text-muted-foreground tabular-nums">
              {list.filter((c) => c.verdict === v).length} ×
              <VerdictBadge verdict={v} />
            </li>
          ))}
        </ul>
      </Rise>
      </Dim>
      <div className="-mx-4 grid gap-2">
        {list.map((claim, i) => (
          <Dim key={claim.claim} k={dim(`c${i}`)}>
            <ClaimBlock claim={claim} id={`c${i}`} at={delay(20 + i * gap)} note={i === 0 ? note : 0} />
          </Dim>
        ))}
      </div>
      <Rise at={footAt} className="grid gap-8">
        <p className="flex items-center gap-1.5 text-small font-semibold text-muted-foreground">
          <InfoIcon aria-hidden="true" className="size-4" />
          {t.limitations} ({limitations.length})
          <ChevronDownIcon aria-hidden="true" className="size-4" />
        </p>
        <div className="flex flex-wrap gap-2">
          <span className={`${button} ${outline} h-9 gap-2 rounded-pill px-4 text-small`}>
            <FlagIcon aria-hidden="true" />
            {t.report_error}
          </span>
          <span className={`${button} h-9 gap-2 rounded-pill px-4 text-small`}>
            <BookOpenIcon aria-hidden="true" />
            {t.how_it_works}
          </span>
        </div>
      </Rise>
    </div>
  );
};

/** The phases a check goes through; the three searches run at once (prototype app.tsx). */
export const phases = [['receive'], ['screen_injection'], ['extract_claims'], ['search_corpus', 'search_web', 'search_fact_checks'], ['assess_evidence'], ['verify_citations'], ['write_answer']] as const;
type Step = keyof typeof analysis.steps;

/** Progress of a running check: one bar, the current step, and the list of steps opening on request. */
export const ListProgress = ({phase, value, open}: {phase: number; value: number; open: number}) => {
  const frame = useCurrentFrame();
  const total = phases.flat().length;
  const over = phases.slice(0, phase).flat().length;
  const now = phases[Math.min(phase, phases.length - 1)];
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-small font-semibold">{analysis.title}</span>
          <span className="text-small text-muted-foreground tabular-nums">{analysis.step_of.replace('{n}', String(Math.min(over + 1, total))).replace('{of}', String(total))}</span>
        </p>
        <div data-a="progress" className="relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted">
          <div className="size-full flex-1 bg-primary" style={{translate: `-${100 - value * 100}% 0`}} />
        </div>
        <p className="text-body">{now.map((s) => analysis.steps[s as Step]).join(' · ')}</p>
      </div>
      <div>
        <p data-a="show-steps" className="flex w-fit items-center gap-1.5 text-small font-semibold text-muted-foreground">
          {analysis.show_steps}
          <ChevronDownIcon aria-hidden="true" className="size-4" style={{rotate: `${open * 180}deg`}} />
        </p>
        <div className="grid" style={{gridTemplateRows: `${open}fr`, opacity: open}}>
          <ol data-a="steps" className="grid min-h-0 gap-2.5 overflow-hidden" style={{paddingTop: `${open}rem`}}>
            {phases.map((codes, i) =>
              codes.map((code) => (
                <li key={code} className="flex items-center gap-3 text-body">
                  {i < phase ? (
                    <CheckIcon aria-hidden="true" className="size-4" />
                  ) : i === phase ? (
                    <LoaderCircleIcon aria-hidden="true" className="size-4" style={{rotate: `${frame * 12}deg`}} />
                  ) : (
                    <MinusIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                  )}
                  <span className={i > phase ? 'text-muted-foreground' : ''}>{analysis.steps[code]}</span>
                  {i >= phase && <span className="text-small text-muted-foreground">{analysis.step_status[i === phase ? 'active' : 'pending']}</span>}
                </li>
              )),
            )}
          </ol>
        </div>
      </div>
    </div>
  );
};

export type HistoryItem = {claim: string; verdict?: string; at: string};

/** The rail: a button for a new check and the earlier checks of this browser tab. */
export const Rail = ({items, withNew = false, at}: {items: HistoryItem[]; withNew?: boolean; at?: number}) => (
  <Rise at={at} className="grid content-start gap-8 self-start">
    {withNew && (
      <span className={`${button} h-10 justify-start gap-2 rounded-pill bg-primary px-4 text-small text-primary-foreground`}>
        <PlusIcon />
        {pl.check_page.new}
      </span>
    )}
    <section className="grid gap-3">
      <IconLabel icon={HistoryIcon}>{pl.history.title}</IconLabel>
      <ul className="-mx-3 grid gap-1">
        {items.map((h) => (
          <li key={h.claim} className="grid gap-2 rounded-lg px-3 py-2.5">
            <span className="line-clamp-2 text-small text-pretty">{h.claim}</span>
            <span className="flex items-center justify-between gap-3">
              {h.verdict ? <VerdictBadge verdict={h.verdict} /> : <span className="text-meta text-muted-foreground">{analysis.step_status.active}</span>}
              <span className="text-meta text-muted-foreground tabular-nums">{h.at}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-meta text-pretty text-muted-foreground">{pl.history.session_note}</p>
    </section>
  </Rise>
);

/** A page of one check or of the form: the 45rem column and the rail beside it. */
export const Columns = ({children, rail}: {children: ReactNode; rail: ReactNode}) => (
  <main className={columns}>
    <div className="grid min-w-0 content-start gap-10">{children}</div>
    {rail}
  </main>
);

/** The field of the form: a plain bordered field with the counter and the submit button. */
export const Field = ({value, caret, focus, press = 0}: {value: string; caret: boolean; focus: boolean; press?: number}) => (
  <div data-a="field" className={`grid gap-1 rounded-lg border border-input bg-card p-2 ${focus ? 'outline-2 outline-offset-2 outline-ring' : ''}`}>
    <div className={`min-h-11 px-2 py-2 text-body ${value ? '' : 'text-muted-foreground'}`}>
      {value || pl.form.input_placeholder}
      {caret && <span className="-my-0.5 ml-px inline-block h-5 w-0.5 translate-y-1 bg-foreground" />}
    </div>
    <div className="flex items-center gap-2">
      {value.length > 0 && (
        <span className="px-2 text-meta text-muted-foreground tabular-nums">
          {value.length} / {(4000).toLocaleString('pl-PL')}
        </span>
      )}
      <span data-a="submit" className={`${button} ml-auto h-10 gap-1.5 rounded-pill bg-primary px-5 text-primary-foreground`} style={{scale: 1 - 0.04 * press}}>
        {pl.form.submit}
        <ArrowUpIcon aria-hidden="true" className="size-4" />
      </span>
    </div>
  </div>
);

/** The page of a new check: heading, field, two example claims, the notice that an AI system answers. */
export const NewCheck = ({field, at}: {field: ReactNode; at?: number}) => {
  const delay = (n: number) => (at === undefined ? undefined : at + n);
  return (
    <div className="grid gap-8">
      <Rise at={at} className="grid gap-3">
        <h1 className="text-headline font-bold tracking-tight text-balance">{pl.form.title}</h1>
        <p className="max-w-prose text-body text-pretty text-muted-foreground">{pl.form.lead}</p>
      </Rise>
      <Rise at={delay(6)}>{field}</Rise>
      <Rise at={delay(12)} className="grid gap-3">
        <p className="text-small text-muted-foreground">{pl.conversation.examples_lead}</p>
        <ul className="flex flex-wrap gap-2">
          {pl.conversation.examples.map((claim) => (
            <li key={claim} className={`${button} ${outline} h-auto min-h-9 rounded-pill px-4 py-1.5 text-left text-small font-normal whitespace-normal`}>
              „{claim}”
            </li>
          ))}
        </ul>
      </Rise>
      <Rise at={delay(18)}>
        <p className="max-w-prose text-small text-pretty text-muted-foreground">{pl.ai_notice.first_contact}</p>
      </Rise>
    </div>
  );
};

const facts = [
  {icon: LibraryIcon, title: pl.method.sources.title, text: pl.method.sources.text[0]},
  {icon: ScaleIcon, title: pl.method.verdict.title, text: pl.method.verdict.text[1]},
  {icon: RefreshCwIcon, title: pl.method.corrections.title, text: pl.method.corrections.text[0]},
];
const pill = 'h-11 gap-2 rounded-pill px-5 text-body';

/** The home page: the tagline, one button, and beside them a real result set straight on the page. */
export const Home = ({at, press = 0}: {at?: number; press?: number}) => {
  const delay = (n: number) => (at === undefined ? undefined : at + n);
  return (
    <main>
      <section className={`${page} grid grid-cols-2 items-start gap-x-16 gap-y-14 pt-24`}>
        <div className="grid gap-6 pt-12">
          <Rise at={at} y={1}>
            <h1 data-a="tagline" className="text-display font-bold tracking-tight text-balance">
              {pl.brand.taglines[0]}
            </h1>
          </Rise>
          <Rise at={delay(8)}>
            <p className="max-w-lg text-title font-normal text-pretty text-muted-foreground">{pl.form.lead}</p>
          </Rise>
          <Rise at={delay(16)} className="flex flex-wrap gap-2 pt-2">
            <span data-a="cta" className={`${button} ${pill} bg-primary text-primary-foreground`} style={{scale: 1 - 0.04 * press}}>
              {pl.form.title}
              <ArrowRightIcon style={{translate: `${press * 0.2}rem 0`}} />
            </span>
            <span className={`${button} ${outline} ${pill}`}>
              <BookOpenIcon />
              {t.how_it_works}
            </span>
          </Rise>
          <Rise at={delay(22)}>
            <p className="max-w-md text-small text-pretty text-muted-foreground">{pl.account.optional}</p>
          </Rise>
        </div>
        <Rise at={delay(14)} y={1.4} d={26}>
          <figure data-a="sample" className="grid gap-5">
            <figcaption className="text-meta font-semibold text-muted-foreground">{pl.check_page.sample}</figcaption>
            <div className="grid gap-6 px-4">
              <p className="relative pl-7 text-title font-semibold tracking-tight text-pretty">
                <span aria-hidden="true" className="absolute top-0 left-0 text-headline leading-none font-bold">
                  „
                </span>
                {examples.CheckRequest.text.replace('rządzić trzy', 'rządzić przez trzy')}”
              </p>
              <div className="@container -mx-4">
                <ClaimBlock claim={done[0]} id="h0" />
              </div>
              <div aria-hidden="true" className="@container -mx-4 -mt-4 max-h-24 overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
                <ClaimBlock claim={done[1]} id="h1" />
              </div>
            </div>
          </figure>
        </Rise>
      </section>
      <Rise at={delay(30)}>
        <section className={`${page} grid grid-cols-3 gap-x-12 gap-y-10 py-20`}>
          {facts.map((f) => (
            <div key={f.title} className="grid content-start gap-2">
              <IconLabel icon={f.icon} className="text-body font-semibold">
                {f.title}
              </IconLabel>
              <p className="text-small text-pretty text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </Rise>
    </main>
  );
};
