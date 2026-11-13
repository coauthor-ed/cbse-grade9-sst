/**
 * InvestmentOvenScene - L05 s05 "Investment", "Paying for it with a loan" (2 beats). SvgScene, design 560 x 480
 * landscape, 390 x 600 portrait. Cast: FinPeople (you), MoneyKit (coin, gullak, rs), StallKit (cakeJar), SimCivic
 * (bank). Drawn here (no kit prop): the oven (as in L03 StartupCostsScene), arrows, the small profit and loss sheet
 * (the paper, title and bands of L04 FinanceAccountsScene b2 / L05 ProfitLossSheetScene).
 *   b0 Investment: 'now': you pay (coins fly from you to the oven, 'pay now' in the money-out colour) for a second
 *      oven (a plus badge). A big arrow to 'the months ahead': April, May, June, each with a row of cake jars and a
 *      coin coming back ('more cakes to sell'). No amounts (the text gives none).
 *   b1 Paying for it with a loan: two sources send coins to the oven: your savings (a gullak) and a bank loan (a
 *      bank, 'pay back + interest'). From the bank an 'interest on a loan Rs 10,000' row flies into the expenses
 *      band of the March sheet ('Profit and loss account, ABC Bakery, March 2026'); income and profit dimmed. Foot:
 *      'cash flow': an 'in' arrow into a shop icon and an 'out' arrow leaving it.
 * No host controls. Colours are tokens only. ASCII only (the rupee sign comes from MoneyKit's rs()).
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin, gullak, rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS, cakeJar } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const GOOD = 'var(--sim-good)', BAD = 'var(--sim-bad)', ACC = 'var(--sim-accent)';
const PAPER = 'color-mix(in oklab, var(--sim-series-2) 10%, var(--sim-bg-surface))';
const INTEREST = 10000;

const CSS = `
svg .io-fly { animation: io-fly 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes io-fly { 0% { transform: translate(var(--fx), var(--fy)); opacity: 0; } 20% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .io-pop { transform-box: fill-box; transform-origin: center bottom; animation: io-pop 0.5s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes io-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .io-slide { animation: io-slide 0.7s cubic-bezier(.3,1.2,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes io-slide { 0% { transform: translateX(-60px); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .io-fly, svg .io-pop, svg .io-slide { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const tint = (col, pct) => `color-mix(in oklab, ${col} ${pct}%, var(--sim-bg-surface))`;
const arrow = (x0, y0, x1, y1, col, w = 6, dash = '') => {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 16, ex = x1 - Math.cos(a) * L, ey = y1 - Math.sin(a) * L;
  const p = (s) => `${f1(ex + Math.cos(a + s * Math.PI / 2) * 11)} ${f1(ey + Math.sin(a + s * Math.PI / 2) * 11)}`;
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(ex)} ${f1(ey)}" ${stroke(col, w, `stroke-linecap:round${dash ? `;stroke-dasharray:${dash}` : ''}`)}/><path d="M${p(1)}L${f1(x1)} ${f1(y1)}L${p(-1)}Z" ${fill(col)}/>`;
};

/** The oven of L03 StartupCostsScene; (x, y) bottom centre. */
function oven(x, y, w) {
  const h = w * 0.86, x0 = x - w / 2, top = y - h, body = 'color-mix(in oklab, var(--sim-series-7) 30%, var(--sim-bg-surface))', rim = shade(body, 60);
  const glow = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-surface))';
  let s = rect(x0, top + 4, w, h, 8, rim) + rect(x0, top, w, h, 8, body, `stroke:${rim};stroke-width:2.5`) + `<path d="M${f1(x0)} ${f1(top + h * 0.22)}H${f1(x0 + w)}" ${stroke(rim, 2.5)}/>`;
  for (const k of [0.2, 0.36]) s += `<circle cx="${f1(x0 + w * k)}" cy="${f1(top + h * 0.11)}" r="${f1(w * 0.05)}" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:2`)}/>`;
  s += rect(x0 + w * 0.12, top + h * 0.32, w * 0.76, h * 0.56, 6, glow, `stroke:${rim};stroke-width:2.5`);
  s += `<path d="M${f1(x0 + w * 0.22)} ${f1(top + h * 0.3)}H${f1(x0 + w * 0.78)}" ${stroke(rim, 5, 'stroke-linecap:round')}/>`;
  s += `<path d="M${f1(x - w * 0.22)} ${f1(top + h * 0.78)}h${f1(w * 0.44)}" ${stroke(shade(glow, 70), 3)}/>`;
  return s;
}

/** The second oven: the oven with a plus badge. */
function newOven(x, y, w) {
  const h = w * 0.86;
  return oven(x, y, w) + `<circle cx="${f1(x + w * 0.5)}" cy="${f1(y - h)}" r="18" ${fill(GOOD, `stroke:${shade(GOOD, 62)};stroke-width:2.5`)}/>`
    + text(x + w * 0.5, y - h + 9, '+', 28, 'var(--sim-bg-surface)');
}

export class InvestmentOvenScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Investment: ABC Bakery buys a second oven. You pay for it now, and in the months ahead, April, May and June, it bakes more cakes to sell. The money can come from your own savings or from a bank loan. A loan is paid back with interest; interest on a loan, 10,000 rupees, is an expense in the March profit and loss account. Cash flow is the money coming in and going out.';

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintLoan(P) : this.paintInvest(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  heading(t, sub) {
    return text(20, 40, t, 30, shade(ACC, 72), 'start') + text(20, 72, sub, 21, 'var(--sim-label-muted)', 'start', 700);
  }

  // b0: pay now for the second oven; more cakes to sell in the months ahead.
  paintInvest(P) {
    const G = P
      ? { now: [195, 114], you: [70, 330, 150], oven: [230, 316, 124], pay: [230, 352], arr: [195, 396, 195, 426], months: [[70, 452], [195, 452], [320, 452]], jar: 40, more: [195, 584], ahead: null }
      : { now: [120, 116], you: [52, 404, 160], oven: [176, 360, 132], pay: [176, 404], arr: [254, 290, 306, 290], months: [[330, 160], [330, 260], [330, 360]], jar: 50, more: [430, 456], ahead: [430, 116] };
    let svg = this.heading('investment', 'pay now, earn later');
    svg += text(G.now[0], G.now[1], 'now', 24);
    const [ox, oy, ow] = G.oven;
    svg += `<g class="io-slide" style="--d:0.2s">${newOven(ox, oy, ow)}</g>`;
    svg += text(ox, oy + 26, 'second oven', 21);
    svg += text(G.pay[0], G.pay[1] + 30, 'pay now', 24, shade(BAD, 72));
    // coins: from you to the oven
    const [yx, yy, yh] = G.you;
    [0, 1, 2].forEach((i) => {
      const cx = ox - ow / 2 + 14 + i * 22, cy = oy - ow * 0.86 - 22;
      svg += `<g class="io-fly" style="--d:${(0.8 + i * 0.15).toFixed(2)}s;--fx:${f1(yx + 20 - cx)}px;--fy:${f1(yy - yh * 0.55 - cy)}px">${coin(cx, cy, 13)}</g>`;
    });
    // to the months ahead
    const [a0, a1, a2, a3] = G.arr;
    svg += `<g class="io-pop" style="--d:1.2s">${arrow(a0, a1, a2, a3, ACC, 8)}</g>`;
    if (G.ahead) svg += text(G.ahead[0], G.ahead[1], 'the months ahead', 22);
    ['April', 'May', 'June'].forEach((m, i) => {
      const [mx, my] = G.months[i], d = (1.4 + i * 0.3).toFixed(2), jw = G.jar;
      let row = '';
      if (P) {
        row += text(mx, my, m, 22, 'var(--sim-label)', 'middle');
        for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) row += cakeJar(mx - 22 + c * 44, my + 52 + r * 48, jw);
        row += coin(mx + 50, my + 30, 13);
      } else {
        row += rect(mx - 14, my - 34, 234, 84, 12, tint(GOOD, 10), `stroke:${shade(GOOD, 50)};stroke-width:2`);
        row += text(mx, my + 12, m, 22, 'var(--sim-label)', 'start');
        for (let c = 0; c < 4; c++) row += cakeJar(mx + 76 + c * 34, my + 38, jw);
        row += coin(mx + 206, my - 14, 13);
      }
      svg += `<g class="io-pop" style="--d:${d}s">${row}</g>`;
    });
    svg += text(G.more[0], G.more[1], 'more cakes to sell', 23, shade(GOOD, 72));
    const over = personSlot('you', { x: yx, y: yy, h: yh, facing: 1, mood: 'smile' });
    return { svg, over };
  }

  // b1: savings or a loan; the loan's interest is an expense in the March sheet; cash flow.
  paintLoan(P) {
    const G = P
      ? { sav: [80, 170, 84], bank: [80, 300, 116], oven: [282, 236, 112], sheet: [30, 362, 330, 204], flow: 590 }
      : { sav: [70, 196, 84], bank: [70, 372, 118], oven: [222, 300, 104], sheet: [332, 92, 220, 312], flow: 452 };
    let svg = this.heading('paying for it', 'savings or a loan');
    const [gx, gy, gw] = G.sav, [bx, by, bw] = G.bank, [ox, oy, ow] = G.oven;
    // arrows from the two sources to the oven
    const target = [ox - ow / 2 - 8, oy - ow * 0.45];
    svg += arrow(gx + gw * 0.6, gy - gw * 0.5, target[0], target[1] - 14, GOOD, 5, '2 10');
    svg += arrow(bx + bw * 0.55, by - bw * 0.5, target[0], target[1] + 14, GOOD, 5, '2 10');
    svg += gullak(gx, gy, { w: gw }) + text(gx, gy + 26, 'your savings', 21);
    svg += civicSvg('bank', bx, by, { w: bw }) + text(bx, by + 26, 'bank loan', 21);
    svg += P ? text(14, by + 46, 'pay back + interest', 19, shade(BAD, 72), 'start', 700) : text(bx, by + 54, 'pay back + interest', 19, shade(BAD, 72), 'middle', 700);
    svg += newOven(ox, oy, ow) + text(ox, oy + 26, 'second oven', 21);
    [0, 1].forEach((i) => {
      const [sx, sy] = i ? [bx + bw * 0.4, by - bw * 0.6] : [gx + gw * 0.4, gy - gw * 0.6];
      const cx = target[0] - 6, cy = target[1] + (i ? 14 : -14);
      svg += `<g class="io-fly" style="--d:${(0.3 + i * 0.3).toFixed(2)}s;--fx:${f1(sx - cx)}px;--fy:${f1(sy - cy)}px">${coin(cx, cy, 13)}</g>`;
    });
    // the March sheet
    const [sx, sy, sw, sh] = G.sheet;
    svg += rect(sx + 5, sy + 6, sw, sh, 10, 'color-mix(in oklab, var(--sim-label) 16%, transparent)') + rect(sx, sy, sw, sh, 10, PAPER, 'stroke:var(--sim-stroke);stroke-width:2.5');
    let y;
    if (P) {
      svg += text(sx + sw / 2, sy + 26, 'Profit and loss account', 20) + text(sx + sw / 2, sy + 48, 'ABC Bakery, March 2026', 18, 'var(--sim-label-muted)', 'middle', 700);
      y = sy + 58;
    } else {
      svg += text(sx + sw / 2, sy + 28, 'Profit and loss', 21) + text(sx + sw / 2, sy + 55, 'account', 21);
      svg += text(sx + sw / 2, sy + 80, 'ABC Bakery,', 18, 'var(--sim-label-muted)', 'middle', 700) + text(sx + sw / 2, sy + 103, 'March 2026', 18, 'var(--sim-label-muted)', 'middle', 700);
      y = sy + 114;
    }
    const bx0 = sx + 10, bwid = sw - 20, shut = P ? 26 : 38;
    svg += `<g style="opacity:0.35">${rect(bx0, y, bwid, shut, 8, tint(GOOD, 12), `stroke:${shade(GOOD, 62)};stroke-width:2`)}${text(bx0 + 12, y + shut / 2 + 7, 'income', 19, shade(GOOD, 75), 'start')}</g>`;
    y += shut + 6;
    const eh = P ? 74 : 106;
    svg += rect(bx0, y, bwid, eh, 8, tint(BAD, 16), `stroke:${shade(BAD, 62)};stroke-width:3`) + text(bx0 + 12, y + 24, 'expenses', 20, shade(BAD, 75), 'start');
    // the interest row flies in from the bank
    const rowY = P ? y + 30 : y + 36, rowX = bx0 + 6, rowW = bwid - 12, rowH = P ? 38 : 64;
    const row = rect(rowX, rowY, rowW, rowH, 8, 'var(--sim-bg-surface)', `stroke:${shade(BAD, 62)};stroke-width:2.5`)
      + (P ? text(rowX + 10, rowY + 26, 'interest on a loan', 19, 'var(--sim-label)', 'start', 700) + text(rowX + rowW - 10, rowY + 27, rs(INTEREST), 21, 'var(--sim-label)', 'end')
        : text(rowX + 10, rowY + 24, 'interest on a loan', 19, 'var(--sim-label)', 'start', 700) + text(rowX + rowW - 10, rowY + 56, rs(INTEREST), 24, 'var(--sim-label)', 'end'));
    svg += `<g class="io-fly" style="--d:1.0s;--fx:${f1(bx - rowX - rowW / 2)}px;--fy:${f1(by - bw * 0.4 - rowY)}px">${row}</g>`;
    y += eh + 6;
    svg += `<g style="opacity:0.35">${rect(bx0, y, bwid, shut, 8, tint(ACC, 12), `stroke:${shade(ACC, 62)};stroke-width:2`)}${text(bx0 + 12, y + shut / 2 + 7, 'profit', 19, shade(ACC, 75), 'start')}</g>`;
    // cash flow: money in, money out
    const fy = G.flow, cx = P ? 195 : 280;
    const sx0 = cx + (P ? 30 : 40);
    svg += `<g class="io-pop" style="--d:1.6s">${text(sx0 - (P ? 118 : 150), fy + 7, 'cash flow', 22, 'var(--sim-label)', 'end')}`
      + arrow(sx0 - (P ? 104 : 136), fy, sx0 - 24, fy, GOOD, 6) + text(sx0 - (P ? 66 : 82), fy - 12, 'in', 20, shade(GOOD, 75))
      + `<g transform="translate(${f1(sx0 - 20)} ${f1(fy - 20)}) scale(0.833)">${iconSvg('shop', 6)}</g>`
      + arrow(sx0 + 24, fy, sx0 + (P ? 104 : 136), fy, BAD, 6) + text(sx0 + (P ? 66 : 82), fy - 12, 'out', 20, shade(BAD, 75)) + '</g>';
    return { svg };
  }

  testState() { return { view: this.stepIndex }; }
}
