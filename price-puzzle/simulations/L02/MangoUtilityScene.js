import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';
import { esc, simTag, simRecord } from 'simulations/base/SimUi.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { fmtINR } from 'simulations/base/kit/SimText.js';

/**
 * MangoUtilityScene - three panels on one buyer: the calendar, the news, and the
 * extra mango.
 *
 * Nothing here is a process. There is no run to watch and no loop: each panel is a
 * set of labels the learner moves by tapping, and the scene rests wherever they
 * left it. Only the calendar sweep is a run, and it walks twelve months and stops.
 *
 * The three panels are stacked and folded rather than set side by side - the scene
 * lives in the slide's right column, and a folded panel keeps the reading the
 * learner last gave it, which is what makes three panels one claim about the same
 * buyer instead of three separate demos.
 *
 * Labels only: month names, stall names, level words, a chip that flips, six
 * counters, and rupees. Every sentence the learner needs is in the slide's prose.
 */

const MONTHS = [
  { ab: 'Jan', full: 'January' }, { ab: 'Feb', full: 'February' }, { ab: 'Mar', full: 'March' },
  { ab: 'Apr', full: 'April' }, { ab: 'May', full: 'May' }, { ab: 'Jun', full: 'June' },
  { ab: 'Jul', full: 'July' }, { ab: 'Aug', full: 'August' }, { ab: 'Sep', full: 'September' },
  { ab: 'Oct', full: 'October' }, { ab: 'Nov', full: 'November' }, { ab: 'Dec', full: 'December' },
];

const LEVELS = ['quiet', 'a few', 'filling', 'crowded'];

// One shopkeeper's year, not a market: a level is how busy that stall is in that
// month. 0-3 in the order above, Jan to Dec.
//   bookshop  term starts in April and June, board and exam season November to March
//   sweets    Makar Sankranti in January, Holi in March, Diwali in October
//   sweaters  October to March, and "gather dust by May" from the slide, so the
//             sweater row's word for level 0 is the slide's word and not "quiet"
const STALLS = [
  { key: 'books', name: 'Bookshop', short: 'bookshop', levels: [3, 1, 2, 3, 1, 3, 2, 1, 1, 2, 3, 2] },
  { key: 'sweets', name: 'Sweet shop', short: 'sweets', levels: [2, 0, 2, 0, 0, 0, 0, 1, 2, 3, 2, 1] },
  { key: 'knitwear', name: 'Sweaters', short: 'sweaters', words: ['dusty', 'a few', 'filling', 'crowded'], levels: [3, 3, 2, 0, 0, 0, 0, 0, 1, 2, 3, 3] },
];

// The two pieces of news the slide names, and the week each one makes. "at" is how
// many of the six buyers are at the counter today; 4 is an ordinary week.
const NEWS = [
  { key: 'sale', tag: 'for next week', head: 'Festival sale next week: sweets 30% off', chip: 'hold back', at: 2 },
  { key: 'rumour', tag: 'from next month', head: 'Rumor: prices will climb from next month', chip: 'buy now', at: 6 },
];
const COUNTERS = 6;
const ORDINARY_WEEK = 4;

// Rupees one buyer will pay for each extra mango of the season. The gaps shrink
// (35, 25, 12, 8) and never go below zero: each mango is still worth something.
const MANGO_WTP = [90, 55, 30, 18, 10];
const WTP_MAX = MANGO_WTP[0];
const PRINCIPLE_REVEALED_AT = 3; // the slide's own third mango

const NOTE_BY_BEAT = [
  'Same buyer, same money. What changes is the month, so the stall they walk into changes too. Levels are one shopkeeper\'s year.',
  'The good has not changed and neither has the buyer. Only the news about its price has.',
  'Bar height is what that mango is worth on its own - the extra satisfaction it adds. Each bar is shorter than the one before.',
];

// ------------------------------------------------------------------ fragments

