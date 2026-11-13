/**
 * TwoMethodsScene - L03 s04 "Rs 30,000 at 8% for Five Years" (3 beats). SvgScene + SimPlotSvg axes, design 560 x 500
 * landscape, 390 x 640 portrait. A bank deposit of Rs 30,000 at 8% a year for 5 years (made-up family).
 * One chart look for the lesson: paid in (Rs 30,000) = muted, added (interest) = the save colour (series 3).
 * Each year has two bars side by side: the quick method (pale, dashed edge) and the real amount (solid). The
 * interest part of a bar is stacked one block per year, so equal blocks mean "the same every year".
 *   b0 The quick method: flat bars only, Rs 30,000 + n blocks of Rs 2,400 (32,400 ... 42,000). Card: "8% of
 *      Rs 30,000 = Rs 2,400", "+Rs 2,400 every year", after 5 years Rs 42,000.
 *   b1 8% of the new amount: the real bars rise beside (blocks 2,400, 2,592, 2,799.36, 3,023.31, 3,265.17: each
 *      bigger than the last). Year 2's real bar has an accent outline round Rs 32,400 ("8% of Rs 32,400 =
 *      Rs 2,592"). Card: A = P(1 + r)^n = 30,000 x 1.08^5 = Rs 44,079.84.
 *   b2 The difference: at year 5 a bracket from 42,000 to 44,079.84, "Rs 2,079.84 interest on interest"; the card
 *      compares the interest: real Rs 14,079.84, quick Rs 12,000.
 * Numbers checked with node. Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { plotFrame, axesOnSvg } from 'simulations/base/kit/SimPlotSvg.js';
import { MONEY_CSS, RS, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const P0 = 30000, R = 0.08, N = 5;
const r2 = (v) => Math.round(v * 100) / 100;
const FLAT = [0, 1, 2, 3, 4, 5].map((n) => P0 + n * P0 * R);                 // 30,000 ... 42,000
const REAL = [0, 1, 2, 3, 4, 5].map((n) => r2(P0 * (1 + R) ** n));          // 30,000 ... 44,079.84
const BLK_REAL = [1, 2, 3, 4, 5].map((n) => REAL[n] - REAL[n - 1]);           // 2,400  2,592  2,799.36 ...
const DIFF = r2(REAL[N] - FLAT[N]);                                            // 2,079.84
const ADD = 'var(--sim-series-3)', PAID = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', MUTED = 'var(--sim-label-muted)';
const ink = (c) => shade(c, 58);
const soft = (col, p) => `color-mix(in oklab, ${col} ${p}%, var(--sim-bg-surface))`;
const PAID_FILL = soft(PAID, 42);

/** Rupees with paise when there are any. */
const rsp = (v) => { const r = Math.round(v * 100); if (r % 100 === 0) return rs(r / 100); return RS + group(Math.floor(r / 100)) + '.' + String(r % 100).padStart(2, '0'); };

const CSS = `
.tm-ab { position: absolute; transform: translate(-50%, -50%); }
.tm-btn { min-height: 46px; padding: 4px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.tm-btn:active { transform: translateY(3px); box-shadow: none; }
.tm-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, col, line, extra = '') =>
  `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(Math.max(1, h))}" ${fill(col, `stroke:${line};stroke-width:2${extra}`)}/>`;

