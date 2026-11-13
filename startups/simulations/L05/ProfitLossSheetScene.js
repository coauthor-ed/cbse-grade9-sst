/**
 * ProfitLossSheetScene - L05 s02 "Money coming in", "Money going out", "Profit before and after tax" (3 beats).
 * SvgScene, design 560 x 480 landscape, 390 x 600 portrait. The hero is the profit and loss sheet, the same paper,
 * title and bands as L04 FinanceAccountsScene b2 ('Profit and loss account', 'ABC Bakery, March 2026'; income good,
 * expenses bad, profit accent). Beside it (landscape) or under it (portrait) two bars on one scale: income and
 * expenses; the gap between them is the profit. Cast: MoneyKit (rs), SimIcons (building = the government).
 *   b0 Money coming in: the income band open: bread and buns 1,20,000, pastries and cookies 75,000, cake orders
 *      85,000, delivery 15,000 pop in one by one, then 'total income 2,95,000'. The income bar grows in four parts.
 *      Expenses and profit bands are shut and dimmed. Foot: 'ABC Bakery: a made-up name'.
 *   b1 Money going out: income shut to its total; the expenses band open: flour and sugar 1,00,000, rent 40,000,
 *      salaries 30,000 and one row 'smaller costs 52,000' (a button: tap to open a card with packaging 12,000,
 *      electricity and gas 15,000, advertising 8,000, other costs 7,000, interest on a loan 10,000), total
 *      2,22,000. The expenses bar grows beside the income bar.
 *   b2 Profit before and after tax: both shut to totals; the profit band open: profit before tax 73,000, tax
 *      - 13,000, profit after tax 60,000 (the one bold line, ringed). On the bars the gap 73,000 is lit; its tax
 *      slice (13,000) lifts off to the government, leaving 60,000. Formula in the sheet: Profit = Total Revenue
 *      - Total Expenses.
 * No host controls. Colours are tokens only. ASCII only (the rupee sign comes from MoneyKit's rs()).
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const PAPER = 'color-mix(in oklab, var(--sim-series-2) 10%, var(--sim-bg-surface))';
const GOOD = 'var(--sim-good)', BAD = 'var(--sim-bad)', ACC = 'var(--sim-accent)';

const INCOME = [['bread and buns', 120000], ['pastries and cookies', 75000], ['cake orders', 85000], ['delivery', 15000]];
const EXPENSES = [['flour and sugar', 100000], ['rent', 40000], ['salaries', 30000], ['smaller costs', 52000]];
const SMALL = [['packaging', 12000], ['electricity and gas', 15000], ['advertising', 8000], ['other costs', 7000], ['interest on a loan', 10000]];
const TOT_IN = 295000, TOT_OUT = 222000, PBT = 73000, TAX = 13000, PAT = 60000;

const CSS = `
.pl-ab { position: absolute; }
.pl-row { display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; cursor: pointer;
  padding: 0 10px; border-radius: calc(10px * var(--look-radius, 1)); font: 800 20px/1 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px dashed ${shade(BAD, 62)}; box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 ${shade(BAD, 62)}; }
.pl-row b { font-weight: 800; }
.pl-row .pl-plus { display: inline-block; width: 26px; height: 26px; margin-right: 6px; border-radius: 50%; text-align: center; line-height: 26px;
  background: ${BAD}; color: var(--sim-ink-on-bad, var(--sim-bg-deep)); font: 800 22px/26px var(--sim-font); }
.pl-row:active { transform: translateY(3px); box-shadow: none; }
.pl-row:focus-visible, .pl-close:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.pl-card { position: absolute; box-sizing: border-box; padding: 10px 16px 12px; background: var(--sim-bg-surface); color: var(--sim-label);
  border: 3px solid ${shade(BAD, 62)}; border-radius: calc(14px * var(--look-radius, 1)); box-shadow: 0 calc(5px * var(--look-lip, 1)) 0 ${shade(BAD, 62)};
  font: 800 20px/1 var(--sim-font); animation: pl-card 0.35s cubic-bezier(.3,1.4,.5,1) both; }
@keyframes pl-card { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: none; opacity: 1; } }
.pl-card .pl-h { display: flex; justify-content: space-between; align-items: center; color: ${shade(BAD, 72)}; font-size: 22px; margin-bottom: 6px; }
.pl-card .pl-l { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1.5px solid color-mix(in oklab, var(--sim-stroke) 50%, transparent); }
.pl-card .pl-t { display: flex; justify-content: space-between; padding: 9px 0 0; color: ${shade(BAD, 72)}; font-size: 22px; }
.pl-close { min-width: 44px; min-height: 40px; cursor: pointer; border-radius: calc(10px * var(--look-radius, 1)); font: 800 20px/1 var(--sim-font);
  background: var(--sim-bg-surface); color: var(--sim-label); border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
svg .pl-pop { transform-box: fill-box; transform-origin: left center; animation: pl-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes pl-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .pl-growY { transform-box: fill-box; transform-origin: bottom; animation: pl-growY 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes pl-growY { 0% { transform: scaleY(0); } 100% { transform: none; } }
svg .pl-growX { transform-box: fill-box; transform-origin: left; animation: pl-growX 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes pl-growX { 0% { transform: scaleX(0); } 100% { transform: none; } }
svg .pl-fade { animation: pl-fade 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes pl-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .pl-gone { animation: pl-gone 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes pl-gone { 0% { opacity: 1; } 100% { opacity: 0; } }
svg .pl-lift { animation: pl-lift 0.7s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes pl-lift { 0% { transform: none; opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)); opacity: 0; } }
svg .pl-arrive { animation: pl-arrive 0.7s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes pl-arrive { 0% { transform: translate(var(--fx), var(--fy)); opacity: 0; } 30% { opacity: 1; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .pl-pop, svg .pl-growY, svg .pl-growX, svg .pl-fade, svg .pl-gone, svg .pl-lift, svg .pl-arrive, .pl-card { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;
const tint = (col, pct) => `color-mix(in oklab, ${col} ${pct}%, var(--sim-bg-surface))`;
/** Shades of one colour for the parts of a bar (light to strong). */
const partCol = (col, i) => `color-mix(in oklab, ${col} ${[34, 50, 26, 42][i % 4]}%, var(--sim-bg-surface))`;

