/**
 * TwoCurvesScene - the chapter's price-quantity plane with demand and supply on
 * it, each stopping short of the other. Closing hook of blk-l04-s09.
 *
 *   0  the plane and the demand curve, drawn on from its outer end
 *   1  + the supply curve, drawn on from its other outer end
 *   2  + a "?" in the gap between the two tips: one price makes them match,
 *      and this lesson does not name it (L05 does)
 *
 * The picture is SimChart's chart frame on an SvgScene stage (axesSvg lays the
 * plane out, traceSvg draws each curve), so it is the same chart vocabulary as
 * the chapter's other curve scenes. Both curves are the quadratic through the
 * chapter's own three market-table rows (FIGURES.md Table 9.3), so the learner's
 * sweep reproduces the table at Rs 40, 100 and 150. There is no frame loop: the
 * only motion is one-shot CSS (each curve's draw-on) plus a halo on the hint.
 */
import { SvgScene, chip, tone as T, fill, stroke, cushionCircle } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg } from 'simulations/base/kit/SimChart.js';
import { fmtNum } from 'simulations/base/kit/SimText.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);

// The chapter's mango market (Table 9.3): price per kg against kg wanted and
// kg offered. Lagrange basis over the three prices, shared by both curves
// because both are sampled at the same three prices.
const L0 = (p) => ((p - 100) * (p - 150)) / 6600;
const L1 = (p) => ((p - 40) * (p - 150)) / -3000;
const L2 = (p) => ((p - 40) * (p - 100)) / 5500;
const wanted = (p) => 38 * L0(p) + 12 * L1(p) + 8 * L2(p);
const offered = (p) => 6 * L0(p) + 12 * L1(p) + 43 * L2(p);
const P_LO = 40, P_HI = 150, P_CROSS = 100;   // the measured range, and where the two readings are equal
const DEMAND_TONE = 1, SUPPLY_TONE = 8;       // sky, orange: the two voices of the chapter's charts
const AX = {
  x: { min: 0, max: 50, ticks: [0, 10, 20, 30, 40, 50], label: 'Quantity of mangoes (kg)' },
  y: { min: 0, max: 160, ticks: [0, 50, 100, 150], label: 'Price of mangoes (\u20b9)' },
};
const HINTS = ['demand: how much is wanted', 'supply: how much is offered', 'only one price makes them match \u2014 what is it called?'];
const CSS = `
/* The halo pulses in the chip's own colour and never moves the box: a moving
   target fights an automated click and a learner on a laggy phone. */
@keyframes tc-halo { 50% { box-shadow: 0 3px 0 color-mix(in oklab, var(--c) 62%, black), 0 0 0 7px color-mix(in oklab, var(--c) 32%, transparent); } }
.tc-pulse { animation: tc-halo 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .tc-pulse { animation: none; } }
`;

