/**
 * InterventionCostsScene - blk-l06-s06, "The Price Tag on the Referee".
 *
 * The slide's claim - intervention buys fairness with a cost of its own - as three cost cards in a
 * row, one per step of the slide. Each card is a drawing plus a row of pills the learner operates,
 * so the three currencies are on screen together and each one bites under the learner's hand:
 *
 *   beat 0  a fixed price below the farmer's real cost  -> the crop thins next season
 *   beat 1  four clearances before the door opens       -> six months, then the small ones quit
 *   beat 2  a cap that eats the whole margin            -> no better seeds, irrigation or cold store
 *
 * Both price cards read the SAME ladder (Rs 30 / Rs 34 / Rs 40) because the slide's two price costs
 * are one mechanism twice: a price that lands below the cost takes the crop first, a price that
 * caps the return takes the investment. Everything on screen is arithmetic a learner can check by
 * hand (see the design note's Model numbers).
 *
 * What this file will not do, all from the stub:
 *   - it names no fix, and no regulator, monopoly, public good or ceiling/floor arithmetic.
 *   - it never draws a curve, a quantity in kg, or a demand/supply comparison.
 *   - it does not autoplay: each beat opens at its own non-harmful state and the dial is the beat.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { simRecord } from 'simulations/base/SimUi.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const RUPEE = '\u20b9';
const NOTE = 'every intervention buys fairness with one of these three currencies';

const BEAT_LABEL = ['Distorted prices', 'Paperwork', 'Stalled investment'];
const BEAT_TITLE = ['Cost one: distorted prices', 'Cost two: paperwork', 'Cost three: stalled investment'];

/* ------------------------------------------------------------------ the model */

// The farmer's real cost per kilogram, and the market's own price for one [derived; the market
// figure is the chapter's lowest price row].
const COST = 34;
const MARKET = 40;

// One ladder, read the same way on both price cards: below the cost, at the cost, at the market.
const STOPS = [30, 34, 40];
const STOPS_OPEN = MARKET;                 // what a card opens at before the learner touches it

// The four clearances a small restaurant needs, with the months each one adds. `short` is what fits
// a pill inside a third of 680 px; the full name rides on the button's aria-label.
const CLEARANCES = [
  { key: 'food', label: 'food safety', short: 'food safety', months: 1 },
  { key: 'fire', label: 'fire safety', short: 'fire safety', months: 1 },
  { key: 'pollution', label: 'pollution clearance', short: 'pollution', months: 2 },
  { key: 'licence', label: 'local licence', short: 'licence', months: 2 },
];
const MONTHS_ALL = CLEARANCES.reduce((n, c) => n + c.months, 0);
const KITCHENS = 3;                        // small kitchens in the lane before the clearance bites

// What a grower would put back in the field if the margin were there.
const INVEST = [
  { key: 'seeds', label: 'better seeds', icon: 'grain' },
  { key: 'irrigation', label: 'irrigation', icon: 'rain' },
  { key: 'cold', label: 'cold storage', icon: 'truck' },
];

// The crop: how many rows are sown under a price that covers the cost, and how many under one that
// does not [derived; the slide says only "plant less the next year"].
const ROWS_FULL = 6;
const ROWS_THIN = 2;

const marginOf = (cap) => Math.min(cap, MARKET) - COST;
const money = (v) => `${RUPEE}${v}`;
// Where a price sits on the rail: the view box runs Rs 24 to Rs 44 across x 8..182.
const railX = (p) => 8 + ((p - 24) * 174) / 20;
const rowX = (i) => 16 + i * 31.6;
const packetW = (margin) => 66 + (margin + 4) * 10;

/* ------------------------------------------------------------------ the drawings */

