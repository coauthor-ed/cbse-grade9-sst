import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { esc, simRecord } from 'simulations/base/SimUi.js';

/**
 * PriceCeilingFloorScene - one medicine shelf under a legal price rule (blk-l06-s03, 3 beats).
 *
 * The slide's one claim: a ceiling set BELOW the market price raises what buyers want and cuts
 * what sellers offer, so the balance falls apart into a shortage - and a floor set above it
 * does the opposite. So this scene holds one shelf and one pair of quantities and moves
 * exactly one thing as the beats go by: the legal price.
 *
 * Two mounts, one file: blk-l06-s02 mounts it with `role: "setup"` and no beats, so it
 * arrives as count 0 and never receives a beat. On that mount there is no quantity, no gap and
 * no floor - the shelf with its stock, the two prices the prompt names, and a dashed "?" where
 * the answer would be.
 *
 * Labels only. The courses on the two bars are the model's numbers; the boxes on the shelf and
 * the figures wanting the medicine are the picture, and the foot line says what one of each is
 * worth.
 */

// Model numbers (design note "Model numbers"): the slide's own prices, and this scene's
// quantities - one month of one medicine, straight lines of 6 courses per 100 rupees.
const P_MARKET = 3000;
const P_CAP = 2500;
const P_FLOOR = 3500;
const STEP = 100;
const COURSES_PER_100 = 6;
const Q_AT_MARKET = 60; // wanted = offered at the market price: the balance the rule starts from
const SCALE_MAX = 100; // courses on the one shared bar scale
const PER_BOX = 6; // one shelf box = one figure = this many courses (every quantity divides by it)
const MAX_BOXES = 90 / PER_BOX; // 15 boxes on a full shelf at the cap
const MAX_FIGURES = 90 / PER_BOX; // 15 figures wanting it

// The three prices on the rail, left to right: the cap under the market price, the market
// price, and the floor mirrored above it.
const PRICE_CELLS = [
  { key: 'cap', price: P_CAP, label: 'cap' },
  { key: 'market', price: P_MARKET, label: 'market price' },
  { key: 'floor', price: P_FLOOR, label: 'floor' },
];

const RECORD_STEPS = ['before the rule', 'the rule bites', 'the mirror'];

// A beat IS its own rule and its own price: beat 0 is the cap stamped on the rail with the
// quantities still at the market price (nothing has bitten yet), beat 1 is the cap biting, and
// beat 2 holds that shortage while the learner may take the rule over to the floor.
const BEAT_RULE = ['cap', 'cap', 'cap'];
const BEAT_PRICE = [P_MARKET, P_CAP, P_CAP];

const wanted = (p) => Q_AT_MARKET + ((P_MARKET - p) / STEP) * COURSES_PER_100;
const offered = (p) => Q_AT_MARKET - ((P_MARKET - p) / STEP) * COURSES_PER_100;

/** One price's whole story: the two quantities, the gap between them and what to call it. */
function state(p) {
  const want = wanted(p);
  const offer = offered(p);
  return {
    price: p,
    want,
    offer,
    gap: Math.abs(want - offer),
    kind: want > offer ? 'shortage' : offer > want ? 'surplus' : 'no gap',
  };
}

const pct = (n) => `${((n / SCALE_MAX) * 100).toFixed(2)}%`;

/** The rupee sign is drawn: the scene font has no U+20B9 on many systems, so a text rupee is a
 *  tofu box. Same drawn glyph as the L05 market table, so every price here reads the same. */
