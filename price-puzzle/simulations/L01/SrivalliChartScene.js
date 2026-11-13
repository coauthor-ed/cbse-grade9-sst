/**
 * SrivalliChartScene - her demand schedule as three points, joined into the curve DD'.
 * Beats 0-2 of blk-l01-s04 ("From a List to a Curve").
 *
 *   0  the price-quantity plane, empty; three schedule rows stand in the margin as
 *      tappable chips - tap one and its point lands with guide lines to both axes
 *   1  all three points A, B, C on the plane (rows not yet tapped are plotted here)
 *   2  the joined segment, drawn on, labelled D at the A end and D' at the C end
 *
 * The surface is SimChart's SVG chart frame (axesSvg lays out panel, ticks and titles,
 * traceSvg draws the line); no hand-placed pixel geometry. State is three booleans
 * (`plotted`); one-shot animations are queued in `_pop`/`_draw` and consumed by the
 * next paint, so a repaint never restarts a finished animation and the scene has no
 * per-frame code at all.
 */
import { SvgScene, chip, stroke, cushionCircle, tone as T, inkVar } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg } from 'simulations/base/kit/SimChart.js';
import { esc } from 'simulations/base/SimUi.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';

// The slide's own table (FIGURES.md Fig. 9.2): price per kg on y, quantity in kg on x.
const ROWS = [
  { key: 'A', price: 150, qty: 1, tone: 1 },
  { key: 'B', price: 100, qty: 2, tone: 2 },
  { key: 'C', price: 50, qty: 3, tone: 3 },
];
const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
// Axis ends sit a little past the last tick so the topmost point and the letter beside
// the rightmost one have room; every tick is where the slide puts it.
const AX = {
  x: { min: 0, max: 3.3, ticks: [0, 1, 2, 3], label: 'Quantity of mangoes (kg)' },
  y: { min: 0, max: 160, ticks: [0, 50, 100, 150], label: 'Price of mangoes (\u20b9)' },
};
const CSS = `
.sc-row { border: 0; cursor: pointer; }
.sc-row:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
/* The hint pulses as a halo, not a transform: a moving box is what makes an automated
   click (and a learner on a laggy phone) fight the chip. */
@keyframes sc-pulse { 50% { box-shadow: 0 3px 0 var(--sim-stroke), 0 0 0 7px color-mix(in oklab, var(--sim-accent) 35%, transparent); } }
.sc-pulse { animation: sc-pulse 1.4s ease-in-out infinite; }
/* The guide lines fade to the same 0.55 the stroke() call sets inline. */
@keyframes sc-fade { from { opacity: 0; } to { opacity: 0.55; } }
.sc-guide { animation: sc-fade 0.45s ease-out both; }
@media (prefers-reduced-motion: reduce) { .sc-pulse { animation: none; } }
`;

