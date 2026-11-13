import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';

/**
 * SellerStallScene - Seller A's stall, one sticker per week (blk-l03-s01, 3 beats).
 *
 * The slide's one claim: nothing about the stall changes except the sticker, and
 * the heap on the table follows the sticker. So this scene draws ONE stall, ONE
 * scale, and changes exactly two things as the week goes by: the price board
 * hanging from the awning, and the size of the heap resting on the scale.
 *
 * Nothing else is on screen that could answer blk-l03-s02's prediction (no
 * curve, no schedule table, no totals): each beat shows exactly one sticker and
 * one heap, in that order.
 *
 * Labels only - the prose is the slide's. The kilograms on the readout are the
 * model's numbers (1 kg, 2 kg, 3 kg); the crates are only a picture of the heap
 * and the footer says so.
 */

// Model numbers (design note "Model numbers"): the slide's own pairs, exactly.
const WEEKS = [
  { price: 50, kg: 1, crates: 1 },
  { price: 100, kg: 2, crates: 2 },
  { price: 150, kg: 3, crates: 3 },
];
const MAX_CRATES = 3;

// Geometry, in the hero SVG's own 620x300 viewBox - not scene positions: the
// whole SVG is one hero inside one card.
const VB_W = 620;
const BOARD_X = 310;
const COUNTER_Y = 210;
const COUNTER_H = 14;
const PLATFORM_Y = 196;
const CRATE_H = 42;
const CRATE_W = 112;
const CRATE_X = [66, 194, 322]; // fixed, so the heap grows to the right
const PLAT_L = 56;
const PLAT_R = 444;

// The scene font has no U+20B9 on many systems (it renders as a tofu box), so the
// rupee sign is a drawn glyph and only the digits are text - the same shape on
// every board, so the three stickers stay comparable.
const RUPEE_D = 'M3 5h12v2.8H3zM2 9.6h14v2.8H2zM7.2 3.2h3.1v11.4c0 3.2 1.5 4.8 5.3 4.8h3l-.9 2.9h-2.4c-5.1 0-8.1-2.9-8.1-7.7z';

function mango(x, y) {
  return `<g class="ss-mango">
    <ellipse cx="${x}" cy="${y}" rx="13" ry="11"/>
    <path class="ss-leaf" d="M${x} ${y - 10}c5 -7 12 -6 13 -5c-1 6 -7 10 -13 8z"/>
  </g>`;
}

// One crate: three mangoes tucked behind its front panel, so they look heaped in
// it rather than stuck on it.
function crate(x) {
  const fruit = [26, 56, 86].map((d) => mango(x + d, PLATFORM_Y - CRATE_H + 2)).join('');
  return `<g class="ss-crate">
    <rect class="ss-crate__box" x="${x}" y="${PLATFORM_Y - CRATE_H}" width="${CRATE_W}" height="${CRATE_H}" rx="4"/>
    ${fruit}
    <rect class="ss-crate__front" x="${x + 4}" y="${PLATFORM_Y - CRATE_H + 12}" width="${CRATE_W - 8}" height="${CRATE_H - 12}" rx="3"/>
  </g>`;
}

function stickerSvg() {
  // The board is fixed and only its digits change, so a new sticker flips about
  // the string it hangs from (the ss-flip keyframes) instead of jumping. The
  // digits are centred on a fixed x and the rupee glyph is placed from the digit
  // count, which keeps the whole "rupee + digits" group centred on the board.
  return `<g class="ss-sticker">
    <line class="ss-string" x1="${BOARD_X}" y1="46" x2="${BOARD_X}" y2="62"/>
    <rect class="ss-sticker__board" x="238" y="62" width="144" height="62" rx="8"/>
    <path class="ss-rupee" transform="translate(284 74) scale(0.88)" d="${RUPEE_D}"/>
    <text class="ss-sticker__price" x="320" y="98" text-anchor="middle">50</text>
    <text class="ss-sticker__unit" x="${BOARD_X}" y="116">per kg</text>
  </g>`;
}

function stallSvg() {
  const stripes = Array.from({ length: 8 }, (_, i) =>
    `<rect class="${i % 2 ? 'ss-stripe ss-stripe--alt' : 'ss-stripe'}" x="${i * 77.5}" y="0" width="77.5" height="46"/>`).join('');
  return `<svg class="ss-svg" viewBox="0 0 ${VB_W} 300" role="img"
      aria-label="Seller A's mango stall: a price board hangs from the awning, and crates of mangoes rest on a scale on the counter.">
    <g class="ss-awning">${stripes}<rect class="ss-awning__lip" x="0" y="40" width="${VB_W}" height="6"/></g>
    <rect class="ss-post" x="16" y="46" width="14" height="220" rx="3"/>
    <rect class="ss-post" x="590" y="46" width="14" height="220" rx="3"/>
    ${stickerSvg()}
    <rect class="ss-platform" x="${PLAT_L}" y="${PLATFORM_Y}" width="${PLAT_R - PLAT_L}" height="${COUNTER_Y - PLATFORM_Y}" rx="3"/>
    <g class="ss-crates">${CRATE_X.slice(0, MAX_CRATES).map(crate).join('')}</g>
    <rect class="ss-counter__top" x="36" y="${COUNTER_Y}" width="548" height="${COUNTER_H}" rx="3"/>
    <rect class="ss-counter__front" x="44" y="${COUNTER_Y + COUNTER_H}" width="532" height="38" rx="4"/>
    <g class="ss-readout">
      <rect class="ss-readout__box" x="170" y="228" width="160" height="30" rx="6"/>
      <text class="ss-readout__kg" x="250" y="249" text-anchor="middle">1 kg</text>
    </g>
    <line class="ss-ground" x1="10" y1="266" x2="610" y2="266"/>
  </svg>`;
}

