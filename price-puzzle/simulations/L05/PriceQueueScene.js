import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { simRecord } from 'simulations/base/SimUi.js';

/**
 * PriceQueueScene - one vegetable stall, three sticker prices (blk-l05-s01, 3 beats).
 *
 * The slide's one claim: only one of the prices leaves neither heap nor queue
 * behind. So this scene draws ONE stall with ONE heap and changes exactly two
 * things as the morning goes by: the price board hanging from the awning, and
 * how much is left on the counter and standing in the queue in front of it.
 *
 * The beats step the board themselves (the dear end, the cheap end, the one
 * middle sticker). On the last beat the board becomes the learner's, and the
 * scene's job is to let them find a clearing sticker by their own hand - that
 * is the slide's question, and the answer is not a word the scene may say
 * (equilibrium, shortage and surplus are the next slides').
 *
 * Labels only. The kilograms on the scale readout are the model's numbers; the
 * baskets and the figures are the picture, and the footer says what one of each
 * is worth.
 */

// Model numbers (design note "Model numbers"): the slide names no numbers, so
// these are the scene's own - one heap of 40 kg, and a morning's buyers.
const STOCK_KG = 40;
const KG_PER_BASKET = 10;
const KG_PER_BUYER = 4;
const MAX_BUYERS = STOCK_KG / KG_PER_BUYER; // 10 buyers take the whole heap
const MAX_BASKETS = STOCK_KG / KG_PER_BASKET; // 4 baskets are the whole heap
const P_MIN = 30;
const P_MAX = 90;
const P_STEP = 5;

// Three market mornings: the slide's dear end, its cheap end, and the one
// middle sticker it asks about.
const MORNINGS = [90, 30, 60];

/**
 * One price, one morning's outcome. Buyers who come fall as the sticker rises
 * ((90 - P) / 3, rounded to whole people - you cannot have 0.4 of a buyer), the
 * seller serves them in order until the heap is gone, and whoever is left over
 * is the queue.
 */
function day(price) {
  const came = Math.round((P_MAX - price) / 3);
  const served = Math.min(came, MAX_BUYERS);
  return {
    price,
    kgLeft: STOCK_KG - KG_PER_BUYER * served,
    baskets: (STOCK_KG - KG_PER_BUYER * served) / KG_PER_BASKET,
    queue: came - served,
  };
}

function outcome(d) {
  if (d.kgLeft === 0 && d.queue === 0) return 'cleared';
  if (d.kgLeft === 0) return 'queue left wanting';
  if (d.queue === 0) return 'heap left over';
  return 'heap and queue both left';
}

// Geometry, in the hero SVG's own 640x272 viewBox - not scene positions: the
// whole SVG is one hero inside one card. Same stall as the L01/L03 boards, so
// the awning, the hanging board and the counter are the same shapes.
const VB_W = 640;
const VB_H = 258;
const BOARD_X = 320;
const COUNTER_Y = 200;
const COUNTER_H = 52;
const BASKET_H = 42;
const BASKET_W = 118;
const BASKET_X = [62, 194, 326, 458];
const READOUT_H = 30;
const READOUT_Y = COUNTER_Y + 14 + (COUNTER_H - 14 - READOUT_H) / 2;

// The scene font has no U+20B9 on many systems (it renders as a tofu box), so
// the rupee sign is a drawn glyph and only the digits are text - the same shape
// on every board as in the L01 and L03 stalls, so the three stickers stay
// comparable.
const RUPEE_D = 'M3 5h12v2.8H3zM2 9.6h14v2.8H2zM7.2 3.2h3.1v11.4c0 3.2 1.5 4.8 5.3 4.8h3l-.9 2.9h-2.4c-5.1 0-8.1-2.9-8.1-7.7z';

/** A bunch of greens: three leaves, so a basket reads as heaped, not stacked. */
function bunch(x, y) {
  return `<g class="pq-bunch">
    <ellipse cx="${x - 14}" cy="${y + 8}" rx="14" ry="10" transform="rotate(-22 ${x - 14} ${y + 8})"/>
    <ellipse cx="${x + 14}" cy="${y + 8}" rx="14" ry="10" transform="rotate(22 ${x + 14} ${y + 8})"/>
    <ellipse cx="${x}" cy="${y}" rx="13" ry="11"/>
  </g>`;
}

/** One basket of greens: the leaves heap over the rim, the front is a shade darker. */
function basket(x) {
  const top = COUNTER_Y - BASKET_H;
  return `<g class="pq-basket">
    ${[-32, 0, 32].map((d) => bunch(x + BASKET_W / 2 + d, top - 8)).join('')}
    <rect class="pq-basket__box" x="${x}" y="${top}" width="${BASKET_W}" height="${BASKET_H}" rx="4"/>
    <rect class="pq-basket__front" x="${x + 4}" y="${top + 14}" width="${BASKET_W - 8}" height="${BASKET_H - 14}" rx="3"/>
  </g>`;
}