function fieldSvg() {
  const rows = Array.from({ length: ROWS_FULL }, (_, i) => `
      <g class="ic-row" data-row="${i}" transform="translate(${rowX(i).toFixed(1)} 0)">
        <line class="ic-row__stem" x1="0" y1="92" x2="0" y2="66"/>
        <ellipse class="ic-row__leaf" cx="-8" cy="76" rx="8" ry="4" transform="rotate(-26 -8 76)"/>
        <ellipse class="ic-row__leaf" cx="8" cy="68" rx="8" ry="4" transform="rotate(26 8 68)"/>
      </g>`).join('');
  return `<svg class="ic-art" viewBox="0 0 190 100" role="img"
      aria-label="A price rail marked at the farmer's cost and at the market price, above a field of six crop rows">
      <line class="ic-rail__line" x1="8" y1="10" x2="182" y2="10"/>
      <line class="ic-rail__tick" x1="${railX(COST).toFixed(1)}" y1="4" x2="${railX(COST).toFixed(1)}" y2="16"/>
      <text class="ic-rail__label" x="${railX(COST).toFixed(1)}" y="34" text-anchor="middle">cost</text>
      <line class="ic-rail__tick" x1="${railX(MARKET).toFixed(1)}" y1="4" x2="${railX(MARKET).toFixed(1)}" y2="16"/>
      <text class="ic-rail__label" x="${railX(MARKET).toFixed(1)}" y="34" text-anchor="middle">market</text>
      <line class="ic-rail__needle" data-needle x1="${railX(MARKET)}" y1="10" x2="${railX(MARKET)}" y2="46"/>
      <path class="ic-rail__tip" data-tip d="M-8 2 L8 2 L0 12 Z" transform="translate(${railX(MARKET)} 0)"/>
      <rect class="ic-soil" x="0" y="50" width="190" height="50" rx="8"/>
      ${rows}
    </svg>`;
}

function shopSvg() {
  // The pile is drawn back to front, so each sheet shows an 11 px band of its own header above the one
  // in front: the count reads off the pile rather than off a number.
  const sheets = CLEARANCES.map((c, i) => `
      <g class="ic-sheet" data-sheet="${c.key}" transform="translate(${15 + i * 4} ${25 + (CLEARANCES.length - 1 - i) * 11})">
        <rect class="ic-sheet__page" x="0" y="0" width="44" height="44" rx="4"/>
        <line class="ic-sheet__line" x1="7" y1="10" x2="36" y2="10"/>
        <line class="ic-sheet__line" x1="7" y1="19" x2="36" y2="19"/>
        <line class="ic-sheet__line" x1="7" y1="28" x2="24" y2="28"/>
      </g>`).reverse().join('');
  return `<svg class="ic-art" viewBox="0 0 190 100" role="img"
      aria-label="A small shopfront with its door shut, and the clearances stacking up beside it">
      <rect class="ic-wall" x="4" y="4" width="182" height="92" rx="10"/>
      <rect class="ic-awning" x="4" y="4" width="182" height="20" rx="10"/>
      <rect class="ic-door__frame" x="112" y="30" width="62" height="66" rx="5"/>
      <rect class="ic-door" x="119" y="37" width="48" height="59" rx="3"/>
      <circle class="ic-knob" cx="128" cy="68" r="3"/>
      <line class="ic-door__bar" x1="112" y1="62" x2="174" y2="62"/>
      <rect class="ic-step" x="4" y="86" width="182" height="10" rx="5"/>
      ${sheets}
    </svg>`;
}

function capSvg() {
  return `<svg class="ic-art" viewBox="0 0 190 100" role="img"
      aria-label="A seed packet under a cap bar; the cap closes in on the packet as the margin falls">
      <rect class="ic-cap__bar" x="14" y="6" width="162" height="11" rx="5"/>
      <rect class="ic-packet" data-packet x="${95 - packetW(6) / 2}" y="26" width="${packetW(6)}" height="68" rx="8"/>
      <rect class="ic-packet__band" data-band x="${95 - packetW(6) / 2}" y="26" width="${packetW(6)}" height="15" rx="8"/>
      <circle class="ic-seed" cx="86" cy="64" r="6"/>
      <circle class="ic-seed" cx="104" cy="72" r="6"/>
      <path class="ic-cap__jaw ic-cap__jaw--a" data-jaw="a" d="M0 0 L-11 7 L0 14 Z"
        transform="translate(${95 - packetW(6) / 2} 24)"/>
      <path class="ic-cap__jaw ic-cap__jaw--b" data-jaw="b" d="M0 0 L11 7 L0 14 Z"
        transform="translate(${95 + packetW(6) / 2} 24)"/>
    </svg>`;
}

/* ------------------------------------------------------------------ the look */