const CSS = SIM_LOOK_DOM_CSS + `
.ss-stack { gap: var(--sim-space-3); }
.ss-head { align-items: center; gap: var(--sim-space-2); }
.ss-svg { display: block; width: 100%; height: auto; }
.ss-svg text { font-family: inherit; }
.ss-awning .ss-stripe { fill: var(--sim-series-2); }
.ss-awning .ss-stripe--alt { fill: color-mix(in oklab, var(--sim-series-2) 72%, black); }
.ss-awning__lip { fill: color-mix(in oklab, var(--sim-series-2) 55%, black); }
.ss-post { fill: var(--sim-series-8); }
.ss-string { stroke: var(--sim-stroke); stroke-width: 2; }
.ss-sticker { transform-origin: ${BOARD_X}px 46px; }
.sim-ui[data-week="1"] .ss-sticker, .sim-ui[data-week="2"] .ss-sticker { animation: ss-flip .45s ease both; }
@keyframes ss-flip {
  0% { transform: rotateX(0deg); }
  45% { transform: rotateX(-82deg); }
  100% { transform: rotateX(0deg); }
}
.ss-sticker__board { fill: var(--sim-series-2); stroke: var(--sim-border); stroke-width: 2; }
.ss-sticker__price { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); font-size: var(--sim-text-2xl); font-weight: 700; }
.ss-sticker__unit { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); font-size: var(--sim-text-sm); }
/* sim-lint-ignore token: --sim-ink-on-* is not a stylesheet token; applyToneInks() sets it per tone and theme, the only thing that can pick readable ink on the amber board in both themes. */
.ss-rupee { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); }
.ss-mango ellipse { fill: var(--sim-series-8); stroke: color-mix(in oklab, var(--sim-series-8) 70%, black); stroke-width: 1.5; }
.ss-mango .ss-leaf { fill: var(--sim-series-3); }
/* The heap is revealed by count, so a crate that is already on the table never
   blinks when the sticker changes - only the new one rises. */
.ss-crate { opacity: 0; transform: translateY(14px); transition: opacity .35s ease, transform .4s ease; }
.sim-ui[data-crates="1"] .ss-crate:nth-child(-n+1),
.sim-ui[data-crates="2"] .ss-crate:nth-child(-n+2),
.sim-ui[data-crates="3"] .ss-crate:nth-child(-n+3) { opacity: 1; transform: translateY(0); }
.ss-crate__box { fill: var(--sim-strata-1); stroke: var(--sim-strata-3); stroke-width: 2; }
/* A shade darker than the counter it stands on, so the heap reads as objects on
   the table rather than as more table. */
.ss-crate__front { fill: color-mix(in oklab, var(--sim-strata-2) 80%, black); stroke: var(--sim-strata-3); stroke-width: 2; }
.ss-platform { fill: var(--sim-strata-2); stroke: var(--sim-strata-3); stroke-width: 2; }
.ss-counter__top { fill: var(--sim-strata-1); stroke: var(--sim-strata-2); stroke-width: 2; }
.ss-counter__front { fill: var(--sim-strata-2); stroke: var(--sim-strata-3); stroke-width: 2; }
.ss-readout__box { fill: var(--sim-bg-deep); stroke: var(--sim-accent); stroke-width: 2; }
.ss-readout__kg { fill: var(--sim-good); font-size: var(--sim-text-xl); font-weight: 700; }
.ss-ground { stroke: var(--sim-stroke); stroke-width: 2; opacity: .5; }
.ss-ask { display: flex; align-items: center; gap: var(--sim-space-2); }
.ss-ask .sim-title { font-size: var(--sim-text-lg); margin: 0; }
/* Portrait: this 620-wide viewBox scales to about 0.6, so the SVG's own text is
   bumped here instead of being left under the 14px floor. */
.sim-dom-root--portrait .ss-sticker__price { font-size: 30px; }
.sim-dom-root--portrait .ss-sticker__unit { font-size: 18px; }
.sim-dom-root--portrait .ss-readout__kg { font-size: 28px; }
`;

