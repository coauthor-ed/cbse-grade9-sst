import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { esc, simTag, simRecord, simArrow } from 'simulations/base/SimUi.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

/**
 * FarmerChoiceScene - the verdict mount of the signpost (blk-l04-s03), and the
 * beat-less setup mount beside the POE prompt (blk-l04-s02, role: "setup").
 *
 * Nothing here is a process. There is no run and no timer: the scene is one
 * signpost, two price tags and a rail of three inputs, and the learner moves the
 * inputs to one crop or the other by tapping a price tag. It rests wherever they
 * leave it.
 *
 * The two mounts are one state machine with two entries. `setup()` paints the
 * signpost with both price tags and an empty plank; the verdict mount then gets
 * `onStep` before `start()`, which is what lights the chickpea arrow and fills
 * the plank. A beat-less mount never gets `onStep`, so it stays exactly where
 * `setup()` left it - the predict state, with the plank empty and the rail tag
 * reading "answer first".
 *
 * Labels only: two crops, two prices, three inputs, one answer, three other
 * markets. Every sentence the learner needs is in the slide's prose.
 */

// One entry per beat of blk-l04-s03 (verified against the slide's STEP split).
const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
];

// Fig 9.6's own labels. It prints no rupee values, so the scene prints none:
// the price is a direction and a movement, which is all the figure gives.
const CROPS = {
  wheat: { name: 'wheat', price: 'low, stayed low', trend: 'down', profit: 'lower profit', tone: 2 },
  chickpeas: { name: 'chickpeas', price: 'high, climbing', trend: 'up', profit: 'higher profit', tone: 3 },
};
const DEARER = 'chickpeas';
const INPUTS = ['land', 'water', 'labour'];
const ANSWER = 'more chickpeas next season';

const CROPS_OF_ROW = ['wheat', 'chickpeas'];

// Beat 2: the slide's three other markets, and the word each one weighs on.
const ROWS = [
  { key: 'trader', who: 'a mango trader', icon: 'shop', a: 'mangoes', b: 'bananas', word: 'prices' },
  { key: 'factory', who: 'a factory', icon: 'factory', a: 'this line', b: 'that line', word: 'profit' },
  { key: 'work', who: "evening's work", icon: 'person', a: 'this job', b: 'that job', word: 'wages' },
];

const NOTE = {
  setup: 'both crops grow in this field - nothing is planted until the question is answered',
  0: 'the farmer is not giving up on wheat - he is answering the market with land',
  1: 'one price never stands alone - the sign weighs both crops at once',
  2: 'the same weighing runs through every market',
};

// ------------------------------------------------------------------ fragments

function podSvg() {
  return `<svg class="fc-pod" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path class="fc-pod__shell" d="M24 7c7.5 0 12.5 6.5 12.5 15S29 41 24 41s-12.5-9.5-12.5-19S16.5 7 24 7z"></path>
    <circle class="fc-pod__bean" cx="24" cy="16" r="4.2"></circle>
    <circle class="fc-pod__bean" cx="24" cy="25.5" r="4.6"></circle>
    <circle class="fc-pod__bean" cx="24" cy="34.5" r="3.9"></circle>
  </svg>`;
}

function cropArt(key) {
  return key === 'wheat' ? iconSvg('grain', CROPS[key].tone) : podSvg();
}

function cropCard(key) {
  const c = CROPS[key];
  return `<button type="button" class="sim-card fc-card fc-card--${key}" data-crop="${key}" aria-pressed="false">
    <span class="fc-card__top">
      <span class="fc-card__art" aria-hidden="true">${cropArt(key)}</span>
      ${simTag(c.name)}
    </span>
    <span class="fc-card__trend fc-card__trend--${c.trend}" aria-hidden="true">${simArrow(c.trend === 'down')}</span>
    <span class="fc-card__price">${esc(c.price)}</span>
    <span class="fc-card__profit">${esc(c.profit)}</span>
  </button>`;
}

