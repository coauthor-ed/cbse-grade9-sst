/**
 * GovMarketScene - L06 s01 "The Government and the Market" (3 beats). SvgScene, design units 560 x 490
 * landscape, 390 x 640 portrait.
 *   b0  the mango lane (Seller A at his stall, Srivalli buying) on one side, the government building on the
 *       other; pills "prices: demand and supply" over the stall, "rules: the government" over the building;
 *       chip "India: 4th-largest economy". Named cases "demand up" / "supply up" put an up / down arrow on the
 *       Rs 100 price board (tap again: none). Rest: no arrow.
 *   b1  the medicine counter (as L05 MarketClose b1): "high price" tag, one family takes a box ("can pay"),
 *       the other walks away with empty hands ("cannot pay"); chip "essential goods: fairness".
 *   b2  the government building with three action cards round it: "highest or lowest price" (a tag with a
 *       lid), "goods for everyone" (tree, road), "too much can harm" (a warning, muted). Tap a card to light it
 *       alone (tap again: all). Rest: all three lit.
 * People are SimFigure people via ../shared/MangoPeople.js. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, pill, btn } from '../shared/MarketParts.js';
import { sellerStall, poles, bigArrow } from '../shared/SupplyParts.js';
import { counter, medBox, govBuilding, icon, capTag, castFamilies } from '../shared/GovParts.js';

castFamilies();

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const CARDS = [['highest or', 'lowest price'], ['goods for', 'everyone'], ['too much', 'can harm']];

export class GovMarketScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'India is the fourth-largest economy in the world. On one side the mango market: Seller A at his stall and Srivalli buying; the price, 100 rupees a kg, depends on demand and supply, and goes up when demand rises or down when supply rises. On the other side the government building: the government makes rules for the market. Then a medicine counter with a high price: one family can pay and takes a box; the other cannot pay and walks away with empty hands. For essential goods, fairness matters. Then three things the government does: fix a highest or a lowest price, provide goods for everyone like parks and roads, and a warning: too much government action can harm the market.';

  async setup() {
    this.sel = 0;
    this.lit = -1;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (this.stepIndex === 0 && (a === 'dem' || a === 'sup')) {
        const v = a === 'dem' ? -1 : 1;
        this.sel = this.sel === v ? 0 : v;
        this.burst(0.6);
      } else if (this.stepIndex === 2 && a === 'card') {
        const v = Number(b.dataset.val);
        this.lit = this.lit === v ? -1 : v;
        this.repaint();
      }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.sel = 0;
    this.lit = -1;
    this.burst(step === 1 ? 1.8 : 1.4);
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

  stageHeight(st) { return Math.round((st.portrait ? 640 : 490) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 490, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 0 ? this.paintLane(P) : s === 1 ? this.paintCounter(P) : this.paintCards(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  pop(d) { return this.fresh ? ` class="mq-pop" style="--d:${d}s"` : ''; }

  paintLane(P) {
    const G = P
      ? { DW: 390, DH: 640, chip: [195, 28, 20], mp: [195, 72], sx: 228, gy: 336, sw: 200, sri: [62, 160], board: [228, 122, 124, 52],
        btn: [[110, 380], [280, 380]], gp: [195, 440], bx: 195, bgy: 626, bw: 220 }
      : { DW: 560, DH: 490, chip: [280, 30, 22], mp: [175, 84], sx: 180, gy: 392, sw: 220, sri: [48, 176], board: [180, 140, 140, 58],
        btn: [[105, 452], [265, 452]], gp: [430, 190], bx: 430, bgy: 392, bw: 220 };
    let svg = '', over = '', front = '';
    const [cx, cy, cs] = G.chip;
    svg += `<g${this.pop(0)}>${pill(cx, cy, 'India: 4th-largest economy', { size: cs, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    // the ground
    svg += `<path d="M0 ${f1(G.gy + 2)}H${P ? 390 : 560}" ${stroke('var(--sim-stroke)', 3)}/>`;
    if (P) svg += `<path d="M0 ${f1(G.bgy + 2)}H390" ${stroke('var(--sim-stroke)', 3)}/>`;
    // the market side
    const S = sellerStall('sellerA', G.sx, G.gy, G.sw, 4, { tag: false });
    over += S.over;
    front += S.front;
    const [bx, by, bw, bh] = G.board;
    svg += poles(G.sx, by + bh / 2, S.G.top, 40);
    svg += priceBoard(bx, by, 100, { w: bw, h: bh, active: true });
    if (this.sel) svg += `<g${this.pop(0)}>${bigArrow(bx + bw / 2 + 28, by - bh * 0.6, by + bh * 0.6, this.sel, ACC, 22)}</g>`;
    svg += `<g${this.pop(0.3)}>${pill(G.mp[0], G.mp[1], 'prices: demand and supply', { size: P ? 19 : 20, bg: 'var(--sim-series-5)', ink: 'var(--sim-ink-on-5, var(--sim-bg-deep))', edge: 'var(--sim-series-5)' })}</g>`;
    // the government side
    const B = govBuilding(G.bx, G.bgy, G.bw, { label: false });
    svg += `<g${this.pop(0.5)}>${B.svg}</g>`;
    svg += `<g${this.pop(0.7)}>${pill(G.gp[0], G.gp[1], 'rules: the government', { size: 19, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', edge: 'var(--sim-label)' })}</g>`;
    over += frontSvg(G.DW, G.DH, front);
    over += personSlot('srivalli', { x: G.sri[0], y: G.gy, h: G.sri[1], pose: 'stand', facing: 1, mood: 'smile' });
    over += btn('dem', 'demand up', G.btn[0][0], G.btn[0][1], { on: this.sel === -1, aria: 'demand rises: the price goes up', size: 19 });
    over += btn('sup', 'supply up', G.btn[1][0], G.btn[1][1], { on: this.sel === 1, aria: 'supply rises: the price goes down', size: 19 });
    return { svg, over };
  }

  paintCounter(P) {
    const fresh = this.fresh;
    const G = P ? { cx: 195, cgy: 440, cw: 200, gy: 548, fam1: [60, 130], fam2: [262, 330], H: 150, h: 104, chip: [195, 612] }
      : { cx: 280, cgy: 398, cw: 230, gy: 398, fam1: [60, 128], fam2: [420, 488], H: 160, h: 110, chip: [280, 466] };
    let svg = '', over = '', front = '';
    const C = counter(G.cx, G.cgy, G.cw);
    svg += C.svg;
    svg += `<g${this.pop(0.1)}>${pill(G.cx, C.top - 30, 'high price \u2191', { size: P ? 21 : 23, bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' })}</g>`;
    const [a1, k1] = G.fam1, gy = G.gy, grip = gy - G.H * 0.5;
    over += personSlot('medA', { x: a1, y: gy, h: G.H, pose: 'stand', facing: 0, mood: 'happy', hands: [{ x: a1 + 14, y: grip }, { x: a1 - 14, y: grip }] });
    over += personSlot('medK', { x: k1, y: gy, h: G.h, pose: 'stand', facing: -1, mood: 'smile' });
    front += `<g${this.pop(0.5)}>${medBox(a1, grip + 22, 44)}</g>`;
    const [a2, k2] = G.fam2, walk = fresh ? 'mq-fly' : '';
    const sty = fresh ? '--dx:-70px;--dy:0px;--dur:1.1s;--d:0.2s' : '';
    over += personSlot('poorA', { x: a2, y: gy, h: G.H, pose: 'walk', facing: 1, mood: 'sad', cls: walk, style: sty });
    over += personSlot('poorK', { x: k2, y: gy, h: G.h, pose: 'walk', facing: 1, mood: 'sad', cls: walk, style: sty });
    const ly = gy + 22, fade = (d) => (fresh ? ` class="mq-fade" style="--d:${d}s"` : '');
    front += `<g${fade(0.8)}>${pill((a1 + k1) / 2, ly, 'can pay', { size: P ? 19 : 20, bg: 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-good)' })}`
      + `${pill((a2 + k2) / 2, ly, 'cannot pay', { size: P ? 19 : 20, bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' })}</g>`;
    front += `<g${fade(1.2)}>${pill(G.chip[0], G.chip[1], 'essential goods: fairness', { size: P ? 21 : 23, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    over += frontSvg(P ? 390 : 560, P ? 640 : 490, front);
    return { svg, over };
  }

  // one action card: a rounded panel, a picture at the top, two lines of words
  card(i, x, y, w, h, P) {
    const on = this.lit < 0 || this.lit === i, warn = i === 2, sel = this.lit === i;
    const edge = warn ? 'var(--sim-label-muted)' : sel ? ACC : 'var(--sim-series-4)';
    let s = `<g style="opacity:${on ? 1 : 0.3}">`;
    s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="18" ${fill(warn ? 'color-mix(in oklab, var(--sim-label-muted) 10%, var(--sim-bg-surface))' : sel ? 'color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${edge};stroke-width:${sel ? 5 : 3.5}${warn ? ';stroke-dasharray:10 7' : ''}`)}/>`;
    const wide = w > h * 2, ix = wide ? x - w / 2 + 56 : x, iy = wide ? y : y - h / 2 + (P ? 40 : 46);
    if (i === 0) s += capTag(x, iy + 8, 'price', { size: P ? 18 : 20, bg: 'var(--sim-bg-surface)', edge: 'var(--sim-label)' });
    else if (i === 1) s += icon('tree', x - 28, iy, P ? 50 : 56, 'var(--sim-series-3)') + icon('road', x + 28, iy, P ? 50 : 56, 'var(--sim-series-8)');
    else {
      const t = P ? 26 : 30;
      s += `<path d="M${f1(ix)} ${f1(iy - t)}L${f1(ix + t * 1.1)} ${f1(iy + t * 0.8)}H${f1(ix - t * 1.1)}Z" ${fill('color-mix(in oklab, var(--sim-bad) 70%, var(--sim-bg-surface))', 'stroke:var(--sim-label-muted);stroke-width:3;stroke-linejoin:round')}/>`;
      s += txt(ix, iy + t * 0.62, '!', t * 1.1, 'var(--sim-bg-surface)');
    }
    const fs = P ? 20 : 22, ty = wide ? y - fs * 0.3 : y + h / 2 - (P ? 46 : 52), tx = wide ? x + 34 : x, col = warn ? 'var(--sim-label-muted)' : 'var(--sim-label)';
    s += txt(tx, ty, CARDS[i][0], fs, col) + txt(tx, ty + fs * 1.35, CARDS[i][1], fs, col);
    s += '</g>';
    const hit = `<button type="button" class="sv-hit tap btn mq-hit" data-act="card" data-val="${i}" aria-pressed="${sel}" aria-label="${CARDS[i].join(' ')}" style="left:${f1(x - w / 2)}px;top:${f1(y - h / 2)}px;width:${f1(w)}px;height:${f1(h)}px"></button>`;
    return { s, hit };
  }

  paintCards(P) {
    const G = P
      ? { bx: 195, gy: 286, bw: 230, cards: [[100, 400, 176, 150], [290, 400, 176, 150], [195, 560, 210, 130]] }
      : { bx: 280, gy: 330, bw: 216, cards: [[92, 160, 162, 170], [468, 160, 162, 170], [280, 424, 260, 96]] };
    let svg = '', over = '';
    const B = govBuilding(G.bx, G.gy, G.bw, { size: 19 });
    // dashed links from the building to each card
    for (const [x, y] of G.cards) svg += `<path d="M${f1(G.bx)} ${f1(G.gy - B.h * 0.5)}L${f1(x)} ${f1(y)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:7 7;opacity:0.6')}/>`;
    svg += `<g${this.pop(0)}>${B.svg}</g>`;
    G.cards.forEach(([x, y, w, h], i) => {
      const c = this.card(i, x, y, w, h, P);
      svg += `<g${this.pop(0.3 + i * 0.25)}>${c.s}</g>`;
      over += c.hit;
    });
    if (!P && !this.anim) svg += txt(460, 470, 'tap a card', 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, sel: this.sel, lit: this.lit, anim: this.anim, price: 100 }; }
}
