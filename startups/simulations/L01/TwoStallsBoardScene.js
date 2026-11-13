/**
 * TwoStallsBoardScene - L01 s03 "Stall A: a long queue" (3 beats, the observe slide after the predict). SvgScene,
 * design 560 x 480 landscape, 390 x 600 portrait. Cast: shared/StallKit.js (stall, glass), shared/MoneyKit.js
 * (tag, rs). All numbers are made up (STORYBOARD section 0): each glass costs Rs 6 to make.
 *   b0 Stall A: a small stall 'Stall A', a price tag Rs 5 'a glass', '200 glasses'. Two bars on one scale
 *      (Rs 0 - 1,200): money collected Rs 1,000, costs Rs 1,200. The 200 that costs reach past the money is
 *      hatched in the bad colour, with a bracket and 'loss Rs 200'. Bars grow 0.6 s each, then the loss pops.
 *   b1 Stall B: Stall A small and dimmed on the left ('loss Rs 200'), Stall B lit: tag Rs 15, '80 glasses'.
 *      The same scale: money collected Rs 1,200, costs Rs 480; the gap from 480 to 1,200 on the costs row is
 *      the profit, outlined in the good colour, 'profit Rs 720' inside it.
 *   b2 One glass at Stall A: one glass big; 'sells for Rs 5', 'costs Rs 6', '-Rs 1 a glass'. Three buttons
 *      in the figure: 50 / 100 / 200 glasses (200 at rest and on cold start); the loss bar on a 0-200 scale
 *      grows from the last count to the new one (0.6 s); 'loss Rs 50 / 100 / 200'.
 * 'made-up numbers' once per beat, bottom corner. No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, tag, rs } from '../shared/MoneyKit.js';
import { STALL_CSS, stall, glass } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const COUNTS = [50, 100, 200];
const IN_COL = 'var(--sim-series-1)';
const COST_COL = 'var(--sim-series-8)';

const CSS = `
.ts-ab { position: absolute; transform: translate(-50%, -50%); }
.ts-btn { min-height: 46px; padding: 5px 12px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ts-btn.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.ts-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.ts-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .ts-from { transform-box: fill-box; transform-origin: left center; animation: ts-from 0.6s ease-out both; }
@keyframes ts-from { 0% { transform: scaleX(var(--from, 0)); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .ts-from { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

/** A flat bar with a lip, (x, y) top left. */
function barRect(x, y, w, h, col) {
  const edge = shade(col, 64);
  return `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(Math.max(0, w))}" height="${h}" rx="10" ${fill(edge)}/>`
    + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0, w))}" height="${h}" rx="10" ${fill(`color-mix(in oklab, ${col} 45%, var(--sim-bg-surface))`, `stroke:${edge};stroke-width:3`)}/>`;
}

const HATCH = '<defs><pattern id="ts-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" style="fill:color-mix(in oklab, var(--sim-bad) 22%, var(--sim-bg-surface))"/><path d="M0 0V12" style="stroke:var(--sim-bad);stroke-width:4"/></pattern></defs>';

