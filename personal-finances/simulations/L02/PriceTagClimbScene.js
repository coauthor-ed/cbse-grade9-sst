/**
 * PriceTagClimbScene - L02 s03 "Safe Coins, Smaller Value" (3 beats). SvgScene + SimPlotSvg chart, design
 * 560 x 500 landscape, 390 x 540 portrait. Cast: shared/MoneyKit.js (tags, gullak).
 *   b0 Rs 60 short: one year on a flat graph (x months 0-12, y rupees 950-1,120). A flat line: the money in the
 *      gullak, Rs 1,000. A climbing line: the price of the school bag, Rs 1,000 -> Rs 1,060 (draws by x over
 *      1.5 s on "replay"). At month 12 a bracket "Rs 60 short"; the bag and its tag Rs 1,060 beside the line end,
 *      the gullak tag under the flat line. Cold start: the drawn rest state.
 *   b1 Inflation and purchasing power: the same chart, small and dimmed; two cards: "inflation" (a Rs 1,000 tag
 *      now, a bigger Rs 1,060 tag a year later) and "purchasing power" (Rs 1,000 covers 1,000 / 1,060 of the
 *      bag's price: a bar 94% filled, "most of a bag").
 *   b2 A higher rate, a bigger gap: the b0 chart with three rate buttons in the figure (0%, 6%, 10%; aria-pressed);
 *      the price line redraws to Rs 1,000 / 1,060 / 1,100 and the bracket reads Rs 0 / 60 / 100. Rest: 6%.
 * Chart geometry is in stage px (the live layer); the static parts are in design units (scale k).
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { plotFrame, axesOnSvg, plotLineSvg, toScreen } from 'simulations/base/kit/SimPlotSvg.js';
import { MONEY_CSS, TONE, tag, gullak, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const SAVED = 1000;
const RATES = [0, 6, 10];
const priceAt = (r) => Math.round(SAVED * (1 + r / 100));
const LINE_S = 1.5;
const BAD = 'var(--sim-bad)';

const CSS = `
.pc-ab { position: absolute; transform: translate(-50%, -50%); }
.pc-row { position: absolute; display: flex; gap: 10px; transform: translate(-50%, -50%); }
.pc-btn { min-height: 46px; min-width: 70px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.pc-btn[aria-pressed="true"] { background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.pc-btn:active { transform: translateY(3px); box-shadow: none; }
.pc-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

/** A plain school bag, (x, y) = bottom centre, w wide (about 1.15 w tall). No logo, no face. */
function schoolBag(x, y, w, o = {}) {
  const col = 'var(--sim-series-4)', rim = shade(col, 62), h = w * 0.95, x0 = x - w / 2, y0 = y - h;
  return `<g${o.dim ? ' style="opacity:0.35"' : ''}>`
    + `<path d="M${f1(x - w * 0.22)} ${f1(y0 + 4)}V${f1(y0 - w * 0.16)}Q${f1(x)} ${f1(y0 - w * 0.34)} ${f1(x + w * 0.22)} ${f1(y0 - w * 0.16)}V${f1(y0 + 4)}" ${stroke(rim, Math.max(4, w * 0.07))}/>`
    + `<rect x="${f1(x0)}" y="${f1(y0 + 4)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w * 0.18)}" ${fill(rim)}/>`
    + `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w * 0.18)}" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x0 + w * 0.16)}" y="${f1(y0 + h * 0.5)}" width="${f1(w * 0.68)}" height="${f1(h * 0.38)}" rx="${f1(w * 0.1)}" ${fill(shade(col, 84), `stroke:${rim};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x0 + w * 0.16)} ${f1(y0 + h * 0.62)}H${f1(x0 + w * 0.84)}" ${stroke(rim, 2.5)}/>`
    + `<rect x="${f1(x - w * 0.07)}" y="${f1(y0 + h * 0.56)}" width="${f1(w * 0.14)}" height="${f1(h * 0.12)}" rx="3" ${fill('var(--sim-series-2)', `stroke:${rim};stroke-width:2`)}/>`
    + '</g>';
}