export class TwoMethodsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A bank deposit of 30,000 rupees at 8% a year for five years. The quick method adds 8% of 30,000, which is 2,400, every year: 42,000 after five years. The real amount works out 8% on the new amount each year: 32,400, 34,992, 37,791.36, 40,814.67 and 44,079.84. The formula A = P(1 + r)^n with P = 30,000, r = 0.08 and n = 5 gives the same. The real interest is 14,079.84 rupees against 12,000: the quick method missed 2,079.84 rupees of interest earned on interest.';

  async setup() {
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => { if (e.target?.closest?.('[data-act="replay"]')) this.replay(); };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); }

  enter() { this.clear(); this.fresh = true; this.after(1.8, () => { this.fresh = false; }); }

  replay() { this.clear(); this.fresh = true; this.repaint(); this.after(1.8, () => { this.fresh = false; }); }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 500) * st.W / (st.portrait ? 390 : 560)); }

  geo(st) {
    const P = st.portrait, DW = P ? 390 : 560, k = st.W / DW;
    const top = P ? 236 : 152, bot = P ? 634 : 496;
    const r = { x: 30 * k, y: top * k, w: (DW - 30) * k, h: (bot - top) * k };
    const f = plotFrame(r, {
      x: { cats: ['0', '1', '2', '3', '4', '5'], label: 'years' },
      y: { min: 0, max: 45000, ticks: [0, 15000, 30000, 45000], fmt: group },
      rightPad: 12 * k,
    });
    f.y.fmt = group;
    const d = { y: (v) => f.py(v) / k, band: (i) => { const b = f.band(i); return { x: b.x / k, w: b.w / k }; } };
    const pl = { x: f.plot.x / k, y: f.plot.y / k, w: f.plot.w / k, h: f.plot.h / k };
    return { P, DW, k, f, d, pl, top };
  }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 500, k = st.W / DW;
    const out = this.paintAll(this.geo(st));
    return { svg: `<g transform="scale(${k.toFixed(4)})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k.toFixed(4)});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** One bar for year n: Rs 30,000 below, then one interest block per year. quick: pale blocks, dashed edge. */
  bar(g, n, x, w, quick, o = {}) {
    const { d } = g;
    let s = '', y = d.y(P0);
    s += `<rect x="${f1(x + 4)}" y="${f1(d.y(quick ? FLAT[n] : REAL[n]) + 4)}" width="${f1(w)}" height="${f1(d.y(0) - d.y(quick ? FLAT[n] : REAL[n]))}" ${fill('var(--sim-stroke)', quick ? 'opacity:0.5' : '')}/>`;
    s += rect(x, y, w, d.y(0) - y, PAID_FILL, shade(PAID, 70));
    for (let j = 0; j < n; j++) {
      const amt = quick ? P0 * R : BLK_REAL[j], h = d.y(0) - d.y(amt);
      y -= h;
      s += quick
        ? rect(x, y, w, h, soft(ADD, 30), shade(ADD, 60), ';stroke-dasharray:5 3')
        : rect(x, y, w, h, soft(ADD, 70 + j * 4), shade(ADD, 55), ';stroke-width:2.5');
    }
    return o.cls ? `<g class="${o.cls}" style="--d:${o.d}s">${s}</g>` : s;
  }

  card(g) {
    const P = g.P, v = this.stepIndex;
    const box = P ? { x: 12, y: 8, w: 366, h: 196 } : { x: 14, y: 8, w: 532, h: 104 };
    let s = `<rect x="${box.x}" y="${box.y + 4}" width="${box.w}" height="${box.h}" rx="16" ${fill('var(--sim-stroke)')}/>`
      + `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    const L = box.x + 18;
    // right column (landscape) or bottom rows (portrait): the key number
    const kx = P ? L : box.x + box.w - 18, ka = P ? 'start' : 'end';
    const ky = P ? box.y + 128 : box.y + 66;
    const sup = (t) => `<tspan dy="-10" style="font-size:16px">${t}</tspan><tspan dy="10"> </tspan>`;
    if (v === 0) {
      s += text(L, box.y + 32, 'quick method', 21, MUTED, 'start', 800);
      s += text(L, box.y + (P ? 66 : 63), `8% of ${rs(P0)} = ${rs(2400)}`, P ? 22 : 23, 'var(--sim-label)', 'start');
      s += text(L, box.y + (P ? 100 : 96), `+${rs(2400)} every year`, P ? 22 : 23, ink(ADD), 'start');
      s += text(kx, ky - (P ? -10 : 30), 'after 5 years', 20, MUTED, ka, 700);
      s += text(kx, ky + (P ? 44 : 14), rs(FLAT[N]), P ? 34 : 38, 'var(--sim-label)', ka);
      if (P) s = s.replace('after 5 years', 'after 5 years:');
    } else if (v === 1) {
      s += text(L, box.y + 32, '8% of the new amount', 21, MUTED, 'start', 800);
      s += text(L, box.y + (P ? 66 : 63), `${P ? 'year 2: ' : ''}8% of ${rs(REAL[1])} = ${rs(BLK_REAL[1])}`, P ? 21 : 22, 'var(--sim-label)', 'start');
      s += `<text x="${L}" y="${box.y + (P ? 102 : 96)}" style="fill:var(--sim-label);font:800 ${P ? 21 : 20}px var(--sim-font)">A = P(1 + r)${sup('n')}= 30,000 x 1.08${sup('5')}</text>`;
      s += text(kx, ky - (P ? -10 : 30), 'after 5 years', 20, MUTED, ka, 700);
      s += text(kx, ky + (P ? 44 : 14), rsp(REAL[N]), 34, ink(ADD), ka);
    } else {
      s += text(L, box.y + 32, 'interest in 5 years', 21, MUTED, 'start', 800);
      s += text(L, box.y + (P ? 68 : 64), `real ${rsp(REAL[N] - P0)}`, P ? 24 : 26, ink(ADD), 'start');
      s += text(L, box.y + (P ? 104 : 96), `quick ${rs(FLAT[N] - P0)}`, P ? 22 : 23, 'var(--sim-label)', 'start', 700);
      s += text(kx, ky - (P ? -10 : 30), 'missed', 20, MUTED, ka, 700);
      s += text(kx, ky + (P ? 44 : 12), rsp(DIFF), 34, 'var(--sim-label)', ka);
      if (!P) s += text(kx, ky + 38, 'interest on interest', 19, MUTED, ka, 700);
    }
    return s;
  }

  paintAll(g) {
    const { P, d } = g, v = this.stepIndex, an = this.fresh;
    let svg = '', over = '';
    svg += this.card(g);
    svg += text(4, g.top - 2, 'rupees', 19, 'var(--sim-label)', 'start', 800);
    // legend, top right above the plot
    const lx = P ? 150 : 250, ly = g.top - 2;
    svg += rect(lx, ly - 16, 20, 18, soft(ADD, 30), shade(ADD, 60), ';stroke-dasharray:5 3') + text(lx + 28, ly, 'quick', 19, 'var(--sim-label)', 'start', 700);
    if (v > 0) svg += rect(lx + (P ? 100 : 110), ly - 16, 20, 18, soft(ADD, 74), shade(ADD, 55)) + text(lx + (P ? 128 : 138), ly, 'real', 19, 'var(--sim-label)', 'start', 700);
    for (let n = 0; n <= N; n++) {
      const b = d.band(n), w = b.w * (P ? 0.36 : 0.34), gap = b.w * 0.04;
      const xq = b.x + b.w / 2 - w - gap, xr = b.x + b.w / 2 + gap;
      svg += this.bar(g, n, xq, w, true, an && v === 0 ? { cls: 'mk-rise', d: (0.1 + n * 0.15).toFixed(2) } : {});
      if (v > 0) svg += this.bar(g, n, xr, w, false, an && v === 1 ? { cls: 'mk-rise', d: (0.2 + n * 0.18).toFixed(2) } : {});
    }
    const b5 = d.band(N), w5 = b5.w * (P ? 0.36 : 0.34), g5 = b5.w * 0.04;
    const xq5 = b5.x + b5.w / 2 - w5 - g5, xr5 = b5.x + b5.w / 2 + g5;
    if (v === 0) {
      // two equal blocks named on the year-2 bar
      const b2 = d.band(2), w2 = b2.w * (P ? 0.36 : 0.34), x2 = b2.x + b2.w / 2 - w2 - b2.w * 0.04;
      svg += `<g${an ? ' class="mk-pop" style="--d:1.1s"' : ''}>${text(d.band(0).x + 6, d.y(38500), `each block ${rs(2400)}`, P ? 18 : 20, ink(ADD), 'start', 800)}</g>`;
    }
    if (v === 1) {
      // what 8% is worked out on in year 2: the Rs 32,400 at the bottom of the real year-2 bar
      const b2 = d.band(2), w2 = b2.w * (P ? 0.36 : 0.34), x2 = b2.x + b2.w / 2 + b2.w * 0.04;
      svg += `<rect x="${f1(x2 - 4)}" y="${f1(d.y(REAL[1]) - 4)}" width="${f1(w2 + 8)}" height="${f1(d.y(0) - d.y(REAL[1]) + 8)}" rx="5" ${fill('none', `stroke:${ACC};stroke-width:3.5;stroke-dasharray:9 5`)}/>`;
    }
    if (v === 2) {
      const bx = xr5 + w5 + 10, yT = d.y(REAL[N]), yF = d.y(FLAT[N]);
      svg += `<path d="M${f1(xq5)} ${f1(yF)}H${f1(bx)}" ${stroke('var(--sim-label)', 2.5, 'stroke-dasharray:6 5')}/>`;
      svg += `<path d="M${f1(bx - 8)} ${f1(yT)}H${f1(bx)}V${f1(yF)}H${f1(bx - 8)}" ${stroke('var(--sim-label)', 4)}/>`;
      // the real bar's interest part, outlined (5 blocks) against the quick bar's 5 equal blocks
      svg += `<rect x="${f1(xr5 - 4)}" y="${f1(yT - 4)}" width="${f1(w5 + 8)}" height="${f1(d.y(P0) - yT + 8)}" rx="5" ${fill('none', `stroke:${ACC};stroke-width:3.5`)}/>`;
    }
    over += `<div class="tm-ab" style="left:${P ? 316 : 500}px;top:${P ? 170 : g.top - 16}px"><button type="button" class="sv-hit tm-btn" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  animate(st) {
    const g = this.geo(st);
    axesOnSvg(this.live, 'ax', g.f, 99, { size: Math.round(19 * g.k), fmtY: group, grid: true });
  }

  testState() {
    return { view: this.stepIndex, flat: FLAT, real: REAL, diff: DIFF, interestReal: r2(REAL[N] - P0), interestFlat: FLAT[N] - P0 };
  }
}