function stallSvg() {
  const stripes = Array.from({ length: 8 }, (_, i) =>
    `<rect class="${i % 2 ? 'pq-stripe pq-stripe--alt' : 'pq-stripe'}" x="${i * 80}" y="0" width="80" height="44"/>`).join('');
  return `<svg class="pq-svg" viewBox="0 0 ${VB_W} ${VB_H}" role="img"
      aria-label="A vegetable stall: a price board hangs from the awning, baskets of greens stand on the counter, and a scale on the counter front reads how many kilograms are left.">
    <g class="pq-awning">${stripes}<rect class="pq-awning__lip" x="0" y="38" width="${VB_W}" height="6"/></g>
    <rect class="pq-post" x="16" y="44" width="14" height="214" rx="3"/>
    <rect class="pq-post" x="610" y="44" width="14" height="214" rx="3"/>
    <g class="pq-sticker">
      <line class="pq-string" x1="${BOARD_X}" y1="44" x2="${BOARD_X}" y2="62"/>
      <rect class="pq-sticker__board" x="242" y="62" width="156" height="66" rx="8"/>
      <path class="pq-rupee" transform="translate(284 74) scale(0.88)" d="${RUPEE_D}"/>
      <text class="pq-sticker__price" x="${BOARD_X}" y="96" text-anchor="middle">90</text>
      <text class="pq-sticker__unit" x="${BOARD_X}" y="120">per kg</text>
    </g>
    <g class="pq-baskets">${BASKET_X.map(basket).join('')}</g>
    <rect class="pq-counter__top" x="30" y="${COUNTER_Y}" width="580" height="14" rx="3"/>
    <rect class="pq-counter__front" x="38" y="${COUNTER_Y + 14}" width="564" height="${COUNTER_H - 14}" rx="4"/>
    <g class="pq-readout">
      <rect class="pq-readout__box" x="225" y="${READOUT_Y}" width="190" height="${READOUT_H}" rx="6"/>
      <text class="pq-readout__kg" x="${BOARD_X}" y="${READOUT_Y + 21}" text-anchor="middle">40 kg left</text>
    </g>
  </svg>`;
}

const QUEUE = Array.from({ length: MAX_BUYERS }, () =>
  `<span class="pq-buyer">${iconSvg('person', 7)}</span>`).join('');

// One reveal rule per count, so a basket already on the counter (or a figure
// already in the queue) never blinks when the sticker moves - only the one that
// arrived rises or steps in.
const REVEAL = (attr, max) => Array.from({ length: max + 1 }, (_, n) =>
  `.sim-ui[data-${attr}="${n}"] .pq-${attr === 'baskets' ? 'basket' : 'buyer'}:nth-child(-n+${n})`).join(',\n');

