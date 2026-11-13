/**
 * SupplyCurveScene - L03 s02 (predict, setup mount) and s03 "Higher Price, More Mangoes Offered" (3 beats).
 * SvgScene, design units 560 x 480 landscape, 390 x 600 portrait. Seller A (series-4 top, "he"), Table 9.2
 * column A: Rs 50 -> 1 kg, Rs 100 -> 2 kg, Rs 150 -> 3 kg. His curve SS' is series-4.
 *   setup  Seller A behind his stall, three price boards Rs 50 / 100 / 150 (none lit), an empty scale reading
 *          "? kg". No kg amounts, no arrows, no curve.
 *   b0     his supply schedule: the boards are buttons. Tap one: the basket on the scale fills to his kg for that
 *          price, the board lights; under each board its kg tag (the schedule rows) pops in on entry.
 *          Rest / cold start: Rs 100, 2 kg, all three tags.
 *   b1     the supply curve: A (1 kg, Rs 50), B (2 kg, Rs 100), C (3 kg, Rs 150) drop in with guides, then SS'
 *          draws through them, sloping up. Tap a point to light its guides; "again" replays.
 *   b2     the Law of Supply: the price board on a track (Rs 50 low, Rs 150 high) beside the scale. "price
 *          rises": the board climbs while the basket fills 1 -> 2 -> 3 kg; two up arrows, "same direction"; a
 *          new stall slides in at the edge, "new sellers join". "price falls" plays the reverse (both arrows
 *          down, no new stall). Rest: price rises (Rs 150, 3 kg).
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, RS, pan, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, paintPeople, personSlot, frontSvg } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, frame, axes, line, dot, guides, pill, btn } from '../shared/MarketParts.js';
import { SER, INK, sellerStall, stallArt, bigArrow } from '../shared/SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
const PRICES = [50, 100, 150];
const KG = [1, 2, 3];
const PTS = ['A', 'B', 'C'];
const S4 = SER(4);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const STEP_S = 0.7;

const CSS = `
svg .sc-slide { animation: sc-slide 0.6s cubic-bezier(.4,0,.3,1) both; }
@keyframes sc-slide { 0% { transform: translateY(var(--dy, 0px)); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .sc-slide { animation: none; } }
`;

export class SupplyCurveScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN, [Number.MAX_SAFE_INTEGER]: [[{ idx: 3, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'Seller A at his mango stall with three price boards, 50, 100 and 150 rupees a kg. At 50 rupees he offers 1 kg, at 100 rupees 2 kg, at 150 rupees 3 kg: his supply schedule. Plotted with price up the side and kg along the bottom, the points A (1 kg, 50 rupees), B (2 kg, 100 rupees) and C (3 kg, 150 rupees) join into his supply curve SS\', which slopes up from left to right. Law of Supply: when the price rises the quantity supplied rises, and a higher price brings new sellers; price and quantity supplied move in the same direction.';

  async setup() {
    this.sel = 1;
    this.tags = 3;
    this.shown = 3;
    this.drawn = true;
    this.lit = -1;
    this.mode = 'rise';
    this.pos = 2;
    this.prevPos = 2;
    this.joined = true;
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

  get view() { return this.hostRole === 'setup' ? 3 : this.stepIndex; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fromKg = null; this.popTag = -1; this.popPt = -1; this.slide = false; this.drawNow = false; this.joinPop = false; }

  enter(step) {
    this.clear();
    this.lit = -1;
    this.sel = 1; this.tags = 3; this.shown = 3; this.drawn = true; this.mode = 'rise'; this.pos = 2; this.prevPos = 2; this.joined = true;
    const v = this.hostRole === 'setup' ? 3 : step;
    if (v === 0) this.schedule();
    else if (v === 1) this.plot();
    else if (v === 2) this.law('rise');
  }

  // b0: the tags pop in turn, the basket fills to 2 kg at Rs 100.
  schedule() {
    this.tags = 0;
    this.anim = true;
    [0, 1, 2].forEach((i) => this.after(0.3 + i * 0.45, () => { this.tags = i + 1; this.popTag = i; this.repaint(); this.popTag = -1; }));
    this.after(1.6, () => { this.fromKg = 0; this.repaint(); this.fromKg = null; });
    this.after(2.8, () => { this.anim = false; this.repaint(); });
  }

  pick(i) {
    this.clear();
    const was = KG[this.sel];
    this.sel = i;
    this.tags = 3;
    this.fromKg = KG[i] > was ? was : null;
    this.repaint();
    this.fromKg = null;
  }

  // b1: points, then the curve.
  plot() {
    this.shown = 0;
    this.drawn = false;
    this.anim = true;
    [0, 1, 2].forEach((i) => this.after(0.4 + i * 0.6, () => { this.shown = i + 1; this.popPt = i; this.repaint(); this.popPt = -1; }));
    this.after(2.2, () => { this.drawn = true; this.drawNow = true; this.repaint(); this.drawNow = false; });
    this.after(3.2, () => { this.anim = false; this.repaint(); });
  }

  // b2: pos indexes PRICES (0 = Rs 50 low, 2 = Rs 150 high).
  law(mode) {
    this.clear();
    this.mode = mode;
    const seq = mode === 'rise' ? [0, 1, 2] : [2, 1, 0];
    this.pos = seq[0];
    this.prevPos = seq[0];
    this.joined = false;
    this.anim = true;
    this.arrowPop = true;
    [1, 2].forEach((n) => this.after(0.5 + (n - 1) * STEP_S, () => { this.prevPos = this.pos; this.pos = seq[n]; this.slide = true; this.repaint(); this.slide = false; }));
    if (mode === 'rise') this.after(0.5 + 2 * STEP_S + 0.1, () => { this.joined = true; this.joinPop = true; this.repaint(); this.joinPop = false; });
    this.after(0.5 + 2 * STEP_S + 0.8, () => { this.anim = false; this.repaint(); });
  }

  act(a, v) {
    const s = this.view, i = Number(v);
    if (s === 0 && a === 'price') this.pick(i);
    else if (s === 1 && a === 'pt') { if (this.anim) this.skip(); this.lit = this.lit === i ? -1 : i; this.repaint(); }
    else if (s === 1 && a === 'again') { this.clear(); this.lit = -1; this.plot(); this.repaint(); }
    else if (s === 2 && a === 'mode') { this.law(v); this.repaint(); this.arrowPop = false; }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.tags = 3; this.shown = 3; this.drawn = true;
    if (this.view === 2) { this.pos = this.mode === 'rise' ? 2 : 0; this.prevPos = this.pos; this.joined = this.mode === 'rise'; }
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.view;
    const out = v === 1 ? this.paintCurve(P) : v === 2 ? this.paintLaw(P, DW, DH) : this.paintOffer(P, v === 3, DW, DH);
    this.arrowPop = false;
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // setup and b0: the boards, the schedule tags, Seller A at his stall, the scale.
  paintOffer(P, setup, DW, DH) {
    let svg = '', over = '';
    const G = P
      ? { bx: [70, 195, 320], by: 46, bw: 114, bh: 52, ty: 104, hint: 150, st: [195, 598, 250], pan: [214, 376, 176], off: [62, 300] }
      : { bx: [110, 280, 450], by: 46, bw: 140, bh: 56, ty: 106, hint: 152, st: [168, 448, 276], pan: [440, 448, 190], off: [440, 178] };
    const i = this.sel;
    PRICES.forEach((p, j) => {
      const on = !setup && j === i;
      svg += priceBoard(G.bx[j], G.by, p, { w: G.bw, h: G.bh, active: on, dim: !setup && !on });
      if (!setup) {
        if (j < this.tags) svg += `<g${this.popTag === j ? ' class="mq-pop"' : ''}${on ? '' : ' opacity="0.55"'}>${pill(G.bx[j], G.ty, `${KG[j]} kg`, { size: P ? 22 : 24, bg: S4, ink: INK(4), edge: S4 })}</g>`;
        over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="price" data-val="${j}" aria-label="${p} rupees a kg" style="left:${G.bx[j] - G.bw / 2 - 4}px;top:${G.by - G.bh / 2 - 6}px;width:${G.bw + 8}px;height:${G.ty - G.by + G.bh / 2 + 24}px"></button>`;
      }
    });
    if (!setup && !this.anim) svg += txt(P ? 195 : 280, G.hint, 'tap a price', 20, 'var(--sim-label-muted)');
    const [cx, gy, w] = G.st;
    const s = sellerStall('sellerA', cx, gy, w, 0, { mood: setup ? 'think' : 'smile', side: 0 });
    svg += txt(G.off[0], G.off[1], 'he offers', P ? 21 : 23, 'var(--sim-label-muted)');
    if (setup) svg += pan(G.pan[0], G.pan[1], '?', { w: G.pan[2], basket: false });
    else svg += pan(G.pan[0], G.pan[1], KG[i], { w: G.pan[2], fromKg: this.fromKg, per: 0.35 });
    over += s.over + frontSvg(DW, DH, s.front);
    return { svg, over };
  }

  // b1: A, B, C and SS'.
  paintCurve(P) {
    const g = P ? frame(104, 366, 100, 440, 4, 200) : frame(132, 528, 36, 370, 4, 200);
    const ticks = [1, 2, 3, 4];
    let svg = axes(g, { xs: ticks, gridX: ticks, yTitleX: P ? 26 : 44, tick: P ? 18 : 20 }), over = '';
    PTS.forEach((n, i) => {
      if (i >= this.shown) return;
      const q = KG[i], p = PRICES[i], x = g.X(q), y = g.Y(p), on = this.lit === i;
      svg += `<g${this.popPt === i ? ' class="mq-fade"' : ''}>${guides(g, q, p, { lit: on })}</g>`;
      svg += `<g${this.popPt === i ? ' class="mq-pop"' : ''}>${dot(x, y, n, { col: S4, lit: on, r: 12, size: 30, ldx: -36, ldy: -12 })}</g>`;
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="pt" data-val="${i}" aria-label="point ${n}: ${q} kg at ${p} rupees" aria-pressed="${on ? 'true' : 'false'}" style="left:${f1(x - 28)}px;top:${f1(y - 28)}px;width:56px;height:56px;border-radius:50%"></button>`;
    });
    if (this.drawn) {
      svg += line(g, 0.5, 25, 3.5, 175, S4, { w: 7, draw: this.drawNow ? 0.8 : 0 });
      const lab = (x, y, a, t) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="fill:${S4};font:800 32px var(--sim-font)">${t}</text>`;
      const fd = this.drawNow ? ' class="mq-fade" style="--d:0.7s"' : '';
      svg += `<g${fd}>${lab(g.X(0.5) - 10, g.Y(25) + 4, 'end', 'S')}${lab(g.X(3.5) + 10, g.Y(175) + 10, 'start', 'S\'')}`
        + pill(g.X(3.1) + (P ? 10 : 40), g.Y(84), 'slopes up', { size: P ? 21 : 23, bg: 'var(--sim-bg-surface)', ink: S4, edge: S4 }) + '</g>';
      PTS.forEach((n, i) => { svg += dot(g.X(KG[i]), g.Y(PRICES[i]), '', { col: S4, r: 12, lit: this.lit === i }); });
    }
    const leg = P ? [120, 52] : [236, 70];
    svg += pill(leg[0], leg[1], 'Seller A', { size: P ? 21 : 22, bg: S4, ink: INK(4), edge: S4 });
    if (!this.anim) over += P ? btn('again', 'again', 195, 556) : btn('again', 'again', 470, 300);
    return { svg, over };
  }

  // b2: the Law of Supply.
  paintLaw(P, DW, DH) {
    let svg = '', over = '';
    const G = P
      ? { tx: 124, ys: [296, 196, 96], bw: 128, bh: 56, aP: 32, aw: 22, sx: 262, sg: 340, sw: 160, aQ: 364, ay: [74, 330], lab: 34, same: 392,
        ns: [300, 520, 120], nt: [110, 470], b: [[100, 566], [290, 566]] }
      : { tx: 158, ys: [296, 196, 96], bw: 156, bh: 64, aP: 46, aw: 28, sx: 316, sg: 340, sw: 176, aQ: 430, ay: [70, 330], lab: 34, same: 400,
        ns: [508, 340, 98], nt: [500, 214], b: [[180, 450], [390, 450]] };
    const rise = this.mode === 'rise';
    svg += txt(G.tx, G.lab, 'price', 24, 'var(--sim-label-muted)') + txt(G.sx, G.lab, 'quantity', 24, 'var(--sim-label-muted)');
    svg += `<path d="M${G.tx} ${G.ys[2]}V${G.ys[0]}" ${stroke('color-mix(in oklab, var(--sim-stroke) 70%, transparent)', 4, 'stroke-dasharray:2 10')}/>`;
    G.ys.forEach((y) => { svg += `<circle cx="${G.tx}" cy="${y}" r="6" ${fill('var(--sim-stroke)')}/>`; });
    const y = G.ys[this.pos], dy = G.ys[this.prevPos] - y;
    svg += `<g${this.slide ? ` class="sc-slide" style="--dy:${f1(dy)}px"` : ''}>${priceBoard(G.tx, y, PRICES[this.pos], { w: G.bw, h: G.bh, active: true })}</g>`;
    svg += pan(G.sx, G.sg, KG[this.pos], { w: G.sw, fromKg: this.slide && KG[this.pos] > KG[this.prevPos] ? KG[this.prevPos] : null, per: 0.3 });
    const pop = this.arrowPop ? ' class="mq-pop"' : '';
    svg += `<g${pop}>${bigArrow(G.aP, G.ay[0], G.ay[1], rise ? -1 : 1, 'var(--sim-accent)', G.aw)}</g>`;
    svg += `<g${pop}>${bigArrow(G.aQ, G.ay[0], G.ay[1], rise ? -1 : 1, S4, G.aw)}</g>`;
    svg += txt(P ? 195 : 280, G.same, 'same direction', P ? 28 : 30);
    if (this.joined) {
      const [nx, ngy, nw] = G.ns, fly = this.joinPop ? ' class="mq-fly"' : '';
      over += `<div${fly} style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px${fly ? `;--dx:${P ? 140 : 120}px;--dy:0px` : ''}">`
        + personSlot('buyer4', { x: nx + nw * 0.2, y: ngy - 4 * nw / 230, h: 138 * nw / 230, pose: 'stand', facing: 0, mood: 'smile' })
        + frontSvg(DW, DH, stallArt(nx, ngy, nw)) + '</div>';
      svg += `<g${this.joinPop ? ' class="mq-fade" style="--d:0.4s"' : ''}>${txt(G.nt[0], G.nt[1], 'new sellers', P ? 21 : 19, 'var(--sim-label)')}${txt(G.nt[0], G.nt[1] + 24, 'join', P ? 21 : 19, 'var(--sim-label)')}</g>`;
    }
    over += btn('mode', 'price rises', G.b[0][0], G.b[0][1], { val: 'rise', on: rise });
    over += btn('mode', 'price falls', G.b[1][0], G.b[1][1], { val: 'fall', on: !rise });
    return { svg, over };
  }

  testState() {
    const v = this.view, i = v === 2 ? this.pos : this.sel;
    return { view: v, price: PRICES[i], kg: KG[i], rs: RS, tags: this.tags, shown: this.shown, drawn: this.drawn, mode: this.mode, joined: this.joined, lit: this.lit };
  }
}
