/**
 * PricePuzzleScene - the chapter's closing hook (blk-l06-s09, 3 beats).
 *
 *   0  the season is over: the stall is empty, the crates are stacked, the crowd
 *      is a row of gone-marks and the signboard is still blank
 *   1  the board carries both plans - demand and supply named by their lesson,
 *      crossing at E with the guides to the chapter's own pair (12 kg, Rs 100) -
 *      and the referee's tag beside them is painted over
 *   2  the stall folds away and one card is left: the message, and the four
 *      questions to ask next time onion prices move
 *
 * Both curves are the quadratic through the chapter's own three market-table
 * rows (FIGURES.md Table 9.3, the same basis as L04's TwoCurvesScene), so the
 * two plans cross exactly at the chapter's equilibrium point. Nothing on the
 * board is a price the chapter has not printed: the referee's tag shows paint
 * and no digits, because the only worked referee number in the chapter belongs
 * to a medicine market (blk-l06-s02), not to this stall.
 *
 * Labels only - the prose is the slide's. No run is ever open: the only motion
 * is one-shot CSS (the two curves drawing on, the E dot popping, the chips).
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { esc } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';

const RUPEE = '\u20b9';

// The scene font (Nunito, else whatever the device has) has no U+20B9 on many
// systems - it renders as a tofu box - so the rupee sign is a drawn glyph and
// only the digits are text (the same shape L01's tags use).
const RUPEE_D = 'M3 5h12v2.8H3zM2 9.6h14v2.8H2zM7.2 3.2h3.1v11.4c0 3.2 1.5 4.8 5.3 4.8h3l-.9 2.9h-2.4c-5.1 0-8.1-2.9-8.1-7.7z';

// -- the chapter's mango market (Table 9.3) --------------------------------------
// Lagrange basis over the three measured prices, shared by both curves because
// both are sampled at the same three prices.
const L0 = (p) => ((p - 100) * (p - 150)) / 6600;
const L1 = (p) => ((p - 40) * (p - 150)) / -3000;
const L2 = (p) => ((p - 40) * (p - 100)) / 5500;
const wanted = (p) => 38 * L0(p) + 12 * L1(p) + 8 * L2(p);
const offered = (p) => 6 * L0(p) + 12 * L1(p) + 43 * L2(p);
const P_LO = 40;
const P_HI = 150;
const Q_MAX = 50;
const P_MAX = 160;

// -- the stall, in its own 620x400 units -----------------------------------------
const BOARD = { x: 34, y: 52, w: 552, h: 202 };
const PLOT = { x0: 116, x1: 556, y0: 76, y1: 188 };   // y0 = Rs160, y1 = Rs0
const px = (q) => PLOT.x0 + (q / Q_MAX) * (PLOT.x1 - PLOT.x0);
const py = (p) => PLOT.y1 - (p / P_MAX) * (PLOT.y1 - PLOT.y0);
const r1 = (n) => n.toFixed(1);

const MARKET_TAG = { x: 300 };
const REFEREE_TAG = { x: 500 };
const TAG = { y: 264, w: 150, h: 60 };

const CRATES = [
  { x: 46, y: 312 }, { x: 96, y: 312 },
  { x: 46, y: 290 }, { x: 96, y: 290 },
];
const CRATE_W = 46;
const CRATE_H = 22;
const GROUND = 378;

const CROWD = 9;   // gone-marks, [derived]: no slide counts a crowd

// The four questions the closing slide prints, split so each chip is one ask.
const QUESTIONS = [
  'demand: which way did it move',
  'supply: which way did it move',
  'what meets what at the stall now',
  'does anyone need the referee',
];

const PLANS = [
  { key: 'want', name: 'demand', role: "buyers' plan", tone: '1' },
  { key: 'offer', name: 'supply', role: "sellers' plan", tone: '8' },
];

// -- the board -------------------------------------------------------------------

/** One curve as a path: 27 samples across the chapter's measured price range. */
function curvePath(fn) {
  const n = 26;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const p = P_LO + ((P_HI - P_LO) * i) / n;
    return `${r1(px(fn(p)))},${r1(py(p))}`;
  });
  return `M${pts.join('L')}`;
}

