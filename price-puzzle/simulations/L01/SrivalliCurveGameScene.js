/**
 * SrivalliCurveGameScene - blk-l01-s06, the "Drop the Points Yourself" mini-game.
 *
 * A price-quantity plane with three price bands (Rs 150, Rs 100, Rs 50) and three quantity
 * ticks (1, 2, 3 kg). Three quantity chips wait in the tray; the learner drops each chip on the
 * price that takes it. A drop is accepted only when its quantity falls on the Law of Demand's
 * line at that price, so the whole board is one rule. When the third point lands, the line
 * DD' is drawn through the learner's own three points and the game is won.
 *
 * Tie level L2 - the win condition IS the concept's rule. `qtyFor()` is the Law of Demand
 * written once (the higher the price, the lower its rank among the prices, so the highest
 * price takes the smallest quantity), every refusal is that one test, and the win is then
 * re-checked on the plotted coordinates: three points, two equal slopes, and a slope that
 * falls. Nothing anywhere stores the three right pairs as a table, and no chip carries a
 * price, so a learner cannot win by matching labels - only by placing the inverse line.
 *
 * No timer anywhere, retries free and unpenalised: a refused chip bounces back, the band is
 * marked with the quantity it would not take, and the chip stays in the tray.
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { esc, simField, simRecord } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';
import { simPick } from 'simulations/base/kit/SimPick.js';

// -------------------------------------------------------------------- the model

/** The slide's own demand schedule, top band first. Nothing is added to it. */
const PRICES = [150, 100, 50];
const QTYS = [1, 2, 3];
/** The slide names the three plotted points A, B, C. */
const POINT_NAME = { 150: 'A', 100: 'B', 50: 'C' };

const rs = (n) => `\u20b9${n}`;

/**
 * The Law of Demand in one line: a price's rank among the plane's prices counts how many
 * prices stand above it, and the quantity it takes is the quantity of that rank in QTYS.
 * The highest price therefore takes the smallest quantity and the lowest the largest. This is
 * the only place the rule is written; every refusal and every placed point reads from it, so
 * no answer table exists anywhere in the file.
 */
function qtyFor(price) {
  const rank = PRICES.filter((p) => p > price).length;
  return QTYS[rank];
}

// The plane's own geometry, in the SVG's 740x430 viewBox so the drawing scales with its card.
// Every text size below is in the drawing's own units, not in CSS pixels: an SVG label shrinks
// with the drawing, and in portrait the plane is scaled to about 0.54. Sized this way the
// prices and quantities still read at 15-16 px there, which is why they are not 14-unit
// numbers. (The portrait shot is what caught this - at 16 units they came out at 8 px.)
const VB_W = 740;
const VB_H = 430;
const AX = 170; // the price axis
const AY = 352; // the quantity axis
const BAND_X = 178;
const BAND_W = 402;
const BAND_H = 80;
const BAND_STEP = 108;
const MARK_X = 600; // the column that holds a band's "not this quantity" marks
const MARK_W = 112;

const bandTop = (price) => 40 + PRICES.indexOf(price) * BAND_STEP;
const bandMid = (price) => bandTop(price) + BAND_H / 2;
const tickX = (qty) => 246 + QTYS.indexOf(qty) * 133;

// -------------------------------------------------------------------------- CSS

