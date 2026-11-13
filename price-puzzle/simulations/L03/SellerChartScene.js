/**
 * SellerChartScene - Seller A's three prices as three points, joined into his supply curve SS'.
 *
 *   setup mount (blk-l03-s02, `role: "setup"`, no beats at all): the labelled plane, the three
 *      prices as plain chips, a "?" where the curve will be. Nothing to tap and no weight
 *      anywhere in the document - the predict prompt must not leak its own answer.
 *   0  "The verdict": the same plane, the three prices as live rows. Tap a row and its point
 *      lands with guide lines to both axes and its kg label beside it; the third point joins
 *      the three into SS', which is when the scene celebrates.
 *   1  "Why a dearer price means a bigger pile": anything not yet lit lights itself, and a
 *      takings card (price x kg, the slide's own "more rupees kept") sits under the curve.
 *   2  "Named, at last": the whole plane, SS and SS' named, and the rule chip "dearer means more".
 *
 * The surface is SimChart's frame (axesSvg lays out panel, ticks and titles; traceSvg draws
 * the line), so no pixel geometry is hand-placed. paint() is a pure function of state and the
 * only motion is one-shot CSS (sv-pop, sv-draw, the halo on an unlit row), so the scene has no
 * frame loop and comes to rest by itself.
 */
import { SvgScene, chip, stroke, cushionCircle, tone as T, inkVar } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg } from 'simulations/base/kit/SimChart.js';
import { esc } from 'simulations/base/SimUi.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';

// The slide's own sentence ("1 kg at Rs 50, 2 kg at Rs 100, 3 kg at Rs 150"), cross-checked
// against FIGURES.md Fig. 9.4b. `keeps` is [derived]: price x quantity, beat 1's own card.
const ROWS = [
  { price: 50, qty: 1, tone: 1, keeps: 50 },
  { price: 100, qty: 2, tone: 2, keeps: 200 },
  { price: 150, qty: 3, tone: 3, keeps: 450 },
];
// The line is drawn from the origin through all three points, exactly the source's own
// straight line in Fig. 9.4b; each axis runs a little past its last tick so the point and
// the SS' label beside it have room.
const AX = {
  x: { min: 0, max: 3.35, ticks: [0, 1, 2, 3], label: 'Quantity of mangoes (kg)' },
  y: { min: 0, max: 162, ticks: [0, 50, 100, 150], label: 'Price of mangoes (\u20b9)' },
};
const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);

const CSS = `
.scl-row { border: 0; cursor: pointer; }
.scl-row:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
/* The hint pulses as a halo, never as a transform: a moving box is what makes an automated
   click (or a tap on a laggy phone) miss the row it was aimed at. */
@keyframes scl-halo { 50% { box-shadow: 0 3px 0 var(--sim-stroke), 0 0 0 7px color-mix(in oklab, var(--sim-accent) 32%, transparent); } }
.scl-hint { animation: scl-halo 1.5s ease-in-out infinite; }
@keyframes scl-fade { from { opacity: 0; } to { opacity: 0.55; } }
.scl-guide { animation: scl-fade 0.45s ease-out both; }
@media (prefers-reduced-motion: reduce) { .scl-hint { animation: none; } }
`;

