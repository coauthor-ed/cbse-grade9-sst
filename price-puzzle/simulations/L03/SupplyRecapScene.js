/**
 * SupplyRecapScene - L03 s08 "The Supply Side in Short" (2 beats). SvgScene, design units 560 x 480 landscape,
 * 390 x 600 portrait. The market supply curve SmSm' of Table 9.2 (series-7): (6 kg, Rs 50), (12 kg, Rs 100),
 * (18 kg, Rs 150). Graph and movers from shared/SupplyMoves.js.
 *   b0  along the curve: three price buttons Rs 50 / 100 / 150 in the figure. A tap moves the dot along the curve
 *       to that price (guides and a "12 kg at Rs 100" read-out); the curve stays. Chip "price changes: move along
 *       the curve". Cold start: the price rises Rs 100 -> Rs 150, the dot climbs 12 -> 18 kg.
 *   b1  the whole curve moves: four in-figure cases with pictures. Another crop earns more (left), new tools and
 *       machines (right), more sellers (right), sellers expect a higher price later (left). The old curve stays as
 *       a dashed ghost, arrows at Rs 150 / 100 / 50. Chip "anything else: the whole curve moves".
 *       Cold start: new tools and machines, right.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, RS } from '../shared/MangoKit.js';
import { BTN_CSS, txt, frame, axes, dot, guides, arrow, pill, btn } from '../shared/MarketParts.js';
import { SUP, INK } from '../shared/SupplyParts.js';
import { SHIFT, smGraph, moverIcon, DIR_COL } from '../shared/SupplyMoves.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const PRICES = [50, 100, 150];
const KG = [6, 12, 18];
const CASES = [
  { k: 'crop', lab: 'another crop earns more', d: -1 },
  { k: 'tech', lab: 'new tools and machines', d: 1 },
  { k: 'sellers', lab: 'more sellers', d: 1 },
  { k: 'expect', lab: 'they expect a higher price later', d: -1 },
];
const REST_CASE = 1;

const CSS = `
.sr-chips .mq-btn { white-space: normal; text-align: left; line-height: 1.12; padding: 4px 10px 4px 6px; display: flex; align-items: center; gap: 8px; width: var(--bw, 220px); min-height: 64px; }
.sr-chips .mq-btn svg { flex: 0 0 auto; display: block; }
`;

export class SupplyRecapScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The market supply curve SmSm\' through 6 kg at 50 rupees, 12 kg at 100 rupees and 18 kg at 150 rupees. When the price of mangoes changes, sellers move along the curve: at a higher price they offer more, at a lower price less, and the curve stays where it is. When something else changes, the whole curve moves: new tools and machines or more sellers move it right; another crop that earns more, or sellers who expect a higher price later, move it left.';

  async setup() {
    this.at = 2;
    this.prev = 1;
    this.sel = REST_CASE;
    this.from = null;
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

  css() { return MANGO_CSS + BTN_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.from = null; this.fly = false; this.popLab = false; }

  enter(step) {
    this.clear();
    if (step === 0) {
      this.at = 1; this.prev = 1;
      this.anim = true;
      this.after(0.6, () => this.price(2));
    } else {
      this.sel = REST_CASE;
      this.from = 0;
      this.anim = true;
      this.after(0.9, () => { this.anim = false; this.popLab = true; this.repaint(); this.popLab = false; });
    }
  }

  price(i) {
    this.clear();
    this.prev = this.at;
    this.at = i;
    this.fly = this.prev !== i;
    this.anim = this.fly;
    this.repaint();
    this.fly = false;
    if (this.anim) this.after(0.8, () => { this.anim = false; this.popLab = true; this.repaint(); this.popLab = false; });
  }

  pick(i) {
    this.clear();
    const was = this.sel;
    this.sel = i;
    this.from = CASES[was].d * SHIFT;
    this.anim = true;
    this.repaint();
    this.from = null;
    this.after(0.9, () => { this.anim = false; this.popLab = true; this.repaint(); this.popLab = false; });
  }

  act(a, v) {
    if (this.stepIndex === 0 && a === 'price') this.price(Number(v));
    else if (this.stepIndex === 1 && a === 'case') this.pick(Number(v));
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    if (this.stepIndex === 0 && this.at === 1 && this.prev === 1) { this.at = 2; }
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintWhole(P) : this.paintAlong(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the price changes, the dot moves along the curve.
  paintAlong(P) {
    let svg = '', over = '';
    const g = P ? frame(92, 372, 96, 372, 26, 200) : frame(122, 528, 78, 344, 26, 200);
    svg += axes(g, { xs: [6, 12, 18, 24], yTitleX: P ? 24 : 40, xTitleY: g.B + (P ? 54 : 58), tick: P ? 18 : 20, title: P ? 20 : 22 });
    svg += smGraph(g, { d: 0, lab: P ? 26 : 30 });
    const i = this.at, q = KG[i], p = PRICES[i], x = g.X(q), y = g.Y(p);
    const moved = this.prev !== i;
    if (moved) {
      const xp = g.X(KG[this.prev]), yp = g.Y(PRICES[this.prev]);
      svg += dot(xp, yp, '', { r: 10, col: 'var(--sim-label-muted)' });
      if (!this.anim) {
        const k = i > this.prev ? 1 : -1, dx = x - xp, dy = y - yp, L = Math.hypot(dx, dy);
        const ox = (-dy / L) * 30 * k, oy = (dx / L) * 30 * k;
        svg += `<g${this.popLab ? ' class="mq-fade"' : ''}>${arrow(xp + dx * 0.18 - ox, yp + dy * 0.18 - oy, xp + dx * 0.8 - ox, yp + dy * 0.8 - oy, 'var(--sim-accent)', 5)}</g>`;
      }
    }
    if (!this.anim) svg += guides(g, q, p, { lit: true });
    const fly = this.fly ? ` class="mq-fly" style="--dx:${f1(g.X(KG[this.prev]) - x)}px;--dy:${f1(g.Y(PRICES[this.prev]) - y)}px;--dur:0.7s"` : '';
    svg += `<g${fly}>${dot(x, y, '', { r: 13, col: SUP, lit: !this.anim })}</g>`;
    if (!this.anim) {
      const lx = x + (i === 2 ? (P ? 12 : 20) : i === 0 ? (P ? 100 : 120) : (P ? 70 : 84)), ly = y + (i === 0 ? (P ? 30 : 34) : (P ? 46 : 48));
      svg += `<g${this.popLab ? ' class="mq-fade"' : ''}>${pill(lx, ly, `${q} kg at ${RS}${p}`, { size: P ? 20 : 22, bg: SUP, ink: INK(7), edge: SUP })}</g>`;
    }
    svg += pill(P ? 195 : 300, P ? 38 : 32, 'price changes: move along the curve', { size: P ? 19 : 22, bg: 'var(--sim-accent)', ink: 'var(--on-primary, var(--sim-bg-deep))', edge: 'var(--sim-accent)' });
    const bx = P ? [86, 195, 304] : [210, 325, 440], by = P ? 520 : 446;
    if (!P) svg += txt(118, by + 7, 'price:', 20, 'var(--sim-label-muted)', 'middle');
    else svg += txt(195, 478, 'tap a price', 18, 'var(--sim-label-muted)');
    PRICES.forEach((pp, j) => { over += btn('price', `${RS}${pp}`, bx[j], by, { val: j, on: j === i, aria: `${pp} rupees a kg` }); });
    return { svg, over };
  }

  // b1: anything else moves the whole curve.
  paintWhole(P) {
    let svg = '', over = '';
    const g = P ? frame(82, 372, 84, 316, 26, 200) : frame(96, 314, 80, 352, 26, 200);
    svg += axes(g, { xs: [6, 12, 18, 24], yTitleX: P ? 22 : 26, xTitleY: g.B + (P ? 56 : 56), tick: P ? 17 : 18, title: P ? 19 : 20 });
    const c = CASES[this.sel], d = c.d * SHIFT;
    svg += smGraph(g, { d, from: this.from, arrows: !this.anim, pop: this.popLab, lab: P ? 24 : 26 });
    this.from = null;
    const col = DIR_COL(d);
    if (!this.anim) svg += `<g${this.popLab ? ' class="mq-fade"' : ''}>${pill((g.L + g.R) / 2 + (P ? 0 : 8), g.T - 22, `whole curve moves ${d > 0 ? 'right' : 'left'}`, { size: P ? 19 : 19, bg: col, ink: 'var(--sim-bg-deep)', edge: col })}</g>`;
    svg += txt(P ? 195 : 280, P ? 30 : 30, 'anything else: the whole curve moves', P ? 19 : 22, 'var(--sim-label)');
    const pos = P ? [[100, 424], [290, 424], [100, 504], [290, 504]] : [[452, 104], [452, 192], [452, 280], [452, 368]];
    const bw = P ? 184 : 204;
    let chips = '';
    CASES.forEach((cs, i) => {
      const ic = `<svg viewBox="0 0 64 64" width="${P ? 40 : 46}" height="${P ? 40 : 46}" aria-hidden="true">${moverIcon(cs.k, 32, 32, 60)}</svg>`;
      chips += `<div style="--bw:${bw}px">${btn('case', `${ic}<span>${cs.lab}</span>`, pos[i][0], pos[i][1], { val: i, on: i === this.sel, size: P ? 15 : 17, aria: cs.lab })}</div>`;
    });
    over += `<div class="sr-chips">${chips}</div>`;
    if (P) svg += txt(195, 566, 'tap a change', 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, price: PRICES[this.at], kg: KG[this.at], case: CASES[this.sel].k, shift: CASES[this.sel].d, anim: this.anim }; }
}