export class ProfitLossSheetScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'The profit and loss account of ABC Bakery for March 2026, a made-up bakery. Income: bread and buns 1,20,000 rupees, pastries and cookies 75,000, cake orders 85,000, delivery 15,000; total 2,95,000. Expenses: flour and sugar 1,00,000, rent 40,000, salaries 30,000 and smaller costs 52,000 (packaging 12,000, electricity and gas 15,000, advertising 8,000, other costs 7,000, interest on a loan 10,000); total 2,22,000. Profit before tax 73,000; tax 13,000; profit after tax 60,000. Two bars show income and expenses; the gap between them is the profit.';

  async setup() {
    this.open = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || this.stepIndex !== 1) return;
      this.open = b.dataset.act === 'open';
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  enter() { this.open = false; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const sheet = this.paintSheet(P, v), bars = this.paintBars(P, v);
    let over = sheet.over;
    if (v === 1 && this.open) over += this.paintCard(P);
    return { svg: `<g transform="scale(${k})">${sheet.svg}${bars}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  // The sheet: title, then three bands; band v is open, earlier ones shut to their total, later ones dimmed.
  paintSheet(P, v) {
    const S = P ? { x: 8, y: 8, w: 374, h: 400 } : { x: 8, y: 8, w: 322, h: 420 };
    const bx = S.x + 10, bw = S.w - 20, rowH = 33, shut = 46;
    let svg = rect(S.x + 6, S.y + 8, S.w, S.h, 10, 'color-mix(in oklab, var(--sim-label) 16%, transparent)') + rect(S.x, S.y, S.w, S.h, 10, PAPER, 'stroke:var(--sim-stroke);stroke-width:2.5');
    svg += text(S.x + S.w / 2, S.y + 32, 'Profit and loss account', 23) + text(S.x + S.w / 2, S.y + 60, 'ABC Bakery, March 2026', 19, 'var(--sim-label-muted)', 'middle', 700);
    let over = '';
    const bands = [
      { head: 'income', col: GOOD, rows: INCOME, total: TOT_IN, tLab: 'total income' },
      { head: 'expenses', col: BAD, rows: EXPENSES, total: TOT_OUT, tLab: 'total expenses' },
      { head: 'profit', col: ACC, total: null },
    ];
    let y = S.y + 76;
    bands.forEach((b, i) => {
      if (i !== v) {
        const past = i < v;
        svg += `<g style="${past ? '' : 'opacity:0.35'}">${rect(bx, y, bw, shut - 6, 8, tint(b.col, 12), `stroke:${shade(b.col, 62)};stroke-width:2`)}`
          + text(bx + 14, y + 27, b.head, 21, shade(b.col, 75), 'start')
          + (past ? text(bx + bw - 14, y + 28, rs(b.total), 22, 'var(--sim-label)', 'end') : '') + '</g>';
        y += shut;
        return;
      }
      const isPro = i === 2, rows = isPro ? 3 : b.rows.length, h = 36 + rows * rowH + (isPro ? 12 : 40) + 8;
      svg += rect(bx, y, bw, h, 8, tint(b.col, 16), `stroke:${shade(b.col, 62)};stroke-width:3`);
      svg += text(bx + 14, y + 27, b.head, 22, shade(b.col, 75), 'start');
      let ry = y + 36;
      if (!isPro) {
        b.rows.forEach(([lab, val], j) => {
          const d = (0.2 + j * 0.25).toFixed(2);
          if (i === 1 && lab === 'smaller costs') {
            over += `<button type="button" class="sv-hit tap btn pl-ab pl-row" data-act="open" aria-label="open the smaller costs" style="left:${f1(bx + 6)}px;top:${f1(ry + 1)}px;width:${f1(bw - 12)}px;height:${rowH - 2}px">`
              + `<span><span class="pl-plus">+</span>${lab}</span><b>${rs(val)}</b></button>`;
          } else {
            svg += `<g class="pl-pop" style="--d:${d}s">${text(bx + 16, ry + 23, lab, 20, 'var(--sim-label)', 'start', 700)}${text(bx + bw - 14, ry + 23, rs(val), 20, 'var(--sim-label)', 'end')}</g>`;
          }
          svg += `<path d="M${f1(bx + 12)} ${f1(ry + rowH)}H${f1(bx + bw - 12)}" ${stroke('color-mix(in oklab, var(--sim-stroke) 45%, transparent)', 1.5)}/>`;
          ry += rowH;
        });
        const d = (0.3 + b.rows.length * 0.25).toFixed(2);
        svg += `<g class="pl-pop" style="--d:${d}s">${rect(bx + 6, ry + 6, bw - 12, 36, 8, tint(b.col, 30), `stroke:${shade(b.col, 62)};stroke-width:2`)}`
          + text(bx + 16, ry + 31, b.tLab, 21, shade(b.col, 75), 'start') + text(bx + bw - 14, ry + 32, rs(b.total), 24, 'var(--sim-label)', 'end') + '</g>';
      } else {
        svg += `<g class="pl-pop" style="--d:0.2s">${text(bx + 16, ry + 23, 'profit before tax', 20, 'var(--sim-label)', 'start', 700)}${text(bx + bw - 14, ry + 24, rs(PBT), 22, 'var(--sim-label)', 'end')}</g>`;
        ry += rowH;
        svg += `<g class="pl-pop" style="--d:0.9s">${text(bx + 16, ry + 23, '- tax', 20, 'var(--sim-label)', 'start', 700)}${text(bx + bw - 14, ry + 24, '- ' + rs(TAX), 22, 'var(--sim-label)', 'end')}</g>`;
        svg += `<path d="M${f1(bx + 12)} ${f1(ry + rowH + 2)}H${f1(bx + bw - 12)}" ${stroke('var(--sim-label)', 2)}/>`;
        ry += rowH + 6;
        svg += `<g class="pl-pop" style="--d:1.6s">${rect(bx + 6, ry, bw - 12, 44, 10, tint(ACC, 30), `stroke:${ACC};stroke-width:3.5`)}`
          + text(bx + 16, ry + 30, 'profit after tax', 22, shade(ACC, 72), 'start') + text(bx + bw - 14, ry + 32, rs(PAT), 28, 'var(--sim-label)', 'end') + '</g>';
      }
      y += h + 6;
    });
    // foot of the sheet: the formula (b2) or the made-up note (b0)
    const fy = S.y + S.h - (P ? 46 : 50);
    if (v === 2) {
      svg += `<g class="pl-fade" style="--d:2.1s">${text(S.x + S.w / 2, fy, 'Profit = Total Revenue', 21)}${text(S.x + S.w / 2, fy + 28, '- Total Expenses', 21)}</g>`;
    } else if (v === 0) {
      svg += P ? text(195, 588, 'ABC Bakery: a made-up name', 19, 'var(--sim-label-muted)', 'middle', 700)
        : text(S.x + S.w / 2, S.y + S.h - 16, 'ABC Bakery: a made-up name', 18, 'var(--sim-label-muted)', 'middle', 700);
    }
    return { svg, over };
  }

  // Two bars on one scale. Landscape: upright, right of the sheet. Portrait: lying down, under the sheet.
  paintBars(P, v) {
    let s = '';
    const show = [true, v >= 1];
    const parts = [INCOME.map((r) => r[1]), EXPENSES.map((r) => r[1])];
    const cols = [GOOD, BAD], labs = ['income', 'expenses'], tots = [TOT_IN, TOT_OUT];
    if (!P) {
      const base = 410, top = 140, sc = (base - top) / TOT_IN, bw = 90, xs = [352, 458];
      const Y = (r) => base - r * sc;
      s += `<path d="M344 ${base}H552" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-linecap:round')}/>`;
      [0, 1].forEach((i) => {
        const x = xs[i], lit = v === i, faded = v === 2 ? false : !lit;
        s += text(x + bw / 2, base + 30, labs[i], 21, shade(cols[i], 75));
        if (!show[i]) { s += rect(x, Y(tots[i]), bw, base - Y(tots[i]), 6, 'none', `stroke:${shade(cols[i], 62)};stroke-width:2;stroke-dasharray:6 6;opacity:0.4`); return; }
        let acc = 0, g = '';
        parts[i].forEach((p, j) => {
          const y0 = Y(acc + p), h = p * sc;
          g += lit ? `<g class="pl-growY" style="--d:${(0.2 + j * 0.25).toFixed(2)}s">${rect(x, y0, bw, h, 0, partCol(cols[i], j), `stroke:${shade(cols[i], 62)};stroke-width:1.5`)}</g>`
            : rect(x, y0, bw, h, 0, partCol(cols[i], j), `stroke:${shade(cols[i], 62)};stroke-width:1.5`);
          acc += p;
        });
        g += rect(x, Y(tots[i]), bw, base - Y(tots[i]), 4, 'none', `stroke:${shade(cols[i], 62)};stroke-width:2.5`);
        g += (lit ? `<g class="pl-fade" style="--d:${(0.3 + parts[i].length * 0.25).toFixed(2)}s">` : '<g>') + (v === 2 && i === 1 ? '' : text(x + bw / 2, Y(tots[i]) - 10, rs(tots[i]), 21)) + '</g>';
        s += `<g style="${faded ? 'opacity:0.45' : ''}">${g}</g>`;
      });
      if (v === 2) {
        const x = xs[1], yT = Y(TOT_IN), yE = Y(TOT_OUT), yP = Y(TOT_OUT + PAT);
        // the level of income carried across, the gap lit
        s += `<path d="M${xs[0] + bw} ${f1(yT)}H${x + bw}" ${stroke(shade(GOOD, 62), 2.5, 'stroke-dasharray:5 5')}/>`;
        s += `<g class="pl-growY" style="--d:0.2s">${rect(x, yP, bw, yE - yP, 0, tint(ACC, 40), `stroke:${ACC};stroke-width:3`)}</g>`;
        // the tax slice: lit, then lifts off to the government
        s += `<g class="pl-growY" style="--d:0.2s">${rect(x, yT, bw, yP - yT, 0, tint('var(--sim-label-muted)', 40), `stroke:${ACC};stroke-width:3`)}</g>`;
        s += `<g class="pl-lift" style="--d:1.0s;--tx:20px;--ty:${f1(60 - yT)}px">${rect(x, yT, bw, yP - yT, 0, tint('var(--sim-label-muted)', 40), `stroke:${shade(ACC, 62)};stroke-width:2`)}</g>`;
        s += `<g class="pl-fade" style="--d:1.2s">${rect(x, yT, bw, yP - yT, 0, 'none', `stroke:${ACC};stroke-width:2;stroke-dasharray:4 4`)}</g>`;
        // labels: 73,000 first, then 60,000 after the tax goes
        s += `<g class="pl-gone" style="--d:1.0s">${text(x + bw / 2, (yP + yE) / 2 + 2, rs(PBT), 20)}</g>`;
        s += `<g class="pl-fade" style="--d:1.5s">${text(x + bw / 2, (yP + yE) / 2 + 8, rs(PAT), 21)}</g>`;
        // the government, top right, with the tax tag
        s += `<g class="pl-fade" style="--d:0.6s">${icon('building', 5, 444, 52, 52)}${text(444, 100, 'government', 18, 'var(--sim-label-muted)', 'middle', 700)}</g>`;
        s += `<g class="pl-arrive" style="--d:1.2s;--fx:${f1(x + 20 - 476)}px;--fy:${f1(yT - 40)}px">${rect(476, 26, 78, 52, 10, 'var(--sim-bg-surface)', `stroke:${shade(ACC, 62)};stroke-width:2.5`)}${text(515, 47, 'tax', 18, 'var(--sim-label-muted)', 'middle', 700)}${text(515, 70, rs(TAX), 18)}</g>`;
      }
    } else {
      const x0 = 18, x1 = 372, sc = (x1 - x0) / TOT_IN, bh = 46, ys = [430, 494];
      const X = (r) => x0 + r * sc;
      s += `<path d="M${x0} 424V${ys[1] + bh + 6}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-linecap:round')}/>`;
      [0, 1].forEach((i) => {
        const y = ys[i], lit = v === i, faded = v === 2 ? false : !lit;
        if (!show[i]) {
          s += rect(x0, y, X(tots[i]) - x0, bh, 6, 'none', `stroke:${shade(cols[i], 62)};stroke-width:2;stroke-dasharray:6 6;opacity:0.4`);
          s += text(x0 + 12, y + 30, labs[i], 20, shade(cols[i], 75), 'start');
          return;
        }
        let acc = 0, g = '';
        parts[i].forEach((p, j) => {
          const w = p * sc, r = rect(X(acc), y, w, bh, 0, partCol(cols[i], j), `stroke:${shade(cols[i], 62)};stroke-width:1.5`);
          g += lit ? `<g class="pl-growX" style="--d:${(0.2 + j * 0.25).toFixed(2)}s">${r}</g>` : r;
          acc += p;
        });
        g += rect(x0, y, X(tots[i]) - x0, bh, 4, 'none', `stroke:${shade(cols[i], 62)};stroke-width:2.5`);
        g += text(x0 + 12, y + 30, labs[i], 20, shade(cols[i], 75), 'start');
        g += (lit ? `<g class="pl-fade" style="--d:${(0.3 + parts[i].length * 0.25).toFixed(2)}s">` : '<g>') + rect(X(tots[i]) - 118, y + 8, 110, bh - 16, 8, 'var(--sim-bg-surface)', `stroke:${shade(cols[i], 62)};stroke-width:1.5`) + text(X(tots[i]) - 63, y + 31, rs(tots[i]), 21) + '</g>';
        s += `<g style="${faded ? 'opacity:0.45' : ''}">${g}</g>`;
      });
      if (v === 2) {
        const y = ys[1], xE = X(TOT_OUT), xP = X(TOT_OUT + PAT), xT = X(TOT_IN);
        s += `<path d="M${f1(xT)} ${ys[0] + bh}V${y}" ${stroke(shade(GOOD, 62), 2.5, 'stroke-dasharray:5 5')}/>`;
        s += `<g class="pl-growX" style="--d:0.2s">${rect(xE, y, xP - xE, bh, 0, tint(ACC, 40), `stroke:${ACC};stroke-width:3`)}</g>`;
        s += `<g class="pl-lift" style="--d:1.0s;--tx:0px;--ty:50px">${rect(xP, y, xT - xP, bh, 0, tint('var(--sim-label-muted)', 40), `stroke:${shade(ACC, 62)};stroke-width:2`)}</g>`;
        s += `<g class="pl-fade" style="--d:1.2s">${rect(xP, y, xT - xP, bh, 0, 'none', `stroke:${ACC};stroke-width:2;stroke-dasharray:4 4`)}</g>`;
        // labels under the bar: the gap, then what is left after tax
        s += `<path d="M${f1(xE)} ${y + bh + 8}v8H${f1(xP)}v-8" ${stroke(ACC, 3, 'stroke-linejoin:round')}/>`;
        s += `<g class="pl-gone" style="--d:1.0s">${text(372, y + bh + 40, 'profit ' + rs(PBT), 21, shade(ACC, 72), 'end')}</g>`;
        s += `<g class="pl-fade" style="--d:1.5s">${text(372, y + bh + 40, 'after tax ' + rs(PAT), 21, shade(ACC, 72), 'end')}${text(18, y + bh + 40, 'tax ' + rs(TAX) + ' goes', 19, 'var(--sim-label-muted)', 'start', 700)}</g>`;
      }
    }
    return s;
  }

  // The smaller costs, opened by the button in the expenses band (b1 only).
  paintCard(P) {
    const [x, y, w] = P ? [14, 250, 362] : [118, 132, 432];
    const rows = SMALL.map(([l, v]) => `<div class="pl-l"><span>${l}</span><span>${rs(v)}</span></div>`).join('');
    return `<div class="pl-card" style="left:${x}px;top:${y}px;width:${w}px">`
      + `<div class="pl-h"><span>smaller costs</span><button type="button" class="sv-hit tap btn pl-close" data-act="close" aria-label="close">x</button></div>`
      + rows + `<div class="pl-t"><span>total</span><span>${rs(52000)}</span></div></div>`;
  }

  testState() { return { view: this.stepIndex, open: !!this.open }; }
}
