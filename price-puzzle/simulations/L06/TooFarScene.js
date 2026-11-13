/**
 * TooFarScene - L06 s06 "When Government Action Goes Too Far" (3 beats). SvgScene, design units 560 x 490
 * landscape, 390 x 640 portrait. Only the book's numbers: wheat Rs 20 (highest price) against Rs 30 (market); no kg
 * numbers anywhere (the book gives none). The farmer (he) is the course cast 'farmer' (same look as L04).
 *   b0  a wheat graph with price ticks Rs 20 and Rs 30 only: demand and supply meet at E (Rs 30); a lid at Rs 20
 *       ("highest price"); at Rs 20 a dot on supply and a dot on demand with the gap lit: "shortage". Beside it the
 *       farmer and his field: one strip of wheat, one strip left bare: "grows less". Plays on entry, "replay".
 *   b1  a small restaurant and its owner, who waits; four permit cards (food safety, fire safety, pollution, local
 *       clearance) are stamped one by one while a month row fills ("months pass"); chip "ease of doing business".
 *       Plays on entry, "replay".
 *   b2  named cases "fair price" / "price set too low" (rest: too low): the farmer's three spends (better seeds,
 *       irrigation, new technology) lit or crossed out; a crop bar for each of 3 years grows (fair) or stays low,
 *       with the fair-price bars as dashed ghosts ("less crop"). No numbers.
 * People are SimFigure people via ../shared/MangoPeople.js. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { farmSpec, farmSvg, cropTone } from 'simulations/base/kit/SimFarm.js';
import { RS } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, frame, axes, line, dot, pill, btn } from '../shared/MarketParts.js';
import { SUP, SINK } from '../shared/SupplyParts.js';
import { lid, icon, CAP } from '../shared/GovParts.js';

registerCast('farmer', { name: 'the farmer', role: 'farmer', i: 0,
  look: { outfit: 'kurta', hairStyle: 'short', top: 'sage', bottom: 'cream', shoeStyle: 'sandal', pattern: 'plain', moustache: true, glasses: false, dupatta: false, girth: 1 } });
registerCast('owner', { name: 'the owner', role: 'shopkeeper', i: 28,
  look: { outfit: 'shirt', hairStyle: 'short', top: 's5', bottom: 'khaki', shoeStyle: 'shoe', pattern: 'plain', moustache: false, glasses: true, dupatta: false, girth: 1 } });

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const BAD = { bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' };
const WHEAT = cropTone('wheat');
// the wheat market (no kg numbers are drawn): demand p = 30 - 2.8 (q - 5), supply p = 30 + 2.8 (q - 5)
const pD = (q) => 30 - 2.8 * (q - 5);
const pS = (q) => 30 + 2.8 * (q - 5);
const qD = (p) => 5 + (30 - p) / 2.8;
const qS = (p) => 5 - (30 - p) / 2.8;
const PERMITS = [['food', 'safety'], ['fire', 'safety'], ['pollution'], ['local', 'clearance']];
const SPENDS = [{ t: ['better', 'seeds'], ic: 'seed' }, { t: ['irrigation'], ic: 'canal' }, { t: ['new', 'technology'], ic: 'bulb' }];
const FAIR = [0.5, 0.72, 0.94];
const LOW = [0.42, 0.4, 0.38];
const STAMP_GAP = 0.6;

export class TooFarScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A wheat graph with two prices: the market price is 30 rupees a kg, where demand and supply meet, and the government sets a highest price of 20 rupees. At 20 rupees buyers want more wheat than farmers offer: a shortage. The farmer earns less and grows less wheat: half his field is left bare. Then a small restaurant: the owner waits for four permissions, food safety, fire safety, pollution and local clearance, stamped one by one while months pass. Ease of doing business means how simple it is to start, run and close a business. Then the farmer over three years: at a fair price he spends on better seeds, irrigation and new technology and his crop grows each year; when the price is set too low he cannot spend, and his crop stays low, less than it could have been.';

  async setup() {
    this.fair = false;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act, s = this.stepIndex;
      if (a === 'replay' && s < 2) this.burst(this.dur(s));
      else if (s === 2 && (a === 'fair' || a === 'low')) { this.fair = a === 'fair'; this.burst(1.4); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  dur(s) { return s === 0 ? 2.0 : s === 1 ? 0.5 + STAMP_GAP * 4 + 0.6 : 1.4; }

  css() { return PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.fair = false;
    this.burst(this.dur(step));
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

  pop(d) { return this.fresh ? ` class="mq-pop" style="--d:${d}s"` : ''; }
  fade(d) { return this.fresh ? ` class="mq-fade" style="--d:${d}s"` : ''; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 490, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 0 ? this.paintWheat(P) : s === 1 ? this.paintPermits(P) : this.paintYears(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  // b0: the wheat graph with a lid at Rs 20; the farmer grows less
  paintWheat(P) {
    const g = P ? frame(84, 370, 70, 330, 10, 45) : frame(104, 336, 40, 372, 10, 45);
    const G = P ? { field: [20, 392, 210], farmer: [300, 620, 196], less: [125, 552], rp: [330, 26] }
      : { field: [356, 62, 194], farmer: [456, 470, 196], less: [453, 236], rp: [500, 466] };
    let svg = '', over = '';
    svg += axes(g, { xs: [], ys: [20, 30], gridX: [], gridY: [20, 30], yTitleX: P ? -999 : 34, yTitle: P ? '' : undefined,
      xTitleY: P ? 352 : 410, xTitle: 'quantity of wheat', tick: P ? 20 : 22, title: P ? 20 : 22 });
    if (P) svg += txt(10, 26, `price (${RS} per kg)`, 20, 'var(--sim-label)', 'start');
    svg += line(g, 1.2, pD(1.2), 9.4, pD(9.4), MKT, { w: 7 }) + line(g, 1.2, pS(1.2), 9.4, pS(9.4), SUP, { w: 7 });
    svg += txt(g.X(1.4), g.Y(pD(1.4)) - 14, 'demand', P ? 19 : 20, SINK(5), 'start');
    svg += txt(g.X(9.3) - 14, g.Y(pS(9.3)) + 8, 'supply', P ? 19 : 20, SINK(7), 'end');
    // E at the market price
    const ex = g.X(5), ey = g.Y(30);
    svg += `<path d="M${f1(g.L)} ${f1(ey)}H${f1(ex)}" ${stroke(ACC, 3, 'stroke-dasharray:9 8')}/>`;
    svg += `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="20" ${fill('color-mix(in oklab, var(--sim-accent) 18%, transparent)', 'stroke:var(--sim-accent);stroke-width:4')}/>`;
    svg += dot(ex, ey, '', { col: 'var(--sim-label)', r: 9 }) + txt(ex + 26, ey + 22, 'E', 30, ACC, 'start');
    // the lid at Rs 20 and the shortage under it
    const y = g.Y(20), xs = g.X(qS(20)), xd = g.X(qD(20));
    svg += `<g${this.fade(0.2)}>${lid(g, 20)}${pill(g.L + 72, y + 32, 'highest price', { size: P ? 18 : 19, bg: 'var(--sim-bg-surface)', ink: CAP, edge: CAP })}</g>`;
    svg += `<g${this.fade(0.7)}><path d="M${f1(xs)} ${f1(y + 2)}H${f1(xd)}" ${stroke(ACC, 7)}/>${dot(xs, y + 2, '', { col: SUP, r: 10 })}${dot(xd, y + 2, '', { col: MKT, r: 10 })}</g>`;
    svg += `<g${this.pop(1.0)}>${pill((xs + xd) / 2 + 30, y + 74, 'shortage', { size: P ? 20 : 22, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    // the farmer's field: one strip of wheat, one left bare
    const [fx, fy, fw] = G.field;
    const spec = farmSpec({ strips: [{ crop: 'wheat', soil: 'loam' }, { crop: 'idle', soil: 'dry' }], orient: 'rows', w: fw, h: 136, gap: 8 });
    svg += farmSvg(spec, { x: fx, y: fy, animate: this.fresh });
    svg += `<g${this.pop(1.4)}>${pill(G.less[0], G.less[1], 'grows less', { size: P ? 21 : 22, ...BAD })}</g>`;
    over += personSlot('farmer', { x: G.farmer[0], y: G.farmer[1], h: G.farmer[2], pose: 'stand', facing: 0, mood: 'sad' });
    if (!this.anim) over += btn('replay', 'replay', G.rp[0], G.rp[1], { size: 17 });
    return { svg, over };
  }

  permit(i, x, y, w, h, stamped, P) {
    let s = `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="10" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:3')}/>`;
    s += `<path d="M${f1(x - w / 2)} ${f1(y - h / 2 + 12)}h${f1(w)}" ${stroke('var(--sim-series-4)', 6, 'opacity:0.8')}/>`;
    const fs = P ? 16 : 19, lines = PERMITS[i];
    let ty = y - h / 2 + 22 + fs + (lines.length === 1 ? fs * 0.6 : 0);
    for (const t of lines) { s += txt(x, ty, t, fs, 'var(--sim-label)'); ty += fs * 1.2; }
    if (stamped) {
      const sy = y + h / 2 - (P ? 28 : 32), r = P ? 20 : 23, d = 0.5 + i * STAMP_GAP;
      s += `<g${this.fresh ? ` class="mq-pop" style="--d:${d}s"` : ''} transform="rotate(-12 ${f1(x)} ${f1(sy)})">`;
      s += `<circle cx="${f1(x)}" cy="${f1(sy)}" r="${r}" ${fill('color-mix(in oklab, var(--sim-good) 16%, transparent)', 'stroke:var(--sim-good);stroke-width:4')}/>`;
      s += `<path d="M${f1(x - r * 0.45)} ${f1(sy)}l${f1(r * 0.3)} ${f1(r * 0.32)}l${f1(r * 0.55)} ${f1(-r * 0.62)}" ${stroke('var(--sim-good)', 4.5)}/></g>`;
    }
    return s;
  }

  // b1: a small restaurant waits for four permissions
  paintPermits(P) {
    const G = P
      ? { shop: [112, 252, 196], sign: [112, 52], owner: [292, 262, 176], cards: [[52, 352], [147, 352], [243, 352], [338, 352]], cw: 88, ch: 128,
        cal: [44, 462], months: [96, 462, 66], mlab: [218, 508], chip: [195, 560], rp: [195, 608] }
      : { shop: [128, 300, 226], sign: [128, 80], owner: [262, 408, 176], cards: [[366, 98], [488, 98], [366, 244], [488, 244]], cw: 112, ch: 132,
        cal: [330, 352], months: [372, 352, 44], mlab: [450, 398], chip: [214, 458], rp: [500, 458] };
    let svg = '', over = '';
    svg += `<path d="M0 ${f1(G.shop[1] + 2)}H${P ? 390 : 300}" ${stroke('var(--sim-stroke)', 3)}/>`;
    svg += civicSvg('shop', G.shop[0], G.shop[1], { w: G.shop[2] });
    svg += pill(G.sign[0], G.sign[1], 'small restaurant', { size: P ? 19 : 20, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', edge: 'var(--sim-label)' });
    G.cards.forEach(([x, y], i) => { svg += `<g${this.pop(0.05 + i * 0.08)}>${this.permit(i, x, y, G.cw, G.ch, true, P)}</g>`; });
    // the months: a calendar and one block per permit
    svg += icon('calendar', G.cal[0], G.cal[1], P ? 50 : 52, 'var(--sim-series-4)');
    const [m0, my, mw] = G.months;
    for (let i = 0; i < 4; i++) {
      const x = m0 + i * (mw + 8);
      svg += `<rect x="${f1(x)}" y="${f1(my - 16)}" width="${f1(mw)}" height="32" rx="7" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2;stroke-dasharray:5 4')}/>`;
      svg += `<g${this.pop(0.5 + i * STAMP_GAP)}><rect x="${f1(x)}" y="${f1(my - 16)}" width="${f1(mw)}" height="32" rx="7" ${fill('color-mix(in oklab, var(--sim-series-4) 55%, var(--sim-bg-surface))', 'stroke:var(--sim-series-4);stroke-width:2.5')}/></g>`;
    }
    svg += txt(G.mlab[0], G.mlab[1], 'months pass', P ? 19 : 20, 'var(--sim-label-muted)');
    svg += `<g${this.pop(0.6 + STAMP_GAP * 4)}>${pill(G.chip[0], G.chip[1], 'ease of doing business', { size: P ? 21 : 22, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    over += personSlot('owner', { x: G.owner[0], y: G.owner[1], h: G.owner[2], pose: 'stand', facing: 0, mood: 'think' });
    if (!this.anim) over += btn('replay', 'replay', G.rp[0], G.rp[1], { size: 17 });
    return { svg, over };
  }

  // b2: three years at a fair price or a price set too low
  paintYears(P) {
    const fair = this.fair;
    const G = P
      ? { btn: [[104, 34], [282, 34]], cards: [[72, 140], [195, 140], [318, 140]], cw: 112, ch: 132, farmer: [72, 560, 196], bx: [190, 270, 350], bw: 56, base: 540, bh: 250,
        ylab: 566, cap: [270, 604] }
      : { btn: [[148, 34], [380, 34]], cards: [[214, 150], [338, 150], [462, 150]], cw: 112, ch: 132, farmer: [74, 452, 216], bx: [250, 360, 470], bw: 64, base: 420, bh: 176,
        ylab: 446, cap: [360, 478] };
    let svg = '', over = '';
    // the three spends
    SPENDS.forEach((sp, i) => {
      const [x, y] = G.cards[i], w = G.cw, h = G.ch;
      let s = `<g style="opacity:${fair ? 1 : 0.55}">`;
      s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(fair ? 'color-mix(in oklab, var(--sim-good) 10%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${fair ? 'var(--sim-good)' : 'var(--sim-label-muted)'};stroke-width:3`)}/>`;
      s += icon(sp.ic, x, y - h / 2 + 38, 54, fair ? 'var(--sim-series-3)' : 'var(--sim-label-muted)');
      let ty = y + 22 + (sp.t.length === 1 ? 9 : 0);
      for (const t of sp.t) { s += txt(x, ty, t, P ? 17 : 18, 'var(--sim-label)'); ty += 21; }
      s += '</g>';
      if (!fair) { const bx = x + w / 2 - 12, by = y - h / 2 + 12; s += `<circle cx="${f1(bx)}" cy="${f1(by)}" r="15" ${fill('var(--sim-bad)', 'stroke:var(--sim-bg-surface);stroke-width:2.5')}/><path d="M${f1(bx - 6)} ${f1(by - 6)}l12 12m0 -12l-12 12" ${stroke('var(--sim-bg-deep)', 3.5)}/>`; }
      svg += `<g${this.pop(0.1 + i * 0.12)}>${s}</g>`;
    });
    // crop bars: a year each
    svg += `<path d="M${f1(G.bx[0] - G.bw)} ${f1(G.base)}H${f1(G.bx[2] + G.bw)}" ${stroke('var(--sim-label)', 3.5)}/>`;
    G.bx.forEach((x, i) => {
      const hf = G.bh * FAIR[i], h = G.bh * (fair ? FAIR[i] : LOW[i]);
      if (!fair) svg += `<rect x="${f1(x - G.bw / 2)}" y="${f1(G.base - hf)}" width="${f1(G.bw)}" height="${f1(hf)}" rx="6" ${fill('none', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-dasharray:8 6')}/>`;
      svg += `<rect${this.fresh ? ` class="sv-grow" style="--d:${0.4 + i * 0.25}s"` : ''} x="${f1(x - G.bw / 2)}" y="${f1(G.base - h)}" width="${f1(G.bw)}" height="${f1(h)}" rx="6" ${fill(WHEAT, `stroke:${shade(WHEAT, 60)};stroke-width:2.5`)}/>`;
      svg += txt(x, G.ylab, `year ${i + 1}`, P ? 17 : 18, 'var(--sim-label-muted)');
    });
    svg += `<g${this.pop(1.2)}>${fair ? pill(G.cap[0], G.cap[1], 'crop grows', { size: P ? 20 : 21, bg: 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-good)' })
      : pill(G.cap[0], G.cap[1], 'less crop', { size: P ? 20 : 21, ...BAD })}</g>`;
    over += personSlot('farmer', { x: G.farmer[0], y: G.farmer[1], h: G.farmer[2], pose: 'stand', facing: 0, mood: fair ? 'happy' : 'sad' });
    over += btn('fair', 'fair price', G.btn[0][0], G.btn[0][1], { on: fair, aria: 'show a fair price', size: 19 });
    over += btn('low', 'price set too low', G.btn[1][0], G.btn[1][1], { on: !fair, aria: 'show a price set too low', size: 19 });
    return { svg, over };
  }

  testState() {
    return { step: this.stepIndex, anim: this.anim, market: 30, ceiling: 20, shortage: this.stepIndex === 0, fair: this.stepIndex === 2 ? this.fair : null,
      permits: PERMITS.map((p) => p.join(' ')), spends: SPENDS.map((s) => s.t.join(' ')) };
  }
}