const CSS = SIM_LOOK_DOM_CSS + `
.vd-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }
.vd-head { display: flex; align-items: center; justify-content: space-between; gap: var(--sim-space-2); flex-wrap: wrap; }
.vd-title { margin: 0; font: 800 var(--sim-text-lg)/1.2 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.vd-row { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }
.vd-btn { padding: 8px 18px; border-radius: var(--sim-radius-pill); border: 2px solid var(--sim-stroke);
  background: var(--sim-bg-surface); color: var(--sim-label); font: 800 var(--sim-text-md)/1 var(--sim-font); cursor: pointer; }
.vd-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.vd-btn:hover { filter: brightness(1.1); }

/* ---- the plane: the hero ---- */
.vd-hero { display: grid; grid-template-columns: minmax(0, 1fr) 200px; gap: var(--sim-space-3); align-items: start; }
.vd-plane { display: block; width: 100%; height: auto; min-width: 0; }
.vd-side { display: flex; flex-direction: column; gap: var(--sim-space-2); align-items: stretch; }
.vd-fields { display: flex; flex-direction: column; gap: 6px; }
/* the verdict row is reserved whether or not there is a verdict, so the frame never jumps */
.vd-verdictrow { display: flex; align-items: center; justify-content: center; min-height: 30px; }
.vd-verdict { font: 800 var(--sim-text-md)/1 var(--sim-font); letter-spacing: 0.04em; white-space: nowrap;
  padding: 5px 12px; border-radius: var(--sim-radius-pill); background: var(--sim-good); color: var(--sim-bg-deep); }

/* ---- the tray ---- */
.vd-tray { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--sim-space-2); }
.vd-chip { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 4px 7px;
  border-radius: var(--sim-radius-md); border: 2px solid var(--sim-stroke); background: var(--sim-bg-surface);
  color: var(--sim-label); cursor: grab; box-shadow: 0 3px 0 color-mix(in oklab, var(--sim-stroke) 70%, var(--sim-bg-deep)); }
.vd-chip:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.vd-chip__art { display: block; width: 26px; height: 26px; }
.vd-chip__qty { font: 800 var(--sim-text-md)/1.15 var(--sim-font); }
.vd-chip__state { font: 700 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label-muted); letter-spacing: 0.06em; }
.vd-chip.is-placed { opacity: 0.45; cursor: default; box-shadow: none; }

/* ---- the foot ---- */
.vd-status { margin: 0; min-height: 56px; font: 700 var(--sim-text-sm)/1.35 var(--sim-font); color: var(--sim-label-muted); }
.vd-status.is-good { color: var(--sim-good); }
.vd-status.is-bad { color: var(--sim-bad); }

/* ---- the plane's own ink ---- */
/* every stroke-only path needs fill: none - an SVG path is filled black by default, and an
   open path filled as if closed draws a wedge across the plane */
.vd-grid { fill: none; stroke: color-mix(in oklab, var(--sim-stroke) 70%, transparent); stroke-width: 1; stroke-dasharray: 3 5; }
.vd-axis { fill: none; stroke: var(--sim-stroke); stroke-width: 2.4; stroke-linecap: round; }
/* The plane's labels are sized in the drawing's own units (see VB_W above), not in CSS
   pixels, so they still read in portrait where the plane scales to about half. */
.vd-tick { font: 700 26px/1 var(--sim-font); fill: var(--sim-label-muted); }
.vd-price { font: 800 30px/1 var(--sim-font); fill: var(--sim-label); }
.vd-axistitle { font: 800 24px/1 var(--sim-font); fill: var(--sim-label-muted); letter-spacing: 0.04em; }
/* the band's own tint is mixed from the stroke, not from bg-deep: bg-deep is nearly white in
   the light theme and the band would disappear into the card there */
.vd-band__box { fill: color-mix(in oklab, var(--sim-stroke) 14%, transparent); stroke: var(--sim-stroke);
  stroke-width: 1.6; stroke-dasharray: 6 6; }
.vd-band__hit { fill: transparent; }
.vd-band[data-filled="1"] .vd-band__box { fill: color-mix(in oklab, var(--sim-series-1) 12%, transparent);
  stroke: color-mix(in oklab, var(--sim-series-1) 55%, transparent); stroke-dasharray: none; }
.vd-band[data-state="refused"] .vd-band__box { stroke: var(--sim-bad); }
/* simPick's own armed/over cues are outlines, which an SVG group does not paint, so the two
   states are redrawn here from the same classes */
.vd-band.sim-pick--armed .vd-band__box { stroke: color-mix(in oklab, var(--sim-accent) 70%, transparent); }
.vd-band.sim-pick--over .vd-band__box { stroke: var(--sim-accent); stroke-width: 3;
  fill: color-mix(in oklab, var(--sim-accent) 14%, transparent); }
.vd-mark__box { fill: color-mix(in oklab, var(--sim-bad) 16%, var(--sim-bg-deep)); stroke: var(--sim-bad); stroke-width: 1.6; }
.vd-mark__text { font: 800 22px/1 var(--sim-font); fill: var(--sim-label); }
.vd-point { cursor: pointer; }
.vd-point__dot { fill: var(--sim-series-1); stroke: var(--sim-bg-deep); stroke-width: 2.5; }
.vd-point__ring { fill: none; stroke: color-mix(in oklab, var(--sim-series-1) 45%, transparent); stroke-width: 2; }
.vd-point__qty { font: 800 24px/1 var(--sim-font); fill: var(--sim-label); }
.vd-point:hover .vd-point__dot, .vd-point:focus-visible .vd-point__dot { fill: var(--sim-accent); }
.vd-point:focus-visible { outline: none; }
.vd-point:focus-visible .vd-point__ring { stroke: var(--sim-accent); stroke-width: 3; }
.vd-point--in { animation: vd-pop 340ms cubic-bezier(0.34, 1.56, 0.64, 1) both; transform-box: fill-box; transform-origin: center; }
@keyframes vd-pop { from { transform: scale(0.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.vd-line { fill: none; stroke: var(--sim-accent); stroke-width: 3.4; stroke-linecap: round; }
.vd-line--draw { animation: vd-draw 700ms ease both; }
@keyframes vd-draw { from { stroke-dashoffset: 260; } to { stroke-dashoffset: 0; } }
.vd-line__tag { font: 800 30px/1 var(--sim-font); fill: var(--sim-accent); }
@media (prefers-reduced-motion: reduce) {
  .vd-point--in, .vd-line--draw { animation: none; }
}

.sim-dom-root--portrait .vd-hero { grid-template-columns: minmax(0, 1fr); }
/* the kit drops a record to two columns in portrait, which is right for a record of names;
   these three steps are one letter each, so three columns fit and read better */
.sim-dom-root--portrait .vd-row .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.sim-dom-root--portrait .vd-head { flex-direction: column; align-items: stretch; }
.sim-dom-root--portrait .vd-row { justify-content: space-between; flex-wrap: nowrap; }
.sim-dom-root--portrait .vd-tray { grid-template-columns: repeat(3, minmax(0, 1fr)); }
`;