function mangoSvg() {
  return `<svg class="mu-mango" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path class="mu-mango__stem" d="M23 11C22 8 23 5 26 4" fill="none"></path>
    <path class="mu-mango__leaf" d="M26 4C31 0 38 1 39 5C33 9 28 7 26 4Z"></path>
    <ellipse class="mu-mango__body" cx="24" cy="28" rx="13" ry="14.5" transform="rotate(-16 24 28)"></ellipse>
    <ellipse class="mu-mango__shine" cx="19.5" cy="22" rx="3" ry="4.6" transform="rotate(-16 19.5 22)"></ellipse>
  </svg>`;
}

function calendarPanel() {
  const cells = MONTHS.map((m, i) => `<button type="button" class="mu-month" data-month="${i}" aria-pressed="false">${esc(m.ab)}</button>`).join('');
  const rows = STALLS.map((s) => {
    const words = s.words || LEVELS;
    const meter = [0, 1, 2, 3].map((n) => `<span class="mu-meter__cell" data-cell="${n}"></span>`).join('');
    return `<div class="mu-stall" data-stall="${s.key}">
      <span class="mu-stall__name">${esc(s.name)}</span>
      <span class="mu-meter" data-meter aria-hidden="true">${meter}</span>
      <span class="mu-stall__word" data-word>${esc(words[0])}</span>
    </div>`;
  }).join('');
  return `<section class="sim-card mu-panel mu-cal" data-panel="cal" aria-label="A year of months and how busy three stalls are in each">
    <div class="mu-panel__head">
      <span class="mu-panel__icon">${iconSvg('calendar', 'var(--sim-accent)')}</span>
      ${simTag('the calendar')}
      <button type="button" class="mu-btn" data-sweep>Sweep the year</button>
    </div>
    <div class="mu-months" role="group" aria-label="Months of the year">${cells}</div>
    <div class="mu-stalls" role="group" aria-label="How busy each stall is this month">${rows}</div>
    <p class="mu-state" data-cal-state aria-live="polite"></p>
    <span class="mu-hint" data-cal-hint hidden>tap a month</span>
  </section>`;
}

function newsPanel() {
  const cards = NEWS.map((n) => `<button type="button" class="mu-headline" data-news="${n.key}" aria-pressed="false">
    <span class="mu-headline__tag">${simTag(n.tag)}</span>
    <span class="mu-headline__text">${esc(n.head)}</span>
  </button>`).join('');
  const glyphs = Array.from({ length: COUNTERS }, (_, i) => `<span class="mu-glyph" data-glyph="${i}">${iconSvg('person', 'var(--sim-accent)')}</span>`).join('');
  return `<section class="sim-card mu-panel mu-news" data-panel="news" aria-label="Two headlines and how many buyers are at the counter today">
    <div class="mu-panel__head">
      <span class="mu-panel__icon">${iconSvg('newspaper', 'var(--sim-accent)')}</span>
      ${simTag('the news')}
      <span class="mu-verdict" data-verdict>tap a headline</span>
    </div>
    <div class="mu-headlines" role="group" aria-label="Headlines">${cards}</div>
    <div class="mu-counter">
      <div class="mu-glyphs" data-glyphs aria-hidden="true">${glyphs}</div>
      <p class="mu-counter__n" data-count aria-live="polite">${ORDINARY_WEEK} of ${COUNTERS} at the counter today</p>
    </div>
    <span class="mu-hint" data-news-hint hidden>tap a headline</span>
  </section>`;
}

function mangoPanel() {
  const cells = MANGO_WTP.map((v, i) => `<button type="button" class="mu-mcell" data-mango="${i}" aria-pressed="false">
    <span class="mu-well" aria-hidden="true"><span class="mu-bar" data-bar style="height:0%"></span></span>
    ${mangoSvg()}
    <span class="mu-price" data-price>tap</span>
  </button>`).join('');
  return `<section class="sim-card mu-panel mu-mangos" data-panel="mango" aria-label="Five mangoes in a row, each with the price a buyer will pay for it">
    <div class="mu-panel__head">
      <span class="mu-panel__icon mu-panel__icon--mango">${mangoSvg()}</span>
      ${simTag('each extra mango')}
    </div>
    <div class="mu-shelf" role="group" aria-label="Mangoes of the season">${cells}</div>
    <p class="mu-principle" data-principle hidden>${simTag('diminishing marginal utility principle', { accent: true })}</p>
    <span class="mu-hint" data-mango-hint hidden>tap the next mango</span>
  </section>`;
}