export class PriceTagClimbScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 540;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A graph of one year. The money in the gullak stays flat at 1,000 rupees. The price of a school bag climbs 6% to 1,060 rupees, so at the end of the year the gullak is 60 rupees short. Inflation is a rise in prices over time; purchasing power is what a sum of money can buy: 1,000 rupees now buys most of the bag, not all of it. At 0% the price stays 1,000 (no gap), at 6% it is 1,060 (60 short), at 10% it is 1,100 (100 short).';

  async setup() {
    this.rate = 6;
    this.drawing = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'replay') this.draw();
      else if (b.dataset.act === 'rate') { this.rate = +b.dataset.val; this.draw(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.drawing = false; }

  enter() { this.clear(); this.rate = 6; }

  /** Redraw the price line (b0 replay, b2 a rate). */
  draw() {
    if (this.stepIndex === 1) return;
    this.clear();
    this.clockReset?.();
    this.drawing = true;
    this.play(LINE_S + 0.2);
    this.after(LINE_S + 0.3, () => { this.drawing = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.drawing) return false;
    this.clear();
    super.skip?.();
    this.repaint();
    return true;
  }

  busy() { return this.drawing; }

  stageHeight(st) { return Math.round((st.portrait ? 540 : 500) * st.W / (st.portrait ? 390 : 560)); }

  /** Design-unit layout plus the chart frame in stage px. */
  geo(st) {
    const P = st.portrait, DW = P ? 390 : 560, k = st.W / DW, rp = P ? 128 : 150;
    const rect = { x: 0, y: 4 * k, w: DW * k, h: 420 * k };
    const f = plotFrame(rect, {
      x: { min: 0, max: 12, ticks: [0, 3, 6, 9, 12], label: 'months' },
      y: { min: 950, max: 1120, ticks: [950, 1000, 1050, 1100], fmt: group },
      rightPad: rp * k,
    });
    f.y.fmt = group;
    const d = { x: (v) => f.px(v) / k, y: (v) => f.py(v) / k };
    return { P, DW, k, f, d, left: f.plot.x / k, right: (f.plot.x + f.plot.w) / k };
  }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 540 : 500, k = st.W / DW, v = this.stepIndex;
    const out = v === 1 ? this.paintCards(P) : this.paintChart(this.geo(st), v);
    return { svg: `<g transform="scale(${k.toFixed(4)})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k.toFixed(4)});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0 / b2: the static parts round the live chart.
  paintChart(g, v) {
    let svg = '', over = '';
    const { P, d } = g, price = priceAt(v === 2 ? this.rate : 6), gap = price - SAVED;
    const yS = d.y(SAVED), yP = d.y(price), R = g.right;
    svg += text(8, 14, 'rupees', 18, 'var(--sim-label)', 'start');
    // the gullak under the flat line
    svg += tag(g.left + (P ? 66 : 78), yS + 46, 'gullak', SAVED, { w: P ? 112 : 124, tone: 'save', labelSize: 19, valueSize: 25 });
    svg += gullak(g.left + (P ? 156 : 186), yS + 92, { w: P ? 50 : 60 });
    if (!this.drawing) {
      const tx = R + (P ? 62 : 76), tw = P ? 116 : 130;
      if (v === 0) svg += schoolBag(tx, yP - 36, P ? 62 : 74);
      svg += `<g class="mk-pop">${tag(tx, yP, 'bag', price, { w: tw, labelSize: 19, valueSize: 27 })}</g>`;
      // the gap bracket at month 12
      const bx = R + 6, col = gap > 0 ? BAD : 'var(--sim-label-muted)';
      if (gap > 0) svg += `<path d="M${f1(bx)} ${f1(yP + 3)}h8V${f1(yS - 3)}h-8" ${stroke(col, 3.5)}/>`;
      const my = gap > 0 ? Math.max(yP + 58, (yP + yS) / 2 + 4) : yS + 62;
      svg += `<g class="mk-pop" style="--d:0.15s">${text(bx + 16, my, rs(gap), P ? 27 : 30, col, 'start')}${text(bx + 16, my + 31, 'short', 23, col, 'start')}</g>`;
    }
    const by = P ? 474 : 462;
    if (v === 0) {
      if (!this.drawing) over += `<div class="pc-ab" style="left:${P ? 195 : 140}px;top:${by}px"><button type="button" class="sv-hit pc-btn" data-act="replay">replay</button></div>`;
      svg += text(P ? 195 : 400, P ? 520 : by + 7, 'prices rise 6% a year', 20, 'var(--sim-label-muted)', 'middle', 700);
    } else {
      svg += text(P ? 195 : 24, P ? 448 : by + 7, 'prices rise each year by', 21, 'var(--sim-label)', P ? 'middle' : 'start', 700);
      const btns = RATES.map((r) => `<button type="button" class="sv-hit pc-btn" data-act="rate" data-val="${r}" aria-pressed="${r === this.rate}">${r}%</button>`).join('');
      over += `<div class="pc-row" style="left:${P ? 195 : 400}px;top:${P ? 498 : by}px">${btns}</div>`;
    }
    return { svg, over };
  }

  // b1: the chart, small and dimmed; the two cards.
  paintCards(P) {
    let svg = '';
    // a small copy of the b0 chart, dimmed
    const m = P ? { x: 30, y: 14, w: 160, h: 96 } : { x: 24, y: 14, w: 190, h: 110 };
    const my = (r) => m.y + m.h - ((r - 950) / 170) * m.h;
    svg += `<g style="opacity:0.4"><path d="M${m.x} ${m.y}V${m.y + m.h}H${m.x + m.w}" ${stroke('var(--sim-label)', 3)}/>`
      + `<path d="M${m.x} ${f1(my(1000))}H${m.x + m.w}" ${stroke(TONE.save, 4)}/>`
      + `<path d="M${m.x} ${f1(my(1000))}L${m.x + m.w} ${f1(my(1060))}" ${stroke(BAD, 4)}/>`
      + `<path d="M${m.x + m.w + 6} ${f1(my(1060))}h6V${f1(my(1000))}h-6" ${stroke(BAD, 2.5)}/>`
      + text(m.x + m.w + 18, (my(1060) + my(1000)) / 2 + 7, rs(60), 18, BAD, 'start') + '</g>';
    const card = (x, y, w, h, title, sub) => `<rect x="${x}" y="${y + 4}" width="${w}" height="${h}" rx="18" ${fill('var(--sim-stroke)')}/>`
      + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`
      + text(x + 18, y + 38, title, 26, 'var(--sim-label)', 'start') + text(x + 18, y + 66, sub, 19, 'var(--sim-label-muted)', 'start', 700);
    const arrow = (x1, y1, x2, y2) => {
      const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - Math.cos(a) * 12, hy = y2 - Math.sin(a) * 12;
      return `<path d="M${f1(x1)} ${f1(y1)}L${f1(hx)} ${f1(hy)}" ${stroke('var(--sim-label)', 4)}/>`
        + `<path d="M${f1(x2)} ${f1(y2)}L${f1(hx - Math.sin(a) * 9)} ${f1(hy + Math.cos(a) * 9)}L${f1(hx + Math.sin(a) * 9)} ${f1(hy - Math.cos(a) * 9)}Z" ${fill('var(--sim-label)')}/>`;
    };
    const pct = SAVED / 1060;
    const powerBar = (x, y, w) => {
      const h = 46, fw = w * pct;
      return text(x, y - 12, `price ${rs(1060)}`, 19, 'var(--sim-label-muted)', 'start', 700)
        + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ${fill(`color-mix(in oklab, ${BAD} 22%, var(--sim-bg-surface))`, `stroke:${shade(BAD, 70)};stroke-width:2.5;stroke-dasharray:6 5`)}/>`
        + `<g class="mk-grow" style="--d:0.4s"><rect x="${x}" y="${y}" width="${f1(fw)}" height="${h}" rx="10" ${fill(`color-mix(in oklab, ${TONE.save} 45%, var(--sim-bg-surface))`, `stroke:${shade(TONE.save, 66)};stroke-width:2.5`)}/></g>`
        + text(x + fw / 2, y + 31, rs(SAVED), 24)
        + text(x + w, y + h + 26, `${rs(60)} short`, 19, BAD, 'end');
    };
    if (P) {
      svg += card(16, 126, 358, 190, 'inflation', 'prices rise over time');
      svg += tag(92, 262, 'now', 1000, { w: 112, labelSize: 19, valueSize: 25 });
      svg += arrow(156, 262, 196, 262);
      svg += `<g class="mk-pop" style="--d:0.3s">${tag(282, 258, 'a year later', 1060, { w: 160, labelSize: 19, valueSize: 32 })}</g>`;
      svg += card(16, 330, 358, 196, 'purchasing power', `what ${rs(1000)} can buy`);
      svg += schoolBag(328, 400, 52);
      svg += powerBar(36, 440, 318);
      svg += text(36, 512, 'most of a bag', 22, 'var(--sim-label)', 'start');
    } else {
      svg += card(16, 146, 256, 330, 'inflation', 'prices rise over time');
      svg += tag(92, 262, 'now', 1000, { w: 116, labelSize: 19, valueSize: 25 });
      svg += arrow(120, 300, 150, 352);
      svg += `<g class="mk-pop" style="--d:0.3s">${tag(176, 400, 'a year later', 1060, { w: 164, labelSize: 19, valueSize: 33 })}</g>`;
      svg += card(288, 146, 256, 330, 'purchasing power', `what ${rs(1000)} can buy`);
      svg += schoolBag(416, 318, 68);
      svg += powerBar(308, 352, 216);
      svg += text(416, 456, 'most of a bag', 22);
    }
    return { svg };
  }

  animate(st, t) {
    const v = this.stepIndex;
    if (v === 1) return;
    const g = this.geo(st), f = g.f, k = g.k, live = this.live, tt = this.drawing ? t : 99;
    const price = priceAt(v === 2 ? this.rate : 6);
    axesOnSvg(live, 'ax', f, 99, { size: Math.round(18 * k), fmtY: group });
    plotLineSvg(live, 'saved', toScreen(f, [[0, SAVED], [12, SAVED]]), 99, { col: TONE.save, width: 7 * k, head: false });
    plotLineSvg(live, 'price', toScreen(f, [[0, SAVED], [12, price]]), tt, { col: BAD, width: 5 * k, by: 'x', dur: LINE_S, head: this.drawing, headR: 8 * k });
  }

  testState() {
    const price = priceAt(this.stepIndex === 2 ? this.rate : 6);
    return { view: this.stepIndex, rate: this.stepIndex === 2 ? this.rate : 6, price, gap: price - SAVED, drawing: this.drawing };
  }
}
