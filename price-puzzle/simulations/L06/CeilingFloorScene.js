/**
 * CeilingFloorScene - L06 s02 (predict, setup mount) and s03 "Highest and Lowest Prices" (3 beats). SvgScene,
 * design units 560 x 490 landscape, 390 x 600 portrait. The mango market graph (as L05 PointEScene: DmDm' MKT
 * series-5 q = 24 - 0.12 p, SmSm' SUP series-7 q = 0.12 p, E Rs 100 / 12 kg). Ceiling and floor parts from
 * ../shared/GovParts.js (lid, floorBar, capTag).
 *   setup  E ringed with its Rs 100 / 12 kg pills; a lid on the Rs 50 line, "ceiling Rs 50", a "?" by it.
 *          No quantities at Rs 50, no bracket, no "shortage".
 *   b0     the lid at Rs 50: dots on DmDm' (18 kg) and SmSm' (6 kg), a bracket "shortage 12 kg"; an up arrow
 *          rises from below, hits the lid and stops; a faint dashed arrow shows where a free price would go
 *          (to E); pill "price cannot rise". Plays on entry, "replay".
 *   b1     the medicine counter with named cases "market price" / "highest price" (rest). Market price: a high
 *          tag, 8 boxes on the shelves, one buyer can pay, two cannot. Highest price: a tag with a lid, only 3
 *          boxes (sellers offer less), two buyers can buy now, one is still waiting. No rupee numbers.
 *   b2     the graph with both: the lid at Rs 50 below E ("ceiling: highest price"), a floor bar at Rs 150 above
 *          E ("floor: lowest price"); beside it a worker and a "minimum wage" tag on a floor bar, a down arrow
 *          blocked by the bar.
 * People are SimFigure people via ../shared/MangoPeople.js. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { RS } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, frame, axes, line, dot, arrow, pill, btn } from '../shared/MarketParts.js';
import { SUP, SINK } from '../shared/SupplyParts.js';
import { counter, medBox, lid, floorBar, capTag, castFamilies, CAP } from '../shared/GovParts.js';

castFamilies();

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const qD = (p) => 24 - 0.12 * p;
const qS = (p) => 0.12 * p;

function curveLabel(x, y, letter, prime, col, size, anchor = 'start') {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${letter}<tspan style="font-size:${Math.round(size * 0.68)}px" dy="${Math.round(size * 0.2)}">m</tspan>${prime ? `<tspan dy="-${Math.round(size * 0.2)}">'</tspan>` : ''}</text>`;
}

export class CeilingFloorScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN, [Number.MAX_SAFE_INTEGER]: [[{ idx: 3, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'The mango market graph: demand and supply meet at E, 100 rupees and 12 kg. A rule puts a lid on the price at 50 rupees, the highest price allowed. At 50 rupees buyers want 18 kg but sellers offer only 6 kg: a shortage of 12 kg. The price would rise towards E, but the lid stops it, so the shortage stays. Then medicines: at the market price only one buyer can pay; under a highest price two can buy, but fewer boxes are on the shelf and one buyer is still waiting. Then both lines on the graph: the ceiling, a highest price, below E at 50 rupees, and the floor, a lowest price, above E at 150 rupees. A minimum wage is a floor: the wage cannot go below it.';

  async setup() {
    this.cap = true;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || this.view === 3) return;
      const a = b.dataset.act;
      if (this.view === 0 && a === 'replay') this.burst(2.2);
      else if (this.view === 1 && (a === 'mkt' || a === 'cap')) { this.cap = a === 'cap'; this.burst(1.0); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  get view() { return this.hostRole === 'setup' ? 3 : this.stepIndex; }

  css() { return PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.cap = true;
    if (this.hostRole === 'setup') return;
    this.burst(step === 0 ? 2.2 : 1.4);
  }

  burst(sec) {
    this.clear();
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

  stageHeight(st) { return Math.round((st.portrait ? 600 : 490) * st.W / (st.portrait ? 390 : 560)); }

  pop(d) { return this.fresh ? ` class="mq-pop" style="--d:${d}s"` : ''; }
  fade(d) { return this.fresh ? ` class="mq-fade" style="--d:${d}s"` : ''; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 490, k = (st.W / DW).toFixed(4), v = this.view;
    const out = v === 1 ? this.paintMeds(P) : v === 2 ? this.paintBoth(P) : this.paintCeiling(P, v === 3);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  curves(g, P, ls) {
    let s = line(g, 22.5, 12.5, 1.5, 187.5, MKT, { w: 7 });
    s += curveLabel(g.X(1.5) + 12, g.Y(187.5) + 10, 'D', false, SINK(5), ls) + curveLabel(g.X(22.5) - 22, g.Y(12.5) + 6, 'D', true, SINK(5), ls, 'end');
    s += line(g, 1.5, 12.5, 22.5, 187.5, SUP, { w: 7 });
    s += curveLabel(g.X(1.5) + 14, g.Y(12.5) + 4, 'S', false, SINK(7), ls) + curveLabel(g.X(22.5) - 8, g.Y(187.5) + 8, 'S', true, SINK(7), ls, 'end');
    return s;
  }

  eRing(g, P, pills) {
    const ex = g.X(12), ey = g.Y(100);
    let s = '';
    if (pills) s += `<path d="M${f1(g.L)} ${f1(ey)}H${f1(ex)}V${f1(g.B)}" ${stroke(ACC, 3, 'stroke-dasharray:9 8')}/>`;
    s += `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="${P ? 20 : 24}" ${fill('color-mix(in oklab, var(--sim-accent) 18%, transparent)', 'stroke:var(--sim-accent);stroke-width:4.5')}/>`;
    s += dot(ex, ey, '', { col: 'var(--sim-label)', r: 9 });
    s += txt(ex + (P ? 24 : 28), ey - (P ? 14 : 18), 'E', P ? 28 : 32, ACC, 'start');
    if (pills) {
      s += pill(g.L - (P ? 38 : 44), ey, `${RS}100`, { size: P ? 20 : 22, bg: ACC, ink: ACC_INK, edge: ACC, padX: 16 });
      s += pill(ex, g.B + (P ? 26 : 28), '12 kg', { size: P ? 20 : 22, bg: ACC, ink: ACC_INK, edge: ACC, padX: 16 });
    }
    return s;
  }

  // setup and b0: the mango graph with a lid at Rs 50
  paintCeiling(P, setup) {
    const g = P ? frame(78, 374, 50, 420, 24, 200) : frame(132, 528, 30, 330, 24, 200);
    const ls = P ? 26 : 30, y = g.Y(50);
    let svg = '', over = '';
    svg += axes(g, { xs: [6, 18], ys: [50, 150], gridX: [6, 12, 18], gridY: [50, 100, 150], yTitleX: P ? -999 : 40, yTitle: P ? '' : undefined,
      xTitleY: P ? 484 : 402, tick: P ? 18 : 20, title: P ? 20 : 22 });
    if (P) svg += txt(10, 30, `price (${RS} per kg)`, 20, 'var(--sim-label)', 'start');
    svg += this.curves(g, P, ls);
    svg += this.eRing(g, P, true);
    svg += lid(g, 50, { cls: this.fresh ? 'mq-fade' : '' });
    const lx = g.L + (P ? 62 : 70), ly = y - (P ? 32 : 36);
    svg += pill(lx, ly, `ceiling ${RS}50`, { size: P ? 17 : 18, bg: 'var(--sim-bg-surface)', ink: CAP, edge: CAP });
    if (setup) {
      svg += pill(g.X(13.5), y + (P ? 36 : 40), '?', { size: P ? 30 : 34, bg: ACC, ink: ACC_INK, edge: ACC, padX: 30 });
      return { svg, over };
    }
    // the shortage at Rs 50: both quantities, the gap lit on the line under the lid
    const xs = g.X(qS(50)), xd = g.X(qD(50));
    svg += `<g${this.fade(0.3)}>`;
    svg += `<path d="M${f1(xs)} ${f1(y)}H${f1(xd)}" ${stroke(ACC, 7)}/>`;
    svg += dot(xs, y, '', { col: SUP, r: 10 }) + dot(xd, y, '', { col: MKT, r: 10 });
    svg += txt(xs + 14, y + 30, '6 kg', P ? 18 : 20, SINK(7), 'start') + txt(xd - 14, y + 30, '18 kg', P ? 18 : 20, SINK(5), 'end');
    svg += pill((xs + xd) / 2, y + (P ? 54 : 56), 'shortage 12 kg', { size: P ? 18 : 20, bg: ACC, ink: ACC_INK, edge: ACC });
    svg += '</g>';
    // the price pushes up and the lid stops it
    const ax = g.L + (P ? 22 : 24);
    const rise = this.fresh ? ' class="mq-fly" style="--dx:0px;--dy:40px;--dur:0.6s;--d:0.9s"' : '';
    svg += `<g${rise}>${arrow(ax, y + (P ? 56 : 52), ax, y + 2, 'var(--sim-bad)', 7)}</g>`;
    svg += `<g${this.pop(1.5)}><path d="M${f1(ax - 18)} ${f1(y - 2)}l-10 -8M${f1(ax + 18)} ${f1(y - 2)}l10 -8" ${stroke('var(--sim-bad)', 4)}/></g>`;
    const py = P ? 530 : 440;
    svg += `<g${this.pop(1.6)}>${pill(P ? 195 : 300, py, 'price cannot rise', { size: P ? 20 : 22, bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' })}</g>`;
    if (!this.anim) over += btn('replay', 'replay', P ? 195 : 478, P ? 576 : 440, { size: 18 });
    return { svg, over };
  }

  // b1: the medicine counter, market price against highest price
  paintMeds(P) {
    const cap = this.cap;
    const G = P ? { cx: 195, cgy: 392, cw: 190, gy: 568, xs: [62, 170, 322], H: 146, btn: [[110, 36], [282, 36]], one: 116 }
      : { cx: 300, cgy: 380, cw: 190, gy: 380, xs: [50, 160, 488], H: 160, btn: [[180, 456], [380, 456]], one: 105 };
    let svg = '', over = '', front = '';
    const C = counter(G.cx, G.cgy, G.cw, { boxes: cap ? 3 : 8 });
    svg += `<g${this.fade(0)}>${C.svg}</g>`;
    const ty = G.cgy - G.cw * 0.95 - (P ? 62 : 64), ts = P ? 20 : 22;
    svg += `<g${this.pop(0.1)}>${cap ? capTag(G.cx, ty, 'highest price', { size: ts, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', edge: CAP })
      : pill(G.cx, ty, 'market price \u2191', { size: ts, bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' })}</g>`;
    if (P) svg += `<path d="M0 ${f1(G.gy + 2)}H390" ${stroke('var(--sim-stroke)', 3)}/>`;
    const who = ['medA', 'poorA', 'waitA'], has = cap ? [true, true, false] : [true, false, false];
    who.forEach((w, i) => {
      const x = G.xs[i], grip = G.gy - G.H * 0.5;
      const hands = has[i] ? [{ x: x + 14, y: grip }, { x: x - 14, y: grip }] : null;
      over += personSlot(w, { x, y: G.gy, h: G.H, pose: 'stand', facing: 0, mood: has[i] ? 'happy' : 'sad', hands });
      if (has[i]) front += `<g${this.pop(0.4 + i * 0.2)}>${medBox(x, grip + 22, 42)}</g>`;
    });
    const ly = G.gy + 22, fs = P ? 17 : 18;
    const good = { size: fs, bg: 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-good)' };
    const bad = { size: fs, bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' };
    let labs = '';
    if (cap) labs += pill(G.one, ly, 'can buy now', good) + pill(G.xs[2], ly, 'still waiting', bad);
    else labs += pill(G.xs[0], ly, 'can pay', good) + pill(G.xs[1] + 4, ly, 'cannot pay', bad) + pill(G.xs[2], ly, 'cannot pay', bad);
    front += `<g${this.fade(0.8)}>${labs}</g>`;
    over += frontSvg(P ? 390 : 560, P ? 600 : 490, front);
    over += btn('mkt', 'market price', G.btn[0][0], G.btn[0][1], { on: !cap, aria: 'show the market price', size: 19 });
    over += btn('cap', 'highest price', G.btn[1][0], G.btn[1][1], { on: cap, aria: 'show a highest price', size: 19 });
    return { svg, over };
  }

  // b2: both lines on the graph, and a minimum wage on its floor
  paintBoth(P) {
    const g = P ? frame(78, 374, 40, 330, 24, 200) : frame(110, 352, 40, 400, 24, 200);
    const ls = P ? 24 : 26;
    let svg = '', over = '', front = '';
    svg += axes(g, { xs: [], ys: [50, 100, 150], gridX: [], gridY: [50, 100, 150], yTitleX: P ? -999 : 32, yTitle: P ? '' : undefined,
      xTitleY: P ? 360 : 432, tick: P ? 18 : 20, title: P ? 20 : 22 });
    if (P) svg += txt(10, 24, `price (${RS} per kg)`, 18, 'var(--sim-label)', 'start');
    svg += this.curves(g, P, ls);
    svg += this.eRing(g, P, false);
    svg += `<g${this.pop(0.2)}>${lid(g, 50)}</g>`;
    svg += `<g${this.pop(0.5)}>${floorBar(g, 150)}</g>`;
    const mx = (g.L + g.R) / 2, fs = P ? 17 : 18;
    svg += `<g${this.fade(0.4)}>${pill(mx, g.Y(50) + 28, 'ceiling: highest price', { size: fs, bg: 'var(--sim-bg-surface)', ink: CAP, edge: CAP })}</g>`;
    svg += `<g${this.fade(0.7)}>${pill(mx, g.Y(150) - 28, 'floor: lowest price', { size: fs, bg: 'var(--sim-bg-surface)', ink: CAP, edge: CAP })}</g>`;
    // the minimum wage: a tag on a floor bar, a down arrow blocked by it, the worker
    const W = P ? { tx: 120, ty: 432, wx: 300, gy: 590, h: 186, fs: 20 } : { tx: 428, ty: 100, wx: 452, gy: 440, h: 220, fs: 19 };
    const tw = 12 * W.fs * 0.56 + W.fs * 1.1, ext = P ? 40 : 30, th = W.fs * 1.55, barY = W.ty + th / 2 + 2, ax = W.tx + tw / 2 + 12 + ext / 2;
    svg += `<g${this.pop(0.9)}>${capTag(W.tx, W.ty, 'minimum wage', { kind: 'floor', ext, size: W.fs, bg: 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-good)' })}</g>`;
    const fall = this.fresh ? ' class="mq-fly" style="--dx:0px;--dy:-30px;--dur:0.6s;--d:1.1s"' : '';
    svg += `<g${fall}>${arrow(ax, W.ty - 50, ax, barY - 2, 'var(--sim-bad)', 6)}</g>`;
    over += personSlot('worker', { x: W.wx, y: W.gy, h: W.h, pose: 'stand', facing: 0, mood: 'happy' });
    over += frontSvg(P ? 390 : 560, P ? 600 : 490, front);
    return { svg, over };
  }

  testState() {
    const v = this.view;
    return { view: v, E: { kg: 12, price: 100 }, ceiling: 50, floor: v === 2 ? 150 : null, cap: v === 1 ? this.cap : null, anim: this.anim,
      want: v === 0 ? qD(50) : null, offer: v === 0 ? qS(50) : null, shortage: v === 0 ? qD(50) - qS(50) : null };
  }
}
