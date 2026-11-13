/**
 * ShiftAndPairsScene - L02 s04 "Demand Can Change When the Price Does Not" (3 beats). SvgScene, design units
 * 560 x 480 landscape, 390 x 600 portrait. No made-up numbers: arrows on boards, people in queues.
 *   b0 the whole curve moves: a demand curve (price up, quantity along, no numbers) and a queue at a phone shop
 *      ("new phone"). "want more" / "want less": the WHOLE curve slides right / left from its ghost, with an
 *      arrow at every price level and "more at every price" / "less at every price"; the queue grows / shrinks.
 *      Chip: "price change: move along". Cold start: "want more" (plays once on entry).
 *   b1 substitutes: a coffee stall and a tea stall. Coffee's board turns "costlier" (up arrow), tea's stays
 *      "same price"; two people walk from the coffee crowd to the tea crowd; "tea: demand up". Plays on entry;
 *      "replay".
 *   b2 complements: a cinema and a popcorn counter. Tickets turn "costlier"; the cinema crowd shrinks and the
 *      popcorn crowd shrinks with it; the popcorn board stays "same price" (lit); "popcorn: demand down". Pair
 *      chips: "phone + earphones", "car + petrol". Plays on entry; "replay".
 * People: shared/MangoPeople.js generic buyers. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, frame, axes, arrow, pill, btn } from '../shared/MarketParts.js';

const f1 = (v) => (+v).toFixed(1);
const UP = '\u2191';
const DN = '\u2193';
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const SHIFT = { none: 0, more: 2.6, less: -2.6 };
const QUEUE = { none: 5, more: 8, less: 3 };
const BAD = 'var(--sim-bad)';
const GOOD = 'var(--sim-good)';

const stallArt = (cx, gy, w) => civicSvg('stall', cx, gy, { w }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '');

/** A row of cups on a counter; kind 'coffee' (dark mugs) or 'tea' (small glasses of amber tea). */
function cups(cx, y, kind, n, s) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = cx + (i - (n - 1) / 2) * s * 1.5;
    if (kind === 'coffee') {
      const col = 'color-mix(in oklab, var(--sim-series-8) 45%, black)';
      out += `<path d="M${f1(x + s * 0.42)} ${f1(y - s * 0.75)}q${f1(s * 0.32)} 0 ${f1(s * 0.32)} ${f1(s * 0.3)}t${f1(-s * 0.32)} ${f1(s * 0.3)}" ${stroke(col, Math.max(2, s * 0.12))}/>`
        + `<rect x="${f1(x - s * 0.45)}" y="${f1(y - s)}" width="${f1(s * 0.9)}" height="${f1(s)}" rx="${f1(s * 0.14)}" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2`)}/>`
        + `<ellipse cx="${f1(x)}" cy="${f1(y - s)}" rx="${f1(s * 0.45)}" ry="${f1(s * 0.12)}" ${fill('color-mix(in oklab, var(--sim-series-8) 30%, black)')}/>`;
    } else {
      const glass = 'color-mix(in oklab, var(--sim-bg-surface) 70%, var(--sim-series-1))', tea = 'color-mix(in oklab, var(--sim-series-2) 70%, var(--sim-series-8))';
      out += `<path d="M${f1(x - s * 0.36)} ${f1(y - s)}L${f1(x - s * 0.28)} ${f1(y)}H${f1(x + s * 0.28)}L${f1(x + s * 0.36)} ${f1(y - s)}Z" ${fill(glass, 'stroke:var(--sim-stroke);stroke-width:2')}/>`
        + `<path d="M${f1(x - s * 0.33)} ${f1(y - s * 0.68)}L${f1(x - s * 0.28)} ${f1(y - 2)}H${f1(x + s * 0.28)}L${f1(x + s * 0.33)} ${f1(y - s * 0.68)}Z" ${fill(tea)}/>`;
    }
  }
  return out;
}

/** Popcorn tubs on a counter: striped tubs heaped with popcorn. */
function tubs(cx, y, n, s) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = cx + (i - (n - 1) / 2) * s * 1.25, top = y - s;
    for (let k = -2; k <= 2; k++) out += `<circle cx="${f1(x + k * s * 0.16)}" cy="${f1(top - s * 0.06 - (2 - Math.abs(k)) * s * 0.08)}" r="${f1(s * 0.16)}" ${fill('color-mix(in oklab, var(--sim-series-2) 35%, var(--sim-bg-surface))', 'stroke:color-mix(in oklab, var(--sim-series-2) 60%, var(--sim-label));stroke-width:1.5')}/>`;
    out += `<path d="M${f1(x - s * 0.42)} ${f1(top)}L${f1(x - s * 0.3)} ${f1(y)}H${f1(x + s * 0.3)}L${f1(x + s * 0.42)} ${f1(top)}Z" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`;
    for (const fx of [-0.2, 0.08]) out += `<path d="M${f1(x + fx * s - s * 0.06)} ${f1(top)}L${f1(x + fx * s)} ${f1(y)}h${f1(s * 0.12)}l${f1(-s * 0.04)} ${f1(-s)}Z" ${fill('var(--sim-series-6)')}/>`;
  }
  return out;
}

/** A cinema front: a building, a marquee band with the word, two posters, a door. (x, y) ground centre. */
function cinema(x, y, w) {
  const h = w * 0.85, x0 = x - w / 2, top = y - h, wall = 'color-mix(in oklab, var(--sim-series-5) 22%, var(--sim-bg-surface))';
  let s = `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(wall, 'stroke:var(--sim-stroke);stroke-width:3')}/>`;
  s += `<rect x="${f1(x0 - 8)}" y="${f1(top + h * 0.08)}" width="${f1(w + 16)}" height="${f1(h * 0.24)}" rx="8" ${fill('var(--sim-series-5)', `stroke:${shade('var(--sim-series-5)', 65)};stroke-width:3`)}/>`;
  for (let i = 0; i < 9; i++) s += `<circle cx="${f1(x0 + w * (0.06 + i * 0.11))}" cy="${f1(top + h * 0.1 + 4)}" r="3" ${fill('var(--sim-series-2)')}/>`;
  s += txt(x, top + h * 0.26, 'cinema', w * 0.15, 'var(--sim-ink-on-5, var(--sim-bg-deep))');
  for (const fx of [0.08, 0.7]) s += `<rect x="${f1(x0 + w * fx)}" y="${f1(top + h * 0.42)}" width="${f1(w * 0.22)}" height="${f1(h * 0.32)}" rx="4" ${fill('color-mix(in oklab, var(--sim-series-1) 40%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2')}/>`;
  s += `<rect x="${f1(x - w * 0.15)}" y="${f1(top + h * 0.48)}" width="${f1(w * 0.3)}" height="${f1(h * 0.52)}" rx="4" ${fill(shade(wall, 70), 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
  return s;
}

/** A sign board: the thing's name and its price state. */
function board(x, y, w, name, state, o = {}) {
  const h = 74, edge = o.lit ? 'var(--sim-accent)' : 'var(--sim-stroke)';
  const face = o.lit ? 'color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)';
  return `<g${o.cls ? ` class="${o.cls}"` : ''}><rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 5)}" width="${f1(w)}" height="${h}" rx="16" ${fill(shade(edge, 75))}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${h}" rx="16" ${fill(face, `stroke:${edge};stroke-width:3`)}/>`
    + txt(x, y - 6, name, 26) + txt(x, y + 24, state, 21, o.col ?? 'var(--sim-label-muted)') + '</g>';
}

export class ShiftAndPairsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A demand curve and a queue at a phone shop for a new phone. When people want more at every price, the whole curve moves right and the queue grows; when they want less, it moves left. A change in price only moves along the curve. Substitutes: coffee becomes costlier while tea stays at the same price, two coffee drinkers walk over to the tea stall, and the demand for tea rises. Complements: cinema tickets become costlier, fewer people go to the cinema, and fewer buy popcorn, though the popcorn price is the same: the demand for popcorn falls. Other pairs used together: phone and earphones, car and petrol.';

  async setup() {
    this.want = 'more';
    this.done = true;
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

  css() { return PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.move = null; this.walking = false; this.popLab = false; }

  enter(step) {
    this.clear();
    this.want = 'more';
    this.done = true;
    if (step === 0) { this.want = 'none'; this.anim = true; this.after(0.7, () => this.setWant('more')); }
    else { this.done = false; this.anim = true; this.after(0.8, () => this.change()); }
  }

  setWant(w) {
    this.clear();
    this.move = { from: this.want };
    this.want = w;
    this.anim = true;
    this.repaint();
    this.move = null;
    this.after(0.8, () => { this.anim = false; this.popLab = true; this.repaint(); this.popLab = false; });
  }

  // b1 / b2: the price board changes, people walk.
  change() {
    this.clear();
    this.done = true;
    this.walking = true;
    this.anim = true;
    this.repaint();
    this.after(1.2, () => { this.walking = false; this.popLab = true; this.repaint(); this.popLab = false; });
    this.after(1.7, () => { this.anim = false; this.repaint(); });
  }

  act(a, v) {
    const s = this.stepIndex;
    if (s === 0 && a === 'want') this.setWant(this.want === v ? 'none' : v);
    else if (s > 0 && a === 'go') this.change();
    else if (s > 0 && a === 'again') { this.clear(); this.done = false; this.repaint(); }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    if (this.stepIndex === 0 && this.want === 'none') this.want = 'more';
    else if (this.stepIndex > 0) this.done = true;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 0 ? this.paintShift(P) : this.paintPair(P, this.stepIndex === 1);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the whole curve moves; the queue at the phone shop.
  paintShift(P) {
    let svg = '', over = '';
    const g = P ? frame(64, 370, 62, 300, 10, 10) : frame(64, 356, 58, 290, 10, 10);
    svg += axes(g, { xs: [], ys: [], gridX: [2, 4, 6, 8], gridY: [2, 4, 6, 8], yTitle: 'price', xTitle: 'quantity', yTitleX: 34, xTitleY: g.B + 36 });
    const base = [[3, 9], [7, 1]], d = SHIFT[this.want], col = MKT;
    const pt = (q, p) => [g.X(q), g.Y(p)];
    const seg = (dx) => { const [a, b] = base; const [x0, y0] = pt(a[0] + dx, a[1]); const [x1, y1] = pt(b[0] + dx, b[1]); return `M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}`; };
    if (d !== 0) {
      svg += `<path d="${seg(0)}" ${stroke('var(--sim-label-muted)', 5, 'stroke-dasharray:10 9;opacity:0.7')}/>`;
      svg += txt(g.X(3) - 8, g.Y(9) + 6, 'before', 19, 'var(--sim-label-muted)', 'end');
    }
    const from = this.move ? SHIFT[this.move.from] : d, ox = (g.X(from) - g.X(0)) - (g.X(d) - g.X(0));
    const slide = this.move ? ` class="mq-fly" style="--dx:${f1(ox)}px;--dy:0px;--dur:0.7s"` : '';
    svg += `<g${slide}><path d="${seg(d)}" ${stroke(col, 7)}/></g>`;
    if (d !== 0 && !this.anim) {
      const pop = this.popLab ? ' class="mq-fade"' : '';
      let ar = '';
      for (const p of [7, 5, 3]) {
        const q = 3 + (9 - p) / 2;
        const xa = g.X(q) + (d > 0 ? 10 : -10), xb = g.X(q + d) + (d > 0 ? -10 : 10);
        ar += arrow(xa, g.Y(p), xb, g.Y(p), d > 0 ? GOOD : BAD, 4);
      }
      svg += `<g${pop}>${ar}${pill((g.L + g.R) / 2, g.T - 30, d > 0 ? 'more at every price' : 'less at every price', { size: P ? 20 : 20, bg: d > 0 ? GOOD : BAD, ink: 'var(--sim-bg-deep)', edge: d > 0 ? GOOD : BAD })}</g>`;
    }
    // the in-figure toggles and the contrast chip
    const B = P ? { m: [106, 396], l: [282, 396], chip: [195, 442] } : { m: [462, 70], l: [462, 130], chip: [462, 216] };
    over += btn('want', `want more`, B.m[0], B.m[1], { val: 'more', on: this.want === 'more' });
    over += btn('want', `want less`, B.l[0], B.l[1], { val: 'less', on: this.want === 'less' });
    if (P) svg += pill(B.chip[0], B.chip[1], 'price change: move along', { size: 18, ink: 'var(--sim-label-muted)' });
    else svg += pill(B.chip[0], B.chip[1] - 18, 'price change:', { size: 17, ink: 'var(--sim-label-muted)' }) + txt(B.chip[0], B.chip[1] + 20, 'move along', 17, 'var(--sim-label-muted)');
    // the phone shop and its queue
    const Q = P ? { shop: [330, 570, 112], gy: 570, h: 104, x0: 252, dx: 30, sign: [330, 470] } : { shop: [480, 454, 136], gy: 454, h: 116, x0: 390, dx: 40, sign: [480, 312] };
    svg += civicSvg('shop', Q.shop[0], Q.shop[1], { w: Q.shop[2] });
    svg += pill(Q.sign[0], Q.sign[1], 'new phone', { size: P ? 17 : 19, bg: 'var(--sim-series-1)', ink: 'var(--sim-ink-on-1, var(--sim-bg-deep))', edge: 'var(--sim-series-1)' });
    const n = QUEUE[this.want], was = this.move ? QUEUE[this.move.from] : n;
    for (let i = n - 1; i >= 0; i--) {
      const fresh = i >= was;
      over += personSlot(`buyer${i + 1}`, { x: Q.x0 - i * Q.dx, y: Q.gy, h: Q.h, pose: 'stand', facing: 1, mood: 'smile', cls: fresh ? 'mpp-pop' : '', style: fresh ? `--d:${f1(0.3 + (i - was) * 0.12)}s` : '' });
    }
    return { svg, over };
  }

  // b1 substitutes (coffee / tea) and b2 complements (cinema / popcorn).
  paintPair(P, subs) {
    let svg = '', over = '';
    const G = P
      ? { ax: 104, bx: 288, w: 184, gy: 296, board: 52, tag: 122, pg: 468, ph: 128, pdx: 20, go: [195, 522], pairs: [[104, 570], [290, 570]], fs: 18 }
      : { ax: 140, bx: 420, w: 210, gy: 296, board: 48, tag: 118, pg: 420, ph: 132, pdx: 30, go: [280, 452], pairs: [[150, 456], [410, 456]], fs: 20 };
    const done = this.done, s = G.w / 230;
    // venue A: coffee stall / cinema; venue B: tea stall / popcorn counter
    if (subs) {
      svg += stallArt(G.ax, G.gy, G.w) + cups(G.ax, G.gy - 84 * s, 'coffee', 4, 22 * s);
      svg += stallArt(G.bx, G.gy, G.w) + cups(G.bx, G.gy - 84 * s, 'tea', 5, 20 * s);
    } else {
      svg += cinema(G.ax, G.gy, G.w * 0.86);
      svg += stallArt(G.bx, G.gy, G.w) + tubs(G.bx, G.gy - 84 * s, 4, 30 * s);
    }
    const flip = this.walking ? ' mq-pop' : '';
    svg += board(G.ax, G.board, P ? 170 : 196, subs ? 'coffee' : 'tickets', done ? `costlier ${UP}` : 'price', { col: done ? BAD : undefined, cls: flip.trim() });
    svg += board(G.bx, G.board, P ? 170 : 196, subs ? 'tea' : 'popcorn', 'same price', { lit: !subs && done });
    // the crowds: coffee 5 -> 3 and tea 2 -> 4 (two walk across); cinema 5 -> 2, popcorn 4 -> 2 (they leave)
    const nA0 = 5, nB0 = subs ? 2 : 4, nA = done ? (subs ? 3 : 2) : nA0, nB = done ? (subs ? 4 : 2) : nB0;
    const spot = (cx, i, n) => cx + (i - (n - 1) / 2) * G.pdx * 1.6;
    for (let i = 0; i < nA; i++) over += personSlot(`buyer${i + 1}`, { x: spot(G.ax, i, nA), y: G.pg, h: G.ph, facing: 0, mood: 'smile' });
    for (let i = 0; i < nB; i++) {
      const walker = subs && done && i >= nB0;
      if (walker && this.walking) {
        const sx = spot(G.ax, nA + (i - nB0), nA0), tx = spot(G.bx, i, nB);
        over += personSlot(`buyer${i + 7}`, { x: tx, y: G.pg, h: G.ph, pose: 'walk', facing: 1, mood: 'smile', cls: 'mq-fly', style: `--dx:${f1(sx - tx)}px;--dy:0px;--dur:1.0s;--d:${f1((i - nB0) * 0.15)}s` });
      } else over += personSlot(`buyer${walker ? i + 7 : i + 11}`, { x: spot(G.bx, i, nB), y: G.pg, h: G.ph, facing: 0, mood: 'smile' });
    }
    // b2: the people who leave fade out walking left
    if (!subs && done && this.walking) {
      for (let i = nA; i < nA0; i++) over += `<div class="mq-fade" style="animation-direction:reverse;animation-duration:1s">${personSlot(`buyer${i + 1}`, { x: spot(G.ax, i, nA0), y: G.pg, h: G.ph, pose: 'walk', facing: -1 })}</div>`;
      for (let i = nB; i < nB0; i++) over += `<div class="mq-fade" style="animation-direction:reverse;animation-duration:1s">${personSlot(`buyer${i + 11}`, { x: spot(G.bx, i, nB0), y: G.pg, h: G.ph, pose: 'walk', facing: 1 })}</div>`;
    }
    // the result chip under venue B's board
    if (done && !this.walking) {
      const t = subs ? `tea: demand ${UP}` : `popcorn: demand ${DN}`, c = subs ? GOOD : BAD;
      svg += `<g${this.popLab ? ' class="mq-pop"' : ''}>${pill(G.bx, G.tag, t, { size: P ? 19 : 22, bg: c, ink: 'var(--sim-bg-deep)', edge: c })}</g>`;
    }
    if (!subs) {
      svg += pill(G.pairs[0][0], G.pairs[0][1], 'phone + earphones', { size: G.fs, ink: 'var(--sim-label)' });
      svg += pill(G.pairs[1][0], G.pairs[1][1], 'car + petrol', { size: G.fs, ink: 'var(--sim-label)' });
    }
    const bp = subs ? G.go : [P ? 195 : 280, P ? 516 : 392];
    if (!done) over += btn('go', subs ? `coffee costlier ${UP}` : `tickets costlier ${UP}`, bp[0], bp[1], { go: true });
    else if (!this.anim) over += btn('again', 'replay', bp[0], bp[1]);
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, want: this.want, queue: QUEUE[this.want], done: this.done }; }
}