export class TwoStallsBoardScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Made-up numbers; each glass costs 6 rupees to make. Stall A sells 200 glasses at 5 rupees: money collected 1,000 rupees, costs 1,200 rupees, a loss of 200 rupees. Stall B sells 80 glasses at 15 rupees: money collected 1,200 rupees, costs 480 rupees, a profit of 720 rupees. At Stall A one glass sells for 5 rupees and costs 6, so each glass loses 1 rupee: 50 glasses lose 50 rupees, 100 lose 100, 200 lose 200.';

  async setup() {
    this.n = 200;
    this.prev = 200;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-n]');
      if (!b || this.stepIndex !== 2) return;
      const n = +b.dataset.n;
      if (n === this.n) return;
      this.prev = this.n;
      this.n = n;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + STALL_CSS + CSS; }

  enter() { this.n = 200; this.prev = 200; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintGlass(P) : this.paintStall(P, v === 1);
    out.svg += text(P ? 195 : 548, P ? DH - 12 : 22, 'made-up numbers', 15, 'var(--sim-label-muted)', P ? 'middle' : 'end', 700);
    return { svg: `<g transform="scale(${k})">${HATCH}${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0 / b1: the stall, its price and glasses, and the two bars on one Rs 0 - 1,200 scale.
  paintStall(P, isB) {
    const G = P
      ? { st: [82, 166, 112], dimSt: [44, 160, 64], bSt: [146, 100], tag: [262, 60, 150], gl: [210, 136], x0: 24, x1: 366, b1: 278, b2: 400, bh: 62, lab: 22, val: 28, cap: [195, 482] }
      : { st: [86, 160, 112], dimSt: [56, 156, 80], bSt: [172, 112], tag: [300, 60, 150], gl: [244, 136], x0: 36, x1: 524, b1: 230, b2: 334, bh: 60, lab: 24, val: 30, cap: [280, 450] };
    const MAX = 1200, X = (r) => G.x0 + (G.x1 - G.x0) * r / MAX;
    const s = isB ? { name: 'Stall B', price: 15, n: 80, inn: 1200, cost: 480 } : { name: 'Stall A', price: 5, n: 200, inn: 1000, cost: 1200 };
    let svg = '';
    // the header: the stall, its price tag, its glasses
    if (isB) {
      const [dx, dg, dw] = G.dimSt;
      svg += stall(dx, dg, dw, { sign: 'Stall A', signSize: 18, dim: true });
      svg += text(dx, dg + 26, `loss ${rs(200)}`, 20, 'var(--sim-label-muted)', 'middle', 700);
    }
    const [sx, sg] = G.st, hx = isB ? G.bSt[0] : sx, sw = isB ? G.bSt[1] : G.st[2];
    svg += stall(hx, sg, sw, { sign: s.name, signSize: 20 });
    const tx = isB ? G.tag[0] + (P ? 20 : 30) : G.tag[0];
    svg += tag(tx, G.tag[1], 'a glass', s.price, { w: G.tag[2], valueSize: 32, labelSize: 19 });
    svg += glass(tx - 50, G.gl[1] + 18, 40) + text(tx - 22, G.gl[1] + 8, `${s.n} glasses`, 26, 'var(--sim-label)', 'start');
    // bar 1: money collected; bar 2: costs
    // the label on the left above the bar, the amount above the bar's end
    const row = (y, lab, amt, col, d) => `<text x="${G.x0}" y="${y - 12}" style="fill:var(--sim-label-muted);font:700 ${G.lab}px var(--sim-font)">${lab}`
      + `<tspan dx="10" style="fill:var(--sim-label);font:800 ${G.val}px var(--sim-font)">${rs(amt)}</tspan></text>`
      + `<g class="mk-grow" style="--d:${d}s">${barRect(G.x0, y, X(amt) - G.x0, G.bh, col)}</g>`;
    svg += row(G.b1, 'money collected', s.inn, IN_COL, 0.1);
    svg += row(G.b2, 'costs', s.cost, COST_COL, 0.6);
    if (!isB) {
      // costs reach 200 past the money: hatch that part, a guide down from the money bar's end, a bracket
      const a = X(1000), b = X(1200), by = G.b2 + G.bh + 14;
      svg += `<g class="mk-pop" style="--d:1.2s"><rect x="${f1(a)}" y="${G.b2}" width="${f1(b - a)}" height="${G.bh}" rx="10" style="fill:url(#ts-hatch);stroke:var(--sim-bad);stroke-width:3"/>`
        + `<path d="M${f1(a)} ${G.b1 - 6}V${G.b2 + G.bh + 6}" ${stroke('var(--sim-label)', 2.5, 'stroke-dasharray:7 6')}/>`
        + `<path d="M${f1(a)} ${by}v10H${f1(b)}v-10" ${stroke('var(--sim-bad)', 3.5)}/>`
        + text(b + (P ? 10 : 6), by + 46, `loss ${rs(200)}`, P ? 30 : 32, 'var(--sim-bad)', 'end') + '</g>';
    } else {
      // the gap from 480 to 1,200 on the costs row is the profit
      const a = X(480), b = X(1200);
      svg += `<g class="mk-pop" style="--d:1.2s"><rect x="${f1(a + 4)}" y="${G.b2}" width="${f1(b - a - 4)}" height="${G.bh}" rx="10" ${fill('color-mix(in oklab, var(--sim-good) 20%, var(--sim-bg-surface))', 'stroke:var(--sim-good);stroke-width:3;stroke-dasharray:9 6')}/>`
        + `<path d="M${f1(a)} ${G.b1 - 6}V${G.b2 + G.bh + 6}" ${stroke('var(--sim-label)', 2.5, 'stroke-dasharray:7 6')}/>`
        + text((a + b) / 2 + 2, G.b2 + G.bh / 2 + 11, `profit ${rs(720)}`, P ? 28 : 32, shade('var(--sim-good)', 78)) + '</g>';
    }
    return { svg };
  }

  // b2: one glass, then the loss bar for 50 / 100 / 200 glasses.
  paintGlass(P) {
    const G = P
      ? { gl: [78, 236, 168], t1: [270, 70], t2: [270, 168], tw: 168, res: [195, 278], cap: [195, 374], btn: [[80, 414], [195, 414], [310, 414]], bw: 100, short: true, x0: 24, x1: 366, by: 456, bh: 62 }
      : { gl: [90, 222, 168], t1: [266, 66], t2: [266, 160], tw: 168, res: [450, 122], btn: [[110, 278], [280, 278], [450, 278]], bw: 150, x0: 36, x1: 524, by: 340, bh: 62 };
    let svg = glass(G.gl[0], G.gl[1], G.gl[2]);
    svg += tag(G.t1[0], G.t1[1], 'sells for', 5, { w: G.tw, valueSize: 32, labelSize: 20 });
    svg += tag(G.t2[0], G.t2[1], 'costs', 6, { w: G.tw, valueSize: 32, labelSize: 20, ring: true });
    svg += text(G.res[0], G.res[1], `-${rs(1)}`, 40, 'var(--sim-bad)') + text(G.res[0], G.res[1] + 40, 'a glass', 24, 'var(--sim-bad)', 'middle', 700);
    // the loss bar on a 0-200 scale, with ticks at every 50 glasses
    const X = (n) => G.x0 + (G.x1 - G.x0) * n / 200, n = this.n, end = X(n);
    svg += `<path d="M${G.x0} ${G.by + G.bh + 10}H${G.x1}" ${stroke('var(--sim-stroke)', 2.5)}/>`;
    for (const t of [0, 50, 100, 150, 200]) {
      svg += `<path d="M${f1(X(t))} ${G.by + G.bh + 4}v12" ${stroke('var(--sim-stroke)', 2.5)}/>`;
      svg += text(X(t), G.by + G.bh + 38, String(t), 18, 'var(--sim-label-muted)', 'middle', 700);
    }
    const from = this.prev && this.prev !== n ? Math.min(1, this.prev / n).toFixed(3) : '0';
    svg += `<g class="ts-from" style="--from:${from}">${barRect(G.x0, G.by, end - G.x0, G.bh, 'var(--sim-bad)')}</g>`;
    const inside = n >= 100;
    svg += text(inside ? end - 12 : end + 12, G.by + G.bh / 2 + 11, `loss ${rs(n)}`, 30, 'var(--sim-label)', inside ? 'end' : 'start');
    let over = '';
    if (G.short) svg += text(G.cap[0], G.cap[1], 'glasses sold', 22, 'var(--sim-label-muted)', 'middle', 700);
    COUNTS.forEach((c, i) => {
      const [bx, by] = G.btn[i];
      over += `<button type="button" class="sv-hit tap btn ts-ab ts-btn${c === n ? ' on' : ''}" data-n="${c}" aria-pressed="${c === n}" style="left:${bx}px;top:${by}px;width:${G.bw}px"${G.short ? ` aria-label="${c} glasses"` : ''}>${G.short ? c : `${c} glasses`}</button>`;
    });
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, n: this.n, loss: this.stepIndex === 2 ? this.n : null }; }
}
