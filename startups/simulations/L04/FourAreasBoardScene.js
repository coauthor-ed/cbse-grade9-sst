/**
 * FourAreasBoardScene - L04 s02 "Four areas of a business" (3 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 600 portrait. Cast: StallKit (bakery, breadLoaf), SimIcons. Same four boxes, colours and card grouping
 * as L03 PlanUpdateScene b1 (management and operations series 1, finance and accounting 3, human resources 5,
 * marketing and sales 6).
 *   b0 Four functional areas: the four boxes; the eight plan cards from L03 fly in from the middle (0.12 s
 *      apart) into their areas (the grouping is the L03 scene's reading of Fig 6.6 into Fig 6.9).
 *   b1 What each area looks after: the cards go; each box shows its work as icon + word (management and
 *      operations: production, quality, supplies; finance and accounting: budgets, reports; human resources:
 *      hiring, benefits, settling quarrels; marketing and sales: advertising, offers). ABC Bakery sits in a
 *      round badge where the four boxes meet (landscape).
 *   b2 Four jobs, four areas: the four job notes from the setup (bake fresh bread, pay the shop rent, hire a
 *      helper, tell people: mango cake) fly from the bakery into their boxes; the recipe card (a star) lands in
 *      management and operations only, ringed in the accent.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { STALL_CSS, bakery, breadLoaf } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;
const PAPER = 'color-mix(in oklab, var(--sim-series-2) 12%, var(--sim-bg-surface))';

function star(x, y, r, col) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`;
  }
  return `<path d="${d}Z" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2;stroke-linejoin:round`)}/>`;
}

const AREAS = [
  { t: ['management', 'and operations'], s: 1, c: ['needs and idea', 'location', 'challenges and risks'],
    work: [['production', 'bread'], ['quality', 'check'], ['supplies', 'crate']],
    job: { lines: ['bake fresh', 'bread'], art: 'bread' } },
  { t: ['finance', 'and accounting'], s: 3, c: ['money and costs', 'pricing and profits'],
    work: [['budgets', 'coin'], ['reports', 'book']],
    job: { lines: ['pay the', 'shop rent'], art: 'shop' } },
  { t: ['human', 'resources'], s: 5, c: ['human resources'],
    work: [['hiring', 'person'], ['benefits', 'money-bag'], ['settling quarrels', 'scales']],
    job: { lines: ['hire a', 'helper'], art: 'person' } },
  { t: ['marketing', 'and sales'], s: 6, c: ['potential customers', 'promotion'],
    work: [['advertising', 'megaphone'], ['offers', 'ticket']],
    job: { lines: ['tell people:', 'mango cake'], art: 'megaphone' } },
];

const art = (name, tone, x, y, s) => (name === 'bread' ? breadLoaf(x, y + s * 0.22, s * 1.25) : icon(name, tone, x, y, s));

export class FourAreasBoardScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Four functional areas of a business, as four boxes: management and operations, finance and accounting, human resources, and marketing and sales. First the eight parts of the bakery plan drop into them. Then each box shows its work: production, quality and supplies; budgets and reports; hiring, benefits and settling quarrels; advertising and offers. Last, the bakery\'s four jobs land in their boxes: baking bread in operations, paying the rent in finance, hiring a helper in human resources, telling people about the mango cake in marketing and sales. The recipe card lands only in management and operations.';

  css() { return MONEY_CSS + STALL_CSS; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const svg = P ? this.paintPortrait(v) : this.paintLandscape(v);
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: '' };
  }

  box(a, x, y, w, h, title2) {
    const col = `var(--sim-series-${a.s})`, rim = shade(col, 62);
    let s = lipRect(x, y, w, h, 14, `color-mix(in oklab, ${col} 14%, var(--sim-bg-surface))`, rim);
    s += title2 ? text(x + w / 2, y + 28, a.t[0], 21) + text(x + w / 2, y + 57, a.t[1], 21) : text(x + 14, y + 30, a.t.join(' '), 21, 'var(--sim-label)', 'start');
    return s;
  }

  /** The eight plan cards as chips, flowed into rows inside a box (as in L03 PlanUpdateScene). */
  chips(a, x, y, w, top, k0, c0, center) {
    const fs = 18, chipH = 36, gap = 8, pad = 12, rim = shade(`var(--sim-series-${a.s})`, 62);
    const cw = (t) => Math.round(t.length * fs * 0.56 + 26);
    const rows = [[]];
    let rx = 0;
    for (const c of a.c) {
      const wd = cw(c);
      if (rx + wd > w - 2 * pad && rows[rows.length - 1].length) { rows.push([]); rx = 0; }
      rows[rows.length - 1].push([c, rx, wd]);
      rx += wd + gap;
    }
    let s = '', kk = k0;
    rows.forEach((row, r) => {
      const rowW = row.reduce((t, [, , wd]) => t + wd + gap, -gap), ox = center ? x + (w - rowW) / 2 : x + pad;
      row.forEach(([c, rx2, wd]) => {
        const chx = ox + rx2, chy = y + top + r * (chipH + gap);
        const dx = f1(c0[0] - (chx + wd / 2)), dy = f1(c0[1] - (chy + chipH / 2));
        s += `<g class="mk-fly" style="--d:${(0.4 + kk * 0.12).toFixed(2)}s;--dx:${dx}px;--dy:${dy}px">${lipRect(chx, chy, wd, chipH, 10, 'var(--sim-bg-surface)', rim)}${text(chx + wd / 2, chy + chipH / 2 + 6, c, fs)}</g>`;
        kk++;
      });
    });
    return { s, n: kk - k0, rows: rows.length };
  }

  /** A job note (paper, a pin, icon on the left, two lines); (x, y) top left. */
  note(a, x, y, w, h, fs, c0, d) {
    const j = a.job;
    let s = rect(x + 3, y + 5, w, h, 6, 'color-mix(in oklab, var(--sim-label) 18%, transparent)') + rect(x, y, w, h, 6, PAPER, 'stroke:var(--sim-stroke);stroke-width:2');
    s += art(j.art, a.s, x + 36, y + h / 2, 42);
    j.lines.forEach((l, i) => { s += text(x + 68, y + h / 2 + fs * 0.36 + (i - 0.5) * (fs + 5), l, fs, 'var(--sim-label)', 'start'); });
    s += `<circle cx="${f1(x + 16)}" cy="${f1(y + 12)}" r="6" ${fill('var(--sim-series-6)', `stroke:${shade('var(--sim-series-6)', 60)};stroke-width:2`)}/>`;
    const dx = f1(c0[0] - (x + w / 2)), dy = f1(c0[1] - (y + h / 2));
    return `<g class="mk-fly" style="--d:${d.toFixed(2)}s;--dx:${dx}px;--dy:${dy}px">${s}</g>`;
  }

  /** The recipe chip with a star, ringed in the accent; (x, y) top left. */
  recipe(x, y, w, h, d) {
    const acc = 'var(--sim-accent)';
    let s = rect(x, y + 4, w, h, 10, acc) + rect(x, y, w, h, 10, `color-mix(in oklab, ${acc} 10%, ${PAPER})`, `stroke:${acc};stroke-width:3`);
    s += star(x + 24, y + h / 2, 14, 'var(--sim-series-2)') + text(x + 46, y + h / 2 + 7, 'recipe', 20, 'var(--sim-label)', 'start');
    return `<g class="mk-pop" style="--d:${d.toFixed(2)}s">${s}</g>`;
  }

  paintLandscape(v) {
    const B = [[12, 12, 262, 224], [286, 12, 262, 224], [12, 248, 262, 220], [286, 248, 262, 220]];
    const c0 = [280, 240];
    let svg = '', kk = 0;
    AREAS.forEach((a, i) => {
      const [x, y, w, h] = B[i];
      svg += `<g class="mk-pop" style="--d:${(i * 0.08).toFixed(2)}s">${this.box(a, x, y, w, h, true)}</g>`;
      if (v === 0) {
        const r = this.chips(a, x, y, w, 72, kk, c0, true);
        svg += r.s;
        kk += r.n;
      } else if (v === 1) {
        const right = i % 2 === 1;
        a.work.forEach(([word, ic], j) => {
          const ry = y + 96 + j * 44, ix = x + (right ? 78 : 32);
          svg += `<g class="mk-pop" style="--d:${(0.3 + (i * 3 + j) * 0.1).toFixed(2)}s">${art(ic, a.s, ix, ry, 40)}${text(ix + 30, ry + 8, word, 22, 'var(--sim-label)', 'start')}</g>`;
        });
      } else {
        svg += this.note(a, x + 16, y + 74, w - 32, 90, 21, c0, 0.3 + i * 0.2);
        if (i === 0) svg += this.recipe(x + 16, y + 176, 140, 38, 1.3);
      }
    });
    if (v > 0) {
      // ABC Bakery in a round badge where the four areas meet
      const [cx, cy] = c0, r = 62;
      svg += `<g class="mk-pop" style="--d:0.1s"><circle cx="${cx}" cy="${cy + 4}" r="${r}" ${fill('var(--sim-stroke)')}/><circle cx="${cx}" cy="${cy}" r="${r}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`
        + bakery(cx, cy + 40, 100, { signSize: 16, sign: 'ABC Bakery' }) + '</g>';
    }
    return svg;
  }

  paintPortrait(v) {
    let svg = '', yc = 8, kk = 0;
    const x = 12, w = 366, c0 = [195, 300];
    const H = v === 0 ? [0, 0, 0, 0] : v === 1 ? [134, 134, 140, 134] : [130, 130, 130, 130];
    AREAS.forEach((a, i) => {
      let h = H[i];
      let inner = '';
      if (v === 0) {
        const r = this.chips(a, x, yc, w, 42, kk, c0, false);
        h = 42 + r.rows * 44 + 8;
        inner = r.s;
        kk += r.n;
      } else if (v === 1) {
        const n = a.work.length, cw = (w - 16) / 3;
        a.work.forEach(([word, ic], j) => {
          const cx = n === 2 ? x + w * (j === 0 ? 0.3 : 0.7) : x + 8 + cw * (j + 0.5), cy = yc + 64;
          const words = word === 'settling quarrels' ? ['settling', 'quarrels'] : [word];
          inner += `<g class="mk-pop" style="--d:${(0.3 + (i * 3 + j) * 0.1).toFixed(2)}s">${art(ic, a.s, cx, cy, 38)}`;
          words.forEach((wd, q) => { inner += text(cx, cy + 46 + q * 22, wd, 20); });
          inner += '</g>';
        });
      } else {
        const nw = i === 0 ? 220 : 300;
        inner = this.note(a, x + 12, yc + 44, nw, 74, 21, c0, 0.3 + i * 0.2);
        if (i === 0) inner += this.recipe(x + 244, yc + 62, 112, 40, 1.3);
      }
      svg += `<g class="mk-pop" style="--d:${(i * 0.08).toFixed(2)}s">${this.box(a, x, yc, w, h, false)}</g>` + inner;
      yc += h + 12;
    });
    return svg;
  }

  testState() { return { view: this.stepIndex }; }
}