export class SellerChartScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL =
    'A price and quantity plane for mangoes. The price of mangoes in rupees runs up the side and the quantity in '
    + 'kilograms along the bottom. Three price rows, fifty, one hundred and one hundred and fifty rupees, each sit '
    + 'beside its own height on the price axis; tapping one plots that row\'s point with guide lines and joins the '
    + 'three points into an upward line labelled S S prime.';
  static CONTROLS = [];
  // Sized from sim-layout's measured worst case, not guessed: the plane is the same height on
  // every beat, and portrait beat 2 is the tallest because its two head chips wrap (696 px).
  static HEIGHT = 532;
  static PORTRAIT_HEIGHT = 700;

  constructor(container, config) {
    super(container, config);
    // The host hands over a beat count and never the slide, so the count IS the mount: the
    // setup mount never receives a beat. `setup` is the safe default (it promises nothing).
    this.mount = 'setup';
    this.lit = new Set();
    this._joined = false;
    this._pop = new Set();
    this._draw = false;
    this._hits = [];
  }

  css() { return CSS; }

  async setup() {
    await super.setup();
    // Keyboard parity for the price rows: the pointer path is hit-tested in pointerDown.
    this.root.addEventListener('keydown', (e) => {
      const el = e.target?.closest?.('[data-row]');
      if (!el || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      this._light(Number(el.dataset.row));
    });
  }

  stageHeight(st) { return st.portrait ? 552 : 430; }

  // The chart rect, and the centre of the price-row column in the margin beside it.
  areas(st) {
    const margin = st.portrait ? 76 : 96;
    return { chart: { x: 0, y: 0, w: st.W - margin, h: st.H }, cx: st.W - margin / 2 };
  }

  // One file, two mounts. A mount change is a different panel with a different promise, so
  // the points do not travel with it.
  onBeatChange(beat, count) {
    const prev = this.mount;
    this.mount = Number(count) === 0 ? 'setup' : 'reveal';
    if (prev !== this.mount) { this.lit = new Set(); this._joined = false; this._pop = new Set(); this._draw = false; }
    super.onBeatChange(beat, count);
  }

  // A step change re-owns only what it adds: the plane is the same picture throughout, so a
  // point the learner already plotted stays plotted.
  enter(step) {
    if (this.mount !== 'reveal') { this.lit = new Set(); this._joined = false; this._pop = new Set(); this._draw = false; return; }
    const added = [];
    ROWS.forEach((r, i) => { if (!this.lit.has(i)) { this.lit.add(i); added.push(i); } });
    this._pop = new Set(added);
    // Beat 0 is the learner's own; from beat 1 on the answer is on screen either way. The line
    // is drawn once, by whoever put the third point there.
    this._draw = !this._joined && (step >= 2 || this.lit.size === ROWS.length);
    if (this._draw) { this._joined = true; this.after(1, () => this.celebrate()); }
  }

  // One price row plotted. A row already plotted re-pops its point, so no chip is ever dead.
  _light(i) {
    if (this.mount !== 'reveal' || !ROWS[i]) return;
    const third = !this.lit.has(i) && this.lit.size + 1 === ROWS.length;
    this._pop.add(i);
    this.lit.add(i);
    if (third && !this._joined) { this._joined = true; this._draw = true; this.after(0.9, () => this.celebrate()); }
    this.repaint();
  }

  paint(st) {
    const step = this.stepIndex ?? 0;
    const live = this.mount === 'reveal';
    const A = this.areas(st);
    const f = chartFrame({ rect: A.chart, x: AX.x, y: AX.y });
    const p = f.plot;
    const pop = this._pop;
    const draw = this._draw;
    this._pop = new Set();
    this._draw = false;

    let svg = axesSvg(f).svg;

    if (!live) {
      // The predict mount: the shape is the question, so the plane carries nothing but a "?".
      svg += `<text x="${(p.x + p.w * 0.42).toFixed(1)}" y="${(p.y + p.h * 0.42).toFixed(1)}" text-anchor="middle"`
        + ` style="fill:var(--sim-label-muted);font-size:46px">?</text>`;
    } else {
      ROWS.forEach((r, i) => {
        if (!this.lit.has(i)) return;
        const X = f.px(r.qty), Y = f.py(r.price), c = T(r.tone);
        // Only the dot pops (a scaled path with no fill has a degenerate fill-box); the guide
        // lines just fade in. The guide is what the figure draws to place one pair of numbers.
        const g = pop.has(i) ? ' class="sv-pop" style="--d:0.05s"' : '';
        const gl = pop.has(i) ? ' class="scl-guide"' : '';
        // The kg label sits on whichever side of the dot still has panel left.
        const flip = X + 58 > A.chart.x + A.chart.w - 6;
        svg += `<path${gl} d="M${p.x.toFixed(1)} ${Y.toFixed(1)}H${X.toFixed(1)}V${(p.y + p.h).toFixed(1)}" ${stroke(c, 2.5, 'stroke-dasharray:7 7;opacity:0.55')}/>`
          + `<g${g}>${cushionCircle(X, Y, 9, c, { lift: 2 })}</g>`
          + `<text x="${(X + (flip ? -15 : 15)).toFixed(1)}" y="${(Y + 6).toFixed(1)}" text-anchor="${flip ? 'end' : 'start'}" style="fill:var(--sim-label);font-size:17px">${r.qty} kg</text>`;
        // Beat 1's own sentence as a number: the rupees this price leaves him with, above the
        // dot and to the left, where no guide line runs. [derived] price x quantity.
        if (step >= 1) svg += `<text x="${(X - 14).toFixed(1)}" y="${(Y - 13).toFixed(1)}" text-anchor="end" style="fill:var(--sim-label-muted);font-size:15px">\u20b9${r.keeps}</text>`;
      });

      if (this._joined) {
        // One straight line, origin to the top point: it passes through all three.
        svg += traceSvg(f, [{ x: 0, y: 0 }].concat(ROWS.map((r) => ({ x: r.qty, y: r.price }))), { tone: 'accent', width: 6, end: false, draw }).svg;
        // Named the way Fig. 9.5a names it: SS beside the line's low end, SS' above its middle.
        // Neither label sits on the evidence: the low end is the axis corner, so SS goes over
        // the line at half a kilo instead of onto the baseline.
        svg += `<text x="${f.px(0.5).toFixed(1)}" y="${(f.py(24) - 10).toFixed(1)}" text-anchor="middle" style="fill:var(--sim-label);font-size:18px">SS</text>`
          + `<text x="${(f.px(1.5)).toFixed(1)}" y="${(f.py(75) - 16).toFixed(1)}" text-anchor="middle" style="fill:var(--sim-label);font-size:18px">SS\u2032</text>`;
      }
    }

    // The three price rows: plain spans on the predict mount, live buttons on the verdict one.
    let over = ROWS.map((r, i) => {
      const y = f.py(r.price);
      const rupee = `\u20b9${r.price}`;
      if (!live) return `<span class="sv-chip sv-chip--sm sv-chip--plain" style="left:${A.cx.toFixed(1)}px;top:${y.toFixed(1)}px">${esc(rupee)}</span>`;
      const on = this.lit.has(i);
      const cls = ['sv-chip', 'sv-chip--sm', 'sv-hit', 'scl-row', on ? '' : 'sv-chip--plain scl-hint'].filter(Boolean).join(' ');
      const sty = on ? `--c:${T(r.tone)};--ci:${inkVar(r.tone)};` : '';
      return `<button type="button" class="${cls}" data-row="${i}" style="left:${A.cx.toFixed(1)}px;top:${y.toFixed(1)}px;${sty}"`
        + ` aria-label="${r.price} rupees a kilogram, ${r.qty} kg offered${on ? ' (plotted)' : ''}">${esc(rupee)}</button>`;
    }).join('');


    return { svg, over, head: this._headHtml(step, live) };
  }

  // The head is the promise of the current step: what to do, then what the model leaves out.
  _headHtml(step, live) {
    const allDone = this.lit.size === ROWS.length;
    let hint;
    if (!live) hint = chip('which way does it go?', 0, 0, { tone: 'plain', static: true });
    else if (step >= 2) hint = chip('dearer means more', 0, 0, { tone: 'accent', static: true })
      + chip("SS\u2032 = Seller A's supply curve", 0, 0, { tone: 'plain', static: true });
    // Beat 1's own words name what the small number beside each point is.
    else if (step === 1) hint = chip('rupees kept', 0, 0, { tone: 'plain', static: true });
    else hint = chip(allDone ? 'all three points on the plane' : 'tap a price row', 0, 0, { tone: allDone ? 'good' : 'plain', static: true });
    const note = noteLineHtml([{ text: 'three prices, one seller \u00b7 the line is drawn straight through them' }]);
    return hint + note;
  }

  // The rows are HTML on the overlay, so they are hit-tested from rects measured after the last
  // paint - never from hand-typed offsets.
  pointerDown(p) {
    for (const h of this._hits) {
      if (p.x >= h.x0 && p.x <= h.x1 && p.y >= h.y0 && p.y <= h.y1) { this._light(h.i); return true; }
    }
    return false;
  }

  repaint() {
    super.repaint();
    this._hits = [...this.root.querySelectorAll('[data-row]')].map((el) => {
      const r = el.getBoundingClientRect();
      const a = this.sv.point({ clientX: r.left, clientY: r.top });
      const b = this.sv.point({ clientX: r.right, clientY: r.bottom });
      return { i: Number(el.dataset.row), x0: a.x, y0: a.y, x1: b.x, y1: b.y };
    });
  }
}
