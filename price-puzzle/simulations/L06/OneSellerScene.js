/**
 * OneSellerScene - L06 s04 "One Seller: a Monopoly" (3 beats). SvgScene, design units 560 x 490 landscape,
 * 390 x 640 portrait. No rupee numbers anywhere (the text gives none): prices are tags with arrows.
 *   b0  named cases "many sellers" / "one seller" (rest: one seller). Many: Seller A, B and C at three stalls,
 *       each with a big heap and a plain "price" tag; Srivalli, Alex and Israt are served. One: Seller A alone,
 *       a small heap ("less supply"), his tag "higher price" with an up arrow, the three buyers queue and wait
 *       ("buyers wait").
 *   b1  the government building with a rule sheet; an arrow from the sheet to Seller A's stall; his tag slides
 *       down (arrow down) and his heap grows; chip "kept in check". Plays on entry, "replay".
 *   b2  four regulator cards with pictures: "RBI: banks" (a bank), "Consumer Protection Authority: buyers'
 *       rights" (scales), "TRAI: phone and internet" (a tower with signals), "SEBI: share market" (a chart).
 *       Tap a card to enlarge it (with the words of the text); tap again for all four. Rest: all four.
 * People are SimFigure people via ../shared/MangoPeople.js. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MANGO_CSS } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, arrow, pill, btn } from '../shared/MarketParts.js';
import { sellerStall, bigArrow } from '../shared/SupplyParts.js';
import { govBuilding, icon } from '../shared/GovParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const BAD = { bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' };
const BUYERS = ['srivalli', 'alex', 'israt'];
const REG = [
  { name: ['RBI'], role: 'banks', text: ['banking'], pic: 'bank' },
  { name: ['Consumer Protection', 'Authority'], role: "buyers' rights", text: ['consumer rights', 'and unfair trade'], pic: 'scales' },
  { name: ['TRAI'], role: 'phone and internet', text: ['telephone and', 'internet services'], pic: 'tower' },
  { name: ['SEBI'], role: 'share market', text: ['the share market'], pic: 'chart' },
];

/** A phone tower: a lattice mast with signal arcs, (x, y) bottom centre, h tall. */
function tower(x, y, h) {
  const top = y - h, w = h * 0.36, col = 'var(--sim-series-6)';
  let s = `<path d="M${f1(x - w / 2)} ${f1(y)}L${f1(x)} ${f1(top + h * 0.12)}L${f1(x + w / 2)} ${f1(y)}" ${stroke(col, 4.5, 'fill:none;stroke-linejoin:round')}/>`;
  for (let i = 1; i < 4; i++) {
    const yy = y - (h * 0.88) * i / 4, half = (w / 2) * (1 - i / 4);
    s += `<path d="M${f1(x - half)} ${f1(yy)}H${f1(x + half)}" ${stroke(col, 3)}/>`;
  }
  s += `<circle cx="${f1(x)}" cy="${f1(top + h * 0.1)}" r="${f1(h * 0.06)}" ${fill(col)}/>`;
  for (const r of [0.2, 0.34]) {
    const R = h * r, cy = top + h * 0.1;
    s += `<path d="M${f1(x - R * 0.7)} ${f1(cy - R * 0.7)}A${f1(R)} ${f1(R)} 0 0 0 ${f1(x - R * 0.7)} ${f1(cy + R * 0.7)}M${f1(x + R * 0.7)} ${f1(cy - R * 0.7)}A${f1(R)} ${f1(R)} 0 0 1 ${f1(x + R * 0.7)} ${f1(cy + R * 0.7)}" ${stroke('var(--sim-accent)', 3.5, 'fill:none')}/>`;
  }
  return s;
}

