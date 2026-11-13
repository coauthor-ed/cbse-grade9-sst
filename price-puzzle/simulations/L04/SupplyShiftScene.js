/**
 * SupplyShiftScene - L04 s01 "Supply Can Change When the Price Does Not" (2 beats). SvgScene, design units
 * 560 x 480 landscape, 390 x 600 portrait. The market supply curve SmSm' of Table 9.2 (series-7) from
 * shared/SupplyMoves.js (same curve and movers as L03 SupplyRecapScene).
 *   b0  two in-figure buttons: "sellers offer more at every price" slides the whole curve right, "... less ..."
 *       slides it left; the old curve stays as a dashed ghost, arrows at Rs 150 / 100 / 50. A small chip in the
 *       empty corner of the graph: "price change: move along" (the contrast). Cold start: offer more, right.
 *   b1  an index of the lesson: the curve in the middle with a left and a right arrow, and four pictures round it:
 *       prices of other goods (wheat and chickpea strips), number of sellers (stalls), technology (drip pipe),
 *       what sellers expect (calendar). A small row under it: "also: costs, weather, disasters". Nothing moves
 *       after the cards come in.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MANGO_CSS } from '../shared/MangoKit.js';
import { BTN_CSS, txt, frame, axes, arrow, pill, btn } from '../shared/MarketParts.js';
import { SHIFT, smGraph, moverIcon, DIR_COL } from '../shared/SupplyMoves.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const MOVERS = [
  { k: 'crop', t: ['prices of', 'other goods'] },
  { k: 'sellers', t: ['number of', 'sellers'] },
  { k: 'tech', t: ['technology'] },
  { k: 'expect', t: ['what sellers', 'expect'] },
];

const CSS = `
.ss-two .mq-btn { white-space: normal; text-align: center; line-height: 1.15; width: var(--bw, 220px); }
`;

export class SupplyShiftScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The market supply curve SmSm\' through 6 kg at 50 rupees, 12 kg at 100 rupees and 18 kg at 150 rupees. When sellers offer more at every price, the whole curve moves right; when they offer less at every price, it moves left; the old curve stays as a dashed line. A change in the price itself only moves sellers along the curve. Four things this lesson looks at move the supply curve: the prices of other goods, the number of sellers, technology and what sellers expect; costs, weather and disasters move it too.';

  async setup() {
    this.d = 1;
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

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.from = null; this.popLab = false; this.come = false; }

  enter(step) {
    this.clear();
    this.d = 1;
    this.anim = true;
    if (step === 0) { this.from = 0; this.after(0.9, () => this.rest()); }
    else { this.come = true; this.after(1.6, () => this.rest()); }
  }

  rest() { this.anim = false; this.come = false; this.popLab = true; this.repaint(); this.popLab = false; }

  move(d) {
    if (d === this.d && !this.anim) return;
    this.clear();
    this.from = this.d * SHIFT;
    this.d = d;
    this.anim = true;
    this.repaint();
    this.after(0.9, () => this.rest());
  }

  act(a, v) { if (this.stepIndex === 0 && a === 'move') this.move(Number(v)); }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintIndex(P) : this.paintMove(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the whole curve slides right or left; the price does not change.
  paintMove(P) {
    let svg = '', over = '';
    const g = P ? frame(92, 372, 84, 352, 26, 200) : frame(122, 528, 66, 334, 26, 200);
    svg += axes(g, { xs: [6, 12, 18, 24], yTitleX: P ? 24 : 40, xTitleY: g.B + (P ? 54 : 58), tick: P ? 18 : 20, title: P ? 20 : 22 });
    const d = this.d * SHIFT;
    svg += smGraph(g, { d, from: this.from, arrows: !this.anim, pop: this.popLab, lab: P ? 26 : 30 });
    this.from = null;
    svg += pill(P ? g.X(11.2) : g.X(20.5), P ? g.Y(188) : g.Y(22), 'price change: move along', { size: P ? 15 : 17, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label-muted)', edge: 'var(--sim-stroke)' });
    const col = DIR_COL(d);
    if (!this.anim) svg += `<g${this.popLab ? ' class="mq-fade"' : ''}>${pill(P ? 195 : 325, P ? 40 : 30, `whole curve moves ${d > 0 ? 'right' : 'left'}`, { size: P ? 21 : 22, bg: col, ink: 'var(--sim-bg-deep)', edge: col })}</g>`;
    const B = P ? { pos: [[195, 462], [195, 522]], bw: 320 } : { pos: [[210, 446], [430, 446]], bw: 206 };
    let two = '';
    [[1, 'sellers offer more at every price'], [-1, 'sellers offer less at every price']].forEach(([v, lab], i) => {
      two += `<div style="--bw:${B.bw}px">${btn('move', lab, B.pos[i][0], B.pos[i][1], { val: v, on: v === this.d, size: P ? 18 : 17 })}</div>`;
    });
    over += `<div class="ss-two">${two}</div>`;
    return { svg, over };
  }

  // b1: four things that move the curve, round a small graph.
  paintIndex(P) {
    let svg = '';
    const g = P ? frame(126, 316, 34, 206, 26, 200) : frame(214, 366, 66, 330, 26, 200);
    svg += axes(g, { xs: [], ys: [], gridX: [6, 12, 18, 24], gridY: [50, 100, 150], yTitle: 'price', xTitle: 'kg', yTitleX: g.L - 18, xTitleY: g.B + 26, title: 18 });
    svg += smGraph(g, { d: 0, w: 6, lab: 22 });
    svg += arrow(g.X(14), g.Y(140), g.X(5), g.Y(140), DIR_COL(-1), 4.5) + arrow(g.X(9), g.Y(50), g.X(18), g.Y(50), DIR_COL(1), 4.5);
    const cw = P ? 176 : 168, ch = P ? 144 : 160, isz = P ? 96 : 108;
    const pos = P ? [[100, 324], [290, 324], [100, 478], [290, 478]] : [[96, 112], [464, 112], [96, 318], [464, 318]];
    MOVERS.forEach((m, i) => {
      const [cx, cy] = pos[i];
      const come = this.come ? ` class="mq-pop" style="--d:${(0.2 + i * 0.25).toFixed(2)}s"` : '';
      let card = `<rect x="${f1(cx - cw / 2)}" y="${f1(cy - ch / 2)}" width="${cw}" height="${ch}" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
      card += moverIcon(m.k, cx, cy - ch * 0.2, isz);
      const ty = cy + ch / 2 - (m.t.length === 2 ? 40 : 16);
      m.t.forEach((t, j) => { card += txt(cx, ty + j * 25, t, 20, 'var(--sim-label)'); });
      svg += `<g${come}>${card}</g>`;
    });
    // also: costs, weather, disasters
    const ry = P ? 584 : 446;
    const ic = (name, x, tone) => iconSvg(name, tone).replace('<svg class="sim-icon" viewBox="0 0 48 48" width="48" height="48"', `<svg class="sim-icon" viewBox="0 0 48 48" x="${f1(x - 17)}" y="${f1(ry - 25)}" width="34" height="34"`);
    const fs = P ? 16 : 20, xs = P ? [16, 76, 94, 166, 184, 272, 290] : [70, 150, 168, 262, 282, 386, 406];
    svg += txt(xs[0], ry, 'also:', fs, 'var(--sim-label-muted)', 'start');
    svg += ic('coin', xs[1], 'var(--sim-gold)') + txt(xs[2], ry, 'costs,', fs, 'var(--sim-label-muted)', 'start');
    svg += ic('sun', xs[3], 'var(--sim-gold)') + txt(xs[4], ry, 'weather,', fs, 'var(--sim-label-muted)', 'start');
    svg += ic('river', xs[5], 'var(--sim-water)') + txt(xs[6], ry, 'disasters', fs, 'var(--sim-label-muted)', 'start');
    return { svg, over: '' };
  }

  testState() { return { step: this.stepIndex, shift: this.d, anim: this.anim }; }
}