function ticks() {
  let out = '';
  // The Rs100 tick is the guide's own height, so it is the one tick in label ink;
  // a second label beside it would only repeat the number.
  for (const p of [50, 100, 150]) {
    const y = r1(py(p));
    out += `<line class="pp-grid" x1="${PLOT.x0}" y1="${y}" x2="${PLOT.x1}" y2="${y}"/>`;
    out += `<text class="pp-tick${p === 100 ? ' pp-tick--hi' : ''}" x="${PLOT.x0 - 12}" y="${r1(py(p) + 8)}" text-anchor="end">${p}</text>`;
  }
  for (let q = 10; q <= Q_MAX; q += 10) {
    const x = r1(px(q));
    out += `<line class="pp-grid" x1="${x}" y1="${PLOT.y0}" x2="${x}" y2="${PLOT.y1}"/>`;
    out += `<text class="pp-tick" x="${x}" y="${PLOT.y1 + 26}" text-anchor="middle">${q}</text>`;
  }
  out += `<text class="pp-tick" x="${PLOT.x0 - 12}" y="${r1(py(0) + 8)}" text-anchor="end">0</text>`;
  return out;
}

// The axis title sits under the tick row at the right, not centred under the
// whole axis: centred, its box meets the tick labels' boxes at any scale.
function axes() {
  return `
    <line class="pp-axis" x1="${PLOT.x0}" y1="${PLOT.y0}" x2="${PLOT.x0}" y2="${PLOT.y1}"/>
    <line class="pp-axis" x1="${PLOT.x0}" y1="${PLOT.y1}" x2="${PLOT.x1}" y2="${PLOT.y1}"/>
    <text class="pp-axtitle" x="${PLOT.x1}" y="${PLOT.y1 + 54}" text-anchor="end">mangoes (kg)</text>
    <text class="pp-axtitle" transform="translate(${PLOT.x0 - 62} ${r1((PLOT.y0 + PLOT.y1) / 2)}) rotate(-90)"
      text-anchor="middle">price (${RUPEE}) per kg</text>`;
}

/** Both plans on the board: the two curves, where they meet, and the guides. */
function plots() {
  const ex = r1(px(12));
  const ey = r1(py(100));
  let out = ticks() + axes();
  out += `<path class="pp-curve pp-curve--want" pathLength="100" d="${curvePath(wanted)}"/>`;
  out += `<path class="pp-curve pp-curve--offer" pathLength="100" d="${curvePath(offered)}"/>`;
  // The source's own end labels (Fig. 9.7): DM on the demand tip, SM on the supply tip.
  out += `<text class="pp-dm pp-dm--want" x="${r1(px(wanted(P_HI)) - 8)}" y="${r1(py(P_HI) - 14)}" text-anchor="end">DM</text>`;
  out += `<text class="pp-dm pp-dm--offer" x="${r1(px(offered(P_LO)) - 8)}" y="${r1(py(P_LO) - 14)}" text-anchor="end">SM</text>`;
  // The dashed guides to the chapter's own pair, and E where the two plans match.
  // The quantity reading sits inside the plot at the foot of its own guide: the
  // tick row below the axis belongs to the axis.
  out += `<g class="pp-pop">
    <line class="pp-guide" x1="${PLOT.x0}" y1="${ey}" x2="${ex}" y2="${ey}"/>
    <line class="pp-guide" x1="${ex}" y1="${ey}" x2="${ex}" y2="${PLOT.y1}"/>
    <circle class="pp-e" cx="${ex}" cy="${ey}" r="9"/>
    <text class="pp-e__lab" x="${r1(px(12) + 18)}" y="${r1(py(100) - 14)}">E</text>
    <text class="pp-tick pp-tick--hi" x="${r1(px(12) + 14)}" y="${PLOT.y1 - 12}" text-anchor="start">12 kg</text>
  </g>`;
  return out;
}

/** Beat 0: the signboard waiting - an empty frame and the question mark. */
function blankBoard() {
  return `<g class="pp-blank">
    <rect class="pp-blank__box" x="${PLOT.x0}" y="${PLOT.y0}" width="${PLOT.x1 - PLOT.x0}" height="${PLOT.y1 - PLOT.y0}" rx="8"/>
    <text class="pp-blank__q" x="${r1((PLOT.x0 + PLOT.x1) / 2)}" y="${r1((PLOT.y0 + PLOT.y1) / 2 + 24)}">?</text>
  </g>`;
}