export class SrivalliChartScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = "A price and quantity plane for mangoes: three rows of Srivalli's demand schedule as tappable chips, each plotting one point with guide lines, and the three points joined into a downward-sloping demand curve.";
  static CONTROLS = [];
  // Sized from sim-layout's measured worst case (540 landscape, 681 portrait), not guessed.
  static HEIGHT = 544;
  static PORTRAIT_HEIGHT = 688;

  css() { return CSS; }

  // Keyboard parity for the row chips: the pointer path is hit-tested in pointerDown.
  async setup() {
    await super.setup();
    this.root.addEventListener('keydown', (e) => {
      const el = e.target?.closest?.('[data-row]');
      if (!el || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      this._plot(Number(el.dataset.row));
    });
  }

  stageHeight(st) { return st.portrait ? 552 : 430; }

  // Chart rect and the row-chip column, per orientation.
  areas(st) {
    return st.portrait
      ? { chart: { x: 0, y: 0, w: st.W, h: 356 }, cx: st.W / 2, y0: 396, dy: 48 }
      : { chart: { x: 0, y: 0, w: st.W - 176, h: st.H }, cx: st.W - 88, y0: 92, dy: 54 };
  }

  // A step change re-owns the scene: beat 0 starts empty, beat 1 plots whatever the
  // learner has not plotted yet, beat 2 queues the one-shot draw of the line. Points
  // already plotted survive (they are the same scene, not a fresh lesson).
  enter(step) {
    this._hits = [];
    const added = [];
    if (step === 0) this.plotted = new Set();          // beat 0 is empty: the learner plots
    else ROWS.forEach((r, i) => { if (!this.plotted.has(i)) { this.plotted.add(i); added.push(i); } });
    this._pop = new Set(added);
    this._draw = step >= 2;
    if (step >= 2) this.after(1, () => this.celebrate());
  }

  // One schedule row plotted. A row already plotted re-pops its point, so the chip is
  // never dead.
  _plot(i) {
    if (!Number.isInteger(i) || !ROWS[i]) return;
    this._pop.add(i);
    if (!this.plotted.has(i) && this.plotted.size + 1 === 3) this.after(0.4, () => this.celebrate());
    this.plotted.add(i);
    this.repaint();
  }

  paint(st) {
    const step = this.stepIndex ?? 0;
    const A = this.areas(st);
    const f = chartFrame({ rect: A.chart, x: AX.x, y: AX.y });
    const pop = this._pop;
    const draw = this._draw;
    this._pop = new Set();
    this._draw = false;

    let svg = axesSvg(f).svg;
    ROWS.forEach((r, i) => {
      if (!this.plotted.has(i)) return;
      const X = f.px(r.qty), Y = f.py(r.price), c = T(r.tone);
      // Only the dot pops (a scaled path with no fill has a degenerate fill-box); the
      // guide lines just fade in.
      const g = pop.has(i) ? ' class="sv-pop" style="--d:0.05s"' : '';
      const gl = pop.has(i) ? ' class="sc-guide"' : '';
      // Guide lines to both axes: what you draw on graph paper to place one pair.
      svg += `<path${gl} d="M${f.plot.x.toFixed(1)} ${Y.toFixed(1)}H${X.toFixed(1)}V${(f.plot.y + f.plot.h).toFixed(1)}" ${stroke(c, 2.5, 'stroke-dasharray:7 7;opacity:0.55')}/>`
        + `<g${g}>${cushionCircle(X, Y, 9, c, { lift: 2 })}</g>`
        + `<text x="${(X + 15).toFixed(1)}" y="${(Y + 7).toFixed(1)}" style="fill:var(--sim-label);font-size:18px">${r.key}</text>`;
    });

    // Beat 2: one line through A, B and C, its two ends named.
    if (step >= 2) {
      svg += traceSvg(f, ROWS.map((r) => ({ x: r.qty, y: r.price })), { tone: 'accent', width: 6, end: false, draw }).svg;
      const a = ROWS[0], b = ROWS[2];
      svg += `<text x="${(f.px(a.qty) - 14).toFixed(1)}" y="${(f.py(a.price) - 14).toFixed(1)}" text-anchor="end" style="fill:var(--sim-label);font-size:18px">D</text>`
        + `<text x="${(f.px(b.qty) + 15).toFixed(1)}" y="${(f.py(b.price) + 34).toFixed(1)}" style="fill:var(--sim-label);font-size:18px">D\u2032</text>`;
    }

    // The schedule, as three live chips: unplotted rows pulse, plotted ones take their
    // point's tone and gain the letter.
    let over = ROWS.map((r, i) => {
      const on = this.plotted.has(i);
      const cls = ['sv-chip', 'sv-hit', 'sc-row', on ? 'sv-chip--sm' : 'sv-chip--sm sv-chip--plain sc-pulse'].join(' ');
      const sty = on ? `--c:${T(r.tone)};--ci:${inkVar(r.tone)};` : '';
      const text = on ? `${r.key}  \u20b9${r.price} \u2192 ${r.qty} kg` : `\u20b9${r.price} \u2192 ${r.qty} kg`;
      const y = A.y0 + i * A.dy;
      return `<button type="button" class="${cls}" data-row="${i}" style="left:${A.cx.toFixed(1)}px;top:${y.toFixed(1)}px;${sty}"`
        + ` aria-label="plot point ${r.key}: ${r.price} rupees, ${r.qty} kg${on ? ' (already plotted)' : ''}">${esc(text)}</button>`;
    }).join('');

    // The hint never promises a row that is already on the plane.
    const allDone = ROWS.every((r, i) => this.plotted.has(i));
    const hint = step === 0 ? chip(allDone ? 'all three rows are on the plane' : 'tap a row to plot its point', 0, 0, { tone: allDone ? 'good' : 'plain', static: true })
      : step === 2 ? chip('DD\u2032 = the demand curve', 0, 0, { tone: 'accent', static: true }) : '';
    // One short line: noteLineHtml joins the rows with a middot, so two rows would wrap raggedly.
    const note = noteLineHtml([{ text: 'three prices only \u00b7 the curve is drawn straight through them' }]);
    return { svg, over, head: hint + note };
  }

  // The chips are HTML on the overlay, so they are hit-tested from rects measured after
  // the last paint - never from hand-typed offsets.
  pointerDown(p) {
    for (const h of this._hits) {
      if (p.x >= h.x0 && p.x <= h.x1 && p.y >= h.y0 && p.y <= h.y1) { this._plot(h.i); return true; }
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