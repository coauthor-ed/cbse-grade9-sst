/**
 * TwoStallsSetupScene - L01 s02 predict "Two stalls, one drink" (setup mount, 1 beat). SvgScene, design 560 x 440
 * landscape, 390 x 600 portrait. Cast: shared/StallKit.js (stall, glass, priceBoard) + shared/MoneyKit.js (RS).
 * The situation only, no answer: no money collected, no costs, no profit or loss.
 *   b0 A shared pill on top: 'each glass costs Rs 6 to make' (a glass beside it in landscape). Stall A and Stall B, the same
 *      stall as TwoStallsBoardScene, signs 'Stall A' / 'Stall B'; on each table a price board (Rs 5 / Rs 15 a
 *      glass) and glasses in the true ratio 200 : 80 = 5 : 2 (five glasses / two glasses); the count big beside
 *      each stall ('200 glasses' / '80 glasses'). 'made-up numbers' once, in a corner. Nothing to tap.
 * Landscape: the stalls side by side, counts under them. Portrait: the stalls one above the other, counts on the
 * right. No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, RS } from '../shared/MoneyKit.js';
import { STALL_CSS, stall, stallTop, glass, priceBoard } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }]];
const STALLS = [{ name: 'Stall A', price: 5, n: 200, glasses: 5 }, { name: 'Stall B', price: 15, n: 80, glasses: 2 }];

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

export class TwoStallsSetupScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 440;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 1: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Made-up numbers. Each glass of nimbu pani costs 6 rupees to make. Stall A charges 5 rupees a glass and sells 200 glasses. Stall B charges 15 rupees a glass and sells 80 glasses.';

  css() { return MONEY_CSS + STALL_CSS; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 440) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 440, k = (st.W / DW).toFixed(4);
    const G = P
      ? { pill: [195, 32, 364, false], sw: 196, at: [[116, 308], [116, 556]], board: 84, gh: 36, gs: 17, cnt: [[316, 216], [316, 464]], side: true, note: [316, 592, 'middle'] }
      : { pill: [280, 34, 400, true], sw: 220, at: [[140, 340], [420, 340]], board: 92, gh: 40, gs: 21, cnt: [[140, 386], [420, 386]], side: false, note: [548, 430, 'end'] };
    let svg = this.costPill(G.pill);
    STALLS.forEach((s, i) => {
      const [sx, gy] = G.at[i], top = stallTop(gy, G.sw);
      svg += stall(sx, gy, G.sw, { sign: s.name, signSize: P ? 20 : 22 });
      // the price board on the left of the table, the glasses on the right (5 : 2, the true 200 : 80)
      svg += `<g class="mk-pop" style="--d:${0.15 + i * 0.2}s">${priceBoard(sx - G.sw * 0.24, top, G.board, s.price)}</g>`;
      for (let g = 0; g < s.glasses; g++) svg += glass(sx + G.sw * 0.04 + G.gh * 0.36 + g * G.gs, top, G.gh);
      const [cx, cy] = G.cnt[i];
      svg += G.side
        ? text(cx, cy, String(s.n), 40) + text(cx, cy + 36, 'glasses', 24, 'var(--sim-label)', 'middle', 700)
        : text(cx, cy, `${s.n} glasses`, 30);
    });
    svg += text(G.note[0], G.note[1], 'made-up numbers', 18, 'var(--sim-label-muted)', G.note[2], 700);
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: '' };
  }

  // The shared cost: a pill 'each glass costs Rs 6 to make' with a small glass on its left.
  costPill([x, y, w, icon]) {
    const h = 50;
    return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 3)}" width="${w}" height="${h}" rx="${h / 2}" ${fill('var(--sim-stroke)')}/>`
      + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="${h / 2}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`
      + (icon ? glass(x - w / 2 + 30, y + 17, 34) : '')
      + `<text x="${f1(x + (icon ? 18 : 0))}" y="${f1(y + 9)}" text-anchor="middle" style="fill:var(--sim-label);font:700 22px var(--sim-font)">each glass costs `
      + `<tspan style="font:800 30px var(--sim-font)">${RS}6</tspan> to make</text>`;
  }

  testState() { return { view: 0, prices: STALLS.map((s) => s.price), glasses: STALLS.map((s) => s.n), cost: 6 }; }
}