const CSS = SIM_LOOK_DOM_CSS + `
.pq-stack { gap: var(--sim-space-3); }
.pq-head { align-items: center; gap: var(--sim-space-2); justify-content: space-between; }
/* Three steps in a four-column record strip: hug the content, not the whole head. */
.pq-record { flex: 0 1 auto; }
.pq-record .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.pq-hero { padding: var(--sim-space-2); }
.pq-svg { display: block; width: 100%; height: auto; }
.pq-svg text { font-family: inherit; }
.pq-awning .pq-stripe { fill: var(--sim-series-2); }
.pq-awning .pq-stripe--alt { fill: color-mix(in oklab, var(--sim-series-2) 72%, black); }
.pq-awning__lip { fill: color-mix(in oklab, var(--sim-series-2) 55%, black); }
.pq-post { fill: var(--sim-series-8); }
.pq-string { stroke: var(--sim-stroke); stroke-width: 2; }
.pq-sticker { transform-origin: ${BOARD_X}px 44px; }
.sim-ui[data-morning="1"] .pq-sticker, .sim-ui[data-morning="2"] .pq-sticker { animation: pq-flip .45s ease both; }
@keyframes pq-flip {
  0% { transform: rotateX(0deg); }
  45% { transform: rotateX(-82deg); }
  100% { transform: rotateX(0deg); }
}
.pq-sticker__board { fill: var(--sim-series-2); stroke: var(--sim-border); stroke-width: 2; }
.pq-sticker__price { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); font-size: var(--sim-text-2xl); font-weight: 700; }
.pq-sticker__unit { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); font-size: var(--sim-text-sm); }
/* sim-lint-ignore token: --sim-ink-on-* is not a stylesheet token; applyToneInks() sets it per tone and theme, the only thing that can pick readable ink on the amber board in both themes. */
.pq-rupee { fill: var(--sim-ink-on-2, var(--sim-bg-deep)); }
.pq-basket { opacity: 0; transform: translateY(14px); transition: opacity .35s ease, transform .4s ease; }
${REVEAL('baskets', MAX_BASKETS)} { opacity: 1; transform: translateY(0); }
.pq-bunch ellipse { fill: var(--sim-series-3); stroke: color-mix(in oklab, var(--sim-series-3) 65%, black); stroke-width: 1.5; }
.pq-basket__box { fill: var(--sim-strata-1); stroke: var(--sim-strata-3); stroke-width: 2; }
/* A shade darker than the counter it stands on, so the heap reads as objects on
   the counter rather than as more counter. */
.pq-basket__front { fill: color-mix(in oklab, var(--sim-strata-2) 80%, black); stroke: var(--sim-strata-3); stroke-width: 2; }
.pq-counter__top { fill: var(--sim-strata-1); stroke: var(--sim-strata-2); stroke-width: 2; }
.pq-counter__front { fill: var(--sim-strata-2); stroke: var(--sim-strata-3); stroke-width: 2; }
.pq-readout__box { fill: var(--sim-bg-deep); stroke: var(--sim-accent); stroke-width: 2; }
.pq-readout__kg { fill: var(--sim-good); font-size: var(--sim-text-xl); font-weight: 700; }
/* The pavement: one line under the counter that the figures stand on. */
.pq-queue { display: flex; align-items: flex-end; gap: var(--sim-space-3); flex-wrap: wrap;
  border-top: 2px solid var(--sim-strata-2); margin-top: var(--sim-space-2); padding-top: var(--sim-space-2); }
.pq-queue__line { display: flex; align-items: flex-end; gap: 6px; flex: 1 1 auto; min-height: 30px; }
.pq-buyer { opacity: 0; transform: translateY(10px); transition: opacity .3s ease, transform .35s ease; }
${REVEAL('queue', MAX_BUYERS)} { opacity: 1; transform: translateY(0); }
.pq-buyer .sim-icon { width: 30px; height: 30px; display: block; }
.pq-tags { align-items: center; }
.pq-ask { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }
.pq-ask .sim-title { font-size: var(--sim-text-lg); margin: 0; flex: 1 1 auto; }
.pq-hint { animation: pq-pulse 1.8s ease-in-out infinite; }
@keyframes pq-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
/* Portrait: this 640-wide viewBox scales to about 0.6, so the SVG's own text is
   bumped here instead of being left under the 14px floor. */
.sim-dom-root--portrait .pq-sticker__price { font-size: 28px; }
.sim-dom-root--portrait .pq-sticker__unit { font-size: 17px; }
.sim-dom-root--portrait .pq-readout__kg { font-size: 28px; }
.sim-dom-root--portrait .pq-buyer .sim-icon { width: 24px; height: 24px; }
`;