function signpost() {
  return `<div class="fc-sign" data-sign role="group" aria-label="A wooden signpost: the farmer's choice on top, plant wheat on the left plank, plant chickpeas on the right plank, and next season's plank below">
    <div class="fc-plank fc-plank--top"><span class="fc-plank__label">farmer's choice</span></div>
    <div class="fc-plank fc-plank--ask">
      <button type="button" class="fc-arrow fc-arrow--${CROPS.wheat.name}" data-crop="wheat" aria-pressed="false">
        <span class="fc-arrow__art" aria-hidden="true">${cropArt('wheat')}</span><span class="fc-arrow__text">plant<br>wheat?</span>
      </button>
      <button type="button" class="fc-arrow fc-arrow--${CROPS.chickpeas.name}" data-crop="chickpeas" aria-pressed="false">
        <span class="fc-arrow__text">plant<br>chickpeas?</span><span class="fc-arrow__art" aria-hidden="true">${cropArt('chickpeas')}</span>
      </button>
    </div>
    <div class="fc-plank fc-plank--answer" data-plank>
      <span class="fc-plank__label" data-plank-label>next season</span>
      <span class="sim-q fc-plank__q" data-plank-q aria-hidden="true">?</span>
    </div>
  </div>`;
}

function compareRows() {
  const rows = ROWS.map((r) => `<button type="button" class="sim-card sim-card--muted fc-row" data-row="${r.key}" aria-pressed="false">
    <span class="fc-row__head">
      <span class="fc-row__art" aria-hidden="true">${iconSvg(r.icon, 5)}</span>
      <span class="fc-row__who">${esc(r.who)}</span>
    </span>
    <span class="fc-row__pair">
      <span class="sim-tag">${esc(r.a)}</span>
      <span class="sim-tag">${esc(r.b)}</span>
    </span>
    <span class="fc-row__slot" data-word-slot>
      <span class="sim-q" aria-hidden="true">?</span>
      <span class="fc-row__word" data-word>${esc(r.word)}</span>
    </span>
  </button>`).join('');
  return `<div class="fc-rows" data-rows hidden role="group" aria-label="Three other markets and what each one weighs">${rows}</div>`;
}

function pivotRail() {
  const chips = INPUTS.map((t) => `<span class="sim-tag fc-input">${esc(t)}</span>`).join('');
  return `<div class="fc-rail" data-rail role="group" aria-label="Land, water and labour, and the crop they go to">
    <div class="fc-rail__track">
      <div class="fc-rail__slot" data-slot>${chips}</div>
    </div>
    <div class="fc-rail__end fc-rail__end--l" data-end="wheat">${simTag(CROPS.wheat.name)}</div>
    <div class="fc-rail__end fc-rail__end--r" data-end="chickpeas">${simTag(CROPS.chickpeas.name)}</div>
  </div>
  <p class="fc-state"><span class="sim-tag" data-state>answer first</span></p>`;
}

function ruleBanner() {
  return `<div class="sim-card sim-card--accent fc-rule" data-rule hidden>
    <span class="fc-rule__art" aria-hidden="true">${iconSvg('scales', 5)}</span>
    <span class="fc-rule__text">supply of one good depends on its alternatives</span>
  </div>`;
}

// --------------------------------------------------------------------- look

