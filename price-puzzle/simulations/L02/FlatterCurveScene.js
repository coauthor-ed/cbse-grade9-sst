/**
 * FlatterCurveScene - L02 s03 "Why the Market Curve Is Flatter" (2 beats). SvgScene, design units 560 x 480
 * landscape, 390 x 560 portrait. Numbers: Table 9.1 (Srivalli 1 kg at Rs 150, 3 kg at Rs 50; the market 6 kg
 * and 18 kg). Srivalli series-1, the market MKT (series-5).
 *   b0 the same fall in price: two bars on one kg scale (0..18). Srivalli 1 kg, the market 6 kg at Rs 150.
 *      "price falls" (in the figure): the board flips to Rs 50, each bar grows by its added part, "+2 kg" and
 *      "+12 kg" pop over the added parts (the heroes). Plays once on entry; rest = after the fall; "replay".
 *   b1 two curves on one graph, same scales: DD' (Srivalli, steep) and DmDm' (market, flatter). On the Rs 50
 *      line each curve's move from its Rs 150 point is an arrow: +2 kg and +12 kg. Tap "Srivalli" or "market"
 *      to light one (the other dims); tap again for both.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, RS, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, frame, axes, line, dot, arrow, pill, crate, btn } from '../shared/MarketParts.js';

const f1 = (v) => (+v).toFixed(1);
const AR = '\u2192';
const S1 = 'var(--sim-series-1)';
const INK = (n) => `var(--sim-ink-on-${n}, var(--sim-bg-deep))`;
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];

const CSS = `
svg .fc-grow { transform-box: fill-box; transform-origin: left center; animation: fc-grow 0.8s cubic-bezier(.45,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes fc-grow { 0% { transform: scaleX(0); } 100% { transform: none; } }
svg .fc-flip { transform-box: fill-box; transform-origin: center; animation: fc-flip 0.45s ease-out both; }
@keyframes fc-flip { 0% { transform: scaleY(0.05); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .fc-grow, svg .fc-flip { animation: none; } }
`;

export class FlatterCurveScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 560;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'When the price falls from 150 to 50 rupees a kg, Srivalli buys 2 kg more (3 kg in place of 1 kg) and the whole market buys 12 kg more (18 kg in place of 6 kg). On one graph with the same scales, Srivalli\'s demand curve is steep and the market demand curve is much flatter: the same fall in price moves the market 12 kg along the kg axis, Srivalli only 2 kg.';

  async setup() {
    this.fallen = true;
    this.labels = true;
    this.focus = null;
    this.anim = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.drawNow = false; }

  enter(step) {
    this.clear();
    this.focus = null;
    this.fallen = true;
    this.labels = true;
    if (step === 0) { this.fallen = false; this.labels = false; this.anim = true; this.after(0.9, () => this.fall()); }
    else { this.drawNow = true; this.anim = true; this.after(0.1, () => { this.drawNow = false; }); this.after(2.0, () => { this.anim = false; this.repaint(); }); }
  }

  fall() {
    this.clear();
    this.fallen = true;
    this.labels = false;
    this.fresh = true;
    this.anim = true;
    this.repaint();
    this.fresh = false;
    this.after(1.1, () => { this.labels = true; this.popLab = true; this.repaint(); this.popLab = false; });
    this.after(1.7, () => { this.anim = false; this.repaint(); });
  }

  act(a, v) {
    const s = this.stepIndex;
    if (s === 0 && a === 'fall') this.fall();
    else if (s === 0 && a === 'again') { this.clear(); this.fallen = false; this.labels = false; this.anim = true; this.repaint(); this.after(0.6, () => this.fall()); }
    else if (s === 1 && a === 'focus') { if (this.anim) this.skip(); this.focus = this.focus === v ? null : v; this.repaint(); }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.fallen = true;
    this.labels = true;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 560 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 560 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintCurves(P) : this.paintBars(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: two bars on one kg scale; the added parts are the heroes.
  paintBars(P) {
    let svg = '', over = '';
    const G = P
      ? { board: [104, 50, 150], go: [284, 50], x0: 104, x1: 372, r1: 214, r2: 394, bh: 40, fig: [50, 262, 132], cr: [52, 432, 84], ax: 470, lab: 22, big: 30 }
      : { board: [150, 50, 170], go: [410, 50], x0: 136, x1: 530, r1: 200, r2: 356, bh: 54, fig: [62, 250, 156], cr: [66, 404, 104], ax: 438, lab: 24, big: 36 };
    const X = (q) => G.x0 + (q / 18) * (G.x1 - G.x0), fl = this.fallen;
    svg += `<g${this.fresh ? ' class="fc-flip"' : ''}>${priceBoard(G.board[0], G.board[1], fl ? 50 : 150, { w: G.board[2], h: 64, active: true })}</g>`;
    if (!this.anim) over += btn('again', 'replay', G.go[0], G.go[1]);
    else if (!fl) over += btn('fall', `price falls ${AR}`, G.go[0], G.go[1], { go: true });
    // the kg scale under both bars
    svg += `<path d="M${G.x0} ${G.ax}H${G.x1}" ${stroke('var(--sim-label)', 3)}/>`;
    for (let q = 0; q <= 18; q += 3) {
      svg += `<path d="M${f1(X(q))} ${G.ax}V${G.ax + 8}" ${stroke('var(--sim-label)', 2.5)}/>` + txt(X(q), G.ax + 30, String(q), P ? 18 : 20, 'var(--sim-label-muted)');
      svg += `<path d="M${f1(X(q))} ${G.r1 - G.bh}V${G.ax}" ${stroke('var(--sim-stroke)', 1.4, 'opacity:0.4')}/>`;
    }
    svg += txt(G.x0 - 16, G.ax + 30, 'kg', P ? 18 : 20, 'var(--sim-label)', 'end');
    // Srivalli and her bar
    over += personSlot('srivalli', { x: G.fig[0], y: G.fig[1], h: G.fig[2], pose: 'stand', facing: 1, mood: 'smile' });
    svg += nameTag(G.fig[0], G.fig[1] + 6, 'srivalli', P ? 15 : 17);
    svg += this.bar(X, G.r1, G.bh, 1, 3, S1, '+2 kg', 1, G, P);
    // the market crate and its bar
    svg += crate(G.cr[0], G.cr[1] - 22, fl ? 18 : 6, { w: G.cr[2], r: P ? 3.4 : 4.2 });
    svg += pill(G.cr[0], G.cr[1], 'market', { size: P ? 17 : 19, bg: MKT, ink: INK(5), edge: MKT });
    svg += this.bar(X, G.r2, G.bh, 6, 18, MKT, '+12 kg', 5, G, P);
    return { svg, over };
  }

  /** One bar: the old part (tinted), the added part (solid) growing in, a bracket and the big "+N kg". */
  bar(X, y, h, from, to, col, plus, n, G, P) {
    const fl = this.fallen, top = y - h;
    let s = `<rect x="${f1(X(0))}" y="${f1(top)}" width="${f1(X(from) - X(0))}" height="${h}" rx="8" ${fill(`color-mix(in oklab, ${col} 40%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2.5`)}/>`;
    if (fl) {
      const g = this.fresh ? ' class="fc-grow" style="--d:0.3s"' : '';
      s += `<g${g}><rect x="${f1(X(from))}" y="${f1(top)}" width="${f1(X(to) - X(from))}" height="${h}" rx="8" ${fill(col, `stroke:color-mix(in oklab, ${col} 70%, var(--sim-label));stroke-width:2.5`)}/></g>`;
    }
    const end = fl ? to : from;
    s += txt(X(end) + (end === 18 ? -10 : 10), top + h * 0.5 + 9, `${end} kg`, G.lab, end === 18 ? INK(n) : 'var(--sim-label)', end === 18 ? 'end' : 'start');
    if (fl && this.labels) {
      const by = top - 12, x0 = X(from) + 3, x1 = X(to) - 3;
      const pop = this.popLab ? ' class="mq-pop"' : '';
      s += `<g${pop}><path d="M${f1(x0)} ${f1(by + 8)}V${f1(by)}H${f1(x1)}V${f1(by + 8)}" ${stroke(col, 3.5)}/>`
        + pill((x0 + x1) / 2 + (to - from < 4 ? 24 : 0), by - 26, plus, { size: G.big, bg: col, ink: INK(n), edge: col }) + '</g>';
    }
    return s;
  }

  // b1: both curves on one graph; the Rs 150 -> Rs 50 move of each as an arrow on the Rs 50 line.
  paintCurves(P) {
    const g = P ? frame(104, 366, 86, 420, 20, 200) : frame(132, 528, 30, 360, 20, 200);
    let svg = axes(g, { yTitleX: P ? 26 : 44, tick: P ? 18 : 20 }), over = '';
    const fS = this.focus === 'mkt' ? 0.25 : 1, fM = this.focus === 'sri' ? 0.25 : 1;
    const d = this.drawNow;
    // the Rs 50 moves: drop from the Rs 150 point, then an arrow along the Rs 50 line
    const move = (q0, q1, col, n, plus, op, dly) => {
      const x0 = g.X(q0), x1 = g.X(q1), y0 = g.Y(150), y1 = g.Y(50);
      return `<g opacity="${op}"${d ? ` class="mq-fade" style="--d:${dly}s"` : ''}><path d="M${f1(x0)} ${f1(y0)}V${f1(y1)}" ${stroke(col, 2.5, 'stroke-dasharray:6 6')}/>`
        + arrow(x0, y1, x1 - 4, y1, col, 4.5)
        + pill(q1 - q0 < 4 ? g.X(P ? 5.5 : 5) : (x0 + x1) / 2, y1 + 34, plus, { size: P ? 20 : 26, bg: col, ink: INK(n), edge: col }) + '</g>';
    };
    svg += move(1, 3, S1, 1, '+2 kg', fS, 1.5) + move(6, 18, MKT, 5, '+12 kg', fM, 1.7);
    // Srivalli's curve DD' (steep) and the market's DmDm' (flatter)
    svg += `<g opacity="${fS}">${line(g, 0.5, 175, 3.5, 25, S1, { w: 7, draw: d ? 0.7 : 0 })}`
      + dot(g.X(1), g.Y(150), '', { col: S1, r: 10 }) + dot(g.X(3), g.Y(50), '', { col: S1, r: 10 })
      + txt(g.X(0.5) + 4, g.Y(175) - 14, 'D', 28, S1)
      + `<g${d ? ' class="mq-fade" style="--d:0.7s"' : ''}>${pill(g.X(2.6) + (P ? 46 : 56), g.Y(118), 'steep', { size: P ? 22 : 24, bg: 'var(--sim-bg-surface)', ink: S1, edge: S1 })}</g></g>`;
    const sub = (x, y, prime, a = 'start') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="fill:${MKT};font:800 28px var(--sim-font)">D<tspan style="font-size:19px" dy="6">m</tspan>${prime ? '<tspan dy="-6">\'</tspan>' : ''}</text>`;
    svg += `<g opacity="${fM}">${line(g, 3, 175, 19.5, 200 - 19.5 * 25 / 3, MKT, { w: 7, draw: d ? 0.9 : 0, delay: d ? 0.6 : 0 })}`
      + dot(g.X(6), g.Y(150), '', { col: MKT, r: 10 }) + dot(g.X(18), g.Y(50), '', { col: MKT, r: 10 })
      + sub(g.X(3) + 16, g.Y(175) - 4, false) + sub(g.X(19.5) - 6, g.Y(37) + 40, true, 'middle')
      + `<g${d ? ' class="mq-fade" style="--d:1.3s"' : ''}>${pill(g.X(9.8), g.Y(84), 'flatter', { size: P ? 22 : 24, bg: 'var(--sim-bg-surface)', ink: MKT, edge: MKT })}</g></g>`;
    const B = P ? [[118, 516], [272, 516]] : [[432, 92], [432, 150]];
    over += btn('focus', 'Srivalli', B[0][0], B[0][1], { val: 'sri', on: this.focus === 'sri' });
    over += btn('focus', 'market', B[1][0], B[1][1], { val: 'mkt', on: this.focus === 'mkt' });
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, fallen: this.fallen, labels: this.labels, focus: this.focus, sri: [1, 3], market: [6, 18], price: this.fallen ? 50 : 150, rs: RS }; }
}
