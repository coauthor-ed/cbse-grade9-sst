/**
 * FinanceAccountsScene - L04 s03b "Finance", "Accounting", "The profit and loss account" (3 beats). SvgScene,
 * design 560 x 480 landscape, 390 x 600 portrait. Cast: MoneyKit (jar, coin), StallKit (sugarBag), FinPeople
 * (you), SimIcons (shop, check). Drawn here (no kit prop): an oven and a mixer and a cake box (as in L03 / L04
 * operations), the account book (as in L03 StartupCostsScene b2), the profit and loss sheet. Area colour:
 * series 3 (finance and accounting, as in FourAreasBoardScene). No amounts anywhere (the text gives none).
 *   b0 Finance: the money jar (the hero) with three plan cards: 'pay costs' (rent, ovens, mixers, ingredients,
 *      packaging; a coin flies to each), 'invest in growth' (a second oven with a plus), 'cash flow' (money in:
 *      coins drop into the jar; money out: coins leave it).
 *   b1 Accounting: the account book, '+ revenue' (money in) and '- expenses' (money out), a line per sale and
 *      per bill; each line gets a tick (checked) 0.5 s after it is written. Buttons 'make a sale' and 'pay a
 *      bill' write a new line (rest / cold start: two sales, two bills, all ticked).
 *   b2 The profit and loss account: the account book's records flow (arrow) into one sheet 'Profit and loss
 *      account, ABC Bakery, March 2026' with three bands (income, expenses, profit or loss?) left blank: no
 *      numbers until the next lesson. You look at it; two chips 'what to spend?' and 'what to invest?'.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, jar, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS, sugarBag } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const AREA = 'var(--sim-series-3)';
const TINT = 'color-mix(in oklab, var(--sim-series-3) 12%, var(--sim-bg-surface))';
const PAPER = 'color-mix(in oklab, var(--sim-series-2) 10%, var(--sim-bg-surface))';
const SALES = ['cake sold', 'bread sold', 'jar sold', 'buns sold'];
const BILLS = ['flour bill', 'rent paid', 'boxes bill', 'power bill'];
const KEEP = 4;

const CSS = `
.fa-ab { position: absolute; transform: translate(-50%, -50%); }
.fa-btn { min-height: 48px; padding: 5px 10px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.fa-btn.in { border-color: var(--sim-good); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-good); }
.fa-btn.out { border-color: var(--sim-bad); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-bad); }
.fa-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.fa-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .fa-fly { animation: fa-fly 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes fa-fly { 0% { transform: translate(var(--fx), var(--fy)); opacity: 0; } 20% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .fa-pop { transform-box: fill-box; transform-origin: left center; animation: fa-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes fa-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .fa-fly, svg .fa-pop { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;
const arrow = (x0, y0, x1, y1, col, w = 6) => {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 16, ex = x1 - Math.cos(a) * L, ey = y1 - Math.sin(a) * L;
  const p = (s) => `${f1(ex + Math.cos(a + s * Math.PI / 2) * 11)} ${f1(ey + Math.sin(a + s * Math.PI / 2) * 11)}`;
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(ex)} ${f1(ey)}" ${stroke(col, w, 'stroke-linecap:round')}/><path d="M${p(1)}L${f1(x1)} ${f1(y1)}L${p(-1)}Z" ${fill(col)}/>`;
};

function oven(x, y, w) {
  const h = w * 0.86, x0 = x - w / 2, top = y - h, body = 'color-mix(in oklab, var(--sim-series-7) 30%, var(--sim-bg-surface))', rim = shade(body, 60);
  const glow = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-surface))';
  let s = rect(x0, top + 3, w, h, 6, rim) + rect(x0, top, w, h, 6, body, `stroke:${rim};stroke-width:2.5`)
    + `<path d="M${f1(x0)} ${f1(top + h * 0.22)}H${f1(x0 + w)}" ${stroke(rim, 2)}/>`;
  s += rect(x0 + w * 0.12, top + h * 0.32, w * 0.76, h * 0.56, 4, glow, `stroke:${rim};stroke-width:2`);
  return s;
}

function mixer(x, y, h) {
  const body = 'color-mix(in oklab, var(--sim-series-4) 45%, var(--sim-bg-surface))', rim = shade(body, 60), bowl = 'color-mix(in oklab, var(--sim-label-muted) 25%, var(--sim-bg-surface))';
  const w = h * 0.8;
  return rect(x - w / 2, y - h * 0.12, w, h * 0.12, 4, body, `stroke:${rim};stroke-width:2`)
    + rect(x - w / 2 + 3, y - h, w * 0.24, h * 0.9, 4, body, `stroke:${rim};stroke-width:2`)
    + rect(x - w / 2 + 3, y - h, w * 0.92, h * 0.26, h * 0.12, body, `stroke:${rim};stroke-width:2`)
    + `<path d="M${f1(x - w * 0.12)} ${f1(y - h * 0.5)}h${f1(w * 0.62)}l-${f1(w * 0.08)} ${f1(h * 0.36)}h-${f1(w * 0.46)}Z" ${fill(bowl, `stroke:${shade(bowl, 60)};stroke-width:2;stroke-linejoin:round`)}/>`;
}

function cakeBox(x, y, w) {
  const h = w * 0.62, x0 = x - w / 2, top = y - h, rib = 'var(--sim-series-6)', rim = 'var(--sim-stroke)';
  return rect(x0, top, w, h, 5, 'var(--sim-bg-surface)', `stroke:${rim};stroke-width:2`)
    + rect(x0 - 3, top - 3, w + 6, h * 0.26, 4, 'color-mix(in oklab, var(--sim-series-6) 18%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2`)
    + rect(x - w * 0.06, top - 3, w * 0.12, h + 3, 0, rib);
}

const COSTS = [
  { lab: 'rent', art: (x, y) => icon('shop', 6, x, y - 16, 38) },
  { lab: 'ovens', art: (x, y) => oven(x, y, 38) },
  { lab: 'mixers', art: (x, y) => mixer(x, y, 36) },
  { lab: 'ingredients', art: (x, y) => sugarBag(x, y, 38, { label: '' }) },
  { lab: 'packaging', art: (x, y) => cakeBox(x, y - 2, 38) },
];

export class FinanceAccountsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Finance for ABC Bakery: a money jar with three plans. Pay costs: rent, ovens, mixers, ingredients and packaging. Invest in growth: a second oven. Cash flow: money coming in and money going out. Accounting: an account book with revenue, the money in, and expenses, the money out; a line for every sale and every bill, each ticked when checked. Then the records go into one sheet, the profit and loss account of ABC Bakery for March 2026, with income, expenses and profit or loss still blank; it helps the owners decide what to spend and what to invest.';

  async setup() {
    this.reset();
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || this.stepIndex !== 1) return;
      if (b.dataset.act === 'sell') { this.ins.push(SALES[this.ns++ % SALES.length]); this.fresh = 'in'; }
      else { this.outs.push(BILLS[this.nb++ % BILLS.length]); this.fresh = 'out'; }
      this.ins = this.ins.slice(-KEEP);
      this.outs = this.outs.slice(-KEEP);
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  reset() { this.ins = [SALES[0], SALES[1]]; this.outs = [BILLS[0], BILLS[1]]; this.ns = 2; this.nb = 2; this.fresh = null; }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.reset(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintBook(P) : v === 2 ? this.paintSheet(P) : this.paintFinance(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  card(x, y, w, h, title) {
    return lipRect(x, y, w, h, 14, TINT, shade(AREA, 62)) + text(x + w / 2, y + 30, title, title.length > 12 ? 20 : 22, shade(AREA, 72));
  }

  // b0: the money jar and its three plans.
  paintFinance(P) {
    const G = P
      ? { title: [195, 34], sub: [195, 66], pay: [10, 82, 186, 270], inv: [204, 366, 176, 226], flow: [10, 366, 186, 226], jar: [292, 330, 104] }
      : { title: [280, 36], sub: [280, 66], pay: [10, 86, 184, 384], inv: [366, 86, 184, 180], flow: [366, 280, 184, 190], jar: [280, 440, 128] };
    let svg = text(G.title[0], G.title[1], 'finance', 30, shade(AREA, 72)) + text(G.sub[0], G.sub[1], 'plan, get and use money', 21, 'var(--sim-label-muted)', 'middle', 700);
    const [jx, jy, jw] = G.jar, mouth = [jx, jy - jw * 1.3 - 6], mid = [jx, jy - jw * 0.6];
    // spokes from the jar to the two spending cards
    const [px, py, pw, ph] = G.pay, [ix, iy, iw, ih] = G.inv, [fx, fy, fw, fh] = G.flow;
    const payEdge = P ? [px + pw, py + ph * 0.6] : [px + pw, py + ph * 0.5];
    const invEdge = P ? [ix + iw / 2, iy] : [ix, iy + ih * 0.6];
    for (const e of [payEdge, invEdge]) svg += `<path d="M${f1(mid[0])} ${f1(mid[1])}L${f1(e[0])} ${f1(e[1])}" ${stroke('var(--sim-series-8)', 3.5, 'stroke-dasharray:3 9;stroke-linecap:round')}/>`;
    svg += jar(jx, jy, 1000, null, { w: jw, max: 1100, label: '' });
    // pay costs
    svg += this.card(px, py, pw, ph, 'pay costs');
    const rh = (ph - 56) / 5;
    COSTS.forEach((c, i) => {
      const ry = py + 52 + rh * (i + 0.5);
      svg += `<g class="mk-pop" style="--d:${(0.5 + i * 0.12).toFixed(2)}s">${c.art(px + 34, ry + 16)}${text(px + 62, ry + 8, c.lab, 21, 'var(--sim-label)', 'start')}</g>`;
    });
    // coins fly from the jar to the two spending cards
    [[payEdge, 0.3], [invEdge, 0.45]].forEach(([e, d]) => {
      const [tx, ty] = [e[0] + (e === payEdge ? 0 : (P ? 0 : -2)), e[1]];
      svg += `<g class="fa-fly" style="--d:${d}s;--fx:${f1(mid[0] - tx)}px;--fy:${f1(mid[1] - ty)}px">${coin(tx, ty, 15)}</g>`;
    });
    // invest in growth: the oven now, and a second oven with a plus
    svg += this.card(ix, iy, iw, ih, 'invest in growth');
    const oy = iy + ih - (P ? 40 : 26), ow = P ? 66 : 58;
    svg += oven(ix + iw * 0.3, oy, ow);
    svg += `<g class="mk-pop" style="--d:0.9s">${oven(ix + iw * 0.72, oy, ow)}<circle cx="${f1(ix + iw * 0.72 + ow * 0.5)}" cy="${f1(oy - ow * 0.86)}" r="15" ${fill('var(--sim-good)', `stroke:${shade('var(--sim-good)', 62)};stroke-width:2`)}/>${text(ix + iw * 0.72 + ow * 0.5, oy - ow * 0.86 + 8, '+', 24, 'var(--sim-bg-surface)')}</g>`;
    // cash flow: money in and money out
    svg += this.card(fx, fy, fw, fh, 'cash flow');
    const r1 = fy + fh * 0.45, r2 = fy + fh * 0.78, ax0 = fx + 18, ax1 = fx + fw - 18;
    // money in points towards the jar (left in landscape, right in portrait), money out away from it
    const [inA, inB, outA, outB] = P ? [ax0, ax1, ax1, ax0] : [ax1, ax0, ax0, ax1], sgn = P ? 1 : -1;
    svg += arrow(inA + sgn * 40, r1 - 8, inB, r1 - 8, 'var(--sim-good)') + coin(inA + sgn * 18, r1 - 8, 15) + text(fx + fw / 2, r1 + 24, 'money in', 20, shade('var(--sim-good)', 75));
    svg += arrow(outA - sgn * 40, r2 - 8, outB, r2 - 8, 'var(--sim-bad)') + coin(outA - sgn * 18, r2 - 8, 15) + text(fx + fw / 2, r2 + 24, 'money out', 20, shade('var(--sim-bad)', 75));
    // on the jar: a coin drops in at the mouth, one leaves at the side
    svg += `<g class="fa-fly" style="--d:0.6s;--fx:0px;--fy:-60px">${coin(mouth[0], mouth[1] + 4, 15)}</g>`;
    return { svg };
  }

  // b1: the account book.
  paintBook(P) {
    const G = P
      ? { book: [4, 14, 382, 446], fs: 20, row: 62, r0: 150, btn: [[100, 528], [290, 528]], bw: 178, head: 23 }
      : { book: [24, 12, 512, 372], fs: 22, row: 56, r0: 160, btn: [[160, 434], [400, 434]], bw: 220, head: 26 };
    const [bx, by, bw, bh] = G.book, mid = bx + bw / 2, cover = 'color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-label) 18%)';
    let svg = rect(bx, by + 6, bw, bh, 14, shade(cover, 60)) + rect(bx, by, bw, bh, 14, cover, `stroke:${shade(cover, 60)};stroke-width:2.5`);
    const pages = [{ x: bx + 10, rows: this.ins, head: 'revenue', sub: 'money in', col: 'var(--sim-good)', sign: '+', key: 'in' },
      { x: mid + 4, rows: this.outs, head: 'expenses', sub: 'money out', col: 'var(--sim-bad)', sign: '-', key: 'out' }];
    const pw = bw / 2 - 14;
    pages.forEach((pg) => {
      svg += rect(pg.x, by + 10, pw, bh - 20, 8, 'var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2');
      svg += rect(pg.x, by + 10, pw, G.head * 3.4, 8, `color-mix(in oklab, ${pg.col} 18%, var(--sim-bg-surface))`);
      svg += text(pg.x + pw / 2, by + 10 + G.head * 1.4, `${pg.sign} ${pg.head}`, G.head + 2, shade(pg.col, 72));
      svg += text(pg.x + pw / 2, by + 10 + G.head * 2.6, pg.sub, G.head - 4, 'var(--sim-label-muted)', 'middle', 700);
      for (let i = 0; i < KEEP; i++) {
        const ly = by + G.r0 + i * G.row;
        svg += `<path d="M${f1(pg.x + 12)} ${f1(ly + 14)}H${f1(pg.x + pw - 12)}" ${stroke('color-mix(in oklab, var(--sim-stroke) 60%, transparent)', 1.5)}/>`;
        const lab = pg.rows[i];
        if (!lab) continue;
        const isNew = this.fresh === pg.key && i === pg.rows.length - 1;
        const row = text(pg.x + 12, ly + 2, `<tspan style="fill:${shade(pg.col, 72)}">${pg.sign}</tspan> ${lab}`, G.fs, 'var(--sim-label)', 'start');
        const tick = `<g class="mk-pop" style="--d:${isNew ? 0.6 : 0.4 + i * 0.15}s">${icon('check', 3, pg.x + pw - 24, ly - 5, 28)}</g>`;
        svg += (isNew ? `<g class="fa-pop">${row}</g>` : row) + tick;
      }
    });
    svg += `<path d="M${f1(mid)} ${by + 6}V${by + bh - 6}" ${stroke(shade(cover, 55), 4)}/>`;
    this.fresh = null;
    let over = '';
    [['sell', 'make a sale', 'in'], ['bill', 'pay a bill', 'out']].forEach(([act, lab, cls], i) => {
      const [x, y] = G.btn[i];
      over += `<button type="button" class="sv-hit tap btn fa-ab fa-btn ${cls}" data-act="${act}" style="left:${x}px;top:${y}px;width:${G.bw}px">${lab}</button>`;
    });
    return { svg, over };
  }

  // b2: the records go into one sheet, the profit and loss account (no numbers yet).
  paintSheet(P) {
    const G = P
      ? { sheet: [124, 10, 252, 370], book: [8, 150, 90, 74], arr: [100, 187, 122, 187], chips: [[262, 456], [262, 516]], cw: 216, you: [76, 592, 176], recLab: [53, 254], cfs: 20 }
      : { sheet: [140, 12, 260, 336], book: [14, 130, 96, 80], arr: [112, 170, 138, 170], chips: [[178, 412], [368, 412]], cw: 176, you: [488, 456, 196], recLab: [62, 242], cfs: 20 };
    const [sx, sy, sw, sh] = G.sheet;
    let svg = rect(sx + 6, sy + 8, sw, sh, 10, 'color-mix(in oklab, var(--sim-label) 16%, transparent)') + rect(sx, sy, sw, sh, 10, PAPER, 'stroke:var(--sim-stroke);stroke-width:2.5');
    svg += text(sx + sw / 2, sy + 36, 'Profit and loss', 24) + text(sx + sw / 2, sy + 64, 'account', 24);
    svg += text(sx + sw / 2, sy + 94, 'ABC Bakery, March 2026', 18, 'var(--sim-label-muted)', 'middle', 700);
    const bands = [['income', 'var(--sim-good)'], ['expenses', 'var(--sim-bad)'], ['profit or loss?', 'var(--sim-accent)']];
    const b0 = sy + 112, bhh = (sh - 124) / 3;
    bands.forEach(([lab, col], i) => {
      const y = b0 + i * bhh, last = i === 2;
      svg += `<g class="mk-pop" style="--d:${(0.4 + i * 0.2).toFixed(1)}s">${rect(sx + 12, y + 4, sw - 24, bhh - 10, 8, `color-mix(in oklab, ${col} ${last ? 22 : 14}%, var(--sim-bg-surface))`, `stroke:${shade(col, 62)};stroke-width:${last ? 3 : 2}`)}`
        + text(sx + 26, y + 34, lab, 21, shade(col, 75), 'start')
        + (last ? text(sx + sw - 34, y + bhh * 0.5 + 14, '?', 40, shade(col, 75)) : `<path d="M${f1(sx + 26)} ${f1(y + bhh - 22)}h${f1(sw * 0.5)}" ${stroke('var(--sim-label-muted)', 3, 'stroke-dasharray:6 6;stroke-linecap:round')}/>`)
        + '</g>';
    });
    // the account book (closed) and its records going in
    const [kx, ky, kw, kh] = G.book, cover = 'color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-label) 18%)';
    svg += rect(kx, ky + 5, kw, kh, 8, shade(cover, 60)) + rect(kx, ky, kw, kh, 8, cover, `stroke:${shade(cover, 60)};stroke-width:2.5`);
    svg += rect(kx + 10, ky + 10, kw - 20, kh - 20, 4, 'var(--sim-bg-surface)');
    for (let i = 0; i < 3; i++) svg += `<path d="M${f1(kx + 18)} ${f1(ky + 22 + i * 14)}h${f1(kw - 36)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-linecap:round')}/>`;
    svg += text(G.recLab[0], G.recLab[1], 'records', 21);
    const [a0, a1, a2, a3] = G.arr;
    svg += `<g class="mk-pop" style="--d:0.2s">${arrow(a0, a1, a2, a3, AREA)}</g>`;
    // the owners decide
    let over = personSlot('you', { x: G.you[0], y: G.you[1], h: G.you[2], facing: P ? 1 : -1, mood: 'think' });
    ['what to spend?', 'what to invest?'].forEach((t, i) => {
      const [cx, cy] = G.chips[i];
      svg += `<g class="mk-pop" style="--d:${(1.1 + i * 0.2).toFixed(1)}s">${lipRect(cx - G.cw / 2, cy - 22, G.cw, 44, 22, 'var(--sim-bg-surface)', 'var(--sim-stroke)')}${text(cx, cy + 7, t, G.cfs)}</g>`;
    });
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, in: this.ins.length, out: this.outs.length }; }
}