function foldRow(panel, tag, lineId) {
  return `<button type="button" class="mu-fold" data-open="${panel}">
    <span class="mu-fold__tag">${simTag(tag)}</span>
    <span class="mu-fold__line" id="${lineId}" data-fold-line></span>
  </button>`;
}

// --------------------------------------------------------------------- look

const CSS = `
.mu-root { width: 100%; }
.mu-panels { display: flex; flex-direction: column; gap: var(--sim-space-2); }
.mu-panel { display: flex; flex-direction: column; gap: var(--sim-space-3); }
/* Folded: one line, still the learner's last reading, still openable by tap. */
.mu-panel[hidden] { display: none; }
.mu-panel__head { display: flex; align-items: center; gap: var(--sim-space-2); }
.mu-panel__icon { display: grid; place-items: center; width: 26px; height: 26px; }
.mu-panel__icon .sim-icon { width: 24px; height: 24px; }
.mu-panel__icon--mango .mu-mango { width: 26px; height: 26px; }
.mu-panel__icon--mango .mu-mango__stem { display: none; }
.mu-panel__icon--mango .mu-mango__body { fill: var(--sim-series-5); }

/* Three forces, so three cells: the shared strip's four-column grid would leave a
   dead cell at the end of every beat. */
.mu-root .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mu-dom-root--portrait .mu-root .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.mu-months { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--sim-space-1); }
.mu-month { min-height: 32px; padding: var(--sim-space-1) 0; border: 2px solid var(--sim-stroke);
  border-radius: var(--sim-radius-sm); background: var(--sim-bg-cell); color: var(--sim-label-muted);
  font-family: inherit; font-size: var(--sim-text-sm); font-weight: 800; cursor: pointer;
  transition: background .18s, border-color .18s, color .18s; }
.mu-month:hover { border-color: var(--sim-accent); }
.mu-month--on { background: color-mix(in oklab, var(--sim-accent) 20%, var(--sim-bg-surface));
  border-color: var(--sim-accent); color: var(--sim-label); }
.mu-month--past { opacity: .72; }

.mu-stalls { display: flex; flex-direction: column; gap: var(--sim-space-2); }
.mu-stall { display: grid; grid-template-columns: 92px 76px minmax(0, 1fr); align-items: center;
  gap: var(--sim-space-2); }
.mu-stall__name { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label); white-space: nowrap; }
.mu-meter { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 3px; }
.mu-meter__cell { height: 10px; border-radius: 2px; background: color-mix(in oklab, var(--sim-stroke) 30%, transparent); }
.mu-meter__cell--on { background: var(--sim-series-5); }
.mu-stall__word { font-size: var(--sim-text-sm); font-weight: 800; color: var(--sim-label); }

.mu-state { margin: 0; font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); }
.mu-btn { margin-left: auto; min-height: 30px; padding: var(--sim-space-1) var(--sim-space-3);
  border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-pill);
  background: var(--sim-bg-cell); color: var(--sim-label); font-family: inherit;
  font-size: var(--sim-text-sm); font-weight: 800; cursor: pointer;
  transition: transform .08s, box-shadow .08s, border-color .15s; }
.mu-btn:hover:not(:disabled) { border-color: var(--sim-accent); }
.mu-btn:active:not(:disabled) { transform: translateY(2px); }
.mu-btn:disabled { opacity: .5; cursor: default; }

.mu-headlines { display: flex; flex-direction: column; gap: var(--sim-space-2); }
.mu-headline { display: flex; flex-direction: column; align-items: flex-start; gap: var(--sim-space-1);
  padding: var(--sim-space-2) var(--sim-space-3); text-align: left;
  border: 2px solid var(--sim-stroke); border-left-width: 5px; border-radius: var(--sim-radius-md);
  background: var(--sim-bg-cell); font-family: inherit; cursor: pointer;
  transition: background .18s, border-color .18s; }
.mu-headline:hover { border-color: var(--sim-accent); }
.mu-headline--on { background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface));
  border-color: var(--sim-accent); }
.mu-headline__text { font-size: var(--sim-text-md); font-weight: 700; color: var(--sim-label); line-height: 1.25; }
.mu-verdict { margin-left: auto; font-size: var(--sim-text-md); font-weight: 800; color: var(--sim-label-muted); }
.mu-verdict--on { color: var(--sim-accent); }

.mu-counter { display: flex; align-items: center; gap: var(--sim-space-3); }
.mu-glyphs { display: flex; gap: var(--sim-space-1); }
.mu-glyph .sim-icon { width: 24px; height: 24px; display: block; }
.mu-glyph--off .sim-icon { opacity: .3; }
.mu-counter__n { margin: 0; font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); }

.mu-shelf { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--sim-space-2);
  border-bottom: 4px solid color-mix(in oklab, var(--sim-stroke) 70%, transparent); padding-bottom: var(--sim-space-2); }
.mu-mcell { display: flex; flex-direction: column; align-items: center; gap: var(--sim-space-1);
  padding: var(--sim-space-1) 0 0; background: none; border: 0; border-radius: var(--sim-radius-sm);
  font-family: inherit; cursor: pointer; }
/* The bars grow from the top of the mango, so a height of 0 must leave no stub
   behind: the unrevealed mango itself is the mark that the column is still to come. */
.mu-well { display: flex; align-items: flex-end; width: 100%; height: 52px; }
.mu-bar { display: block; width: 100%; border-radius: var(--sim-radius-sm) var(--sim-radius-sm) 0 0;
  background: var(--sim-series-5); transition: height .32s ease; }
.mu-mcell .mu-mango { width: 38px; height: 38px; }
/* The unrevealed fruit is the darker cushion shade of the revealed one, so a
   priced mango is unmistakably the brighter object in both themes. */
.mu-mcell--wait .mu-mango__body { fill: color-mix(in oklab, var(--sim-stroke) 45%, var(--sim-bg-deep)); }
.mu-mcell--wait .mu-mango__shine { opacity: .28; }
.mu-mcell--wait .mu-mango__leaf { fill: color-mix(in oklab, var(--sim-stroke) 70%, var(--sim-bg-surface)); }
.mu-mcell--on .mu-mango__body { fill: var(--sim-series-5); }
.mu-mcell--on .mu-mango__shine { opacity: .8; }
.mu-mcell--on .mu-mango__leaf { fill: var(--sim-series-3); }
.mu-price { font-size: var(--sim-text-sm); font-weight: 800; color: var(--sim-label-muted); }
.mu-mcell--on .mu-price { color: var(--sim-label); }
.mu-mango__stem { stroke: var(--sim-label-muted); stroke-width: 2.5; stroke-linecap: round; }
.mu-mango__leaf { fill: var(--sim-series-3); }
.mu-mango__body { fill: var(--sim-series-5); transition: fill .25s; }
.mu-mango__shine { fill: color-mix(in oklab, var(--sim-bg-surface) 55%, transparent); }
.mu-principle { margin: 0; display: flex; }

.mu-fold { display: flex; align-items: center; gap: var(--sim-space-2); width: 100%;
  padding: var(--sim-space-2) var(--sim-space-3); text-align: left; font-family: inherit;
  border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-md);
  background: none; cursor: pointer; transition: border-color .15s; }
.mu-fold:hover { border-color: var(--sim-accent); }
.mu-fold[hidden] { display: none; }
.mu-fold__tag { flex: none; }
.mu-fold__line { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted);
  overflow-wrap: anywhere; }

.mu-hint { display: inline-block; align-self: flex-start; font-size: var(--sim-text-sm); font-weight: 800;
  color: var(--sim-bg-deep); background: var(--sim-accent); border-radius: var(--sim-radius-pill);
  padding: var(--sim-space-1) var(--sim-space-3); animation: mu-pulse 1.6s ease-in-out infinite; }
.mu-hint[hidden] { display: none; }
@keyframes mu-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }

.sim-dom-root--portrait .mu-stall { grid-template-columns: 88px 64px minmax(0, 1fr); }
.sim-dom-root--portrait .mu-stall__name { white-space: normal; }
.sim-dom-root--portrait .mu-counter { flex-direction: column; align-items: flex-start; }
@media (prefers-reduced-motion: reduce) {
  .mu-hint { animation: none; }
  .mu-bar, .mu-month, .mu-headline, .mu-mango__body { transition: none; }
}
`;