function marketTag() {
  const x0 = Math.round(MARKET_TAG.x - (TAG.w + 10) / 2);
  return `<g class="pp-tag" aria-label="The market's own tag: one hundred rupees per kg, where the two plans meet.">
    <line class="pp-string" x1="${MARKET_TAG.x}" y1="${BOARD.y + BOARD.h}" x2="${MARKET_TAG.x}" y2="${TAG.y}"/>
    <rect class="pp-tag__board" x="${MARKET_TAG.x - TAG.w / 2}" y="${TAG.y}" width="${TAG.w}" height="${TAG.h}" rx="8"/>
    <path class="pp-rupee" transform="translate(${x0} ${TAG.y + 6}) scale(1.05)" d="${RUPEE_D}"/>
    <text class="pp-price" x="${x0 + 40}" y="${TAG.y + 42}">100</text>
    <text class="pp-unit" x="${MARKET_TAG.x + 30}" y="${TAG.y + 36}">per kg</text>
  </g>`;
}

// Paint, not a figure: the digits this tag once carried are the chapter's to
// print and are not on any mango stall, so what the learner sees is the paint.
function refereeTag() {
  const y = TAG.y;
  return `<g class="pp-tag" aria-label="The referee's tag, painted over at the season's end.">
    <line class="pp-string" x1="${REFEREE_TAG.x}" y1="${BOARD.y + BOARD.h}" x2="${REFEREE_TAG.x}" y2="${y}"/>
    <rect class="pp-tag__board" x="${REFEREE_TAG.x - TAG.w / 2}" y="${y}" width="${TAG.w}" height="${TAG.h}" rx="8"/>
    <line class="pp-paint" x1="${REFEREE_TAG.x - 54}" y1="${y + 20}" x2="${REFEREE_TAG.x + 54}" y2="${y + 20}"/>
    <text class="pp-painted" x="${REFEREE_TAG.x}" y="${y + 52}" text-anchor="middle">painted over</text>
  </g>`;
}

function crate({ x, y }) {
  return `<g class="pp-crate">
    <rect x="${x}" y="${y}" width="${CRATE_W}" height="${CRATE_H}" rx="3"/>
    <line x1="${x}" y1="${y + CRATE_H / 2}" x2="${x + CRATE_W}" y2="${y + CRATE_H / 2}"/>
  </g>`;
}