const CSS = SIM_LOOK_DOM_CSS + `
.ic-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }
.ic-root > .sim-record { margin: 0; }
.ic-root .sim-record, .sim-dom-root--portrait .ic-root .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* ---- the three cost cards ---- */
.ic-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sim-space-2); }
.ic-card { display: flex; flex-direction: column; gap: var(--sim-space-1); margin: 0; padding: var(--sim-space-2);
  transition: opacity .3s ease, border-color .3s ease; }
.ic-card.is-dim { opacity: .5; }
.ic-card.is-now { border-color: var(--sim-accent); }
.ic-head { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-height: 38px; }
.ic-title { font: 800 var(--sim-text-sm)/1.2 var(--sim-font); color: var(--sim-label); }
.ic-card.is-dim .ic-title { color: var(--sim-label-muted); }

/* ---- the drawing: one flexible box, so the three cards stay level without an empty band ---- */
.ic-art { display: block; width: 100%; flex: 1 1 96px; min-height: 96px; }
.ic-dial { display: flex; flex-wrap: wrap; gap: var(--sim-space-1); }
.ic-dial--two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ic-pill { font: 800 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label-muted);
  background: transparent; border: 2px dashed color-mix(in oklab, var(--sim-stroke) 70%, transparent);
  border-radius: var(--sim-radius-pill); padding: 4px var(--sim-space-2); cursor: pointer; }
.ic-pill:hover:not([disabled]) { border-color: var(--sim-accent); }
.ic-pill.is-on { border-style: solid; border-color: var(--sim-accent);
  background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); color: var(--sim-label); }
.ic-pill[disabled] { cursor: default; }
.ic-pill[disabled]:hover { border-color: color-mix(in oklab, var(--sim-stroke) 70%, transparent); }

/* ---- state chips: pinned to the foot so all three cards end level ---- */
.ic-chips { display: flex; flex-wrap: wrap; gap: var(--sim-space-1); margin: auto 0 0; }
.ic-chip { margin: 0; font-weight: 800; }
.ic-chip.is-bite { color: var(--sim-ink-on-bad); background: var(--sim-bad); border-color: var(--sim-bad); }
.ic-chip.is-fresh { animation: ic-pop .35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes ic-pop { from { transform: scale(0.82); } to { transform: scale(1); } }

/* ---- glyph readouts: the small kitchens, and what a grower would invest ---- */
.ic-glyphs { display: flex; align-items: center; gap: var(--sim-space-2); min-height: 30px; }
.ic-glyph { display: grid; place-items: center; width: 30px; height: 30px; color: var(--sim-series-2);
  border: 2px solid color-mix(in oklab, var(--sim-stroke) 60%, transparent); border-radius: var(--sim-radius-sm);
  transition: opacity .3s ease, color .3s ease; }
.ic-glyph .sim-icon { width: 24px; height: 24px; }
.ic-glyph.is-out { opacity: .35; color: var(--sim-label-muted); border-style: dashed; }

/* ---- card one: the rail and the crop ---- */
.ic-rail__line, .ic-rail__tick, .ic-rail__needle { stroke: var(--sim-stroke); stroke-width: 3; stroke-linecap: round; }
.ic-rail__needle { stroke-dasharray: 4 4; stroke-width: 2; transition: stroke .3s ease; }
.ic-rail__label { font: 800 14px/1 var(--sim-font); fill: var(--sim-label-muted); }
.ic-rail__tip { fill: var(--sim-accent); transition: transform .35s ease, fill .3s ease; }
.ic-card.is-bite .ic-rail__needle { stroke: var(--sim-bad); }
.ic-card.is-bite .ic-rail__tip { fill: var(--sim-bad); }
.ic-soil { fill: color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-deep)); }
.ic-row__stem { stroke: var(--sim-series-3); stroke-width: 4; stroke-linecap: round; transition: opacity .3s ease; }
.ic-row__leaf { fill: var(--sim-series-3); transition: opacity .3s ease; }
.ic-row.is-thin .ic-row__stem { opacity: .28; }
.ic-row.is-thin .ic-row__leaf { opacity: 0; }

/* ---- card two: the shopfront and its stack ---- */
/* The wall takes a stroke as well as a fill: in the light theme a tint mixed into --sim-bg-deep
   lands close to the card behind it, and the shopfront would float. */
.ic-wall { fill: color-mix(in oklab, var(--sim-stroke) 14%, var(--sim-bg-deep));
  stroke: var(--sim-stroke); stroke-width: 2; }
.ic-awning { fill: color-mix(in oklab, var(--sim-series-2) 70%, var(--sim-bg-deep)); }
.ic-step { fill: color-mix(in oklab, var(--sim-stroke) 46%, var(--sim-bg-deep)); }
.ic-knob { fill: var(--sim-bg-deep); opacity: .6; }
.ic-door__frame { fill: color-mix(in oklab, var(--sim-series-5) 40%, var(--sim-bg-deep)); }
.ic-door { fill: color-mix(in oklab, var(--sim-series-5) 68%, var(--sim-bg-deep)); transition: fill .3s ease; }
.ic-card.is-shut .ic-door { fill: color-mix(in oklab, var(--sim-label-muted) 34%, var(--sim-bg-deep)); }
.ic-door__bar { stroke: var(--sim-label-muted); stroke-width: 5; stroke-linecap: round; opacity: 0; transition: opacity .3s ease; }
.ic-card.is-shut .ic-door__bar { opacity: .9; }
/* The pile fades in only: a CSS transform here would override the sheet's own transform attribute
   and stack every sheet in the same place. */
.ic-sheet { opacity: 0; transition: opacity .3s ease; }
.ic-sheet.is-on { opacity: 1; }
.ic-sheet__page { fill: var(--sim-bg-surface); stroke: var(--sim-stroke); stroke-width: 2; }
.ic-sheet__line { stroke: var(--sim-label-muted); stroke-width: 3; stroke-linecap: round; }

/* ---- card three: the cap bar closing on the packet ---- */
.ic-cap__bar { fill: color-mix(in oklab, var(--sim-label-muted) 75%, var(--sim-bg-deep)); }
.ic-cap__jaw { fill: var(--sim-accent); transition: transform .4s ease, fill .3s ease; }
.ic-packet { fill: color-mix(in oklab, var(--sim-series-2) 72%, var(--sim-bg-surface));
  stroke: color-mix(in oklab, var(--sim-series-2) 90%, var(--sim-bg-deep)); stroke-width: 2;
  transition: all .4s ease; }
.ic-packet__band { fill: color-mix(in oklab, var(--sim-series-2) 88%, var(--sim-bg-deep));
  transition: all .4s ease; }
.ic-card.is-capped .ic-packet { fill: color-mix(in oklab, var(--sim-label-muted) 22%, var(--sim-bg-surface));
  stroke: var(--sim-stroke); }
.ic-card.is-capped .ic-packet__band { fill: var(--sim-label-muted); }
.ic-card.is-capped .ic-cap__jaw { fill: var(--sim-bad); }
.ic-seed { fill: var(--sim-bg-deep); opacity: .5; transition: opacity .3s ease; }
.ic-card.is-capped .ic-seed { opacity: .12; }

/* portrait: one card per row. The drawing is capped at 280 px so the svg's own text does not scale
   up with a 350 px card, and it keeps its aspect ratio, so nothing is letterboxed. */
.sim-dom-root--portrait .ic-cards { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .ic-art { flex: 0 0 auto; width: 100%; max-width: 280px; margin: 0 auto;
  height: auto; aspect-ratio: 190 / 100; }
`;