const CSS = `
.fc-root { width: 100%; }
.fc-root .sim-record, .sim-dom-root--portrait .fc-root .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* The three columns of Fig 9.6, with the signpost given the middle on the
   strength it needs: the hero is a third of the frame or more. */
.fc-main { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.2fr) minmax(0, 0.95fr);
  gap: var(--sim-space-3); align-items: stretch; }
.sim-dom-root--portrait .fc-main { grid-template-columns: repeat(2, minmax(0, 1fr)); }
/* Portrait stacks: the signpost (or the beat-2 rows) spans the full width first,
   then the two price cards side by side under it. */
.sim-dom-root--portrait .fc-centre { grid-column: 1 / -1; grid-row: 1; }
.sim-dom-root--portrait .fc-card--wheat { grid-column: 1; grid-row: 2; }
.sim-dom-root--portrait .fc-card--chickpeas { grid-column: 2; grid-row: 2; }

/* ---- price cards */
.fc-card { font: inherit; color: inherit; text-align: start; cursor: pointer; gap: var(--sim-space-1); justify-content: center; }
.fc-card:hover { border-color: var(--sim-accent); }
.fc-card__top { display: flex; align-items: center; flex-wrap: wrap; gap: var(--sim-space-2); }
.fc-card__art { display: grid; place-items: center; width: 36px; height: 36px; flex: none; }
.fc-card__art .sim-icon, .fc-card__art .fc-pod { width: 36px; height: 36px; }
.fc-card__price { font-size: var(--sim-text-md); font-weight: 800; color: var(--sim-label); line-height: 1.2; }
.fc-card__profit { align-self: flex-start; padding: 2px var(--sim-space-2); border-radius: var(--sim-radius-pill);
  background: var(--sim-bg-deep); font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); }
.fc-card__trend--down { color: var(--sim-series-6); }
.fc-card__trend--up { color: var(--sim-series-3); }
.fc-card__trend--up .sim-arrow { transform: rotate(-90deg); }
.fc-card.fc-on { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 13%, var(--sim-bg-surface));
  box-shadow: 0 var(--sim-lift) 0 var(--sim-accent); }
.fc-card.fc-on .fc-card__profit { background: var(--sim-accent); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); }
.fc-card.fc-dim { background: var(--sim-bg-deep); box-shadow: none; }
.fc-card.fc-locked { cursor: default; }
.fc-card.fc-locked:hover { border-color: var(--sim-border); }

/* ---- the signpost: a post and three planks. Arrow tips are clip-path
   polygons, so the plank IS the arrow and the label rides inside it. */
.fc-pod__shell { fill: var(--sim-series-3); }
.fc-pod__bean { fill: color-mix(in oklab, var(--sim-series-3) 45%, var(--sim-bg-deep)); }
.fc-sign { position: relative; display: flex; flex-direction: column; align-items: center;
  gap: var(--sim-space-2); padding: 0 0 var(--sim-space-4); }
.fc-sign::before { content: ''; position: absolute; inset: 0 auto 0 50%; transform: translateX(-50%); width: 15px;
  border-radius: 5px 5px 3px 3px; background: color-mix(in oklab, var(--sim-series-8) 62%, var(--sim-bg-deep)); }
.fc-plank { position: relative; display: flex; align-items: center; justify-content: center;
  gap: var(--sim-space-2); width: 100%; min-height: 36px; padding: var(--sim-space-1) var(--sim-space-3);
  background: var(--sim-series-8); color: var(--sim-ink-on-8); font-size: var(--sim-text-md); font-weight: 800; }
.fc-plank--top { border-radius: var(--sim-radius-sm); }
.fc-plank--ask { padding: 0; min-height: 46px;
  clip-path: polygon(0 22%, 8% 22%, 8% 0, 92% 0, 92% 22%, 100% 50%, 92% 78%, 92% 100%, 8% 100%, 8% 78%, 0 50%); }
.fc-arrow { flex: 1; display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
  gap: var(--sim-space-1); min-width: 0; padding: var(--sim-space-1) var(--sim-space-2);
  border: 0; background: transparent; color: inherit; font: inherit; font-weight: 800;
  font-size: var(--sim-text-sm); cursor: pointer; }
.fc-arrow__text { white-space: normal; line-height: 1.15; }
.fc-arrow__art { display: grid; place-items: center; width: 20px; height: 20px; flex: none; }
.fc-arrow__art .sim-icon, .fc-arrow__art .fc-pod { width: 20px; height: 20px; }
.fc-arrow.fc-on { background: color-mix(in oklab, var(--sim-accent) 24%, transparent);
  box-shadow: inset 0 0 0 3px var(--sim-accent); }
.fc-arrow.fc-dim { background: color-mix(in oklab, var(--sim-bg-deep) 30%, transparent); }
.fc-arrow.fc-dim .fc-arrow__art { opacity: .6; }
.fc-plank--answer { border-radius: var(--sim-radius-sm) 0 0 var(--sim-radius-sm);
  clip-path: polygon(0 0, 84% 0, 100% 50%, 84% 100%, 0 100%);
  padding-inline-end: 20%;
  background: color-mix(in oklab, var(--sim-stroke) 26%, var(--sim-bg-deep)); color: var(--sim-label-muted); }
.fc-plank--answer.fc-on { background: var(--sim-good); color: var(--sim-ink-on-good); }
.fc-plank--answer:not(.fc-on) .fc-plank__label { font-weight: 700; }
.fc-plank--on-pop { animation: fc-pop .24s ease both; }
@keyframes fc-pop { from { transform: scale(.94); } to { transform: none; } }

/* ---- the pivot rail: three inputs riding a line between the two crop names */
.fc-rail { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sim-space-1) var(--sim-space-2); align-items: center; }
.fc-rail__track { grid-column: 1 / -1; grid-row: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center; padding: var(--sim-space-2) 0; border-radius: var(--sim-radius-pill);
  background: linear-gradient(color-mix(in oklab, var(--sim-stroke) 62%, transparent), color-mix(in oklab, var(--sim-stroke) 62%, transparent)) center / 100% 7px no-repeat; }
.fc-rail__slot { grid-column: 2; display: flex; flex-wrap: wrap; justify-content: center;
  gap: var(--sim-space-1); transition: transform .28s ease; }
.fc-rail__end { grid-row: 2; justify-self: center; }
.fc-rail__end--l { grid-column: 1; }
.fc-rail__end--r { grid-column: 3; }
.fc-rail__end.fc-on .sim-tag { border-color: var(--sim-accent); background: var(--sim-accent);
  color: var(--sim-ink-on-accent, var(--sim-bg-deep)); }
.fc-state { margin: 0; text-align: center; min-height: 26px; display: flex; justify-content: center; }
.fc-state .sim-tag--accent { animation: fc-pulse 1.7s ease-in-out infinite; }
@keyframes fc-pulse { 0%, 100% { transform: none; } 50% { transform: scale(1.06); } }
@media (prefers-reduced-motion: reduce) { .fc-state .sim-tag--accent { animation: none; } }

/* ---- the rule (beat 1) */
.fc-rule { flex-direction: row; align-items: center; gap: var(--sim-space-2); }
.fc-rule__art { display: grid; place-items: center; width: 30px; height: 30px; flex: none; }
.fc-rule__art .sim-icon { width: 28px; height: 28px; }
.fc-rule__text { font-size: var(--sim-text-md); font-weight: 800; color: var(--sim-label); line-height: 1.25; }

/* ---- every market (beat 2): a full-width row of three, under the hero */
.fc-rows { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sim-space-2); }
.sim-dom-root--portrait .fc-rows { grid-template-columns: minmax(0, 1fr); }
.fc-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "head slot" "pair pair";
  gap: var(--sim-space-1) var(--sim-space-2); align-items: center; font: inherit; color: inherit;
  cursor: pointer; padding: var(--sim-space-2); }
.fc-row:hover { border-color: var(--sim-accent); }
.fc-row__head { grid-area: head; display: flex; align-items: center; gap: var(--sim-space-2); min-width: 0; }
.fc-row__art { display: grid; place-items: center; width: 22px; height: 22px; flex: none; }
.fc-row__art .sim-icon { width: 22px; height: 22px; }
.fc-row__who { font-size: var(--sim-text-sm); font-weight: 800; color: var(--sim-label); }
.fc-row__pair { grid-area: pair; display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
  gap: var(--sim-space-1); }
/* The reveal slot is a fixed 26px cell with the "?" badge and the word stacked in
   it, so reading a row never moves the rail under it. */
.fc-row__slot { grid-area: slot; display: grid; place-items: center; height: 26px; }
/* A button's own colour is the UA's buttontext, which in the light theme is
   invisible on the card: the badge needs its ink named. */
.fc-row__slot .sim-q { color: var(--sim-accent); }
.fc-row__slot > * { grid-area: 1 / 1; }
.fc-row__word { visibility: hidden; font-size: var(--sim-text-sm); font-weight: 800; color: var(--sim-accent); }
.fc-row.fc-on { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface)); }
.fc-row.fc-on .fc-row__word { visibility: visible; }
.fc-row.fc-on .fc-row__slot .sim-q { visibility: hidden; }
`;
// sim-lint-ignore token: --sim-ink-on-* is not a stylesheet token; applyToneInks() sets it on the root at mount.