function stallSvg() {
  const stripes = [0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<rect class="${i % 2 ? 'pp-stripe pp-stripe--alt' : 'pp-stripe'}" x="${i * 77.5}" y="0" width="77.5" height="38"/>`)
    .join('');
  return `<svg class="pp-svg" viewBox="0 0 620 ${GROUND + 8}" role="img"
      aria-label="One mango stall at the season's end: the counter is bare with its crates stacked, an empty signboard hangs above it, and two price tags hang under the board - the market's own tag and the referee's tag painted over.">
    <g class="pp-awning">${stripes}<rect class="pp-awning__lip" x="0" y="38" width="620" height="6"/></g>
    <rect class="pp-post" x="12" y="44" width="14" height="${GROUND - 44}"/>
    <rect class="pp-post" x="594" y="44" width="14" height="${GROUND - 44}"/>
    <g class="pp-board">
      <rect class="pp-board__face" x="${BOARD.x}" y="${BOARD.y}" width="${BOARD.w}" height="${BOARD.h}" rx="10"/>
      ${blankBoard()}
      <g class="pp-plots">${plots()}</g>
    </g>
    ${marketTag()}
    ${refereeTag()}
    ${CRATES.map(crate).join('')}
    <rect class="pp-counter__top" x="34" y="334" width="552" height="14" rx="3"/>
    <rect class="pp-counter__front" x="42" y="348" width="536" height="${GROUND - 348}" rx="4"/>
    <line class="pp-counter__front" x1="220" y1="348" x2="220" y2="${GROUND}"/>
    <line class="pp-counter__front" x1="420" y1="348" x2="420" y2="${GROUND}"/>
    <line class="pp-ground" x1="20" y1="${GROUND}" x2="600" y2="${GROUND}"/>
  </svg>`;
}

const CSS = SIM_LOOK_DOM_CSS + `
.pp-stack { gap: var(--sim-space-2); }
.pp-hero .pp-svg { display: block; width: 100%; height: auto; }
.pp-svg text { font-family: inherit; }
.pp-awning .pp-stripe { fill: var(--sim-series-2); }
.pp-awning .pp-stripe--alt { fill: color-mix(in oklab, var(--sim-series-2) 72%, black); }
.pp-awning__lip { fill: color-mix(in oklab, var(--sim-series-2) 55%, black); }
.pp-post { fill: var(--sim-series-8); }
.pp-board__face { fill: var(--sim-surface-raised); stroke: var(--sim-border); stroke-width: 2; }
.pp-grid { stroke: var(--sim-stroke); stroke-width: 1.5; opacity: .3; }
.pp-axis { stroke: var(--sim-label-muted); stroke-width: 3; stroke-linecap: round; }
.pp-tick { fill: var(--sim-label-muted); font-size: 24px; }
.pp-tick--hi { fill: var(--sim-label); font-weight: 700; }
.pp-axtitle { fill: var(--sim-label-muted); font-size: 24px; }
.pp-guide { stroke: var(--sim-series-1); stroke-width: 2.5; stroke-dasharray: 9 7; opacity: .75; }
.pp-e { fill: var(--sim-warning); stroke: var(--sim-bg-surface); stroke-width: 3; }
.pp-e__lab { fill: var(--sim-label); font-size: 24px; font-weight: 700; }
.pp-dm { font-size: 24px; font-weight: 700; }
.pp-dm--want { fill: var(--sim-series-1); }
.pp-dm--offer { fill: var(--sim-series-8); }
.pp-curve { fill: none; stroke-width: 6; stroke-linecap: round; stroke-dasharray: 100; }
/* Each curve keeps its own hue but is mixed toward the label ink, so it reads on
   the board's raised face in the dark theme without a new token. */
.pp-curve--want { stroke: color-mix(in oklab, var(--sim-series-1) 70%, var(--sim-label)); }
.pp-curve--offer { stroke: color-mix(in oklab, var(--sim-series-8) 82%, var(--sim-label)); }
.pp-curve.is-lit { stroke-width: 10; }
.pp-curve.is-off { opacity: .28; }
/* The board draws its curves on once, when the beat that owns them arrives.
   Beat 0's board is the blank frame: the plans are not on it yet. */
@keyframes pp-draw { to { stroke-dashoffset: 0; } }
.pp-plots .pp-curve { animation: pp-draw .9s ease-out both; }
@keyframes pp-pop { from { opacity: 0; } to { opacity: 1; } }
.pp-pop { animation: pp-pop .35s ease-out .7s both; }
[data-step="0"] .pp-plots { display: none; }
[data-step="1"] .pp-blank { display: none; }
.pp-blank__box { fill: none; stroke: var(--sim-stroke); stroke-width: 2.5; stroke-dasharray: 10 8; }
.pp-blank__q { fill: var(--sim-label-muted); font-size: 64px; font-weight: 700; text-anchor: middle; }
.pp-string { stroke: var(--sim-stroke); stroke-width: 2; }
.pp-tag__board { fill: var(--sim-surface-raised); stroke: var(--sim-border); stroke-width: 2; }
.pp-price { fill: var(--sim-label); font-size: 30px; font-weight: 700; }
.pp-rupee { fill: var(--sim-label); }
.pp-unit { fill: var(--sim-label-muted); font-size: 20px; }
.pp-paint { stroke: var(--sim-label-muted); stroke-width: 22; stroke-linecap: round; }
.pp-painted { fill: var(--sim-label); font-size: 20px; font-weight: 700; }
.pp-crate rect { fill: var(--sim-strata-1); stroke: var(--sim-strata-2); stroke-width: 2; }
.pp-crate line { stroke: var(--sim-strata-2); stroke-width: 2; }
.pp-counter__top { fill: var(--sim-strata-1); stroke: var(--sim-strata-2); stroke-width: 2; }
.pp-counter__front { fill: var(--sim-strata-2); stroke: var(--sim-strata-3); stroke-width: 2; }
.pp-counter__front line { stroke: var(--sim-strata-3); stroke-width: 2; opacity: .7; }
.pp-ground { stroke: var(--sim-stroke); stroke-width: 2; opacity: .5; }

.pp-plans { gap: var(--sim-space-2); }
/* Both chip rows are real buttons, and a button takes the UA's own colour and
   face unless the scene says otherwise - hence the explicit ink and surface. */
.pp-plan, .pp-q { font: inherit; font-size: var(--sim-text-md); color: var(--sim-label);
  background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-pill);
  padding: 6px 12px; cursor: pointer; text-align: left; }
.pp-plan--want { border-color: var(--sim-series-1); }
.pp-plan--offer { border-color: var(--sim-series-8); }
.pp-plan.is-on { background: color-mix(in oklab, var(--sim-series-1) 22%, var(--sim-bg-surface)); }
.pp-plan--offer.is-on { background: color-mix(in oklab, var(--sim-series-8) 22%, var(--sim-bg-surface)); }
.pp-dots { display: flex; gap: 7px; }
.pp-dot { width: 10px; height: 10px; border-radius: 999px; background: var(--sim-label-muted); opacity: .45; }
.pp-ask { margin: var(--sim-space-1) 0 var(--sim-space-2); font-size: var(--sim-text-md); color: var(--sim-label-muted); }
.pp-qs { display: flex; flex-wrap: wrap; gap: var(--sim-space-2); }
.pp-q.is-on { background: color-mix(in oklab, var(--sim-good) 24%, var(--sim-bg-surface)); border-color: var(--sim-good); }
@media (prefers-reduced-motion: reduce) {
  .pp-plots .pp-curve, .pp-pop { animation: none; }
}
`;

const HTML = `<div class="sim-stack pp-stack">
  <div class="sim-row pp-top" data-top>
    <span class="sim-tag sim-tag--accent">season: over</span>
    <span class="sim-tag">mangoes sold</span>
    <span class="pp-dots" aria-hidden="true">${Array.from({ length: CROWD }, () => '<span class="pp-dot"></span>').join('')}</span>
    <span class="sim-tag">crowd gone</span>
  </div>
  <div class="sim-card pp-hero" data-hero>${stallSvg()}</div>
  <div class="sim-row pp-plans" data-plans hidden>
    ${PLANS.map((p) => `<button type="button" class="pp-plan pp-plan--${p.key}" data-plan="${p.key}"
      aria-pressed="false" aria-label="Show the ${p.name} curve alone: the ${p.role}.">
      <span class="sim-tag sim-tag--accent">${esc(p.name)}</span> ${esc(p.role)}
    </button>`).join('')}
  </div>
  <article class="sim-card pp-close" data-close hidden>
    <h2 class="sim-title pp-msg">A price is a message, not a mystery</h2>
    <p class="pp-ask">Next onion season, ask:</p>
    <div class="pp-qs">
      ${QUESTIONS.map((q, i) => `<button type="button" class="pp-q" data-q="${i}" aria-pressed="false">${esc(q)}</button>`).join('')}
    </div>
  </article>
  ${noteLineHtml([
    { text: `Model: the chapter's own mango table, ${RUPEE}40 / ${RUPEE}100 / ${RUPEE}150 a kg, and its two plans meet at ${RUPEE}100 a kg. The referee's figure is shown only as paint.` },
  ])}
</div>`;

export class PricePuzzleScene extends DomSimulation {
  static WIDTH = 680;
  // sim-layout's measured worst state over every beat and both orientations
  // (the lit plan chips on beat 1 included): 568 landscape, 496 portrait.
  static HEIGHT = 568;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 496;
  static FIT = true;               // beat 2 is one card where beats 0-1 are a stall: the frame is the content
  static BEAT_STEP_MAP = [
    [{ idx: 0, dwellMs: null }],    // the stall at season's end, the signboard waiting
    [{ idx: 1, dwellMs: null }],    // both plans on the board, the referee's tag painted over
    [{ idx: 2, dwellMs: null }],    // the closing card and its four questions
  ];
  static ARIA_LABEL =
    'One mango stall at the season of its end: the counter bare with its crates stacked, an empty signboard above it and two tags under the board. '
    + 'The board then carries both plans - demand falling and supply rising, crossing at E, twelve kilos at one hundred rupees a kilo - '
    + 'and the referee\'s tag beside them is painted over. Tapping a plan name shows that plan alone. '
    + 'The last beat leaves one card: a price is a message, not a mystery, and the four questions to ask next onion season.';
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._lit = { want: false, offer: false };
    this._cheeredPlans = false;
    this._asked = QUESTIONS.map(() => false);
    this._cheeredAsk = false;
  }

  async setup() {
    await super.setup();
    this.render({ css: CSS, rootClass: 'sl-backdrop', html: HTML });

    this._hero = this.root?.querySelector?.('[data-hero]');
    this._top = this.root?.querySelector?.('[data-top]');
    this._plans = this.root?.querySelector?.('[data-plans]');
    this._close = this.root?.querySelector?.('[data-close]');
    this._want = this.root?.querySelector?.('.pp-curve--want');
    this._offer = this.root?.querySelector?.('.pp-curve--offer');

    // One delegated listener: a tap anywhere on a chip does the same thing, and
    // a real <button> already answers Enter and Space.
    this.root?.addEventListener?.('click', (ev) => {
      const plan = ev.target?.closest?.('[data-plan]');
      if (plan) {
        this._tapPlan(plan.dataset.plan);
        return;
      }
      const q = ev.target?.closest?.('[data-q]');
      if (q) this._tapAsk(Number(q.dataset.q));
    });

    this.onStep();
    this._paint();
  }

  // DomSimulation's declarative default clamps the beat, sets stepIndex and
  // root.dataset.step (the board's own CSS keys off it), then calls this.
  onStep() {
    const s = this.stepIndex ?? 0;
    // Beat 2 folds the stall away: the header, the hero and the plan chips all go,
    // so the closing card never shares height with the board.
    if (this._top) this._top.hidden = s >= 2;
    if (this._hero) this._hero.hidden = s >= 2;
    if (this._plans) this._plans.hidden = s !== 1;
    if (this._close) this._close.hidden = s < 2;
  }

  _tapPlan(key) {
    if (key !== 'want' && key !== 'offer') return;
    if (this._close && !this._close.hidden) return;   // the card owns the last beat
    this._lit[key] = !this._lit[key];
    this._paint();
    // The concept, not a press: the moment both plans are named at once, this
    // price is the line two plans send. Once.
    if (this._lit.want && this._lit.offer && !this._cheeredPlans) {
      this._cheeredPlans = true;
      burst(this._hero, 26);
    }
  }

  _tapAsk(i) {
    if (!Number.isInteger(i) || i < 0 || i >= QUESTIONS.length) return;
    this._asked[i] = !this._asked[i];
    this._paint();
    if (this._asked.every(Boolean) && !this._cheeredAsk) {
      this._cheeredAsk = true;
      burst(this._close, 26);
    }
  }

  _paint() {
    for (const p of PLANS) {
      const btn = this.root?.querySelector?.(`[data-plan="${p.key}"]`);
      if (!btn) continue;
      btn.classList.toggle('is-on', !!this._lit[p.key]);
      btn.setAttribute('aria-pressed', String(!!this._lit[p.key]));
    }
    // One plan named: that curve thickens and the other steps back, so the two
    // voices of the chapter never read as one line.
    const other = (k) => (this._lit.want && this._lit.offer ? false : !this._lit[k]);
    this._want?.classList?.toggle('is-lit', !!this._lit.want);
    this._offer?.classList?.toggle('is-lit', !!this._lit.offer);
    this._want?.classList?.toggle('is-off', other('want'));
    this._offer?.classList?.toggle('is-off', other('offer'));
    this._asked.forEach((on, i) => {
      const b = this.root?.querySelector?.(`[data-q="${i}"]`);
      if (!b) return;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  // Nothing to wait for: the only motion is each curve's one-shot draw-on and burst().
  busy() {
    return false;
  }

  destroy() {
    this._hero = this._top = this._plans = this._close = this._want = this._offer = null;
    super.destroy();
  }
}