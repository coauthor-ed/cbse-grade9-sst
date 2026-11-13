/**
 * SellerNumbersScene - L04 s04 "More Sellers, Fewer Sellers" (3 beats). SvgScene, design units 560 x 480
 * landscape, 390 x 600 portrait. Table 9.2 at Rs 100: Seller A 2 kg, B 4 kg, C 6 kg (12 kg); buyers want 12 kg
 * (Table 9.1 at Rs 100). Three new sellers are a made-up example (2 / 4 / 6 kg), generic people registered here.
 * Two bars carry the idea in every beat: "sellers offer" (market supply SUP, series-7) and "buyers want" (MKT,
 * series-5), same scale, same place.
 *   b0  three stalls A / B / C, then three new stalls slide in under them ("new sellers (made-up example)"); the
 *       offer bar grows 12 -> 24 kg, the want bar stays 12. Buttons "3 sellers" / "6 sellers". Cold start: 3, then 6.
 *   b1  the same two bars: the offer bar's extra 12 kg turns pale "not sold" and pours into a crate "12 kg not
 *       sold"; the Rs 100 board gets a down arrow "price falls"; bold chip "more sellers: supply up, price falls".
 *   b2  back to A / B / C; Seller C's shutter comes down ("closed"); offer bar 2 + 4 = 6 kg against want 12 kg; two
 *       buyers walk away ("no mangoes"); the board gets an up arrow "price rises". Buttons "Seller C open" /
 *       "Seller C closed". Cold start: open, then closed.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg, registerCast } from '../shared/MangoPeople.js';
import { BTN_CSS, MKT, txt, pill, crate, btn } from '../shared/MarketParts.js';
import { SUP, SER, INK, SINK, SELLERS, sellerStall, stallArt, stallGeo, bigArrow } from '../shared/SupplyParts.js';

registerCast('newSeller1', { name: 'new seller', role: 'shopkeeper', i: 7,
  look: { outfit: 'shirt', hairStyle: 'short', top: 'sage', bottom: 'khaki', shoeStyle: 'sandal', pattern: 'plain', moustache: false, glasses: false, dupatta: false, girth: 1 } });
registerCast('newSeller2', { name: 'new seller', role: 'shopkeeper', i: 8,
  look: { outfit: 'kurti', hairStyle: 'bun', top: 'stone', bottom: 'cream', shoeStyle: 'sandal', pattern: 'plain', moustache: false, glasses: false, dupatta: true, girth: 1 } });
registerCast('newSeller3', { name: 'new seller', role: 'shopkeeper', i: 9,
  look: { outfit: 'kurta', hairStyle: 'sidepart', top: 'denim', bottom: 'cream', shoeStyle: 'sandal', pattern: 'plain', moustache: true, glasses: false, dupatta: false, girth: 1.05 } });

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const OLD = [2, 4, 6];
const NEW = [2, 4, 6];
const NEWS = ['newSeller1', 'newSeller2', 'newSeller3'];
const MOVE = 'var(--sim-accent)';

const CSS = `
svg .sn-grow { transform-box: fill-box; transform-origin: 0 50%; animation: sn-grow 0.7s cubic-bezier(.45,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes sn-grow { 0% { transform: scaleX(var(--s0, 0)); } 100% { transform: none; } }
svg .sn-shut { transform-box: fill-box; transform-origin: 50% 0; animation: sn-shut 0.6s cubic-bezier(.45,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes sn-shut { 0% { transform: scaleY(0); } 100% { transform: none; } }
.sn-go { animation: sn-go 0.8s ease-in both; animation-delay: var(--d, 0s); }
@keyframes sn-go { 0% { transform: translateX(-90px); opacity: 0.2; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .sn-grow, svg .sn-shut, .sn-go { animation: none; } }
`;

export class SellerNumbersScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'At 100 rupees a kg, Seller A offers 2 kg, Seller B 4 kg and Seller C 6 kg: 12 kg, and buyers want 12 kg. In a made-up example three new sellers open stalls and offer 2, 4 and 6 kg, so market supply at 100 rupees grows to 24 kg while buyers still want 12 kg. 12 kg would be left unsold, so the price falls. If instead Seller C closes her stall, only 2 + 4 = 6 kg is offered against 12 kg wanted: some buyers go home without mangoes and the price rises.';

  async setup() {
    this.six = true;
    this.shut = true;
    this.anim = false;
    this.fresh = false;
    this.grow0 = -1;
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

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.grow0 = -1; }

  enter(step) {
    this.clear();
    this.six = true; this.shut = true;
    // the change plays at once from the beat's own start state (no still pause the shot could catch)
    if (step === 0) { this.six = false; this.setSix(true); }
    else if (step === 1) this.play1();
    else { this.shut = false; this.setShut(true); }
  }

  /** One timed burst: paint with the entry classes, then a rest repaint. */
  burst(sec) {
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(sec, () => { this.anim = false; this.repaint(); });
  }

  setSix(v) {
    const was = this.six;
    this.clear();
    this.six = v;
    this.grow0 = was === v ? -1 : (v ? 12 / 24 : 1);
    this.burst(v ? 1.6 : 0.9);
  }

  play1() { this.clear(); this.burst(1.6); }

  setShut(v) {
    const was = this.shut;
    this.clear();
    this.shut = v;
    this.grow0 = was === v ? -1 : (v ? 1 : 0.5);
    this.burst(v ? 1.8 : 0.9);
  }

  act(a, v) {
    const s = this.stepIndex;
    if (s === 0 && a === 'n') this.setSix(v === '6');
    else if (s === 1 && a === 'again') this.play1();
    else if (s === 2 && a === 'shut') this.setShut(v === '1');
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 0 ? this.paintMore(P, DW, DH) : s === 1 ? this.paintFall(P) : this.paintFewer(P, DW, DH);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** Bars geometry, the same in every beat. */
  barGeo(P) {
    return P
      ? { above: true, x0: 18, k: 12.5, y: [446, 516], h: 36, ls: 20, vs: 24 }
      : { above: false, lx: 150, x0: 162, k: 13, y: [414, 456], h: 32, ls: 20, vs: 24 };
  }

  /** The two bars: o = { offer, want, unsold (pale tail from 12 kg), offerText (spans), grow0 (offer bar start scale) }. */
  bars(P, o) {
    const B = this.barGeo(P);
    let s = '';
    const rows = [['sellers offer', o.offer, SUP, 7], ['buyers want', o.want, MKT, 5]];
    rows.forEach(([lab, kg, col, n], i) => {
      const y = B.y[i], x0 = B.x0, w = kg * B.k;
      if (B.above) s += txt(x0, y - B.h / 2 - 10, lab, B.ls, SINK(n), 'start');
      else s += txt(B.lx, y + 7, lab, B.ls, SINK(n), 'end');
      s += `<rect x="${x0}" y="${f1(y - B.h / 2)}" width="${f1(24 * B.k)}" height="${B.h}" rx="10" ${fill('color-mix(in oklab, var(--sim-stroke) 18%, transparent)')}/>`;
      const solid = i === 0 && o.unsold ? 12 : kg;
      const grow = i === 0 && o.grow0 >= 0 ? ` class="sn-grow" style="--s0:${o.grow0.toFixed(3)};--d:${(o.growD ?? 0).toFixed(2)}s"` : '';
      let bar = `<rect x="${x0}" y="${f1(y - B.h / 2)}" width="${f1(solid * B.k)}" height="${B.h}" rx="10" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2.5`)}/>`;
      if (i === 0 && o.unsold) {
        const ux = x0 + 12 * B.k - 6;
        bar += `<rect x="${f1(ux)}" y="${f1(y - B.h / 2)}" width="${f1((kg - 12) * B.k + 6)}" height="${B.h}" rx="10" ${fill(`color-mix(in oklab, ${col} 22%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2.5;stroke-dasharray:8 6`)}/>`;
        bar += txt(ux + (kg - 12) * B.k / 2 + 3, y + 7, 'not sold', 19, SINK(7));
      }
      s += `<g${grow}>${bar}</g>`;
      const vt = i === 0 && o.offerText ? o.offerText : `${kg} kg`;
      s += `<text x="${f1(x0 + w + 10)}" y="${f1(y + B.vs * 0.36)}" style="font:800 ${B.vs}px var(--sim-font);fill:${SINK(n)}">${vt}</text>`;
    });
    return s;
  }

  /** A stall with its seller and a kg pill on the cart; who may be a CAST key or a newSellerN key. */
  stall(who, x, gy, w, kg, o = {}) {
    const st = sellerStall(who, x, gy, w, kg, { r: o.r ?? 5, tag: false, dim: o.dim });
    let front = st.front;
    const n = SELLERS.indexOf(who);
    const col = n >= 0 ? SER(n + 4) : 'var(--sim-bg-surface)', ink = n >= 0 ? INK(n + 4) : 'var(--sim-label)', edge = n >= 0 ? SER(n + 4) : 'var(--sim-stroke)';
    front += `<g${o.dim ? ' opacity="0.4"' : ''}>${pill(x, st.G.cart + 2, `${kg} kg`, { size: o.ps ?? 19, bg: col, ink, edge })}</g>`;
    if (n >= 0 && o.tag !== false) front += nameTag(x, gy + 4, who, o.ts ?? 15);
    return { over: st.over, front, G: st.G };
  }

  // b0: three sellers, then three more.
  paintMore(P, DW, DH) {
    let svg = '', over = '', front = '', newOver = '', newFront = '';
    const G = P
      ? { board: [70, 34, 110, 46], xs: [68, 195, 322], w: 122, gy: [204, 366], note: [195, 388], b: [[110, 572], [280, 572]], bs: 18 }
      : { board: [66, 32, 112, 46], xs: [92, 280, 468], w: 164, gy: [204, 356], note: [280, 374], b: [[364, 32], [492, 32]], bs: 18 };
    const [bx, by, bw, bh] = G.board;
    svg += priceBoard(bx, by, 100, { w: bw, h: bh, active: true });
    SELLERS.forEach((who, j) => {
      const st = this.stall(who, G.xs[j], G.gy[0], G.w, OLD[j]);
      over += st.over; front += st.front;
    });
    if (this.six) {
      NEWS.forEach((who, j) => {
        const st = this.stall(who, G.xs[j], G.gy[1], G.w, NEW[j]);
        newOver += st.over; newFront += st.front;
      });
      newFront += pill(G.note[0], G.note[1], 'new sellers (made-up example)', { size: P ? 17 : 18 });
      const fly = this.fresh && this.grow0 >= 0 ? ` class="mq-fly" style="--dx:${DW}px;--dy:0px;--dur:0.7s"` : '';
      over += `<div${fly} style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px">${newOver}${frontSvg(DW, DH, newFront)}</div>`;
    } else {
      svg += `<rect x="${f1(G.xs[0] - G.w / 2)}" y="${f1(G.gy[1] - 112)}" width="${f1(G.xs[2] - G.xs[0] + G.w)}" height="110" rx="18" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-dasharray:10 8;opacity:0.6')}/>`;
      svg += txt(G.xs[1], G.gy[1] - 48, 'room for more stalls', P ? 18 : 19, 'var(--sim-label-muted)');
    }
    over += frontSvg(DW, DH, front);
    const offer = this.six ? 24 : 12;
    svg += this.bars(P, { offer, want: 12, grow0: this.fresh ? this.grow0 : -1, growD: this.six ? 0.7 : 0 });
    over += btn('n', '3 sellers', G.b[0][0], G.b[0][1], { val: '3', on: !this.six, size: G.bs });
    over += btn('n', '6 sellers', G.b[1][0], G.b[1][1], { val: '6', on: this.six, size: G.bs });
    return { svg, over };
  }

  // b1: 12 kg would be left; the price falls.
  paintFall(P) {
    let svg = '', over = '';
    const G = P
      ? { board: [96, 84, 150, 62], ar: [196, 52, 116], fall: [96, 158], cr: [292, 266, 160], crTag: [292, 290], chip: [195, 352, 360, 74], again: [338, 160] }
      : { board: [120, 74, 176, 70], ar: [236, 40, 112], fall: [120, 152], cr: [420, 264, 190], crTag: [420, 292], chip: [280, 340, 520, 50], again: [500, 40] };
    const pop = (d) => (this.fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
    const [bx, by, bw, bh] = G.board;
    svg += priceBoard(bx, by, 100, { w: bw, h: bh, active: true });
    svg += `<g${pop(0.9)}>${bigArrow(G.ar[0], G.ar[1], G.ar[2], 1, MOVE, 24)}</g>`;
    svg += `<g${pop(1.0)}>${pill(G.fall[0], G.fall[1], 'price falls', { size: P ? 22 : 24, bg: MOVE, ink: 'var(--sim-ink-on-accent, var(--sim-bg-deep))', edge: MOVE })}</g>`;
    const [cx, cy, cw] = G.cr;
    svg += `<g${pop(0.4)}>${crate(cx, cy, 12, { w: cw, r: P ? 5.4 : 6.2 })}</g>`;
    svg += `<g${pop(0.5)}>${pill(G.crTag[0], G.crTag[1], '12 kg not sold', { size: P ? 20 : 22, bg: `color-mix(in oklab, ${SUP} 22%, var(--sim-bg-surface))`, edge: SUP })}</g>`;
    // a dashed lead from the pale tail of the offer bar up to the crate
    const B = this.barGeo(P), tx = B.x0 + 18 * B.k, ty = B.y[0] - B.h / 2 - (P ? 34 : 6);
    svg += `<g${pop(0.3)}><path d="M${f1(tx)} ${f1(ty)}Q${f1(tx)} ${f1(G.crTag[1] + 40)} ${f1(cx - (P ? 20 : 40))} ${f1(G.crTag[1] + 22)}" ${stroke(SUP, 3, 'stroke-dasharray:8 7;opacity:0.8')}/></g>`;
    const [chx, chy, chw, chh] = G.chip;
    svg += `<g${pop(1.2)}><rect x="${f1(chx - chw / 2)}" y="${f1(chy - chh / 2)}" width="${chw}" height="${chh}" rx="16" ${fill('color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3')}/>`
      + (P
        ? txt(chx, chy - 6, 'more sellers:', 22) + txt(chx, chy + 24, 'supply up, price falls', 22)
        : txt(chx, chy + 9, 'more sellers: supply up, price falls', 24))
      + '</g>';
    svg += this.bars(P, { offer: 24, want: 12, unsold: true });
    if (!this.anim) over += btn('again', 'again', G.again[0], G.again[1], { size: 18 });
    return { svg, over };
  }

  // b2: Seller C closes; 6 kg against 12 kg.
  paintFewer(P, DW, DH) {
    let svg = '', over = '', front = '';
    const G = P
      ? { board: [70, 36, 110, 46], ar: [148, 14, 60], rise: [252, 38], xs: [68, 195, 322], w: 118, gy: [214], b: [[104, 296], [286, 296]], bs: 17, walk: [[290, 594], [342, 594]], wh: 96, no: [128, 560] }
      : { board: [482, 40, 126, 50], ar: [482, 76, 136], rise: [482, 166], xs: [72, 206, 340], w: 134, gy: [222], b: [[118, 298], [300, 298]], bs: 18, walk: [[446, 470], [504, 470]], wh: 112, no: [476, 330] };
    const shut = this.shut, closing = this.fresh && this.grow0 >= 0 && shut;
    const [bx, by, bw, bh] = G.board;
    svg += priceBoard(bx, by, 100, { w: bw, h: bh, active: true });
    SELLERS.forEach((who, j) => {
      const x = G.xs[j], gy = G.gy[0];
      if (j === 2 && shut) {
        // her stall stands closed: no seller, a shutter down over the cart, no heap
        const g2 = stallGeo(x, gy, G.w), k = g2.k;
        front += stallArt(x, gy, G.w);
        const sx = x - 92 * k, sw = 184 * k, sy = g2.awn + 6 * k, sh = gy - 16 * k - sy;
        let sh1 = `<rect x="${f1(sx)}" y="${f1(sy)}" width="${f1(sw)}" height="${f1(sh)}" rx="4" ${fill('color-mix(in oklab, var(--sim-series-8) 30%, var(--sim-bg-surface))', `stroke:${shade('var(--sim-series-8)', 60)};stroke-width:2.5`)}/>`;
        for (let i = 1; i < 7; i++) sh1 += `<path d="M${f1(sx + 4)} ${f1(sy + (i * sh) / 7)}H${f1(sx + sw - 4)}" ${stroke(shade('var(--sim-series-8)', 70), 2)}/>`;
        front += `<g${closing ? ' class="sn-shut"' : ''}>${sh1}</g>`;
        front += `<g${closing ? ' class="mq-pop" style="--d:0.6s"' : ''}>${pill(x, sy + sh * 0.5, 'closed', { size: P ? 18 : 20, bg: 'var(--sim-bg-surface)', edge: 'var(--sim-stroke)' })}</g>`;
        front += nameTag(x, gy + 4, who, 15);
        return;
      }
      const st = this.stall(who, x, gy, G.w, OLD[j]);
      over += st.over; front += st.front;
    });
    over += frontSvg(DW, DH, front);
    const offer = shut ? 6 : 12;
    const spans = (shut ? [['2', SINK(4)], [' + ', 'var(--sim-label)'], ['4', SINK(5)], [' = ', 'var(--sim-label)'], ['6 kg', SINK(7)]]
      : [['2', SINK(4)], [' + ', 'var(--sim-label)'], ['4', SINK(5)], [' + ', 'var(--sim-label)'], ['6', SINK(6)], [' = ', 'var(--sim-label)'], ['12 kg', SINK(7)]])
      .map(([t, c]) => `<tspan style="fill:${c}">${t}</tspan>`).join('');
    svg += this.bars(P, { offer, want: 12, offerText: spans, grow0: this.fresh ? this.grow0 : -1, growD: shut ? 0.5 : 0 });
    if (shut) {
      const pop = (d) => (this.fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
      svg += `<g${pop(1.3)}>${bigArrow(G.ar[0], G.ar[1], G.ar[2], -1, MOVE, P ? 18 : 24)}</g>`;
      svg += `<g${pop(1.4)}>${pill(G.rise[0], G.rise[1], 'price rises', { size: P ? 21 : 24, bg: MOVE, ink: 'var(--sim-ink-on-accent, var(--sim-bg-deep))', edge: MOVE })}</g>`;
      let walkers = '';
      ['buyer1', 'buyer2'].forEach((who, i) => {
        walkers += personSlot(who, { x: G.walk[i][0], y: G.walk[i][1], h: G.wh, pose: 'walk', facing: 1, mood: 'sad' });
      });
      over += `<div${this.fresh ? ' class="sn-go" style="--d:0.9s"' : ''} style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px">${walkers}</div>`;
      svg += `<g${pop(1.5)}>${pill(G.no[0], G.no[1], 'no mangoes', { size: P ? 20 : 21 })}</g>`;
    }
    over += btn('shut', 'Seller C open', G.b[0][0], G.b[0][1], { val: '0', on: !shut, size: G.bs });
    over += btn('shut', 'Seller C closed', G.b[1][0], G.b[1][1], { val: '1', on: shut, size: G.bs });
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, six: this.six, shut: this.shut, anim: this.anim, offer: this.stepIndex === 0 ? (this.six ? 24 : 12) : this.stepIndex === 1 ? 24 : (this.shut ? 6 : 12), want: 12 }; }
}