// ------------------------------------------------------------------- the drawing

/** The small mango each chip carries. It is the same glyph on all three, so it says nothing. */
function mangoSvg() {
  return (
    '<svg viewBox="0 0 26 26" aria-hidden="true">'
    + '<path d="M13 7 q3 -5 8 -4 q-1 5 -7 5 Z" fill="var(--sim-series-3)" />'
    + '<path d="M13 7 q-5 -2 -8 2 q3 3 8 1 Z" fill="color-mix(in oklab, var(--sim-series-3) 70%, var(--sim-bg-deep))" />'
    + '<path d="M13 8 q7 0 7 8 q0 7 -7 7 q-7 0 -7 -7 q0 -8 7 -8 Z" fill="var(--sim-series-2)" />'
    + '<path d="M13 8 q7 0 7 8 q0 2 -1 3 q-6 -2 -6 -11 Z" fill="color-mix(in oklab, var(--sim-series-2) 72%, var(--sim-bg-surface))" />'
    + '</svg>'
  );
}

/**
 * The whole plane: axes, grid, the three price bands as the drop targets, the learner's
 * points, and - only once the three points hold one falling line - the line through them.
 * The bands are drawn empty and unlabelled with any answer; the marks in the right-hand
 * column record only which quantities that band has already refused.
 */