export class SellerStallScene extends DomSimulation {
  static WIDTH = 640;
  static HEIGHT = 570; // sim-layout: tallest state (beat 2, question card open) is 565px
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 515; // sim-layout: portrait tallest state is 511px
  static FIT = true;
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }], // week 1: the Rs50 board, one crate, 1 kg
    [{ idx: 1, dwellMs: null }], // week 2: the Rs100 board, two crates, 2 kg
    [{ idx: 2, dwellMs: null }], // week 3: the Rs150 board, three crates, 3 kg - the sticker is the learner's
  ];
  static ARIA_LABEL = "Seller A's mango stall: a price board hangs from the awning, and the heap of mangoes on the table scale grows as the board goes from 50 to 100 to 150 rupees per kilogram.";
  static CONTROLS = [
    {
      type: 'segmented', id: 'sticker', label: "This week's sticker",
      options: WEEKS.map((w) => ({ value: String(w.price), label: `\u20b9${w.price}` })),
      value: '150',
    },
  ];

  async setup() {
    await super.setup();
    this.week = WEEKS[0];
    this._seen = new Set();
    this._celebrated = false;
    this.render({
      css: CSS,
      html: `<div class="sim-stack ss-stack">
        <div class="sim-row ss-head">
          <span class="sim-tag sim-tag--accent">Seller A</span>
          <span class="sim-tag">mango stall</span>
        </div>
        <div class="sim-card ss-hero">${stallSvg()}</div>
        <article class="sim-card sim-card--accent ss-question" hidden>
          <div class="ss-ask"><span class="sim-q">?</span><h2 class="sim-title">What decides the pile's size?</h2></div>
          <p class="sim-meta">move this week's sticker and watch the table</p>
        </article>
        <p class="sim-meta">One stall, one scale - the heap is schematic; the scale reads the weight</p>
        ${noteLineHtml([
          { text: 'Model: only the three weekly stickers are shown (a real market moves day to day); a crate is only a picture of the heap - the kilograms on the scale are the number.' },
        ])}
      </div>`,
    });
    applyToneInks(this.root);
    this._hero = this.root.querySelector('.ss-hero');
    this._price = this.root.querySelector('.ss-sticker__price');
    this._rupee = this.root.querySelector('.ss-rupee');
    this._kg = this.root.querySelector('.ss-readout__kg');
    this._question = this.root.querySelector('.ss-question');
    this.root.dataset.crates = '1';
    this.root.dataset.week = '0';
    this.onStep();
  }

  // The base class clamps the beat, sets this.stepIndex and root.dataset.step, then calls this.
  onStep() {
    // A beat IS the week's sticker - the stub's "each new sticker visibly re-piles
    // the table". From beat 2 on, the learner's own sticker choice then stands
    // until the next beat (or mount) puts the week's sticker back.
    this.week = WEEKS[this.stepIndex];
    this._paint();
    if (this._question) this._question.hidden = this.stepIndex < WEEKS.length - 1;
    this.requestUiUpdate?.();
  }

  // The sticker is the slide's reveal on beats 0-1: hiding it there keeps the
  // beat (not the dial) doing the work, and keeps blk-l03-s02 unspoiled.
  isControlHidden(id) {
    return id === 'sticker' && this.stepIndex < WEEKS.length - 1;
  }

  onControlChange(id, v) {
    if (id !== 'sticker' || this.isControlHidden(id)) return;
    const price = Number(v);
    const week = WEEKS.find((w) => w.price === price);
    if (!week) return;
    this.week = week;
    this._seen.add(price);
    this._paint();
    // The concept lands when the learner has watched every sticker re-pile the
    // table with their own hand - not when the beat arrived.
    if (this._seen.size === WEEKS.length && !this._celebrated) {
      this._celebrated = true;
      if (this._hero) burst(this._hero);
    }
  }

  // The host draws the control at this value, so the board on the awning and
  // the control bar can never disagree.
  getControlValue(id) {
    if (id === 'sticker') return String(this.week.price);
    return undefined;
  }

  // The amber board's ink is the one thing the CSS cascade cannot decide.
  refreshTheme() {
    if (this.root) applyToneInks(this.root);
  }

  _paint() {
    const w = this.week;
    const digits = String(w.price);
    if (this.root.dataset.crates !== String(w.crates)) this.root.dataset.crates = String(w.crates);
    if (this.root.dataset.week !== String(this.stepIndex)) this.root.dataset.week = String(this.stepIndex);
    if (this._price) this._price.textContent = digits;
    // rupee glyph + digits stay one centred group: the digits' centre is fixed,
    // the glyph sits to their left by half their width.
    if (this._rupee) this._rupee.setAttribute('transform', `translate(${300 - 8 * digits.length} 74) scale(0.88)`);
    if (this._kg) this._kg.textContent = `${w.kg} kg`;
  }

  destroy() {
    this._hero = this._price = this._rupee = this._kg = this._question = null;
    super.destroy();
  }
}