function rupeeSvg() {
  return '<svg class="pcf-rs" viewBox="0 0 14 14" width="17" height="17" aria-hidden="true" focusable="false">'
    + '<path d="M2.3 3.1h9.4M2.3 5.8h9.4M3.7 3.1v8.1M3.7 3.1h3.7a2.4 2.4 0 0 1 0 4.8H3.7M7.3 7.9l4.7 3.3" '
    + 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

const money = (p) => `${rupeeSvg()}<span class="pcf-digits">${p.toLocaleString('en-IN')}</span>`;

/** One price cell on the rail. The floor cell is a dashed unknown until the mirror beat. */
function priceCell(cell) {
  return `<div class="pcf-cell pcf-cell--${cell.key}" data-cell="${cell.key}">
    <span class="sim-tag pcf-cell__kind"></span>
    <span class="pcf-cell__price pcf-cell__num">${money(cell.price)}</span>
    <span class="pcf-cell__q sim-field sim-field--missing pcf-cell__unknown"><span class="sim-q">?</span>what a floor would do</span>
  </div>`;
}

/** The shelf: a recess with the boxes of stock standing on the plank. Fifteen slots, revealed
 *  by count, so a box already on the shelf never blinks when the legal price moves. */
function shelfSvg() {
  const x0 = 16;
  const w = 33;
  const gap = 6;
  const h = 40;
  const top = 34;
  const plankY = top + h;
  const boxes = Array.from({ length: MAX_BOXES }, (_, i) =>
    `<g class="pcf-box" style="--i:${i}">
      <rect x="${x0 + i * (w + gap)}" y="${top}" width="${w}" height="${h}" rx="4"/>
      <rect class="pcf-box__band" x="${x0 + i * (w + gap) + 5}" y="${top + 12}" width="${w - 10}" height="10" rx="2"/>
    </g>`).join('');
  return `<svg class="pcf-shelf" viewBox="0 0 616 102" role="img"
      aria-label="A shelf of medicine boxes: one box stands for six courses of the medicine.">
    <rect class="pcf-shelf__back" x="6" y="8" width="604" height="${plankY - 8}" rx="8"/>
    <rect class="pcf-shelf__lip" x="6" y="${plankY - 4}" width="604" height="4" rx="2"/>
    <g class="pcf-boxes">${boxes}</g>
    <rect class="pcf-plank" x="6" y="${plankY}" width="604" height="12" rx="3"/>
  </svg>`;
}

const FIGURES = Array.from({ length: MAX_FIGURES }, () =>
  `<span class="pcf-fig">${iconSvg('person', 1)}</span>`).join('');

/** One balance row: the label, a bar on the one shared scale, and the number of courses. */
function balanceRow(key, name, who) {
  return `<div class="pcf-row pcf-row--${key}">
    <span class="pcf-row__lab"><span class="pcf-row__name">${esc(name)}</span><span class="pcf-row__who">${esc(who)}</span></span>
    <span class="pcf-track"><span class="pcf-fill pcf-fill--${key}"></span></span>
    <span class="pcf-row__n"><span class="pcf-row__count"></span><span class="pcf-row__unit">courses</span></span>
  </div>`;
}

// One reveal rule per count, so a box (or a figure) already showing is never re-animated - only
// the one that arrived appears.
const REVEAL = (attr, max) => Array.from({ length: max + 1 }, (_, n) =>
  `.sim-ui[data-${attr}="${n}"] .pcf-${attr === 'boxes' ? 'box' : 'fig'}:nth-child(-n+${n})`).join(',\n');

const CSS = SIM_LOOK_DOM_CSS + `
.pcf-stack { gap: var(--sim-space-2); }
.pcf-head { align-items: center; gap: var(--sim-space-2); justify-content: space-between; }
.pcf-record { flex: 0 1 auto; }
.pcf-record .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* the price rail: three cells, the middle one the market price both sides are read against */
.pcf-rail { padding: var(--sim-space-2); }
.pcf-cells { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sim-space-2); }
.pcf-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px 6px 8px;
  border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-md); background: var(--sim-bg-deep); }
.pcf-cell.is-legal { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 20%, var(--sim-bg-deep)); }
.pcf-cell--market { border-style: dashed; }
.pcf-cell.is-legal.pcf-cell--market { border-style: solid; }
.pcf-cell__kind { max-width: 100%; text-align: center; }
.pcf-cell__price { display: inline-flex; align-items: baseline; gap: 3px; font: 800 var(--sim-text-xl)/1.1 var(--sim-font);
  font-variant-numeric: tabular-nums; color: var(--sim-label); }
.pcf-cell__unknown { display: none; align-items: center; gap: 5px; max-width: 100%; text-align: center;
  font-size: var(--sim-text-sm); }
.pcf-cell--floor.is-unknown .pcf-cell__unknown { display: inline-flex; }
.pcf-cell--floor.is-unknown .pcf-cell__kind, .pcf-cell--floor.is-unknown .pcf-cell__num { display: none; }
.pcf-rs { flex: none; align-self: center; color: var(--sim-label); }

/* the two quantities and the gap between them, on one shared scale */
.pcf-balance { padding: var(--sim-space-2) var(--sim-space-3); display: flex; flex-direction: column; gap: 6px; }
.pcf-row { display: grid; grid-template-columns: 128px minmax(0, 1fr) 112px; align-items: center; gap: var(--sim-space-2); }
.pcf-row__lab { display: flex; flex-direction: column; }
.pcf-row__name { font: 700 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); }
.pcf-row__who { font-size: var(--sim-text-sm); line-height: 1.2; color: var(--sim-label-muted); }
.pcf-track { position: relative; height: 20px; border-radius: var(--sim-radius-pill); background: var(--sim-track); overflow: hidden; }
.pcf-fill { position: absolute; top: 0; bottom: 0; left: 0; width: var(--k, 0%);
  border-radius: var(--sim-radius-pill); transition: width 350ms cubic-bezier(0.2, 0.8, 0.3, 1); }
.pcf-fill--want { background: var(--sim-series-1); }
.pcf-fill--offer { background: var(--sim-series-8); }
.pcf-row__n { display: flex; flex-direction: column; align-items: flex-end; }
.pcf-row__count { font: 800 var(--sim-text-lg)/1.1 var(--sim-font); font-variant-numeric: tabular-nums; color: var(--sim-label); }
.pcf-row__unit { font-size: var(--sim-text-sm); line-height: 1.1; color: var(--sim-label-muted); }
.pcf-gaprow { border-top: 1px solid color-mix(in oklab, var(--sim-stroke) 45%, transparent); padding-top: 6px; }
.pcf-gap { position: absolute; top: 0; bottom: 0; left: var(--g0, 0%); width: var(--g1, 0%);
  background: var(--sim-warning); border-radius: var(--sim-radius-sm);
  transition: left 350ms cubic-bezier(0.2, 0.8, 0.3, 1), width 350ms cubic-bezier(0.2, 0.8, 0.3, 1); }
.pcf-gaprail.is-none { background: transparent; border: 2px dashed var(--sim-stroke); }
.pcf-gapword { font: 800 var(--sim-text-md)/1.15 var(--sim-font); color: var(--sim-warning); text-align: right; }
.pcf-gapword.is-none { color: var(--sim-label-muted); font-weight: 700; }

/* the shelf, and the figures who want what is on it */
.pcf-stock { padding: var(--sim-space-2) var(--sim-space-3); }
/* The card is a flex column, so a tag child stretches to the full card width and reads as a bar,
   not a pill: align-self is what makes it shrink-wrap (display is blockified on a flex item). */
.pcf-shelf__label { align-self: flex-start; margin-bottom: 4px; }
.pcf-now { align-self: center; gap: 5px; font-variant-numeric: tabular-nums; }
.pcf-now .pcf-rs { color: inherit; }
.pcf-shelf { display: block; width: 100%; height: auto; }
.pcf-shelf__back { fill: color-mix(in oklab, var(--sim-bg-deep) 55%, var(--sim-bg-surface)); }
.pcf-shelf__lip { fill: color-mix(in oklab, var(--sim-bg-deep) 30%, var(--sim-bg-surface)); }
.pcf-plank { fill: var(--sim-strata-2); stroke: var(--sim-strata-3); stroke-width: 2; }

.pcf-box { opacity: 0; transform: translateY(12px); transition: opacity .3s ease, transform .35s ease; }
${REVEAL('boxes', MAX_BOXES)} { opacity: 1; transform: translateY(0); }
.pcf-box rect { fill: var(--sim-series-8); stroke: color-mix(in oklab, var(--sim-series-8) 62%, black); stroke-width: 2; }
.pcf-box .pcf-box__band { fill: var(--sim-bg-surface); stroke: none; }
.pcf-people { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 6px;
  border-top: 2px solid var(--sim-strata-2); margin-top: 6px; padding-top: 6px; }
.pcf-fig { opacity: 0; transform: translateY(10px); transition: opacity .3s ease, transform .35s ease; }
${REVEAL('figs', MAX_FIGURES)} { opacity: 1; transform: translateY(0); }
.pcf-fig .sim-icon { display: block; width: 28px; height: 28px; color: var(--sim-series-1); }
.pcf-ask { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }
.pcf-ask .sim-title { font-size: var(--sim-text-lg); margin: 0; flex: 1 1 220px; }
.pcf-hint { animation: pcf-pulse 1.8s ease-in-out infinite; }
@keyframes pcf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }

/* portrait: three price cells and a three-column row do not survive 380px, so the rail stacks
   and the balance rows put the label above its own bar. */
.sim-dom-root--portrait .pcf-cells { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .pcf-row { grid-template-columns: minmax(0, 1fr) 112px; }
.sim-dom-root--portrait .pcf-row__lab { grid-column: 1 / -1; flex-direction: row; align-items: baseline; gap: 6px; }
.sim-dom-root--portrait .pcf-fig .sim-icon { width: 24px; height: 24px; }
`;

export class PriceCeilingFloorScene extends DomSimulation {
  static WIDTH = 640;
  static HEIGHT = 710; // sim-layout: the tallest interaction state is 710px
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 1031; // sim-layout: the tallest portrait state is 1031px
  static FIT = true;
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }], // the cap lands: both sides still at the market price
    [{ idx: 1, dwellMs: null }], // the cap bites: wanted up, offered down, the gap between them
    [{ idx: 2, dwellMs: null }], // the mirror: the floor appears and the learner sets it
  ];
  static ARIA_LABEL = 'One shelf of medicine under a legal price rule. A price rail shows a cap of 2,500 rupees, the market price of 3,000 and, later, a floor of 3,500. Two bars on one scale show how many courses buyers want and how many sellers offer, and a band between them is the shortage or the surplus. On the last beat the learner can switch the rule to a floor and move the legal price themselves.';
  static CONTROLS = [
    {
      type: 'segmented', id: 'rule', label: 'Legal price rule',
      options: [
        { value: 'cap', label: 'ceiling 2,500' },
        { value: 'floor', label: 'floor 3,500' },
      ],
      value: 'cap',
    },
    {
      type: 'slider', id: 'legal', label: 'Legal price, rupees a course',
      min: P_CAP, max: P_FLOOR, step: STEP, value: P_CAP,
    },
  ];

  async setup() {
    await super.setup();
    this.mount = 'verdict';
    this.beat = 0;
    this.stepIndex = 0;
    this.rule = 'cap';
    this.price = P_CAP;
    this._celebrated = false;
    this._touched = false;
    this.render({
      css: CSS,
      html: `<div class="sim-stack pcf-stack">
        <div class="sim-row pcf-head">
          <span class="sim-tag sim-tag--accent">one medicine course</span>
          <span class="sim-tag pcf-now" hidden></span>
          <span class="sim-tag pcf-hint" hidden>set the floor yourself</span>
          <span class="pcf-record"></span>
        </div>

        <div class="sim-card sim-card--accent pcf-rail">
          <div class="pcf-cells">${PRICE_CELLS.map(priceCell).join('')}</div>
        </div>

        <article class="sim-card sim-card--accent pcf-ask-card" hidden>
          <div class="pcf-ask"><span class="sim-q">?</span><h2 class="sim-title">Once the legal price falls to 2,500, what happens to the stock on the shelves?</h2></div>
        </article>

        <div class="sim-card pcf-balance">
          ${balanceRow('want', 'wanted', 'by buyers')}
          ${balanceRow('offer', 'offered', 'by sellers')}
          <div class="pcf-row pcf-gaprow">
            <span class="pcf-row__lab"><span class="pcf-row__name">the gap</span></span>
            <span class="pcf-track pcf-gaprail"><span class="pcf-gap"></span></span>
            <span class="pcf-gapword"></span>
          </div>
        </div>

        <div class="sim-card pcf-stock">
          <span class="sim-tag pcf-shelf__label">stock on the shelf</span>
          ${shelfSvg()}
          <div class="pcf-people">
            <span class="sim-tag pcf-people__label">families wanting it</span>
            ${FIGURES}
          </div>
        </div>

        <p class="sim-meta">One month of one course - one box and one figure stand for 6 courses, and both bars share one scale of 100 courses</p>
        ${noteLineHtml([
          { text: 'The cap did not make the medicine cheaper to produce - it only moved the legal price' },
          { text: 'Straight lines, 6 courses per 100 rupees: nothing but the price moves here' },
        ])}
      </div>`,
    });
    applyToneInks(this.root);
    const q = (sel) => this.root.querySelector(sel);
    this._els = {
      record: q('.pcf-record'),
      now: q('.pcf-now'),
      hint: q('.pcf-hint'),
      ask: q('.pcf-ask-card'),
      balance: q('.pcf-balance'),
      people: q('.pcf-people'),
      peopleLabel: q('.pcf-people__label'),
      fillWant: q('.pcf-fill--want'),
      fillOffer: q('.pcf-fill--offer'),
      wantN: q('.pcf-row--want .pcf-row__count'),
      offerN: q('.pcf-row--offer .pcf-row__count'),
      gapRail: q('.pcf-gaprail'),
      gap: q('.pcf-gap'),
      gapWord: q('.pcf-gapword'),
      floorCell: q('[data-cell="floor"]'),
      capCell: q('[data-cell="cap"]'),
    };
    this._els.cells = PRICE_CELLS.map((c) => ({
      key: c.key,
      el: q(`[data-cell="${c.key}"]`),
      kind: q(`[data-cell="${c.key}"] .pcf-cell__kind`),
    }));
    this._paint();
  }

  // -- the two mounts ------------------------------------------------------------

  // The host hands over a beat count and never the slide, so the count IS the mount: the setup
  // mount never receives a beat. Written out (not the declarative clamp), because the clamp
  // reads only BEAT_STEP_MAP and the setup mount has no entry.
  onBeatChange(beatIndex, beatCount) {
    const prev = this.mount;
    this.mount = Number(beatCount) === 0 || this.config?.role === 'setup' ? 'setup' : 'verdict';
    if (prev !== this.mount) this._celebrated = false;
    // The hint belongs to the mirror beat's own turn, so it comes back on each arrival at it;
    // the celebration does not (once found, found).
    this._touched = false;
    const n = Number.isFinite(Number(beatIndex)) ? Math.trunc(Number(beatIndex)) : 0;
    this.beat = this.mount === 'setup' ? 0 : Math.max(0, Math.min(n, BEAT_RULE.length - 1));
    this.stepIndex = this.beat;
    this.rule = BEAT_RULE[this.beat];
    this.price = this.mount === 'setup' ? P_MARKET : BEAT_PRICE[this.beat];
    if (this.root) this.root.dataset.step = String(this.beat);
    if (this._els?.record) {
      this._els.record.innerHTML = this.mount === 'setup'
        ? ''
        : simRecord(RECORD_STEPS, this.beat, 'The rule');
    }
    this._paint();
    this.requestUiUpdate?.();
  }

  // Nothing to operate before the mirror beat: those beats are the slide's own reveal, and on
  // the setup mount the prompt beside the panel is the thing to answer.
  isControlHidden(id) {
    return (id === 'rule' || id === 'legal') && (this.mount === 'setup' || this.beat < BEAT_RULE.length - 1);
  }

  isControlDisabled(id) {
    return this.mount === 'setup' || this.beat < BEAT_RULE.length - 1;
  }

  onControlChange(id, v) {
    if (this.isControlHidden(id) || this.isControlDisabled(id)) return;
    if (id === 'rule') {
      this.rule = v === 'floor' ? 'floor' : 'cap';
      this.price = this.rule === 'cap' ? P_CAP : P_FLOOR;
      this._touched = true;
      this._paint();
      this._maybeCelebrate();
      this.requestUiUpdate?.();
      return;
    }
    if (id !== 'legal') return;
    // The slider's own ends swap with the rule, so each side only reaches its own half of the
    // rail: a ceiling is read against the market price from below, a floor from above.
    const [lo, hi] = this.rule === 'cap' ? [P_CAP, P_MARKET] : [P_MARKET, P_FLOOR];
    const steps = Math.round((Number(v) - lo) / STEP);
    if (!Number.isFinite(steps)) return;
    this.price = Math.min(hi, Math.max(lo, lo + steps * STEP));
    this._touched = true;
    this._paint();
    this._maybeCelebrate();
    this.requestUiUpdate?.();
  }

  // The concept, not the press: the learner has set the floor themselves and read the gap flip
  // over to a surplus - whether they got there by flipping the rule or by walking the slider.
  _maybeCelebrate() {
    if (this._celebrated || state(this.price).kind !== 'surplus') return;
    this._celebrated = true;
    burst(this._els?.balance, 30);
  }

  // The host draws each control at this value, so the rail and the control bar can never
  // disagree (and the slider's label follows the rule in force).
  getControlValue(id) {
    if (id === 'rule') return this.rule;
    if (id === 'legal') return String(this.price);
    return undefined;
  }

  refreshTheme() {
    super.refreshTheme();
    applyToneInks(this.root);
  }

  destroy() {
    this._els = null;
    super.destroy();
  }

  // -- the paint -----------------------------------------------------------------

  _paint() {
    const e = this._els;
    if (!e) return;
    const setup = this.mount === 'setup';
    const mirror = !setup && this.beat >= BEAT_RULE.length - 1;
    const s = state(this.price);
    const root = this.root;

    // The setup mount is the predict: stock and the two prices the prompt names, and a dashed
    // "?" where the answer would be. No quantity, no gap, no floor.
    if (e.ask) e.ask.hidden = !setup;
    // The hint pulses only on the beat the learner can act on, and goes once they have.
    if (e.hint) e.hint.hidden = !(mirror && !this._touched);
    // The rail cells name three fixed prices; the moment the learner drives the rule themselves
    // the price in force is none of them, so it takes the hint's own slot in the head row.
    if (e.now) {
      e.now.hidden = !(mirror && this._touched);
      if (!e.now.hidden) e.now.innerHTML = `<span class="pcf-now__lab">legal price</span>${money(this.price)}`;
    }
    if (e.balance) e.balance.hidden = setup;
    if (e.people) e.people.hidden = setup;
    if (e.peopleLabel) e.peopleLabel.hidden = setup;

    const boxes = Math.round(s.offer / PER_BOX);
    const figs = Math.round(s.want / PER_BOX);
    if (root.dataset.boxes !== String(boxes)) root.dataset.boxes = String(boxes);
    if (root.dataset.figs !== String(figs)) root.dataset.figs = String(figs);

    // The price rail: the cell the rule in force sits in is the legal one, and once the learner has
    // the rule themselves a cell only claims the word "legal" while the price in force is still the
    // price printed on it (before that, the beat's own rule stands and the cap is stamped where the
    // slide stamps it); the floor cell stays a dashed unknown until the mirror beat fills it.
    const at = (c) => c.price === this.price || !this._touched;
    for (const c of e.cells) {
      const legal = c.key === this.rule && !(c.key === 'floor' && !mirror);
      c.el?.classList?.toggle('is-legal', legal);
      if (c.key === 'floor') {
        const unknown = !mirror;
        c.el?.classList?.toggle('is-unknown', unknown);
        if (c.el) c.el.hidden = setup;
        if (c.kind) c.kind.textContent = unknown ? '' : legal && at(c) ? 'legal floor' : 'floor';
      } else if (c.kind) {
        c.kind.textContent = legal && at(c) ? `legal ${c.key}` : c.key === 'cap' ? 'cap' : 'market price';
      }
    }

    e.fillWant?.style?.setProperty?.('--k', pct(s.want));
    e.fillOffer?.style?.setProperty?.('--k', pct(s.offer));
    if (e.wantN) e.wantN.textContent = String(s.want);
    if (e.offerN) e.offerN.textContent = String(s.offer);

    // The gap band spans the stretch neither bar covers: from the shorter bar's end to the
    // longer one's, on the same scale the bars use.
    const lo = Math.min(s.want, s.offer);
    if (s.gap > 0) {
      e.gapRail?.classList?.remove('is-none');
      e.gap?.style?.setProperty?.('--g0', pct(lo));
      e.gap?.style?.setProperty?.('--g1', pct(s.gap));
      if (e.gapWord) {
        e.gapWord.textContent = `${s.kind} ${s.gap}`;
        e.gapWord.classList.remove('is-none');
      }
    } else {
      e.gapRail?.classList?.add('is-none');
      e.gap?.style?.setProperty?.('--g0', '0%');
      e.gap?.style?.setProperty?.('--g1', '0%');
      if (e.gapWord) {
        e.gapWord.textContent = 'no gap';
        e.gapWord.classList.add('is-none');
      }
    }
  }
}