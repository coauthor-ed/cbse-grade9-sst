/**
 * PointEScene - L05 s04 "Point E on the Graph" (3 beats). SvgScene, design units 560 x 490 landscape, 390 x 600
 * portrait. The mango market's two curves on one graph (graph look of MarketParts, as L04 BothCurvesScene):
 *   DmDm' market demand (MKT, series-5): q = 24 - 0.12 p, through (18, Rs 50), (12, Rs 100), (6, Rs 150).
 *   SmSm' market supply (SUP, series-7): q = 0.12 p, through (6, Rs 50), (12, Rs 100), (18, Rs 150).
 *   b0  E ringed at (12 kg, Rs 100), dashed guides to both axes ending in big "Rs 100" and "12 kg" pills.
 *   b1  the Rs 150 line: a bracket from 6 kg (on DmDm') to 18 kg (on SmSm'), "surplus 12 kg"; the Rs 50 line:
 *       a bracket from 6 kg (on SmSm') to 18 kg (on DmDm'), "shortage 12 kg". Named cases "above E" / "below E"
 *       light one (tap again: both). Rest: both.
 *   b2  each price line slides to E (Rs 150 down, Rs 50 up) while its bracket shrinks to nothing; then arrows on
 *       the price side (Rs 150 -> Rs 100, Rs 50 -> Rs 100); E stays lit. "replay".
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { RS } from '../shared/MangoKit.js';
import { BTN_CSS, MKT, txt, frame, axes, line, dot, arrow, pill, btn } from '../shared/MarketParts.js';
import { SUP, INK, SINK } from '../shared/SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const qD = (p) => 24 - 0.12 * p;
const qS = (p) => 0.12 * p;
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const FRAMES = 16;

function curveLabel(x, y, letter, prime, col, size, anchor = 'start') {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${letter}<tspan style="font-size:${Math.round(size * 0.68)}px" dy="${Math.round(size * 0.2)}">m</tspan>${prime ? `<tspan dy="-${Math.round(size * 0.2)}">'</tspan>` : ''}</text>`;
}

export class PointEScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The mango market on one graph, price up the side and kg along the bottom. The market demand curve DmDm\' slopes down and the market supply curve SmSm\' slopes up. They cross at one point, E: read across to the price, 100 rupees, and down to the quantity, 12 kg. At 150 rupees, above E, buyers want 6 kg and sellers offer 18 kg: the gap of 12 kg is the surplus. At 50 rupees, below E, buyers want 18 kg and sellers offer 6 kg: the gap of 12 kg is the shortage. A surplus pushes the price down and a shortage pushes it up, so the price moves towards E.';

  async setup() {
    this.only = 0;
    this.t = 1;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (this.stepIndex === 1 && (a === 'above' || a === 'below')) {
        const v = a === 'above' ? 1 : -1;
        this.only = this.only === v ? 0 : v;
        this.repaint();
      } else if (this.stepIndex === 2 && a === 'replay') this.slide();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return BTN_CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.t = 1; }

  enter(step) {
    this.clear();
    this.only = 0;
    if (step === 2) this.slide();
    else this.burst(1.2);
  }

  burst(sec) {
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(sec, () => { this.anim = false; this.repaint(); });
  }

  // b2: both price lines slide to E in FRAMES steps, then the arrows show
  slide() {
    this.clear();
    this.anim = true;
    this.t = 0;
    this.repaint();
    for (let n = 1; n <= FRAMES; n++) this.after(0.5 + n * 0.055, () => { this.t = n / FRAMES; this.repaint(); });
    this.after(0.5 + FRAMES * 0.055 + 0.1, () => { this.fresh = true; this.repaint(); this.fresh = false; });
    this.after(0.5 + FRAMES * 0.055 + 0.7, () => { this.anim = false; this.repaint(); });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 490) * st.W / (st.portrait ? 390 : 560)); }

  bracket(g, p, label, below, on, P, o = {}) {
    const a = qD(p), b = qS(p), x0 = g.X(Math.min(a, b)), x1 = g.X(Math.max(a, b)), y = g.Y(p), op = on ? 1 : 0.25;
    let s = `<g style="opacity:${op}">`;
    s += `<path d="M${f1(g.L)} ${f1(y)}H${f1(g.R)}" ${stroke('var(--sim-label-muted)', 2, 'stroke-dasharray:6 6')}/>`;
    if (x1 - x0 > 2) {
      s += `<path d="M${f1(x0)} ${f1(y - 13)}V${f1(y + 13)}M${f1(x1)} ${f1(y - 13)}V${f1(y + 13)}M${f1(x0)} ${f1(y)}H${f1(x1)}" ${stroke(ACC, 6)}/>`;
      if (o.dots !== false) {
        s += dot(g.X(a), y, '', { col: MKT, r: 10 }) + dot(g.X(b), y, '', { col: SUP, r: 10 });
        s += txt(g.X(a), y + (below ? -22 : 34), `${a} kg`, P ? 18 : 20, SINK(5)) + txt(g.X(b), y + (below ? -22 : 34), `${b} kg`, P ? 18 : 20, SINK(7));
      }
      if (label) s += pill((x0 + x1) / 2, y + (below ? 40 : -34), label, { size: P ? 20 : 22, bg: on ? ACC : 'var(--sim-bg-surface)', ink: on ? ACC_INK : 'var(--sim-label)', edge: ACC });
    }
    return s + '</g>';
  }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 490, k = (st.W / DW).toFixed(4), s = this.stepIndex, fresh = this.fresh;
    const g = P ? frame(78, 374, 66, 430, 24, 200) : frame(132, 528, 30, 360, 24, 200);
    const pop = (d) => (fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
    const fade = (d) => (fresh ? ` class="mq-fade" style="--d:${d}s"` : '');
    const ls = P ? 26 : 30;
    let svg = '', over = '';
    const ePills = s !== 1;
    svg += axes(g, { xs: ePills ? [6, 18] : [6, 12, 18], ys: ePills ? [50, 150] : [50, 100, 150], gridX: [6, 12, 18], gridY: [50, 100, 150],
      yTitleX: P ? -999 : 40, yTitle: P ? '' : undefined, xTitleY: P ? 492 : 436, tick: P ? 18 : 20, title: P ? 20 : 22 });
    if (P) svg += txt(10, 34, `price (${RS} per kg)`, 20, 'var(--sim-label)', 'start');
    // the two curves
    svg += line(g, 22.5, 12.5, 1.5, 187.5, MKT, { w: 7 });
    svg += curveLabel(g.X(1.5) + 12, g.Y(187.5) + 10, 'D', false, SINK(5), ls) + curveLabel(g.X(22.5) - 22, g.Y(12.5) + 6, 'D', true, SINK(5), ls, 'end');
    svg += line(g, 1.5, 12.5, 22.5, 187.5, SUP, { w: 7 });
    svg += curveLabel(g.X(1.5) + 14, g.Y(12.5) + 4, 'S', false, SINK(7), ls) + curveLabel(g.X(22.5) - 8, g.Y(187.5) + 8, 'S', true, SINK(7), ls, 'end');
    const ex = g.X(12), ey = g.Y(100);
    if (s === 1) {
      svg += this.bracket(g, 150, 'surplus 12 kg', false, this.only >= 0, P);
      svg += this.bracket(g, 50, 'shortage 12 kg', true, this.only <= 0, P);
      svg += dot(ex, ey, 'E', { col: 'var(--sim-label)', r: 9, size: P ? 24 : 28, ldx: 14, ldy: -12 });
      const [ax, bx, by] = P ? [110, 280, 540] : [250, 420, 458];
      over += btn('above', 'above E', ax, by, { on: this.only === 1, aria: 'light the gap above E, at 150 rupees' });
      over += btn('below', 'below E', bx, by, { on: this.only === -1, aria: 'light the gap below E, at 50 rupees' });
    } else {
      // guides to both axes, big price and kg pills
      svg += `<g${fade(0.3)}><path d="M${f1(g.L)} ${f1(ey)}H${f1(ex)}V${f1(g.B)}" ${stroke(ACC, 3, 'stroke-dasharray:9 8')}/></g>`;
      if (s === 2) {
        const t = this.t, e = t * t * (3 - 2 * t), pa = 150 - 50 * e, pb = 50 + 50 * e;
        const rest = !this.anim || t >= 1;
        if (!rest || this.t < 1) {
          svg += this.bracket(g, pa, '', false, true, P, { dots: false });
          svg += this.bracket(g, pb, '', true, true, P, { dots: false });
        } else {
          for (const p of [150, 50]) svg += `<path d="M${f1(g.L)} ${f1(g.Y(p))}H${f1(g.R)}" ${stroke('var(--sim-label-muted)', 2, 'stroke-dasharray:6 6;opacity:0.5')}/>`;
        }
        if (this.t >= 1) {
          const ax = g.L + (P ? 26 : 30);
          svg += `<g${fade(0)}>${arrow(ax, g.Y(150) + 4, ax, ey - 16, ACC, 6)}${arrow(ax, g.Y(50) - 4, ax, ey + 16, ACC, 6)}</g>`;
          svg += `<g${fade(0.2)}>${pill(ex, g.Y(150), 'price falls', { size: P ? 17 : 19 })}${pill(ex, g.Y(50), 'price rises', { size: P ? 17 : 19 })}</g>`;
        }
      }
      svg += `<g${pop(0.1)}><circle cx="${f1(ex)}" cy="${f1(ey)}" r="${P ? 22 : 26}" ${fill('color-mix(in oklab, var(--sim-accent) 18%, transparent)', 'stroke:var(--sim-accent);stroke-width:4.5')}/></g>`;
      svg += dot(ex, ey, '', { col: 'var(--sim-label)', r: 9 });
      svg += `<g${pop(0.3)}>${txt(ex + (P ? 26 : 30), ey - (P ? 18 : 22), 'E', P ? 30 : 34, ACC, 'start')}</g>`;
      svg += `<g${pop(0.6)}>${pill(g.L - (P ? 38 : 44), ey, `${RS}100`, { size: P ? 20 : 24, bg: ACC, ink: ACC_INK, edge: ACC, padX: 18 })}</g>`;
      svg += `<g${pop(0.8)}>${pill(ex, g.B + (P ? 26 : 28), '12 kg', { size: P ? 20 : 24, bg: ACC, ink: ACC_INK, edge: ACC, padX: 18 })}</g>`;
      if (s === 0) {
        const leg = P ? [[106, 548], [288, 548]] : [[250, 462], [430, 462]];
        svg += pill(leg[0][0], leg[0][1], 'market demand', { size: P ? 18 : 20, bg: MKT, ink: INK(5), edge: MKT });
        svg += pill(leg[1][0], leg[1][1], 'market supply', { size: P ? 18 : 20, bg: SUP, ink: INK(7), edge: SUP });
      } else if (!this.anim) over += btn('replay', 'replay', P ? 195 : 470, P ? 548 : 458, { size: 18 });
    }
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, E: { kg: 12, price: 100 }, only: this.only, t: this.t, anim: this.anim, surplus: qS(150) - qD(150), shortage: qD(50) - qS(50) }; }
}
