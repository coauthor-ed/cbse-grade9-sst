/**
 * BakeryMarchSetupScene - L05 s01 setup for the predict "March at ABC Bakery" (1 beat). SvgScene, design 560 x 480
 * landscape, 390 x 600 portrait. Cast: StallKit (bakery), MoneyKit (tag, coin, rs), FinPeople (you), SimIcons
 * (calendar, building). Drawn here (no kit prop): the bill slips and the blank profit card.
 *   b0 ABC Bakery in March 2026. Coins fly into a big tag 'customers paid 2,95,000' (the hero). A pile of bill
 *      slips 'bills paid': flour and sugar 1,00,000, rent 40,000, salaries, electricity, and more (no amounts the
 *      text does not give). A tax slip 'tax: to the government'. A blank dashed card 'profit left = ?' with you
 *      thinking (landscape). No profit figure, no subtraction done: the predict asks for it.
 * No host controls. Colours are tokens only. ASCII only (the rupee sign comes from MoneyKit's rs()).
 */
import { SvgScene, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, tag, coin, rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS, bakery } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }]];
const BAD = 'var(--sim-bad)', ACC = 'var(--sim-accent)', TAXC = 'var(--sim-series-5)';
const BILLS = [['flour and sugar', 100000], ['rent', 40000], ['salaries', null], ['electricity', null], ['and more', null]];

const CSS = `
svg .bm-drop { animation: bm-drop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes bm-drop { 0% { transform: translate(18px, -26px) rotate(4deg); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .bm-fly { animation: bm-fly 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes bm-fly { 0% { transform: translate(var(--fx), var(--fy)); opacity: 0; } 25% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .bm-pop { transform-box: fill-box; transform-origin: center; animation: bm-pop 0.5s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes bm-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .bm-drop, svg .bm-fly, svg .bm-pop { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;
const tint = (col, pct) => `color-mix(in oklab, ${col} ${pct}%, var(--sim-bg-surface))`;

/** A paper bill slip: a coloured stripe on the left, label, and an amount on the right if the text gives one. */
function slip(x, y, w, h, label, val, col) {
  return rect(x + 3, y + 4, w, h, 7, 'color-mix(in oklab, var(--sim-label) 14%, transparent)')
    + rect(x, y, w, h, 7, 'var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')
    + rect(x, y, 10, h, 4, col)
    + text(x + 22, y + h / 2 + 7, label, 21, 'var(--sim-label)', 'start', 700)
    + (val == null ? '' : text(x + w - 12, y + h / 2 + 8, rs(val), 22, 'var(--sim-label)', 'end'));
}

export class BakeryMarchSetupScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 1: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'ABC Bakery in March 2026. Customers paid 2,95,000 rupees in all. The bakery paid bills: flour and sugar 1,00,000, rent 40,000, salaries, electricity and more. It also pays tax to the government. How much profit is left is a question mark.';

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const G = P
      ? { cal: [130, 28], bak: [95, 214, 160], tag: [286, 150, 196, 32], billHead: [20, 248], bills: [20, 260, 350, 36, 42], tax: [20, 482, 350, 42], card: [30, 538, 330, 54], you: null }
      : { cal: [300, 30], bak: [104, 194, 150], tag: [116, 290, 214, 34], billHead: [256, 82], bills: [256, 94, 296, 38, 44], tax: [256, 322, 296, 44], card: [140, 398, 300, 64], you: [66, 470, 128] };
    let svg = '';
    // March 2026
    svg += icon('calendar', 6, G.cal[0], G.cal[1], 38) + text(G.cal[0] + 26, G.cal[1] + 9, 'March 2026', 24, 'var(--sim-label)', 'start');
    // the bakery
    const [bx, by, bw] = G.bak;
    svg += bakery(bx, by, bw);
    // the hero: what customers paid; coins fly from the shop into the tag
    const [tx, ty, tw, vs] = G.tag;
    svg += `<g class="bm-pop" style="--d:0.2s">${tag(tx, ty, 'customers paid', 295000, { w: tw, valueSize: vs, ring: true })}</g>`;
    [0, 1, 2].forEach((i) => {
      const cx = tx - tw * 0.18 + i * 26, cy = ty - tw * 0.23 - 12;
      svg += `<g class="bm-fly" style="--d:${(0.5 + i * 0.15).toFixed(2)}s;--fx:${f1(bx - cx)}px;--fy:${f1(by - bw * 0.5 - cy)}px">${coin(cx, cy, 13)}</g>`;
    });
    // the bills
    svg += text(G.billHead[0], G.billHead[1], 'bills paid', 22, shade(BAD, 72), 'start');
    const [sx, sy, sw, sh, sg] = G.bills;
    BILLS.forEach(([lab, val], i) => {
      svg += `<g class="bm-drop" style="--d:${(0.6 + i * 0.15).toFixed(2)}s">${slip(sx, sy + i * sg, sw, sh, lab, val, BAD)}</g>`;
    });
    // the tax
    const [qx, qy, qw, qh] = G.tax;
    svg += `<g class="bm-drop" style="--d:1.5s">${rect(qx + 3, qy + 4, qw, qh, 7, 'color-mix(in oklab, var(--sim-label) 14%, transparent)')}`
      + rect(qx, qy, qw, qh, 7, tint(TAXC, 18), `stroke:${shade(TAXC, 62)};stroke-width:2`) + rect(qx, qy, 10, qh, 4, TAXC)
      + text(qx + 22, qy + qh / 2 + 7, 'tax', 21, shade(TAXC, 75), 'start') + text(qx + 66, qy + qh / 2 + 7, 'to the government', 20, 'var(--sim-label)', 'start', 700)
      + icon('building', 5, qx + qw - 24, qy + qh / 2, 32) + '</g>';
    // the question: what is left?
    const [cx, cy, cw, ch] = G.card;
    svg += `<g class="bm-pop" style="--d:1.9s">${rect(cx, cy + 4, cw, ch, 14, shade(ACC, 62))}${rect(cx, cy, cw, ch, 14, tint(ACC, 14), `stroke:${ACC};stroke-width:3;stroke-dasharray:9 6`)}`
      + text(cx + 22, cy + ch / 2 + 9, 'profit left =', 26, shade(ACC, 72), 'start') + text(cx + cw - 40, cy + ch / 2 + 16, '?', 46, shade(ACC, 72)) + '</g>';
    let over = '';
    if (G.you) over += personSlot('you', { x: G.you[0], y: G.you[1], h: G.you[2], facing: 1, mood: 'think' });
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() { return { view: this.stepIndex }; }
}