// sim-lint-ignore token: --sim-ink-on-bad is set on the root at mount by applyToneInks, not by a stylesheet.

/* ------------------------------------------------------------------ the scene */

export class InterventionCostsScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 472;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 1188;
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }],     // the fixed price and the crop that thins
    [{ idx: 1, dwellMs: null }],     // the clearances stacking against the door
    [{ idx: 2, dwellMs: null }],     // the cap squeezing the payoff out of the field
  ];
  static ARIA_LABEL =
    'Three cost cards side by side, one for each cost of intervening too much. On the first a price rail '
    + 'marked at the farmer\'s cost of 34 rupees a kilo and the market price of 40 rupees, with a field of six '
    + 'crop rows under it: fix the price below the cost and the field is sown thin next season. On the second a '
    + 'shopfront whose door is shut while food safety, fire safety, pollution clearance and a local licence '
    + 'stack up beside it, six months before the first order. On the third a seed packet under a cap bar, with '
    + 'better seeds, irrigation and cold storage going unpurchased when the cap leaves no margin.';
  static CONTROLS = [];              // the stub says "Dials: none" - the pills in each card are the dial

  constructor(container, config) {
    super(container, config);
    this._price = STOPS_OPEN;        // card one: the price the government fixes
    this._papers = new Set();        // card two: the clearances already filed for
    this._cap = STOPS_OPEN;          // card three: the cap on what a grower can keep
    this._broke = {};                // which beats have already celebrated
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="ic-root">
          <div data-record>${simRecord(BEAT_LABEL, 0, 'The cost of stepping in')}</div>

          <div class="ic-cards">
            <!-- card one: a fixed price, and the crop it leaves -->
            <div class="sim-card ic-card" data-card="0" data-beat-title="${BEAT_TITLE[0]}">
              <div class="ic-head">
                <span class="sim-tag" data-title>cost one</span>
                <span class="ic-title">distorted prices</span>
              </div>
              ${fieldSvg()}
              <div class="ic-dial" role="group" aria-label="the price the government fixes">
                ${STOPS.map((p) => `<button class="ic-pill" type="button" data-stop="${p}" aria-pressed="false"
                  aria-label="fix the price at ${p} rupees a kilo">${money(p)}</button>`).join('')}
              </div>
              <div class="ic-chips">
                <span class="sim-tag ic-chip" data-gap role="status" aria-live="polite"></span>
                <span class="sim-tag ic-chip" data-crop></span>
              </div>
            </div>

            <!-- card two: the clearances, and the months they cost -->
            <div class="sim-card ic-card" data-card="1" data-beat-title="${BEAT_TITLE[1]}">
              <div class="ic-head">
                <span class="sim-tag" data-title>cost two</span>
                <span class="ic-title">paperwork</span>
              </div>
              ${shopSvg()}
              <div class="ic-dial ic-dial--two" role="group" aria-label="the clearances a small restaurant needs">
                ${CLEARANCES.map((c) => `<button class="ic-pill" type="button" data-clear="${c.key}" aria-pressed="false"
                  aria-label="${c.label}, ${c.months} month${c.months > 1 ? 's' : ''}">${c.short}</button>`).join('')}
              </div>
              <div class="ic-glyphs" data-shops role="img" aria-label="small kitchens left in the lane"></div>
              <div class="ic-chips">
                <span class="sim-tag ic-chip" data-months role="status" aria-live="polite"></span>
                <span class="sim-tag ic-chip" data-kitchens></span>
              </div>
            </div>

            <!-- card three: a cap on the returns, and what it stops buying -->
            <div class="sim-card ic-card" data-card="2" data-beat-title="${BEAT_TITLE[2]}">
              <div class="ic-head">
                <span class="sim-tag" data-title>cost three</span>
                <span class="ic-title">stalled investment</span>
              </div>
              ${capSvg()}
              <div class="ic-dial" role="group" aria-label="the cap on what a grower can keep">
                ${STOPS.map((p) => `<button class="ic-pill" type="button" data-cap="${p}" aria-pressed="false"
                  aria-label="cap what a grower can keep at ${p} rupees a kilo">${money(p)}</button>`).join('')}
              </div>
              <div class="ic-glyphs" data-invest role="img" aria-label="better seeds, irrigation and cold storage: bought only when the margin is there"></div>
              <div class="ic-chips">
                <span class="sim-tag ic-chip" data-margin role="status" aria-live="polite"></span>
                <span class="sim-tag ic-chip" data-buy></span>
              </div>
            </div>
          </div>

          ${noteLineHtml([{ text: NOTE }])}
        </div>`,
    });

    const q = (sel) => this.root?.querySelector?.(sel) ?? null;
    this._el = {
      record: q('[data-record]'),
      cards: [0, 1, 2].map((i) => q(`[data-card="${i}"]`)),
      titles: [0, 1, 2].map((i) => q(`[data-card="${i}"] [data-title]`)),
      // card one
      stops: STOPS.map((p) => q(`[data-stop="${p}"]`)),
      needle: q('[data-needle]'),
      tip: q('[data-tip]'),
      rows: Array.from({ length: ROWS_FULL }, (_, i) => q(`[data-row="${i}"]`)),
      gap: q('[data-gap]'),
      crop: q('[data-crop]'),
      // card two
      sheets: CLEARANCES.map((c) => q(`[data-sheet="${c.key}"]`)),
      clears: CLEARANCES.map((c) => q(`[data-clear="${c.key}"]`)),
      shops: q('[data-shops]'),
      months: q('[data-months]'),
      kitchens: q('[data-kitchens]'),
      // card three
      caps: STOPS.map((p) => q(`[data-cap="${p}"]`)),
      packet: q('[data-packet]'),
      band: q('[data-band]'),
      jaws: [q('[data-jaw="a"]'), q('[data-jaw="b"]')],
      invest: q('[data-invest]'),
      margin: q('[data-margin]'),
      buy: q('[data-buy]'),
      note: q('.sl-note-line'),
    };

    // The glyph readouts are counts, so they are built from the shared icon set, not drawn here.
    if (this._el.shops) {
      this._el.shops.innerHTML = Array.from({ length: KITCHENS }, () =>
        `<span class="ic-glyph" title="a small kitchen">${iconSvg('shop', 'currentColor')}</span>`).join('');
      this._el.shopGlyphs = Array.from(this._el.shops.querySelectorAll('.ic-glyph'));
    }
    if (this._el.invest) {
      this._el.invest.innerHTML = INVEST.map((it) =>
        `<span class="ic-glyph" data-invest="${it.key}" title="${it.label}">${iconSvg(it.icon, 'currentColor')}</span>`).join('');
      this._el.investGlyphs = Array.from(this._el.invest.querySelectorAll('.ic-glyph'));
    }

    applyToneInks(this.root);

    this.root?.addEventListener?.('click', (e) => {
      const stop = e.target?.closest?.('[data-stop]');
      if (stop && !stop.disabled) { this._price = Number(stop.dataset.stop); this._paint({ fresh: 'price' }); this._maybeBurst(0); return; }
      const clear = e.target?.closest?.('[data-clear]');
      if (clear && !clear.disabled) { this._toggleClear(clear.dataset.clear); return; }
      const cap = e.target?.closest?.('[data-cap]');
      if (cap && !cap.disabled) { this._cap = Number(cap.dataset.cap); this._paint({ fresh: 'cap' }); this._maybeBurst(2); }
    });

    this._paintRecord();
    this._paint();
  }

  destroy() {
    this._el = null;
    super.destroy();
  }

  /* ------------------------------------------------------------------ the beats and the taps */

  /** The clamped beat index: a mount can open on any beat, and none may be past the last. */
  _beat() {
    const i = Number(this.stepIndex);
    return Number.isFinite(i) && i >= 0 ? Math.min(i, 2) : 0;
  }

  /**
   * A beat change. Cards the learner has already worked keep their state, so a beat can be read
   * back; only the cards still ahead of the lesson are put back to their opening, so nothing is
   * spoiled early.
   */
  onStep() {
    const beat = this._beat();
    if (beat < 1) this._papers.clear();
    if (beat < 2) this._cap = STOPS_OPEN;
    this._paint({ fresh: 'all' });
  }

  /** File (or pull back) one clearance: the stack, the months and the lane all follow. */
  _toggleClear(key) {
    if (this._beat() < 1) return;                    // no clearance exists before the beat that names one
    if (this._papers.has(key)) this._papers.delete(key); else this._papers.add(key);
    this._paint({ fresh: 'clear' });
    this._maybeBurst(1);
  }

  /* ------------------------------------------------------------------ the paint */

  /** Everything on screen, from the three dials and the beat. */
  _paint(opts = {}) {
    const el = this._el;
    if (!el) return;
    const beat = this._beat();
    const fresh = opts.fresh;
    el.cards.forEach((card, i) => {
      card?.classList.toggle('is-now', i === beat);
      card?.classList.toggle('is-dim', i !== beat);
    });

    /* card one: the price the government fixes, and the crop it leaves */
    const below = this._price < COST;
    const rows = below ? ROWS_THIN : ROWS_FULL;
    el.rows?.forEach((row, i) => row?.classList.toggle('is-thin', below && i >= ROWS_THIN));
    const x = railX(this._price).toFixed(1);
    if (el.needle) { el.needle.setAttribute('x1', x); el.needle.setAttribute('x2', x); }
    if (el.tip) el.tip.setAttribute('transform', `translate(${x} 0)`);
    el.cards?.[0]?.classList.toggle('is-bite', below);
    if (el.gap) {
      el.gap.textContent = below ? `${money(COST - this._price)}/kg short of cost` : 'cost covered';
      el.gap.classList.toggle('is-bite', below);
      this._pop(el.gap, fresh === 'price' || fresh === 'all');
    }
    if (el.crop) {
      el.crop.textContent = `next season: ${rows} of ${ROWS_FULL} rows`;
      el.crop.classList.toggle('is-bite', below);
      this._pop(el.crop, fresh === 'price' || fresh === 'all');
    }
    STOPS.forEach((p, i) => {
      const pill = el.stops?.[i];
      if (!pill) return;
      pill.classList.toggle('is-on', p === this._price);
      pill.setAttribute('aria-pressed', String(p === this._price));
    });

    /* card two: the clearances stacked against a shut door */
    const months = CLEARANCES.reduce((n, c) => n + (this._papers.has(c.key) ? c.months : 0), 0);
    CLEARANCES.forEach((c, i) => {
      const on = this._papers.has(c.key);
      el.sheets?.[i]?.classList.toggle('is-on', on);
      const pill = el.clears?.[i];
      if (pill) {
        pill.classList.toggle('is-on', on);
        pill.setAttribute('aria-pressed', String(on));
        pill.disabled = beat < 1;
      }
    });
    el.cards?.[1]?.classList.toggle('is-shut', months > 0);
    const kitchens = months >= MONTHS_ALL ? 1 : KITCHENS;
    el.shopGlyphs?.forEach((g, i) => g?.classList.toggle('is-out', i >= kitchens));
    if (el.shops) {
      el.shops.setAttribute('aria-label', kitchens === KITCHENS
        ? `${KITCHENS} small kitchens, all still open`
        : '1 small kitchen left - the small ones gave up');
    }
    if (el.months) {
      el.months.textContent = `months to open: ${months}`;
      this._pop(el.months, fresh === 'clear' || fresh === 'all');
    }
    if (el.kitchens) {
      el.kitchens.textContent = kitchens === KITCHENS
        ? `${KITCHENS} small kitchens` : `${KITCHENS - 1} gave up, 1 left`;
      el.kitchens.classList.toggle('is-bite', kitchens < KITCHENS);
      this._pop(el.kitchens, fresh === 'clear' || fresh === 'all');
    }

    /* card three: the cap, the margin it leaves, and what that margin buys */
    const margin = marginOf(this._cap);
    const w = packetW(margin);
    if (el.packet) el.packet.setAttribute('width', String(w));
    if (el.band) el.band.setAttribute('width', String(w));
    if (el.jaws?.[0]) el.jaws[0].setAttribute('transform', `translate(${95 - w / 2} 24)`);
    if (el.jaws?.[1]) el.jaws[1].setAttribute('transform', `translate(${95 + w / 2} 24)`);
    el.cards?.[2]?.classList.toggle('is-capped', margin <= 0);
    el.investGlyphs?.forEach((g) => g?.classList.toggle('is-out', margin <= 0));
    if (el.invest) {
      el.invest.setAttribute('aria-label', margin > 0
        ? 'better seeds, irrigation and cold storage: bought, the margin is there'
        : 'better seeds, irrigation and cold storage: none bought, no margin is left');
    }
    if (el.margin) {
      el.margin.textContent = `margin left ${money(margin)}/kg`;
      el.margin.classList.toggle('is-bite', margin <= 0);
      this._pop(el.margin, fresh === 'cap' || fresh === 'all');
    }
    if (el.buy) {
      el.buy.textContent = margin > 0
        ? `${INVEST.length} would be bought` : 'nobody invests';
      el.buy.classList.toggle('is-bite', margin <= 0);
      this._pop(el.buy, fresh === 'cap' || fresh === 'all');
    }
    STOPS.forEach((p, i) => {
      const pill = el.caps?.[i];
      if (!pill) return;
      pill.classList.toggle('is-on', p === this._cap);
      pill.setAttribute('aria-pressed', String(p === this._cap));
      pill.disabled = beat < 2;
    });

    this._paintRecord();
  }

  /** Restart a one-shot pop: the class has to come off and go back on, or a second tap does nothing. */
  _pop(node, on) {
    if (!node) return;
    if (!on) { node.classList.remove('is-fresh'); return; }
    node.classList.remove('is-fresh');
    void node.offsetWidth;
    node.classList.add('is-fresh');
  }

  /** simRecord emits no data attribute of its own, so the strip is moved by position. */
  _paintRecord() {
    const steps = this._el?.record?.querySelectorAll?.('.sim-record__step') ?? [];
    const beat = this._beat();
    Array.from(steps).forEach((step, i) => {
      if (i === beat) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  /* ------------------------------------------------------------------ celebration */

  /** The concept, not the press: each beat is found by the learner operating that card's dial. */
  _maybeBurst(beat) {
    if (this._broke[beat]) return;
    const found = beat === 0 ? this._price < COST
      : beat === 1 ? this._papers.size === CLEARANCES.length
        : marginOf(this._cap) <= 0;
    if (!found) return;
    this._broke[beat] = true;
    burst(this._el?.cards?.[beat]);
  }
}