function planeSvg(points, refused, holds) {
  let out =
    `<svg class="vd-plane" viewBox="0 0 ${VB_W} ${VB_H}" role="group" `
    + 'aria-label="A price and quantity plane: price of mangoes per kilogram on the vertical '
    + 'axis, quantity in kilograms on the horizontal one. Three price bands at 150, 100 and 50 '
    + 'rupees, each empty until a quantity is dropped on it.">';

  // grid: a dashed line through every tick, so a dropped point lands on a crossing
  for (const q of QTYS) {
    out += `<path class="vd-grid" d="M${tickX(q)} 36 V${AY}" />`;
  }
  for (const p of PRICES) {
    out += `<path class="vd-grid" d="M${AX} ${bandMid(p)} H${BAND_X + BAND_W}" />`;
  }
  // the two axes, and the price labels that name each band
  out += `<path class="vd-axis" d="M${AX} 32 V${AY} H${MARK_X + MARK_W + 12}" />`;
  for (const p of PRICES) {
    out += `<text class="vd-price" x="${AX - 12}" y="${bandMid(p) + 10}" text-anchor="end">${esc(rs(p))}</text>`;
  }
  // the quantity ticks
  for (const q of QTYS) {
    out += `<text class="vd-tick" x="${tickX(q)}" y="${AY + 30}" text-anchor="middle">${q} kg</text>`;
  }
  out += `<text class="vd-axistitle" x="${(BAND_X + BAND_W) / 2}" y="${AY + 62}" text-anchor="middle">QUANTITY (kg)</text>`;
  out += `<text class="vd-axistitle" transform="translate(48 ${bandMid(100)}) rotate(-90)" text-anchor="middle">PRICE (${esc(rs(''))} per kg)</text>`;
  out += `<path class="vd-grid" d="M${MARK_X - 8} 32 V${AY}" />`;

  // the three bands, each one drop target
  for (const p of PRICES) {
    const y = bandTop(p);
    const qty = points[p];
    const list = (refused[p] || []).slice().sort((a, b) => a - b);
    const state = qty !== undefined ? 'filled' : (list.length ? 'refused' : 'empty');
    const aria = qty !== undefined
      ? `${rs(p)} a kilogram takes ${qty} kilograms. Click the point to lift it.`
      : `${rs(p)} a kilogram, empty. ${list.length ? `It will not take ${list.join(' or ')} kilograms.` : ''}`;
    out +=
      `<g class="vd-band" data-bin="${p}" data-state="${state}" data-filled="${qty !== undefined ? 1 : 0}" `
      + `role="button" tabindex="0" aria-label="${esc(aria)}">`
      + `<rect class="vd-band__hit" x="${BAND_X}" y="${y}" width="${BAND_W}" height="${BAND_H}" rx="12" />`
      + `<rect class="vd-band__box" x="${BAND_X}" y="${y}" width="${BAND_W}" height="${BAND_H}" rx="12" />`
      + '</g>';
    // the refusals, in the column beside the band they happened on: one pill per pair, three
    // at most, stacked inside the band's own height
    for (let i = 0; i < list.length; i += 1) {
      const my = bandMid(p) - (list.length * 23) / 2 + i * 27;
      out +=
        `<g class="vd-mark">`
        + `<rect class="vd-mark__box" x="${MARK_X}" y="${my - 11.5}" width="${MARK_W}" height="23" rx="11" />`
        + `<text class="vd-mark__text" x="${MARK_X + MARK_W / 2}" y="${my + 8}" text-anchor="middle">not ${list[i]} kg</text>`
        + '</g>';
    }
  }

  // the learner's points, then the line through them once they hold one
  for (const p of PRICES) {
    const qty = points[p];
    if (qty === undefined) continue;
    const cx = tickX(qty);
    const cy = bandMid(p);
    out +=
      `<g class="vd-point vd-point--in" data-point="${p}" tabindex="0" role="button" `
      + `aria-label="${esc(`${POINT_NAME[p]}: ${rs(p)} a kilogram, ${qty} kilograms. Click to lift it`)}">`
      + `<circle class="vd-point__ring" cx="${cx}" cy="${cy}" r="19" />`
      + `<circle class="vd-point__dot" cx="${cx}" cy="${cy}" r="11" />`
      + `<text class="vd-point__qty" x="${cx + 22}" y="${cy - 15}">${qty} kg</text>`
      // one transparent hit rect over the dot and its label, so the whole group is grabbable
      + `<rect class="vd-point__hit" x="${cx - 22}" y="${cy - 22}" width="88" height="44" fill="transparent" />`
      + '</g>';
  }
  if (holds) {
    const a = PRICES[0];
    const b = PRICES[PRICES.length - 1];
    const x1 = tickX(points[a]);
    const y1 = bandMid(a);
    const x2 = tickX(points[b]);
    const y2 = bandMid(b);
    // run the line a little past both ends so it reads as a line, not as a segment
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ex = x1 - (dx / len) * 14;
    const ey = y1 - (dy / len) * 14;
    const fx = x2 + (dx / len) * 14;
    const fy = y2 + (dy / len) * 14;
    out +=
      `<path class="vd-line vd-line--draw" style="stroke-dasharray: 300;" `
      + `d="M${ex.toFixed(1)} ${ey.toFixed(1)} L${fx.toFixed(1)} ${fy.toFixed(1)}" />`
      + `<text class="vd-line__tag" x="${(ex - 8).toFixed(1)}" y="${(ey - 14).toFixed(1)}" text-anchor="end">DD'</text>`;
  }
  return out + '</svg>';
}