const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }], // the calendar
  [{ idx: 1, dwellMs: null }], // the news
  [{ idx: 2, dwellMs: null }], // the extra mango
];

const SWEEP_STEP_MS = 340;
const PANEL_OF_BEAT = ['cal', 'news', 'mango'];
const FOLD_TAG = { cal: 'the calendar', news: 'the news', mango: 'each extra mango' };

export class MangoUtilityScene extends DomSimulation {
  static WIDTH = 660;
  // sim-layout's measured numbers for the tallest state (the calendar panel open with
  // its hint chip showing), not a guess: 518 landscape, 689 portrait.
  static HEIGHT = 518;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 689;
  static FIT = true;
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static ARIA_LABEL = 'Three panels about one buyer: a year of months with how busy a bookshop, a sweet shop and a sweater stall are in each; two headlines that flip a chip between buy now and hold back and change how many buyers are at the counter today; and five mangoes in a row, each worth a lower price than the one before.';
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._month = 3; // April: term start, so the first tap already shows a crowded shop
    this._news = null;
    this._newsSeen = new Set();
    this._shown = 0; // how many mangoes have dropped their price chip
    this._sweeping = false;
    this._openKey = 'cal';
    this._broke = { cal: false, news: false, mango: false };
    this._words = new Set();
    this._els = null;
  }

  async setup() {
    await super.setup();
    this.render({
      css: SIM_LOOK_DOM_CSS + CSS,
      rootClass: 'mu-root sl-backdrop',
      html: `<div class="sim-stack mu-root">
        <div data-record>${simRecord(['Calendar', 'News', 'Extra mango'], 0, 'Three forces')}</div>
        <div class="sim-stack sim-stack--tight mu-panels" data-panels>
          ${calendarPanel()}
          ${newsPanel()}
          ${mangoPanel()}
        </div>
        <div data-folds class="sim-stack sim-stack--tight">
          ${foldRow('cal', FOLD_TAG.cal, 'mu-fold-cal')}
          ${foldRow('news', FOLD_TAG.news, 'mu-fold-news')}
          ${foldRow('mango', FOLD_TAG.mango, 'mu-fold-mango')}
        </div>
        ${noteLineHtml([{ text: NOTE_BY_BEAT[0] }])}
      </div>`,
    });
    this._els = {
      record: this.root?.querySelector?.('[data-record]'),
      panels: {
        cal: this.root?.querySelector?.('[data-panel="cal"]'),
        news: this.root?.querySelector?.('[data-panel="news"]'),
        mango: this.root?.querySelector?.('[data-panel="mango"]'),
      },
      folds: {
        cal: this.root?.querySelector?.('#mu-fold-cal'),
        news: this.root?.querySelector?.('#mu-fold-news'),
        mango: this.root?.querySelector?.('#mu-fold-mango'),
      },
      monthBtns: Array.from(this.root?.querySelectorAll?.('[data-month]') ?? []),
      stalls: Array.from(this.root?.querySelectorAll?.('[data-stall]') ?? []),
      calState: this.root?.querySelector?.('[data-cal-state]'),
      sweep: this.root?.querySelector?.('[data-sweep]'),
      hints: {
        cal: this.root?.querySelector?.('[data-cal-hint]'),
        news: this.root?.querySelector?.('[data-news-hint]'),
        mango: this.root?.querySelector?.('[data-mango-hint]'),
      },
      headlines: Array.from(this.root?.querySelectorAll?.('[data-news]') ?? []),
      verdict: this.root?.querySelector?.('[data-verdict]'),
      count: this.root?.querySelector?.('[data-count]'),
      glyphs: Array.from(this.root?.querySelectorAll?.('[data-glyph]') ?? []),
      mangoBtns: Array.from(this.root?.querySelectorAll?.('[data-mango]') ?? []),
      principle: this.root?.querySelector?.('[data-principle]'),
      note: this.root?.querySelector?.('.sl-note-line'),
    };
    this._bind();
    this._paintAll();
    this.onStep();
  }

  // ------------------------------------------------------------------ wiring

  _bind() {
    const e = this._els;
    for (const btn of e.monthBtns) {
      btn.addEventListener('click', () => this._setMonth(Number(btn.dataset.month), true));
    }
    for (const btn of e.headlines) {
      btn.addEventListener('click', () => this._setNews(btn.dataset.news, true));
    }
    for (const btn of e.mangoBtns) {
      btn.addEventListener('click', () => this._revealMango(Number(btn.dataset.mango), true));
    }
    e.sweep?.addEventListener('click', () => this._sweep());
    // One delegated listener on the fold strip: tapping a folded panel opens it,
    // so a learner who missed a beat can still reach the panel they want.
    e.folds.cal?.closest('[data-folds]')?.addEventListener('click', (ev) => {
      const row = ev.target.closest('[data-open]');
      if (row) this._open(row.dataset.open ?? null);
    });
  }

  // One state, one paint: the month buttons, the three stall rows and the fold
  // line all read this._month, so nothing on the calendar can tell a different
  // story from the words.
  _setMonth(i, fromLearner) {
    if (!Number.isInteger(i) || i < 0 || i >= MONTHS.length) return;
    this._month = i;
    this._paintCalendar();
    this._paintFold('cal');
    if (fromLearner) {
      this.requestUiUpdate?.();
      this.animateFor?.(500);
      this._broke.cal = true;
      for (const s of STALLS) this._words.add(this._wordsFor(s.key)[s.levels[i]]);
      this._paintHints('cal');
      this._stopSweep();
      this._maybeBurst('cal');
    }
  }

  _wordsFor(stallKey) {
    const s = STALLS.find((x) => x.key === stallKey);
    return s.words || LEVELS;
  }

  _setNews(key, fromLearner) {
    if (!NEWS.some((n) => n.key === key)) return;
    this._news = key;
    this._paintNews();
    this._paintFold('news');
    if (fromLearner) {
      this.requestUiUpdate?.();
      this.animateFor?.(500);
      this._newsSeen.add(key);
      this._paintHints('news');
      this._maybeBurst('news');
    }
  }

  // Tapping any mango reveals every mango up to it, so the shelf is always read
  // left to right as a slide and the learner can never see a hole in it.
  _revealMango(i, fromLearner) {
    if (!Number.isInteger(i) || i < 0 || i >= MANGO_WTP.length) return;
    if (i + 1 <= this._shown) return;
    this._shown = i + 1;
    this._paintMangoes();
    this._paintFold('mango');
    if (fromLearner) {
      this.requestUiUpdate?.();
      this.animateFor?.(500);
      this._paintHints('mango');
      if (this._shown >= PRINCIPLE_REVEALED_AT) this._maybeBurst('mango');
    }
  }

  // Opening a folded panel from another beat is the learner overriding the beat, so
  // the record strip follows the open panel and not the beat it was left on.
  _open(key) {
    if (!PANEL_OF_BEAT.includes(key)) return;
    this._openKey = key;
    this.requestUiUpdate?.();
    this.animateFor?.(400);
    this._paintPanels(key);
    this._paintRecord(PANEL_OF_BEAT.indexOf(key));
    this._paintHints(key);
  }

  // ------------------------------------------------------------------- paint

  _paintAll() {
    this._paintCalendar();
    this._paintNews();
    this._paintMangoes();
    for (const key of PANEL_OF_BEAT) this._paintFold(key);
  }

  _paintCalendar() {
    const e = this._els;
    if (!e) return;
    for (const btn of e.monthBtns) {
      const i = Number(btn.dataset.month);
      btn.classList.toggle('mu-month--on', i === this._month);
      btn.setAttribute('aria-pressed', i === this._month ? 'true' : 'false');
    }
    for (const row of e.stalls) {
      const key = row.dataset.stall;
      const level = STALLS.find((s) => s.key === key).levels[this._month];
      for (const cell of row.querySelectorAll('[data-cell]')) {
        cell.classList.toggle('mu-meter__cell--on', Number(cell.dataset.cell) < level);
      }
      const word = row.querySelector('[data-word]');
      if (word) word.textContent = this._wordsFor(key)[level];
    }
    if (e.calState) e.calState.textContent = `${MONTHS[this._month].full} - ${this._readings().join(' \u00b7 ')}`;
    if (e.sweep) e.sweep.disabled = this._sweeping;
  }

  _paintNews() {
    const e = this._els;
    if (!e) return;
    const n = NEWS.find((x) => x.key === this._news) || null;
    const at = n ? n.at : ORDINARY_WEEK;
    for (const card of e.headlines) {
      const on = !!n && card.dataset.news === n.key;
      card.classList.toggle('mu-headline--on', on);
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (e.verdict) {
      e.verdict.textContent = n ? n.chip : 'tap a headline';
      e.verdict.classList.toggle('mu-verdict--on', !!n);
    }
    for (const g of e.glyphs) g.classList.toggle('mu-glyph--off', Number(g.dataset.glyph) >= at);
    if (e.count) e.count.textContent = `${at} of ${COUNTERS} at the counter today`;
  }

  _paintMangoes() {
    const e = this._els;
    if (!e) return;
    for (const cell of e.mangoBtns) {
      const i = Number(cell.dataset.mango);
      const shown = i < this._shown;
      cell.classList.toggle('mu-mcell--on', shown);
      cell.classList.toggle('mu-mcell--wait', !shown);
      cell.setAttribute('aria-pressed', shown ? 'true' : 'false');
      const bar = cell.querySelector('[data-bar]');
      if (bar) bar.style.height = shown ? `${Math.round((MANGO_WTP[i] / WTP_MAX) * 100)}%` : '0%';
      const price = cell.querySelector('[data-price]');
      if (price) price.textContent = shown ? fmtINR(MANGO_WTP[i]) : 'tap';
    }
    if (e.principle) e.principle.hidden = this._shown < PRINCIPLE_REVEALED_AT;
  }

  _paintFold(key) {
    const e = this._els;
    const line = e?.folds?.[key];
    if (!line) return;
    line.textContent = key === 'cal' ? this._foldCalendar()
      : key === 'news' ? this._foldNews()
        : this._foldMango();
  }

  _readings() {
    return STALLS.map((s) => `${s.short} ${this._wordsFor(s.key)[s.levels[this._month]]}`);
  }

  _foldCalendar() {
    return `${MONTHS[this._month].full} \u00b7 ${this._readings().join(', ')}`;
  }

  _foldNews() {
    const n = NEWS.find((x) => x.key === this._news);
    return n ? `${n.chip} \u00b7 ${n.at} of ${COUNTERS} at the counter` : `no news chosen \u00b7 ${ORDINARY_WEEK} of ${COUNTERS} at the counter`;
  }

  _foldMango() {
    if (!this._shown) return 'no mango priced yet';
    return `${this._shown} of ${MANGO_WTP.length} priced \u00b7 ${fmtINR(MANGO_WTP[0])} down to ${fmtINR(MANGO_WTP[this._shown - 1])}`;
  }

  // Exactly one panel is open. The other two are one line each, in calendar order,
  // so the three forces stay on screen for the whole slide.
  _paintPanels(openKey) {
    const e = this._els;
    if (!e) return;
    for (const key of PANEL_OF_BEAT) {
      const panel = e.panels[key];
      if (panel) panel.hidden = key !== openKey;
      const fold = this.root?.querySelector?.(`[data-open="${key}"]`);
      if (fold) fold.hidden = key === openKey;
    }
  }

  // --------------------------------------------------------------------- beat

  // Nothing is reset. Every panel belongs to the learner: beat 2 is the shelf with
  // however many mangoes they had already priced. The only per-beat change is which
  // panel is open and what the note says.
  onStep() {
    const beat = Math.min(PANEL_OF_BEAT.length - 1, Math.max(0, this.stepIndex ?? 0));
    const open = PANEL_OF_BEAT[beat];
    if (beat !== 0) this._stopSweep();
    this._openKey = open;
    this._paintPanels(open);
    this._paintRecord(beat);
    const note = this._els?.note;
    if (note) note.textContent = NOTE_BY_BEAT[beat];
    this._paintHints(open);
  }

  // A hint only names work that is left to do: the calendar has no hint (tapping a
  // month is the panel's whole point), and the other two go quiet once the learner
  // has tried them.
  _paintHints(openKey) {
    for (const key of PANEL_OF_BEAT) {
      const hint = this._els?.hints?.[key];
      if (!hint) continue;
      // The calendar's hint stays up until the year has actually been read across
      // three stall words: beat 0 is a "try it" beat and nothing happens on its own.
      const todo = key === 'mango' ? this._shown < MANGO_WTP.length
        : key === 'news' ? !this._news
          : this._words.size < 3;
      hint.hidden = key !== openKey || !todo;
    }
  }

  // simRecord marks the step with aria-current and emits no data attribute of its
  // own, so the strip is moved by position in the list.
  _paintRecord(beat) {
    const steps = this._els?.record?.querySelectorAll?.('.sim-record__step') ?? [];
    Array.from(steps).forEach((step, i) => {
      if (i === beat) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  // --------------------------------------------------------------------- run

  // The one run in the scene: the year walks past at a third of a second a month
  // and stops. A tap or a beat change ends it early, so it can never outlive the
  // beat that started it.
  _sweep() {
    if (this._sweeping) return;
    this._open('cal');
    this._sweeping = true;
    this._paintCalendar();
    this._sweepStep(0);
  }

  _sweepStep(n) {
    if (!this._sweeping) return;
    if (n >= MONTHS.length) {
      this._sweeping = false;
      this._paintCalendar();
      return;
    }
    this._month = n;
    this._paintCalendar();
    this._paintFold('cal');
    this._words.add(this._wordsFor('books')[STALLS[0].levels[n]]);
    this._paintHints('cal');
    this.startDwellTimer(SWEEP_STEP_MS, () => this._sweepStep(n + 1));
  }

  _stopSweep() {
    if (!this._sweeping) return;
    this._sweeping = false;
    this.clearDwellTimer();
    this._paintCalendar();
  }

  // -------------------------------------------------------------- celebration

  // The rule, not the tap: the calendar has been read across three different stall
  // words, both headlines have been tried, the third mango has dropped its chip.
  _maybeBurst(panel) {
    if (this._broke[panel]) return;
    if (panel === 'cal' && this._words.size < 3) return;
    if (panel === 'news' && this._newsSeen.size < NEWS.length) return;
    this._broke[panel] = true;
    const host = this._els?.panels?.[panel];
    if (host) burst(host);
  }

  destroy() {
    this._sweeping = false;
    this.clearDwellTimer();
    this._els = null;
    super.destroy();
  }
}
