/**
 * SellerOfferScene - L03 s01 "What Is Supply?" (3 beats). SvgScene, design units 560 x 480 landscape, 390 x 600
 * portrait. Cast: MangoPeople (Seller A "he", series-4 top; Srivalli, Alex, Israt), stalls via shared/SupplyParts.
 *   b0 sellers decide too: Seller A large behind his stall; the buyers small and dim on the far side. His heap
 *      drops onto the counter; chip "how much to bring?". "again" replays the drop.
 *   b1 willing and able: a price board (Rs 100 / kg) on poles over the stall, crates of mangoes beside it.
 *      "willing: the price is worth it" lights the board, "able: he has the mangoes" lights the crates. Named
 *      cases: "has mangoes" (rest) / "no mangoes left": crates empty, heap gone, the board still shows its price,
 *      chip "no supply at any price".
 *   b2 early and mid-season: a season strip ("start of season" / "mid-season"). Start: only Seller A has a small
 *      heap, B and C are empty; supply "low", price "costly" (up arrow). Mid: big heaps on all three stalls;
 *      supply "rises" (up arrow), price "lower price" (down arrow). No rupee numbers. Entry plays start -> mid;
 *      rest = mid-season.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, pill, crate, btn } from '../shared/MarketParts.js';
import { SUP, SINK, SELLERS, sellerStall, stallGeo, poles, bigArrow } from '../shared/SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const AR = '\u2192';
const LIT = 'color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface))';

export class SellerOfferScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Seller A stands behind his mango stall and decides how many kilograms of mangoes to put out; the buyers Srivalli, Alex and Israt are on the far side. Supply needs two things: willing, the price on his board is worth it to him, and able, he really has the mangoes in his crates. With no mangoes left, he cannot supply any, whatever the price on the board. At the start of the mango season only Seller A has a small heap and mangoes are costly; by mid-season all three stalls have big heaps, supply rises and the price falls.';

  async setup() {
    this.dropped = true;
    this.has = true;
    this.chips = 2;
    this.season = 'mid';
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

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.pop = null; }

  enter(step) {
    this.clear();
    this.dropped = true; this.has = true; this.chips = 2; this.season = 'mid';
    if (step === 0) this.drop();
    else if (step === 1) this.explain();
    else this.seasons();
  }

  // b0: the heap drops onto the counter.
  drop() {
    this.clear();
    this.dropped = false;
    this.anim = true;
    this.after(0.5, () => { this.dropped = true; this.pop = 'heap'; this.repaint(); this.pop = null; });
    this.after(1.3, () => { this.anim = false; this.repaint(); });
  }

  // b1: willing, then able.
  explain() {
    this.clear();
    this.has = true;
    this.chips = 0;
    this.anim = true;
    this.after(0.4, () => { this.chips = 1; this.pop = 'c1'; this.repaint(); this.pop = null; });
    this.after(1.2, () => { this.chips = 2; this.pop = 'c2'; this.repaint(); this.pop = null; });
    this.after(1.8, () => { this.anim = false; this.repaint(); });
  }

  // b2: start of season, then mid-season.
  seasons() {
    this.clear();
    this.season = 'start';
    this.anim = true;
    this.after(1.6, () => this.setSeason('mid', true));
  }

  setSeason(s, fromTour) {
    if (!fromTour) this.clear();
    this.season = s;
    this.anim = true;
    this.pop = 'season';
    this.repaint();
    this.pop = null;
    this.after(0.9, () => { this.anim = false; this.repaint(); });
  }

  act(a, v) {
    const s = this.stepIndex;
    if (s === 0 && a === 'again') { this.drop(); this.repaint(); }
    else if (s === 1 && a === 'has') { this.clear(); this.chips = 2; this.has = v === 'yes'; this.pop = 'has'; this.repaint(); this.pop = null; }
    else if (s === 2 && a === 'season') this.setSeason(v, false);
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.dropped = true; this.chips = 2;
    if (this.stepIndex === 2) this.season = 'mid';
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 2 ? this.paintSeason(P, DW, DH) : s === 1 ? this.paintAble(P, DW, DH) : this.paintDecide(P, DW, DH);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: Seller A large behind his stall; buyers small and dim on the far side.
  paintDecide(P, DW, DH) {
    let svg = '', over = '';
    const G = P
      ? { st: [195, 410, 340], buy: [[96, 586], [195, 586], [294, 586]], bh: 110, bl: [195, 458], chip: [150, 46], again: [334, 46], fs: 24 }
      : { st: [382, 424, 324], buy: [[48, 424], [110, 424], [172, 424]], bh: 124, bl: [110, 274], chip: [382, 70], again: [492, 450], fs: 26 };
    ['srivalli', 'alex', 'israt'].forEach((w, i) => {
      over += personSlot(w, { x: G.buy[i][0], y: G.buy[i][1], h: G.bh, pose: 'stand', facing: P ? 0 : 1, mood: 'smile', dim: true });
    });
    svg += txt(G.bl[0], G.bl[1], 'buyers', P ? 20 : 22, 'var(--sim-label-muted)');
    const [cx, gy, w] = G.st;
    const st = sellerStall('sellerA', cx, gy, w, this.dropped ? 3 : 0, { mood: 'think', heapCls: this.pop === 'heap' ? 'mk-drop' : '', r: 12 });
    over += st.over + frontSvg(DW, DH, st.front);
    svg += pill(G.chip[0], G.chip[1], 'how much to bring?', { size: G.fs, bg: 'color-mix(in oklab, var(--sim-series-4) 18%, var(--sim-bg-surface))', edge: 'var(--sim-series-4)' });
    if (!this.anim) over += btn('again', 'again', G.again[0], G.again[1]);
    return { svg, over };
  }

  // b1: willing (the price board) and able (the crates).
  paintAble(P, DW, DH) {
    let svg = '', over = '';
    const G = P
      ? { st: [140, 400, 230], board: [195, 104, 176, 62], c1: [195, 36], cr: [322, 400, 116], c2: [195, 448], b: [[92, 540], [290, 540]], fs: 19 }
      : { st: [176, 398, 262], board: [176, 104, 176, 62], c1: [250, 36], cr: [444, 398, 150], c2: [404, 156], b: [[176, 450], [400, 450]], fs: 20 };
    const [cx, gy, w] = G.st, geo = stallGeo(cx, gy, w), has = this.has;
    // crates beside the stall (behind the people layer)
    const [kx, ky, kw] = G.cr, ch = kw * 0.55 + 10;
    const lit2 = this.chips >= 2 && has;
    if (lit2) svg += `<rect x="${f1(kx - kw / 2 - 10)}" y="${f1(ky - 2 * ch - 14)}" width="${f1(kw + 20)}" height="${f1(2 * ch + 20)}" rx="16" ${fill(LIT, 'stroke:var(--sim-accent);stroke-width:3.5')}/>`;
    svg += crate(kx, ky, has ? 4 : 0, { w: kw, r: kw / 20 }) + crate(kx, ky - ch, has ? 4 : 0, { w: kw, r: kw / 20 });
    // the board on poles
    const [bx, by, bw, bh] = G.board;
    svg += poles(bx, by + bh / 2, geo.top, 44);
    svg += priceBoard(bx, by, 100, { w: bw, h: bh, active: this.chips >= 1 });
    const st = sellerStall('sellerA', cx, gy, w, has ? 3 : 0, { mood: has ? 'smile' : 'sad', r: 11 });
    over += st.over + frontSvg(DW, DH, st.front);
    const tint = LIT, chipO = { size: G.fs, bg: tint, edge: 'var(--sim-accent)' };
    if (this.chips >= 1) svg += `<g${this.pop === 'c1' ? ' class="mq-pop"' : ''}>${pill(G.c1[0], G.c1[1], 'willing: the price is worth it', chipO)}</g>`;
    if (this.chips >= 2) {
      const c = has ? pill(G.c2[0], G.c2[1], 'able: he has the mangoes', chipO)
        : pill(G.c2[0], G.c2[1], 'no supply at any price', { size: G.fs + 2, bg: 'color-mix(in oklab, var(--sim-bad) 16%, var(--sim-bg-surface))', edge: 'var(--sim-bad)' });
      svg += `<g${this.pop === 'c2' || this.pop === 'has' ? ' class="mq-pop"' : ''}>${c}</g>`;
    }
    if (!has) svg += txt(kx, ky - ch - kw * 0.22, 'empty', P ? 20 : 22, 'var(--sim-bad)');
    over += btn('has', 'has mangoes', G.b[0][0], G.b[0][1], { val: 'yes', on: has });
    over += btn('has', 'no mangoes left', G.b[1][0], G.b[1][1], { val: 'no', on: !has });
    return { svg, over };
  }

  // b2: start of season against mid-season.
  paintSeason(P, DW, DH) {
    let svg = '', over = '', front = '';
    const mid = this.season === 'mid', pop = this.pop === 'season';
    const G = P
      ? { b: [[100, 40], [290, 40]], arr: [195, 40], sup: [90, 100], pr: [288, 100], aw: 22, xs: [100, 290, 195], gys: [400, 400, 590], w: 182, r: 8, fs: 30 }
      : { b: [[160, 38], [400, 38]], arr: [280, 38], sup: [140, 96], pr: [392, 96], aw: 28, xs: [93, 280, 467], gys: [452, 452, 452], w: 182, r: 8, fs: 34 };
    over += btn('season', 'start of season', G.b[0][0], G.b[0][1], { val: 'start', on: !mid });
    over += btn('season', 'mid-season', G.b[1][0], G.b[1][1], { val: 'mid', on: mid });
    svg += txt(G.arr[0], G.arr[1] + 9, AR, 28, 'var(--sim-label-muted)');
    // supply: low / rises
    const [sx, sy] = G.sup, [px, py] = G.pr;
    const card = (x, y, w2) => `<rect x="${f1(x - w2 / 2)}" y="${f1(y - 22)}" width="${f1(w2)}" height="${P ? 142 : 150}" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    svg += card(sx, sy, P ? 160 : 200) + card(px, py, P ? 186 : 250);
    svg += txt(sx, sy + 8, 'supply', P ? 21 : 23, 'var(--sim-label-muted)');
    svg += txt(px, py + 8, 'price', P ? 21 : 23, 'var(--sim-label-muted)');
    const ay0 = sy + 28, ay1 = sy + (P ? 110 : 118);
    const g = (s) => `<g${pop ? ' class="mq-pop"' : ''}>${s}</g>`;
    svg += g(txt(sx - (mid ? 22 : 0), sy + (P ? 82 : 86), mid ? 'rises' : 'low', G.fs, SINK(7)) + (mid ? bigArrow(sx + (P ? 46 : 62), ay0, ay1, -1, SUP, G.aw) : ''));
    svg += g(txt(px - (P ? 26 : 28), py + (P ? 82 : 86), mid ? 'lower price' : 'costly', mid ? G.fs - (P ? 6 : 4) : G.fs, 'var(--sim-label)')
      + bigArrow(px + (P ? 68 : 96), ay0, ay1, mid ? 1 : -1, 'var(--sim-accent)', G.aw));
    // three stalls; at the start only Seller A has a small heap
    SELLERS.forEach((who, i) => {
      const kg = mid ? 4 : (i === 0 ? 1 : 0), dim = !mid && i > 0;
      const st = sellerStall(who, G.xs[i], G.gys[i], G.w, kg, { r: G.r, dim, mood: kg ? 'smile' : 'think', heapCls: pop && mid ? 'mk-drop' : '', heapStyle: `--d:${(i * 0.12).toFixed(2)}s` });
      over += st.over;
      front += st.front;
    });
    over += frontSvg(DW, DH, front);
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, dropped: this.dropped, has: this.has, chips: this.chips, season: this.season, price: 100, heapsKg: this.season === 'mid' ? [4, 4, 4] : [1, 0, 0] }; }
}