// ------------------------------------------------------------------------- scene

export class SrivalliCurveGameScene extends withChallenge(DomSimulation) {
  static WIDTH = 720;
  static HEIGHT = 670;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 930;
  static MIN_SCALE = 1;
  static ARIA_LABEL =
    'A price and quantity plane with three price bands at 150, 100 and 50 rupees a kilogram '
    + 'and three quantity chips - 1, 2 and 3 kilograms - in a tray below it. Drag or tap a '
    + 'chip onto the price that takes it; a chip that does not fit that price bounces back. '
    + 'Place all three points on one downward-sloping line to win.';
  static OBJECTIVE = {
    prompt: {
      en: 'Drop each of the three price levels onto its quantity on the plane. Win when the three '
        + 'points fall on one downward-sloping line - the Law of Demand itself.',
    },
  };
  /** The win needs all three points, exactly: value 3 of target 3. */
  static SCORING = { tolerance: 0 };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._points = {}; // price -> kg
    this._refused = {}; // price -> [kg, ...]
    this._status = { text: 'Drag a quantity chip onto the price that takes it.', tone: '' };
    this._gestureDropped = false;
  }

  // ---------------------------------------------------------------------- setup

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="vd-root" data-root>
          <div class="vd-head">
            <h2 class="vd-title">Drop the Points Yourself</h2>
            <div class="vd-row" data-headrow>
              <span data-record></span>
              <button type="button" class="vd-btn" data-act="reset">RESET</button>
            </div>
          </div>

          <div class="sim-card vd-hero">
            <span class="vd-planewrap" data-plane></span>
            <div class="vd-side">
              <span class="sim-tag sim-tag--accent">DEMAND SCHEDULE</span>
              <div class="vd-fields" data-fields></div>
              <div class="vd-verdictrow" data-verdictrow></div>
            </div>
          </div>

          <div class="sim-card">
            <div class="vd-tray" data-tray role="group" aria-label="The three quantity chips"></div>
          </div>

          <p class="vd-status" data-status role="status"></p>

          ${noteLineHtml([
            {
              text:
                'These three prices and quantities are Srivalli\u2019s own schedule from the lesson, not a '
                + 'dated market record: the board prints no date, no income and no shop, and every point '
                + 'on it is the learner\u2019s own placement.',
            },
          ])}
        </div>
      `,
    });

    // Every element a handler touches is built here, once. Nothing is created later and
    // nothing is set to null while a handler can still run.
    this._el = {
      root: this.root?.querySelector?.('[data-root]'),
      plane: this.root?.querySelector?.('[data-plane]'),
      fields: this.root?.querySelector?.('[data-fields]'),
      verdict: this.root?.querySelector?.('[data-verdictrow]'),
      tray: this.root?.querySelector?.('[data-tray]'),
      record: this.root?.querySelector?.('[data-record]'),
      status: this.root?.querySelector?.('[data-status]'),
    };

    this._pick = simPick(this.root, {
      items: '[data-item]',
      targets: '[data-bin]',
      canDrop: (itemId, targetId) => this._canDrop(itemId, targetId),
      onPick: (itemId) => this._onPick(itemId),
      onDrop: (itemId, targetId) => this._onDrop(itemId, targetId),
      announce: () => {},
    });

    // simPick consumes the selection inside its own handler, and its listeners are bound
    // first, so the gesture flag is what tells a real empty-handed tap from a drop attempt.
    this.root?.addEventListener?.('pointerdown', () => { this._gestureDropped = false; });
    this.root?.addEventListener?.('click', (e) => {
      const act = e.target?.closest?.('[data-act]')?.dataset?.act;
      if (act === 'reset') { this._reset(); return; }
      const pt = e.target?.closest?.('[data-point]');
      if (pt && !this._gestureDropped) this._onLift(Number(pt.dataset.point));
    });

    this._paintAll();
  }

  // -------------------------------------------------------------------- the drops

  /**
   * simPick calls this once per attempted drop, from `drop()`, before it hands over - so a
   * refusal is recorded here and the chip is put back by simPick's own cancel.
   */
  _canDrop(itemId, targetId) {
    const qty = Number(itemId);
    const price = Number(targetId);
    if (!QTYS.includes(qty) || !PRICES.includes(price)) return false;
    this._gestureDropped = true;
    if (this._points[price] !== undefined) {
      this._status = { text: 'That price already has a point. Click the point to lift it.', tone: 'bad' };
      this._paintStatus();
      return false;
    }
    if (qty !== qtyFor(price)) {
      // the mark says what this band will not take; the line says the rule and stops there
      const list = this._refused[price] || (this._refused[price] = []);
      if (!list.includes(qty)) list.push(qty);
      this._status = {
        text: `${rs(price)} a kilogram will not take ${qty} kg. Price and quantity move in opposite directions.`,
        tone: 'bad',
      };
      this._paintAll();
      return false;
    }
    return true;
  }

  _onPick(itemId) {
    this._status = { text: `${itemId} kg in hand. Now choose the price it belongs with.`, tone: '' };
    // Only the status line is repainted: re-rendering the tray would replace the node simPick
    // has just selected, and its MutationObserver would drop the selection.
    this._paintStatus();
  }

  _onDrop(itemId, targetId) {
    const qty = Number(itemId);
    const price = Number(targetId);
    this._gestureDropped = true;
    this._points[price] = qty;
    delete this._refused[price];
    const placed = this._placedCount();
    this._status = placed >= PRICES.length
      ? { text: "One line, sloping down. That is Srivalli's demand curve, DD'.", tone: 'good' }
      : { text: `${POINT_NAME[price]} placed: ${rs(price)} a kilogram, ${qty} kg. ${PRICES.length - placed} to go.`, tone: '' };
    this._paintAll();
    if (placed >= PRICES.length && this._lineHolds()) {
      this._status = { text: "One line, sloping down. That is Srivalli's demand curve, DD'.", tone: 'good' };
      burst(this._el?.plane, 34);
      // The wrapper's own commit control also calls evaluate(); both land on the same verdict.
      this.evaluate();
    }
  }

  /** Clicking a placed point lifts it and returns its chip to the tray. Retries are free. */
  _onLift(price) {
    if (this._points[price] === undefined) return;
    delete this._points[price];
    delete this._refused[price];
    this._status = { text: `Point ${POINT_NAME[price]} lifted. Its chip is back in the tray.`, tone: '' };
    this._paintAll();
  }

  _reset() {
    this._points = {};
    this._refused = {};
    this._status = { text: 'Drag a quantity chip onto the price that takes it.', tone: '' };
    this._pick?.cancel();
    this.resetChallenge();
    this._paintAll();
  }

  // -------------------------------------------------------------------- the line

  _placedCount() {
    return Object.keys(this._points).length;
  }

  /**
   * The win, tested on the plotted coordinates rather than on chip ids: the three points must
   * fall as the price rises, and the two slopes between them must be the same slope - one
   * line, sloping down. On this plane only Rs 150->1, Rs 100->2, Rs 50->3 satisfies it.
   */
  _lineHolds() {
    if (this._placedCount() !== PRICES.length) return false;
    const pts = PRICES
      .filter((p) => this._points[p] !== undefined)
      .sort((a, b) => b - a) // the highest price first
      .map((p) => ({ x: this._points[p], y: p }));
    const s0 = (pts[1].y - pts[0].y) / (pts[1].x - pts[0].x);
    const s1 = (pts[2].y - pts[1].y) / (pts[2].x - pts[1].x);
    if (!Number.isFinite(s0) || !Number.isFinite(s1)) return false;
    return s0 < 0 && Math.abs(s0 - s1) < 1e-9;
  }

  // ------------------------------------------------------------------- objective

  checkObjective() {
    const placed = this._placedCount();
    // Nothing to judge until at least one point is down.
    if (!placed) return null;
    return {
      value: placed,
      target: PRICES.length,
      hint: 'Price and quantity move in opposite directions.',
    };
  }

  // ----------------------------------------------------------------------- paint

  _paintAll() {
    if (!this._el?.plane) return;
    const holds = this._lineHolds();
    this._el.plane.innerHTML = planeSvg(this._points, this._refused, holds);
    this._paintSchedule(holds);
    this._paintTray();
    this._paintRecord();
    this._paintStatus();
  }

  _paintSchedule(holds) {
    // The band's own price is the label, not a sentence: the column is narrow and the price
    // alone is what the row is about.
    this._el.fields.innerHTML = PRICES
      .map((p) => simField(rs(p), this._points[p] === undefined ? null : `${this._points[p]} kg`))
      .join('');
    this._el.verdict.innerHTML = holds ? `<span class="vd-verdict">DD'</span>` : '';
  }

  _paintTray() {
    // All three chips stay on the board in every state: a placed one is dimmed, not removed,
    // so the tray is a fixed height and the frame never jumps under the learner's hand.
    this._el.tray.innerHTML = QTYS.map(
      (q) => `<button type="button" class="vd-chip${this._used(q) ? ' is-placed' : ''}" data-item="${q}"`
        + ` aria-disabled="${this._used(q) ? 'true' : 'false'}" `
        + `aria-label="${q} kilogram${this._used(q) ? ', already placed, click its point to lift it' : ', drag it onto the price that takes it'}">`
        + `<span class="vd-chip__art">${mangoSvg()}</span>`
        + `<span class="vd-chip__qty">${q} kg</span>`
        + `<span class="vd-chip__state">${this._used(q) ? 'PLACED' : 'DROP'}</span>`
        + '</button>'
    ).join('');
  }

  /** A quantity is spent once any band holds it; a lifted point frees its chip again. */
  _used(qty) {
    return PRICES.some((p) => this._points[p] === qty);
  }

  _paintRecord() {
    if (!this._el.record) return;
    const placed = this._placedCount();
    this._el.record.innerHTML = simRecord(
      PRICES.map((p) => POINT_NAME[p]),
      placed - 1,
      'Points placed'
    );
  }

  _paintStatus() {
    const el = this._el?.status;
    if (!el) return;
    el.className = `vd-status${this._status.tone ? ` is-${this._status.tone}` : ''}`;
    el.textContent = this._status.text;
  }

  destroy() {
    this._pick?.destroy();
    this._pick = null;
    super.destroy();
  }
}