export class FarmerChoiceScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 545;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 930;
  static FIT = true;
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static ARIA_LABEL = 'A farmer signpost with a wheat arrow priced low and a chickpea arrow priced high; tapping a price moves land, water and labour toward that crop, and the plank below reads more chickpeas next season.';
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    // The verdict opens on the slide's answer; the predict mount (locked) opens
    // on nothing chosen.
    this._lit = DEARER;
    this._seen = new Set([DEARER]);
    this._rows = new Set();
    this._broke = {};
    this._stepped = false;
    this._els = null;
  }

  async setup() {
    await super.setup();
    this.render({
      css: SIM_LOOK_DOM_CSS + CSS,
      rootClass: 'fc-root sl-backdrop',
      html: `<div class="sim-stack fc-root">
        <div data-record>${simRecord(['Verdict', 'The rule', 'Every market'], 0, 'The pivot')}</div>
        ${ruleBanner()}
        <div class="fc-main">
          ${cropCard('wheat')}
          <div class="sim-stack sim-stack--tight fc-centre" data-centre>
            ${signpost()}
          </div>
          ${cropCard('chickpeas')}
        </div>
        ${compareRows()}
        ${pivotRail()}
        ${noteLineHtml([{ text: NOTE.setup }])}
      </div>`,
    });
    const q = (sel) => this.root?.querySelector?.(sel) ?? null;
    this._els = {
      record: q('[data-record]'),
      rule: q('[data-rule]'),
      sign: q('[data-sign]'),
      rows: q('[data-rows]'),
      slot: q('[data-slot]'),
      state: q('[data-state]'),
      plank: q('[data-plank]'),
      plankLabel: q('[data-plank-label]'),
      plankQ: q('[data-plank-q]'),
      note: q('.sl-note-line'),
      cards: {
        wheat: q('[data-crop="wheat"].fc-card'),
        chickpeas: q('[data-crop="chickpeas"].fc-card'),
      },
      arrows: {
        wheat: q('.fc-arrow[data-crop="wheat"]'),
        chickpeas: q('.fc-arrow[data-crop="chickpeas"]'),
      },
      ends: {
        wheat: q('[data-end="wheat"]'),
        chickpeas: q('[data-end="chickpeas"]'),
      },
      rowEls: Array.from(this.root?.querySelectorAll?.('[data-row]') ?? []),
    };
    applyToneInks(this.root);
    this.root?.addEventListener?.('click', (ev) => {
      const crop = ev.target?.closest?.('[data-crop]');
      if (crop) { this._light(crop.dataset.crop); return; }
      const row = ev.target?.closest?.('[data-row]');
      if (row) this._revealRow(row.dataset.row);
    });
    this._paint();
  }

  // ----------------------------------------------------------------- the beat

  // A beat-less setup mount never reaches this, which is the whole reason the
  // two mounts can share one file. `config.role` says the same thing if the host
  // passes it, so both signals are honoured.
  onStep() {
    this._stepped = true;
    const beat = Math.min(2, Math.max(0, this.stepIndex ?? 0));
    const e = this._els;
    if (e?.rule) e.rule.hidden = beat !== 1;
    if (e?.rows) e.rows.hidden = beat !== 2;
    if (beat !== 2) this._rows.clear();
    if (e?.note) e.note.textContent = NOTE[beat];
    this._paintRecord(beat);
    this._paint();
    this._maybeBurst(beat);
  }

  // Nothing is reset: the lit crop and the tags the learner has already tried are
  // theirs, and they carry from beat to beat. Only beat 2's reveals are its own.
  refreshTheme() {
    applyToneInks(this.root);
    this._paint();
  }

  destroy() {
    this._els = null;
    super.destroy();
  }

  // ----------------------------------------------------------------- learning

  _light(key) {
    if (this._locked() || !CROPS[key]) return;
    this._lit = key;
    this._seen.add(key);
    this.animateFor?.(600);
    this._paint();
    this._maybeBurst(Math.min(2, Math.max(0, this.stepIndex ?? 0)));
  }

  _revealRow(key) {
    if (!ROWS.some((r) => r.key === key)) return;
    this._rows.has(key) ? this._rows.delete(key) : this._rows.add(key);
    this.animateFor?.(400);
    this._paint();
    const beat = Math.min(2, Math.max(0, this.stepIndex ?? 0));
    if (beat === 2 && this._rows.size === ROWS.length) this._maybeBurst(beat);
  }

  // The predict mount beside the prompt: the sign is there to be read, not
  // touched. config.role is the host's word for it; a mount that never stepped is
  // the same state.
  _locked() {
    return !this._stepped || this.config?.role === 'setup';
  }

  // -------------------------------------------------------------------- paint

  _paint() {
    const e = this._els;
    if (!e) return;
    const locked = this._locked();
    const beat = Math.min(2, Math.max(0, this.stepIndex ?? 0));

    if (e.record) e.record.hidden = locked;
    for (const key of CROPS_OF_ROW) {
      const on = !locked && this._lit === key;
      const dim = !locked && !!this._lit && this._lit !== key;
      for (const el of [e.cards[key], e.arrows[key]]) {
        if (!el) continue;
        el.classList.toggle('fc-on', on);
        el.classList.toggle('fc-dim', dim);
        el.classList.toggle('fc-locked', locked);
        if (locked) el.disabled = true; else el.disabled = false;
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      e.ends[key]?.classList.toggle('fc-on', on);
    }

    // The three inputs ride one measured cell: no pixel travel is typed anywhere.
    const dir = locked || !this._lit ? 0 : (this._lit === 'wheat' ? -1 : 1);
    if (e.slot) {
      e.slot.style.transform = `translateX(${locked || !this._lit ? 0 : dir * 100}%)`;
      e.slot.classList.toggle('fc-slot--locked', locked);
    }

    // The plank answers only for the dearer side. It never reads "more wheat":
    // the wheat tag says lower profit, and the scene must not write a decision
    // its own labels contradict.
    const answered = !locked && this._lit === DEARER;
    e.plank?.classList.toggle('fc-on', answered);
    if (e.plankLabel) e.plankLabel.textContent = answered ? ANSWER : 'next season';
    if (e.plankQ) e.plankQ.hidden = answered;
    if (e.plank) {
      e.plank.classList.remove('fc-plank--on-pop');
      if (answered) { void e.plank.offsetWidth; e.plank.classList.add('fc-plank--on-pop'); }
    }

    for (const row of e.rowEls) {
      const on = this._rows.has(row.dataset.row);
      row.classList.toggle('fc-on', on);
      row.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    this._paintState(locked, answered);
    void beat;
  }

  // One chip carries the state of the whole rail, so the rail never needs a
  // second line: what the learner has to do, or what their tap just showed.
  _paintState(locked, answered) {
    const tag = this._els?.state;
    if (!tag) return;
    let text = 'answer first';
    let accent = false;
    if (!locked) {
      if (!this._lit) { text = 'tap a price tag'; accent = true; }
      else if (answered) {
        text = this._seen.size >= 2 ? 'both prices weighed' : 'more per field';
        accent = this._seen.size >= 2;
      } else { text = 'less per field'; }
    }
    if (tag.textContent !== text) tag.textContent = text;
    tag.classList.toggle('sim-tag--accent', accent);
  }

  // simRecord emits no data attribute of its own, so the strip is moved by
  // position in the list.
  _paintRecord(beat) {
    const steps = this._els?.record?.querySelectorAll?.('.sim-record__step') ?? [];
    Array.from(steps).forEach((step, i) => {
      if (i === beat) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  // -------------------------------------------------------------- celebration

  // The concept, not the tap: both prices have been weighed and the dearer side
  // is the one lit - or, on beat 2, all three other markets have been read.
  _maybeBurst(beat) {
    const e = this._els;
    if (!e || this._locked() || this._broke[beat]) return;
    const ready = beat === 2 ? this._rows.size === ROWS.length : (this._lit === DEARER && this._seen.size >= 2);
    if (!ready) return;
    this._broke[beat] = true;
    // The plank is clip-path'd into an arrow and the signpost is a small box:
    // confetti in either is clipped away with it, so the burst goes on the scene
    // root, which is the only box here big enough to show it.
    burst(beat === 2 ? e.rows : this.root);
  }
}