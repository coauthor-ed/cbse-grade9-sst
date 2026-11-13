/**
 * DemandRecapScene - L02 s09 "The Demand Side in Short" (2 beats). SvgScene, design units 560 x 480 landscape,
 * 390 x 600 portrait. The market demand curve DmDm' of Table 9.1: E (6 kg, Rs 150), F (12 kg, Rs 100), G (18 kg,
 * Rs 50). Market colour MKT (series-5), as every L02 scene.
 *   b0  the curve and six named cases in the figure. "price falls": a dot moves along the curve from F to G, the
 *       curve stays ("move along the curve"). Five other cases move the WHOLE curve, the old one left as a dashed
 *       ghost, arrows at Rs 150 / 100 / 50: income rises (right), a substitute gets costlier (right), a complement
 *       gets costlier (left), buyers expect a lower price (left), more buyers (right). Cold start: price falls.
 *   b1  now the sellers: the mango stall, Seller A, B and C each beside a heap with "? kg", the chip
 *       "supply: next lesson". Sellers and heaps come in on entry.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MANGO_CSS, heap } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, frame, axes, line, dot, arrow, pill, btn } from '../shared/MarketParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const GOOD = 'var(--sim-good)';
const BAD = 'var(--sim-bad)';
const INK5 = 'var(--sim-ink-on-5, var(--sim-bg-deep))';
const SHIFT = 5;
const CASES = [
  { k: 'price', lab: 'price falls', d: 0 },
  { k: 'income', lab: 'income rises', d: 1 },
  { k: 'sub', lab: 'a substitute gets costlier', d: 1 },
  { k: 'comp', lab: 'a complement gets costlier', d: -1 },
  { k: 'expect', lab: 'buyers expect a lower price', d: -1 },
  { k: 'more', lab: 'more buyers', d: 1 },
];
// DmDm' runs from (3 kg, Rs 175) to (19.5 kg, Rs 37.5): through E (6, 150), F (12, 100), G (18, 50).
const Q0 = 3, P0 = 175, Q1 = 19.5, P1 = 37.5;
const qAt = (p) => Q0 + (P0 - p) * (Q1 - Q0) / (P0 - P1);
const SELLERS = ['sellerA', 'sellerB', 'sellerC'];

const stallArt = (cx, gy, w) => civicSvg('stall', cx, gy, { w }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '');

const CSS = `
.dr-chips .mq-btn { white-space: normal; text-align: center; line-height: 1.15; padding: 5px 10px; }
.dr-chips .dr-w .mq-btn { width: var(--bw, 200px); }
`;

export class DemandRecapScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The market demand curve DmDm\' through 6 kg at 150 rupees, 12 kg at 100 rupees and 18 kg at 50 rupees. When the price falls, buyers move along the curve from 12 kg to 18 kg and the curve stays where it is. When anything else changes, the whole curve moves: income rises, a substitute gets costlier or more buyers come, and it moves right; a complement gets costlier or buyers expect a lower price, and it moves left. Then the sellers: Seller A, Seller B and Seller C bring heaps of mangoes to the stall. How much they offer at each price is supply, the next lesson.';

  async setup() {
    this.sel = 0;
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

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.from = null; this.popLab = false; this.come = false; }

  enter(step) {
    this.clear();
    this.sel = 0;
    if (step === 0) { this.sel = -1; this.anim = true; this.after(0.5, () => this.pick(0, -1)); }
    else { this.come = true; this.anim = true; this.after(1.6, () => { this.come = false; this.anim = false; this.popLab = true; this.repaint(); this.popLab = false; }); }
  }

  pick(i, prev = this.sel) {
    this.clear();
    this.from = prev;
    this.sel = i;
    this.anim = true;
    this.repaint();
    this.from = null;
    this.after(0.9, () => { this.anim = false; this.popLab = true; this.repaint(); this.popLab = false; });
  }

  act(a, v) {
    if (this.stepIndex === 0 && a === 'case') this.pick(Number(v));
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    if (this.stepIndex === 0 && this.sel < 0) this.sel = 0;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintSellers(P) : this.paintCurve(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the curve and the six cases.
  paintCurve(P) {
    let svg = '', over = '';
    const g = P ? frame(82, 376, 66, 296, 26, 200) : frame(94, 336, 62, 362, 26, 200);
    svg += axes(g, { xs: [6, 12, 18, 24], ys: [50, 100, 150], gridX: [6, 12, 18, 24], yTitleX: P ? 22 : 26, xTitleY: g.B + (P ? 50 : 60), tick: P ? 18 : 19, title: P ? 20 : 21 });
    const c = CASES[this.sel] ?? null, d = c ? c.d * SHIFT : 0;
    const X = (q) => g.X(q), Y = (p) => g.Y(p);
    const qs = (dq) => Math.max(Q0 + dq, 0.8), ps = (dq) => P0 - (qs(dq) - Q0 - dq) * (P0 - P1) / (Q1 - Q0);
    const seg = (dq, extra) => line(g, qs(dq), ps(dq), Q1 + dq, P1, MKT, extra);
    const lab = (x, y, a, prime, col = MKT) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="fill:${col};font:800 ${P ? 26 : 28}px var(--sim-font)">D<tspan style="font-size:${P ? 17 : 18}px" dy="6">m</tspan>${prime ? '<tspan dy="-6">\'</tspan>' : ''}</text>`;
    const pop = this.popLab ? ' class="mq-fade"' : '';
    if (d !== 0) {
      // the old curve stays as a ghost; the whole curve slides
      svg += seg(0, { w: 5, dash: '10 9', opacity: 0.55 }).replace(MKT, 'var(--sim-label-muted)');
      const fromD = this.from != null && CASES[this.from] ? CASES[this.from].d * SHIFT : 0;
      const slide = this.from != null ? ` class="mq-fly" style="--dx:${f1(X(fromD) - X(d))}px;--dy:0px;--dur:0.8s"` : '';
      svg += `<g${slide}>${seg(d, { w: 7 })}${lab(X(qs(d)) + (d < 0 ? 22 : -18), Y(ps(d)) + (d < 0 ? -4 : -2), d < 0 ? 'start' : 'end', false)}${lab(X(Q1 + d) + 4, Y(P1) + 36, 'middle', true)}</g>`;
      if (!this.anim) {
        const col = d > 0 ? GOOD : BAD;
        let ar = '';
        for (const p of [150, 100, 50]) {
          const xa = X(qAt(p)) + (d > 0 ? 12 : -12), xb = X(qAt(p) + d) + (d > 0 ? -12 : 12);
          ar += arrow(xa, Y(p), xb, Y(p), col, 4);
        }
        svg += `<g${pop}>${ar}${pill((g.L + g.R) / 2, g.T - 34, `whole curve moves ${d > 0 ? 'right' : 'left'}`, { size: P ? 20 : 21, bg: col, ink: 'var(--sim-bg-deep)', edge: col })}</g>`;
      }
    } else {
      svg += seg(0, { w: 7 }) + lab(X(Q0) - 18, Y(P0) - 2, 'end', false) + lab(X(Q1) + 4, Y(P1) + 36, 'middle', true);
      const pts = [['E', 6, 150], ['F', 12, 100], ['G', 18, 50]];
      if (c) {
        // price falls: from F to G along the curve
        const [fx, fy, gx, gy] = [X(12), Y(100), X(18), Y(50)];
        svg += dot(fx, fy, '', { r: 11, col: 'var(--sim-label-muted)' });
        const moving = this.from !== null || this.anim;
        if (!moving || !this.anim) {
          svg += `<g${pop}>${arrow(fx + 22, fy - 4, gx + 8, gy - 26, 'var(--sim-accent)', 4)}${pill((g.L + g.R) / 2, g.T - 34, 'move along the curve', { size: P ? 20 : 21, bg: 'var(--sim-accent)', ink: 'var(--on-primary, var(--sim-bg-deep))', edge: 'var(--sim-accent)' })}</g>`;
        }
        const fly = this.anim ? ` class="mq-fly" style="--dx:${f1(fx - gx)}px;--dy:${f1(fy - gy)}px;--dur:0.8s"` : '';
        svg += `<g${fly}>${dot(gx, gy, '', { r: 13, lit: !this.anim })}</g>`;
        svg += txt(fx - 18, fy - 16, 'F', P ? 24 : 26, 'var(--sim-label-muted)', 'end') + txt(gx - 18, gy - 18, 'G', P ? 24 : 26, 'var(--sim-label)', 'end');
      } else pts.forEach(([n, q, p]) => { svg += dot(X(q), Y(p), n, { r: 11, size: 26 }); });
    }
    // the six cases, in the figure
    const B = P
      ? { pos: [[100, 398], [290, 398], [100, 458], [290, 458], [100, 518], [290, 518]], bw: 182, fs: 16, groups: null }
      : { pos: [[452, 82], [452, 186], [452, 246], [452, 306], [452, 366], [452, 426]], bw: 200, fs: 17, groups: [[452, 40, 'the price itself'], [452, 144, 'anything else']] };
    for (const [x, y, t] of B.groups ?? []) svg += txt(x, y, t, 18, 'var(--sim-label-muted)');
    let chips = '';
    CASES.forEach((cs, i) => {
      chips += `<div class="dr-w" style="--bw:${B.bw}px">${btn('case', cs.lab, B.pos[i][0], B.pos[i][1], { val: i, on: i === this.sel, size: B.fs })}</div>`;
    });
    over += `<div class="dr-chips">${chips}</div>`;
    if (P) svg += txt(195, 566, 'tap a change', 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  // b1: the sellers bring their heaps; how much at each price is the next lesson.
  paintSellers(P) {
    let svg = '', over = '';
    const G = P
      ? { chip: [195, 36], st: [195, 284, 260], xs: [72, 195, 318], fy: 482, h: 186, hp: [72, 195, 318], hy: 584, hr: 8.5, q: 526, tag: 488, ts: 15 }
      : { chip: [280, 36], st: [280, 236, 270], xs: [60, 246, 432], fy: 428, h: 170, hp: [170, 358, 546], hy: 432, hr: 10, q: 360, tag: 436, ts: 17 };
    const [sx, sgy, sw] = G.st, s = sw / 230;
    svg += stallArt(sx, sgy, sw) + heap(sx, sgy - 84 * s, 4, { r: P ? 9 : 10 });
    svg += `<g${this.popLab ? ' class="mq-pop"' : ''}>${pill(G.chip[0], G.chip[1], 'supply: next lesson', { size: P ? 24 : 26, bg: MKT, ink: INK5, edge: MKT })}</g>`;
    SELLERS.forEach((who, i) => {
      const x = G.xs[i], from = i === 0 ? -40 : i === 2 ? 40 : 0;
      const walk = this.come ? ` mq-fly` : '';
      const style = this.come ? `--dx:${from}px;--dy:${i === 1 ? 30 : 0}px;--dur:0.9s;--d:${(i * 0.15).toFixed(2)}s` : '';
      over += personSlot(who, { x, y: G.fy, h: G.h, pose: this.come ? 'walk' : 'stand', facing: this.come ? (i === 0 ? 1 : i === 2 ? -1 : 0) : 0, mood: 'smile', cls: walk.trim(), style });
      svg += nameTag(x, G.tag, who, G.ts);
      const hx = P ? G.hp[i] : G.xs[i] + 68;
      const drop = this.come ? ` class="mk-drop" style="--d:${(0.9 + i * 0.15).toFixed(2)}s"` : '';
      svg += `<g${drop}>${heap(hx, G.hy, [2, 3, 3][i], { r: G.hr, tray: true })}</g>`;
      svg += pill(hx, G.q, '? kg', { size: P ? 16 : 20 });
    });
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, sel: this.sel, case: CASES[this.sel]?.k ?? null, shift: CASES[this.sel]?.d ?? null, anim: this.anim }; }
}