export class TwoCurvesScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A price and quantity plane for mangoes: a demand curve sloping down from the left and a supply curve sloping up from the right, each stopping short of the other, with a price slider that reads how much is wanted or how much is offered at that price.';
  static CONTROLS = [
    { type: 'slider', id: 'price', label: 'Price to check (\u20b9 per kg)', min: P_LO, max: P_HI, step: 10, value: P_LO },
  ];
  // Sized from sim-layout's measured worst case, control bar included
  // (576 landscape, 689 portrait), not guessed.
  static HEIGHT = 576;
  static PORTRAIT_HEIGHT = 689;

  css() { return CSS; }

  stageHeight(st) { return st.portrait ? 480 : 440; }

  // How far short of the price where the two readings are equal each curve
  // stops. Rupees, not pixels, so the staged gap is the same data in both
  // orientations - only the visible width changes with the plot.
  _gapRupees(st) { return st.portrait ? 12 : 10; }

  enter(step) {
    // A beat change re-owns the scene: only the curve this beat introduces
    // animates, and a run from an earlier beat never outlives it (CSS one-shots
    // are rebuilt by the repaint below).
    this._drawD = step === 0;
    this._drawS = step === 1;
    this._popD = step === 0;
    this._popS = step === 1;
    if (step === 0) { this.price = P_LO; this._band = false; }
  }

  onControlChange(id, v) {
    if (id !== 'price') return;
    const n = Math.round(Number(v) / 10) * 10;
    this.price = Math.max(P_LO, Math.min(P_HI, Number.isFinite(n) ? n : P_LO));
    // The concept moment: the sweep reaches the hole in the middle, where the
    // two curves stop and neither reading exists. Strictly inside it - the two
    // stops themselves still have their curve drawn.
    const g = this._gapR ?? 0;
    if (!this._band && this.price > P_CROSS - g && this.price < P_CROSS + g) {
      this._band = true;
      this.after(0.15, () => this.celebrate());
    }
    this.repaint();
    this.requestUiUpdate?.();
  }

  /** Points of one curve between two prices, for traceSvg (which maps data, not px). */
  _run(f, p0, p1, fn, tone, draw) {
    const n = 26;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const p = p0 + ((p1 - p0) * i) / n;
      return { x: fn(p), y: p };
    });
    return traceSvg(f, pts, { tone, width: 7, end: false, draw }).svg;
  }

  paint(st) {
    const step = this.stepIndex ?? 0;
    const gR = this._gapRupees(st);
    this._gapR = gR;
    const f = chartFrame({ rect: { x: 0, y: 0, w: st.W, h: st.H }, x: AX.x, y: AX.y });
    const p = this.price;
    const dHi = P_CROSS - gR, sLo = P_CROSS + gR;
    let svg = axesSvg(f).svg;
    let over = '';

    // Beat 0: demand, drawn on from its tip at the left, so it grows in from the
    // left. Beat 1: supply, from its outer end at the right, so it grows in from
    // the right. Point order IS draw direction: traceSvg draws from its first
    // point.
    if (step >= 0) svg += this._run(f, dHi, P_LO, wanted, DEMAND_TONE, this._drawD);
    if (step >= 1) svg += this._run(f, P_HI, sLo, offered, SUPPLY_TONE, this._drawS);
    this._drawD = false;
    this._drawS = false;

    // A deliberate rounded stop at each tip. The curves carry no text of their
    // own: both names live in the head chips, in the same two colours, so no
    // label can ever land under the sweeping price line or off the plot edge in
    // a narrow frame.
    const tip = (price, qty, tone, pop) => {
      const c = cushionCircle(f.px(qty), f.py(price), 8, T(tone), { lift: 2 });
      return pop ? `<g class="sv-pop" style="--d:0.7s">${c}</g>` : c;
    };
    svg += tip(dHi, wanted(dHi), DEMAND_TONE, this._popD);
    if (step >= 1) svg += tip(sLo, offered(sLo), SUPPLY_TONE, this._popS);
    this._popD = false;
    this._popS = false;

    // The price line the learner is sweeping, and the ring where it meets a curve.
    const y = f.py(p);
    svg += `<line x1="${f.plot.x}" y1="${y.toFixed(1)}" x2="${(f.plot.x + f.plot.w).toFixed(1)}" y2="${y.toFixed(1)}" ${stroke('var(--sim-label)', 2.5, 'stroke-dasharray:9 7;opacity:0.7')}/>`;
    const ring = (price, qty, tone) => {
      const X = f.px(qty), Y = f.py(price);
      return `<circle cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" r="13" ${fill(T(tone), 'opacity:0.22')}/><circle cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" r="7" ${fill(T(tone), 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
    };
    if (p <= dHi) svg += `<g class="sv-pop">${ring(p, wanted(p), DEMAND_TONE)}</g>`;
    if (p >= sLo) svg += `<g class="sv-pop">${ring(p, offered(p), SUPPLY_TONE)}</g>`;
    // The price tag rides just inside the plot's left edge: nothing is drawn
    // left of x = 250 on this chart (each curve stops long before it), and the
    // gutter outside the axis belongs to the rotated axis title.
    over += chip(`\u20b9${p}`, f.plot.x + 8, y - 16, { tone: 'plain', align: 'left', size: 'sm' });

    // Beat 2: the price where the two readings would be equal is the hole
    // between the two tips - marked, not named. It is a hole in PRICE, so it
    // sits between the tips on the chart, not at the crossing.
    if (step >= 2) {
      const mx = (f.px(wanted(dHi)) + f.px(offered(sLo))) / 2;
      const my = (f.py(dHi) + f.py(sLo)) / 2;
      over += chip('?', mx, my, { tone: 'warning', size: 'sm', cls: 'tc-pulse' });
    }

    // Both reading chips are on every beat, so the head - and with it the plot's
    // position - is the same height on all three: stepping a beat never makes the
    // chart jump. Each chip is filled with its own curve's colour, which is how
    // the curve is named. On beat 0 the supply side is not on the plane yet.
    const reading = (word, tone, qty, drawn, notYet) => (drawn
      ? chip(`${word} \u00b7 ${fmtNum(Math.round(qty))} kg`, 0, 0, { tone, size: 'big', static: true })
      : chip(`${word} \u00b7 ${notYet ? 'not on the plane yet' : 'not drawn'}`, 0, 0, { tone: 'plain', static: true }));
    const head = reading('wanted', DEMAND_TONE, wanted(p), step >= 0 && p <= dHi, false)
      + reading('offered', SUPPLY_TONE, offered(p), step >= 1 && p >= sLo, step < 1)
      + chip(HINTS[step], 0, 0, { tone: step === 2 ? 'accent' : 'plain', static: true, cls: step === 0 ? 'tc-pulse' : '' })
      + noteLineHtml([{ text: 'three measured prices \u00b7 the curves stop short of where they match' }]);
    return { svg, over, head };
  }
}