/** A share-market chart: a panel, bars and a zig-zag line going up, centred on (x, y), w wide. */
function chart(x, y, w) {
  const h = w * 0.72, x0 = x - w / 2, y0 = y - h / 2;
  let s = `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:3')}/>`;
  [0.3, 0.45, 0.38, 0.6, 0.75].forEach((v, i) => {
    const bw = w * 0.12, bx = x0 + w * 0.1 + i * w * 0.17, bh = h * v * 0.8;
    s += `<rect x="${f1(bx)}" y="${f1(y0 + h - 6 - bh)}" width="${f1(bw)}" height="${f1(bh)}" rx="2" ${fill('color-mix(in oklab, var(--sim-series-3) 45%, var(--sim-bg-surface))')}/>`;
  });
  const pts = [[0.08, 0.7], [0.3, 0.5], [0.46, 0.6], [0.66, 0.32], [0.9, 0.14]].map(([a, b]) => `${f1(x0 + w * a)} ${f1(y0 + h * b)}`);
  s += `<path d="M${pts.join('L')}" ${stroke('var(--sim-good)', 4.5, 'fill:none;stroke-linejoin:round')}/>`;
  return s;
}

export class OneSellerScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Many sellers against one seller. With Seller A, Seller B and Seller C, each stall has a big heap and an ordinary price, and the buyers are served. With only one seller, Seller A, the price goes up, his heap is small, and Srivalli, Alex and Israt wait in a queue. Then the government makes a rule: the one seller\'s price comes down and his heap grows, so the monopoly is kept in check. Then four regulators: RBI for banks, the Central Consumer Protection Authority for buyers\' rights, TRAI for phone and internet, and SEBI for the share market.';

  async setup() {
    this.one = true;
    this.lit = -1;
    this.done = true;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act, s = this.stepIndex;
      if (s === 0 && (a === 'many' || a === 'one')) { this.one = a === 'one'; this.burst(0.9); }
      else if (s === 1 && a === 'replay') this.play1();
      else if (s === 2 && a === 'card') { const v = Number(b.dataset.val); this.lit = this.lit === v ? -1 : v; this.burst(0.5); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.done = true; }

  enter(step) {
    this.clear();
    this.one = true;
    this.lit = -1;
    if (step === 1) this.play1();
    else this.burst(1.3);
  }

  burst(sec) {
    this.clear();
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(sec, () => { this.anim = false; this.repaint(); });
  }

  // b1: the rule sheet pops, then the tag slides down and the heap grows
  play1() {
    this.clear();
    this.anim = true;
    this.done = false;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(1.2, () => { this.done = true; this.fresh = true; this.repaint(); this.fresh = false; });
    this.after(2.4, () => { this.anim = false; this.repaint(); });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 490) * st.W / (st.portrait ? 390 : 560)); }

  pop(d) { return this.fresh ? ` class="mq-pop" style="--d:${d}s"` : ''; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 490, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 0 ? this.paintCases(P) : s === 1 ? this.paintRule(P) : this.paintCards(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  // a price tag with no number: "price" (plain), or a word and a block arrow
  tag(x, y, t, dir, size, o = {}) {
    let s = pill(x, y, t, { size, ...o });
    if (dir) {
      const tw = String(t).length * size * 0.56 + size * 1.1;
      s += bigArrow(x + tw / 2 + 22, y - size * 1.05, y + size * 1.05, dir, dir < 0 ? 'var(--sim-bad)' : ACC, 18);
    }
    return s;
  }

  paintCases(P) {
    const one = this.one;
    const G = P
      ? { gy: 330, many: { xs: [70, 195, 320], w: 122 }, one: { x: 150, w: 230 }, by: 600, bxs: one ? [190, 270, 350] : [70, 195, 320], bh: 150, btn: [[110, 34], [282, 34]] }
      : { gy: 320, many: { xs: [96, 280, 464], w: 176 }, one: { x: 180, w: 270 }, by: 474, bxs: one ? [330, 410, 490] : [96, 280, 464], bh: 140, btn: [[478, 34], [478, 92]] };
    let svg = '', over = '', front = '';
    if (!one) {
      ['sellerA', 'sellerB', 'sellerC'].forEach((w, i) => {
        const S = sellerStall(w, G.many.xs[i], G.gy, G.many.w, 5, { tagSize: P ? 13 : 16 });
        over += S.over;
        front += `<g${this.pop(0.1 + i * 0.15)}>${S.front}</g>`;
        svg += `<g${this.pop(0.4 + i * 0.15)}>${pill(G.many.xs[i], S.G.top - (P ? 22 : 26), 'price', { size: P ? 17 : 20 })}</g>`;
      });
    } else {
      const S = sellerStall('sellerA', G.one.x, G.gy, G.one.w, 1, { tagSize: P ? 16 : 18 });
      over += S.over;
      front += S.front;
      svg += `<g${this.pop(0.2)}>${this.tag(G.one.x - 16, S.G.top - 34, 'higher price', -1, P ? 20 : 22, BAD)}</g>`;
      front += `<g${this.pop(0.5)}>${pill(G.one.x - G.one.w * 0.2, S.G.counter + (P ? 66 : 70), 'less supply', { size: P ? 18 : 19 })}</g>`;
    }
    over += frontSvg(P ? 390 : 560, P ? 640 : 490, front);
    BUYERS.forEach((w, i) => {
      const x = G.bxs[i];
      over += personSlot(w, { x, y: G.by, h: G.bh, pose: 'stand', facing: one ? -1 : 0, mood: one ? (i === 0 ? 'think' : 'sad') : 'happy' });
    });
    if (one) {
      const qx = (G.bxs[0] + G.bxs[2]) / 2;
      over += frontSvg(P ? 390 : 560, P ? 640 : 490, `<g${this.pop(0.7)}>${pill(qx, G.by - G.bh - 26, 'buyers wait', { size: P ? 18 : 20, ...BAD })}</g>`);
    }
    over += btn('many', 'many sellers', G.btn[0][0], G.btn[0][1], { on: !one, aria: 'show many sellers', size: 19 });
    over += btn('one', 'one seller', G.btn[1][0], G.btn[1][1], { on: one, aria: 'show one seller', size: 19 });
    return { svg, over };
  }

  paintRule(P) {
    const done = this.done;
    const G = P
      ? { b: [110, 220, 170], sheet: [290, 100, 84], sx: 200, gy: 566, sw: 250, chip: [150, 612], rp: [320, 612] }
      : { b: [98, 330, 184], sheet: [228, 112, 80], sx: 408, gy: 330, sw: 250, chip: [250, 428], rp: [470, 428] };
    let svg = '', over = '', front = '';
    svg += `<path d="M0 ${f1(G.gy + 2)}H${P ? 390 : 560}" ${stroke('var(--sim-stroke)', 3)}/>`;
    if (P) svg += `<path d="M0 ${f1(G.b[1] + 2)}H390" ${stroke('var(--sim-stroke)', 3)}/>`;
    const B = govBuilding(G.b[0], G.b[1], G.b[2], { size: P ? 16 : 18 });
    svg += B.svg;
    // the rule sheet, and an arrow from it to the stall
    const [rx, ry, rs] = G.sheet;
    svg += `<g${!done && this.fresh ? ' class="mq-pop" style="--d:0.2s"' : ''}>${icon('scroll', rx, ry, rs, 'var(--sim-series-4)')}${txt(rx, ry + rs / 2 + 24, 'rules', P ? 20 : 22)}</g>`;
    const S = sellerStall('sellerA', G.sx, G.gy, G.sw, done ? 5 : 1, { tagSize: 18, heapCls: done && this.fresh ? 'mq-fade' : '' });
    over += S.over;
    front += S.front;
    const ax0 = P ? rx : rx + rs / 2 + 4, ay0 = P ? ry + rs / 2 + 34 : ry, ax1 = P ? G.sx + 60 : G.sx - 104, ay1 = S.G.top - (P ? 80 : -40);
    svg += `<g${!done && this.fresh ? ' class="mq-fade" style="--d:0.6s"' : ''}>${arrow(ax0, ay0, ax1, ay1, 'var(--sim-series-4)', 5)}</g>`;
    const ty = S.G.top - (done ? 30 : 76), slide = done && this.fresh ? ' class="mq-fly" style="--dx:0px;--dy:-46px;--dur:0.6s"' : '';
    const tx = P ? G.sx - 40 : G.sx;
    svg += `<g${slide}>${done ? this.tag(tx, ty, 'price', 1, 22, { bg: 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-good)' }) : this.tag(tx, ty, 'higher price', -1, 22, BAD)}</g>`;
    if (done) {
      front += `<g${this.fresh ? ' class="mq-pop" style="--d:0.5s"' : ''}>${pill(G.chip[0], G.chip[1], 'kept in check', { size: P ? 22 : 24, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    }
    over += frontSvg(P ? 390 : 560, P ? 640 : 490, front);
    if (!this.anim) over += btn('replay', 'replay', G.rp[0], G.rp[1], { size: 18 });
    return { svg, over };
  }

  picture(i, x, y, size) {
    const p = REG[i].pic;
    if (p === 'bank') return civicSvg('bank', x, y + size * 0.38, { w: size * 1.3 });
    if (p === 'scales') return icon('scales', x, y, size * 1.05, 'var(--sim-series-4)');
    if (p === 'tower') return tower(x, y + size * 0.5, size);
    return chart(x, y, size * 1.15);
  }

  card(i, x, y, w, h, big, P) {
    const r = REG[i], on = this.lit < 0 || big;
    let s = `<g style="opacity:${on ? 1 : 0.25}">`;
    s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="20" ${fill(big ? 'color-mix(in oklab, var(--sim-accent) 10%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${big ? ACC : 'var(--sim-series-4)'};stroke-width:${big ? 5 : 3.5}`)}/>`;
    const ps = big ? (P ? 110 : 120) : (P ? 62 : 66);
    s += this.picture(i, x, y - h / 2 + ps / 2 + (big ? 30 : 18), ps);
    const fs = big ? (P ? 28 : 32) : (r.name.length > 1 ? (P ? 17 : 20) : (P ? 26 : 30));
    let ty = y - h / 2 + ps + (big ? 30 : 18) + fs + 6;
    for (const n of r.name) { s += txt(x, ty, n, fs, 'var(--sim-label)'); ty += fs * 1.3; }
    const rs = big ? (P ? 22 : 24) : (P ? 17 : 19);
    if (big) { ty += 8; for (const t of r.text) { s += txt(x, ty, t, rs, 'var(--sim-series-4-ink, var(--sim-label))'); ty += rs * 1.3; } }
    else s += txt(x, ty + 2, r.role, rs, 'var(--sim-label-muted)');
    return s + '</g>';
  }

  paintCards(P) {
    const pos = P ? [[100, 150], [290, 150], [100, 410], [290, 410]] : [[142, 122], [418, 122], [142, 360], [418, 360]];
    const [w, h] = P ? [178, 240] : [262, 216];
    let svg = '', over = '';
    pos.forEach(([x, y], i) => {
      svg += `<g${this.lit < 0 ? this.pop(0.1 + i * 0.15) : ''}>${this.card(i, x, y, w, h, false, P)}</g>`;
      if (this.lit < 0) over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="card" data-val="${i}" aria-pressed="${this.lit === i}" aria-label="${REG[i].name.join(' ')}: ${REG[i].role}" style="left:${f1(x - w / 2)}px;top:${f1(y - h / 2)}px;width:${f1(w)}px;height:${f1(h)}px"></button>`;
    });
    if (this.lit >= 0) {
      const [cx, cy, bw, bh] = P ? [195, 290, 350, 420] : [280, 241, 440, 440];
      svg += `<g${this.pop(0)}>${this.card(this.lit, cx, cy, bw, bh, true, P)}</g>`;
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="card" data-val="${this.lit}" aria-pressed="true" aria-label="back to all four" style="left:${f1(cx - bw / 2)}px;top:${f1(cy - bh / 2)}px;width:${f1(bw)}px;height:${f1(bh)}px"></button>`;
    }
    if (this.lit < 0 && !this.anim) svg += txt(P ? 195 : 280, P ? 572 : 480, 'tap a card', 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, one: this.one, lit: this.lit, done: this.done, anim: this.anim, regulators: REG.map((r) => r.name.join(' ')) }; }
}
