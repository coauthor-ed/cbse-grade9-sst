/**
 * BothCurvesScene - L04 s09 "Demand and Supply Together" (2 beats). SvgScene, design units 560 x 480 landscape,
 * 390 x 600 portrait. One graph, the mango market's two curves (graph look of MarketParts):
 *   DmDm' market demand (MKT, series-5): (18 kg, Rs 50), (12, Rs 100), (6, Rs 150), slopes down.
 *   SmSm' market supply (SUP, series-7): (6 kg, Rs 50), (12, Rs 100), (18, Rs 150), slopes up.
 *   b0  the demand curve draws in with its three points, then the supply curve; a legend pill under each.
 *       "again" replays.
 *   b1  the same two curves, no numbers at all (ticks hidden, no points): the crossing gets a ring and a "?",
 *       dashed guides from it to both axes end in "?". L05 names it E, Rs 100, 12 kg; nothing here gives it away.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { BTN_CSS, MKT, txt, frame, axes, line, dot, pill, btn } from '../shared/MarketParts.js';
import { SUP, INK, SINK } from '../shared/SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const PRICES = [50, 100, 150];
const DQ = [18, 12, 6];
const SQ = [6, 12, 18];
const DEM = [22.5, 12.5, 1.5, 187.5];
const SUPL = [1.5, 12.5, 22.5, 187.5];

const CSS = `
svg .bc-ring { transform-box: fill-box; transform-origin: center; animation: bc-ring 0.9s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes bc-ring { 0% { transform: scale(2.2); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .bc-ring { animation: none; } }
`;

function curveLabel(x, y, letter, prime, col, size, anchor = 'start') {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${letter}<tspan style="font-size:${Math.round(size * 0.68)}px" dy="${Math.round(size * 0.2)}">m</tspan>${prime ? `<tspan dy="-${Math.round(size * 0.2)}">'</tspan>` : ''}</text>`;
}

export class BothCurvesScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The mango market on one graph, price up the side and kg along the bottom. The market demand curve DmDm\' slopes down through 18 kg at 50 rupees, 12 kg at 100 rupees and 6 kg at 150 rupees. The market supply curve SmSm\' slopes up through 6 kg at 50 rupees, 12 kg at 100 rupees and 18 kg at 150 rupees. The two curves cross at one point, marked with a question mark: at that price the amount buyers want equals the amount sellers offer.';

  async setup() {
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b && b.dataset.act === 'again' && this.stepIndex === 0) { this.clear(); this.burst(2.6); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return BTN_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.burst(step === 0 ? 2.6 : 1.6);
  }

  burst(sec) {
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(sec, () => { this.anim = false; this.repaint(); });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, k = (st.W / DW).toFixed(4), b1 = this.stepIndex === 1, fresh = this.fresh;
    const G = P
      ? { g: frame(92, 372, 50, 420, 24, 200), yT: 26, xT: 482, leg: [[106, 528], [288, 528]], again: [195, 574], ls: 26, ps: 18 }
      : { g: frame(124, 528, 30, 360, 24, 200), yT: 40, xT: 424, leg: [[246, 460], [430, 460]], again: [52, 456], ls: 30, ps: 20 };
    const g = G.g;
    let svg = '', over = '';
    svg += axes(g, b1
      ? { xs: [], ys: [], gridX: [6, 12, 18], gridY: [50, 100, 150], yTitleX: G.yT, xTitleY: G.xT, title: P ? 20 : 22 }
      : { xs: [6, 12, 18], ys: PRICES, yTitleX: G.yT, xTitleY: G.xT, tick: P ? 18 : 20, title: P ? 20 : 22 });
    const dm = (d) => (fresh && !b1 ? ` class="mq-fade" style="--d:${d}s"` : '');
    // demand first, then supply
    svg += line(g, DEM[0], DEM[1], DEM[2], DEM[3], MKT, { w: 7, draw: fresh && !b1 ? 0.8 : 0 });
    svg += `<g${dm(0.6)}>${curveLabel(g.X(DEM[2]) + 12, g.Y(DEM[3]) + 10, 'D', false, SINK(5), G.ls)}${curveLabel(g.X(DEM[0]) - 22, g.Y(DEM[1]) + 6, 'D', true, SINK(5), G.ls, 'end')}</g>`;
    if (!b1) DQ.forEach((q, i) => { svg += `<g${dm(0.3 + i * 0.15)}>${dot(g.X(q), g.Y(PRICES[i]), '', { col: MKT, r: 10 })}</g>`; });
    const sDraw = fresh && !b1;
    svg += sDraw
      ? `<g class="mq-fade" style="--d:1.1s">${line(g, SUPL[0], SUPL[1], SUPL[2], SUPL[3], SUP, { w: 7, draw: 0.8, delay: 1.1 })}</g>`
      : line(g, SUPL[0], SUPL[1], SUPL[2], SUPL[3], SUP, { w: 7 });
    svg += `<g${dm(1.7)}>${curveLabel(g.X(SUPL[0]) + 14, g.Y(SUPL[1]) + 4, 'S', false, SINK(7), G.ls)}${curveLabel(g.X(SUPL[2]) - 8, g.Y(SUPL[3]) + 8, 'S', true, SINK(7), G.ls, 'end')}</g>`;
    if (!b1) SQ.forEach((q, i) => { svg += `<g${dm(1.4 + i * 0.15)}>${dot(g.X(q), g.Y(PRICES[i]), '', { col: SUP, r: 10 })}</g>`; });
    // legends
    svg += `<g${dm(0.5)}>${pill(G.leg[0][0], G.leg[0][1], 'market demand', { size: G.ps, bg: MKT, ink: INK(5), edge: MKT })}</g>`;
    svg += `<g${dm(1.6)}>${pill(G.leg[1][0], G.leg[1][1], 'market supply', { size: G.ps, bg: SUP, ink: INK(7), edge: SUP })}</g>`;
    if (b1) {
      const x = g.X(12), y = g.Y(100), pop = (d) => (fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
      svg += `<g${fresh ? ' class="mq-fade" style="--d:0.7s"' : ''}><path d="M${f1(g.L)} ${f1(y)}H${f1(x)}V${f1(g.B)}" ${stroke('var(--sim-accent)', 3, 'stroke-dasharray:9 8')}/></g>`;
      svg += `<g${fresh ? ' class="bc-ring" style="--d:0.2s"' : ''}><circle cx="${f1(x)}" cy="${f1(y)}" r="${P ? 22 : 26}" ${fill('color-mix(in oklab, var(--sim-accent) 18%, transparent)', 'stroke:var(--sim-accent);stroke-width:4.5')}/></g>`;
      svg += `<g${pop(0.6)}>${pill(x + (P ? 56 : 66), y + 4, '?', { size: P ? 30 : 34, bg: 'var(--sim-accent)', ink: 'var(--sim-ink-on-accent, var(--sim-bg-deep))', edge: 'var(--sim-accent)', padX: P ? 26 : 30 })}</g>`;
      svg += `<g${pop(1.0)}>${txt(g.L - 22, y + 10, '?', P ? 28 : 30, 'var(--sim-accent)')}${txt(x, g.B + 34, '?', P ? 28 : 30, 'var(--sim-accent)')}</g>`;
    }
    if (!b1 && !this.anim) over += btn('again', 'again', G.again[0], G.again[1], { size: 18 });
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${P ? 600 : 480}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, anim: this.anim, cross: this.stepIndex === 1 ? '?' : null, demand: DQ, supply: SQ }; }
}