export class PriceQueueScene extends DomSimulation {
  static WIDTH = 640;
  static HEIGHT = 630; // sim-layout: tallest interaction state (beat 2) is 626px
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 798; // sim-layout: portrait tallest state is 793px
  static FIT = true;
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }], // morning 1: the dear end, the heap stays whole
    [{ idx: 1, dwellMs: null }], // morning 2: the cheap end, the heap gone, the queue left
    [{ idx: 2, dwellMs: null }], // morning 3: the one middle sticker - the board is the learner's
  ];
  static ARIA_LABEL = "A vegetable stall through three market mornings: the price board on the awning reads 90, then 30, then 60 rupees per kilogram, while the baskets of greens on the counter shrink and a queue of buyers grows in front of the stall. On the last morning the learner can move the sticker themselves.";
  static CONTROLS = [
    {
      type: 'slider', id: 'sticker', label: 'Sticker price, rupees per kg',
      min: P_MIN, max: P_MAX, step: P_STEP, value: 60,
    },
  ];

  async setup() {
    await super.setup();
    this.price = MORNINGS[0];
    this._touched = false;
    this._celebrated = false;
    this.render({
      css: CSS,
      html: `<div class="sim-stack pq-stack">
        <div class="sim-row pq-head">
          <span class="sim-tag sim-tag--accent">vegetable stall</span>
          <span class="pq-record"></span>
        </div>
        <div class="sim-card pq-hero">
          ${stallSvg()}
          <div class="pq-queue">
            <span class="sim-tag pq-queue__label">buyers waiting</span>
            <div class="pq-queue__line">${QUEUE}</div>
          </div>
        </div>
        <div class="sim-row pq-tags">
          <span class="sim-tag pq-kg"></span>
          <span class="sim-tag pq-waiting"></span>
          <span class="sim-tag pq-outcome"></span>
        </div>
        <article class="sim-card sim-card--accent pq-ask-card" hidden>
          <div class="pq-ask"><span class="sim-q">?</span><h2 class="sim-title">What is special about that price?</h2><span class="sim-tag sim-tag--accent pq-hint">try another sticker</span></div>
        </article>
        <p class="sim-meta">One stall, 40 kg of greens each morning - one basket = 10 kg, one figure = one buyer</p>
        ${noteLineHtml([
          { text: "Only this slide's three prices are shown - a real market moves through many in a morning" },
          { text: 'the dear end with no takers at all is the slide\u2019s own picture, not every stall\u2019s' },
        ])}
      </div>`,
    });
    applyToneInks(this.root);
    this._hero = this.root.querySelector('.pq-hero');
    this._record = this.root.querySelector('.pq-record');
    this._price = this.root.querySelector('.pq-sticker__price');
    this._readout = this.root.querySelector('.pq-readout__kg');
    this._kg = this.root.querySelector('.pq-kg');
    this._waiting = this.root.querySelector('.pq-waiting');
    this._outcome = this.root.querySelector('.pq-outcome');
    this._ask = this.root.querySelector('.pq-ask-card');
    this._hint = this.root.querySelector('.pq-hint');
    this.onStep();
  }

  // The base class clamps the beat, sets this.stepIndex and root.dataset.step, then calls this.
  onStep() {
    // A beat IS its morning's sticker - the slide's own three prices. From the
    // last beat on, the learner's own sticker then stands until the next beat
    // (or mount) puts the morning's sticker back.
    this.price = MORNINGS[this.stepIndex];
    if (this._record) {
      this._record.innerHTML = simRecord(MORNINGS.map((_, i) => `morning ${i + 1}`), this.stepIndex, 'Morning');
    }
    if (this._ask) this._ask.hidden = this.stepIndex < MORNINGS.length - 1;
    this._paint();
    this.requestUiUpdate?.();
  }

  // The sticker is the slide's reveal on the first two mornings: hiding it there
  // keeps the beat (not the dial) doing the work.
  isControlHidden(id) {
    return id === 'sticker' && this.stepIndex < MORNINGS.length - 1;
  }

  onControlChange(id, v) {
    if (id !== 'sticker' || this.isControlHidden(id)) return;
    const steps = Math.round((Number(v) - P_MIN) / P_STEP);
    if (!Number.isFinite(steps)) return;
    this.price = Math.min(P_MAX, Math.max(P_MIN, P_MIN + steps * P_STEP));
    this._touched = true;
    if (this._hint) this._hint.hidden = true;
    this._paint();
    // The concept lands when the learner has parked the sticker where neither
    // heap nor queue is left - not when the beat arrived (which already shows
    // that sticker).
    const d = day(this.price);
    if (d.kgLeft === 0 && d.queue === 0 && !this._celebrated) {
      this._celebrated = true;
      if (this._hero) burst(this._hero);
    }
  }

  // The host draws the control at this value, so the board on the awning and the
  // control bar can never disagree.
  getControlValue(id) {
    if (id === 'sticker') return String(this.price);
    return undefined;
  }

  // The amber board's ink is the one thing the CSS cascade cannot decide.
  refreshTheme() {
    if (this.root) applyToneInks(this.root);
  }

  _paint() {
    const d = day(this.price);
    if (this.root.dataset.baskets !== String(d.baskets)) this.root.dataset.baskets = String(d.baskets);
    if (this.root.dataset.queue !== String(d.queue)) this.root.dataset.queue = String(d.queue);
    if (this.root.dataset.morning !== String(this.stepIndex)) this.root.dataset.morning = String(this.stepIndex);
    if (this._price) this._price.textContent = String(d.price);
    if (this._readout) this._readout.textContent = `${d.kgLeft} kg left`;
    if (this._kg) this._kg.textContent = `${d.kgLeft} kg on the counter`;
    if (this._waiting) this._waiting.textContent = `${d.queue} ${d.queue === 1 ? 'buyer' : 'buyers'} waiting`;
    if (this._outcome) {
      this._outcome.textContent = outcome(d);
      this._outcome.classList.toggle('sim-tag--accent', d.kgLeft === 0 && d.queue === 0);
    }
  }

  destroy() {
    this._hero = this._record = this._price = this._readout = null;
    this._kg = this._waiting = this._outcome = this._ask = this._hint = null;
    super.destroy();
  }
}