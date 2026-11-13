/**
 * ThreeBuyersScene - L01 s07 "From one buyer to the market" (2 beats). SvgScene, drawn in design units (560 wide
 * landscape, 390 wide portrait) and scaled to the stage width. Cast: shared/MangoKit.js. Table 9.1 only:
 * Srivalli 1 / 2 / 3 kg, Alex 2 / 4 / 6 kg, Israt 3 / 6 / 9 kg at Rs 150 / 100 / 50.
 *   b0 one buyer's curve: Srivalli's DD' alone (series 1) on a big graph, x 0..4 kg; her figure beside it,
 *      "one buyer". The line draws in, then her three points pop. Nobody else is drawn.
 *   b1 every buyer has a curve: three small graphs on the same axes (x 0..10 kg, ticks 3, 6, 9), side by side
 *      (portrait: stacked, sharing the x numbers at the bottom). Each buyer in turn (0.6 s): the figure, the three
 *      points, the line, in that buyer's series colour. A "+" between the graphs and "= ?" at the end: the market
 *      curve is the next lesson, so it is not drawn. "each curve slopes down". "again" replays.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { RS } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag } from '../shared/MangoPeople.js';

const WHO = ['srivalli', 'alex', 'israt'];

const f1 = (v) => (+v).toFixed(1);
const PRICES = [150, 100, 50];
const TABLE = [[1, 2, 3], [2, 4, 6], [3, 6, 9]];
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const PER_S = 0.6;
const ser = (n) => `var(--sim-series-${n + 1})`;

const CSS = `
.tb-ab { position: absolute; transform: translate(-50%, -50%); }
.tb-btn { min-height: 46px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.tb-btn:active { transform: translateY(3px); box-shadow: none; }
.tb-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .tb-pop { transform-box: fill-box; transform-origin: center; animation: tb-pop 0.4s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes tb-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .tb-pop { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function frame(L, R, T, B, xMax, yMax = 200) {
  return { L, R, T, B, X: (q) => L + (q / xMax) * (R - L), Y: (p) => B - (p / yMax) * (B - T), xMax, yMax };
}

/** Graph paper and axes; o.xTicks / o.yTicks: which numbers to print. */
function axes(g, o = {}) {
  const step = o.grid ?? 1;
  let s = `<rect x="${g.L}" y="${g.T}" width="${g.R - g.L}" height="${g.B - g.T}" ${fill('var(--sim-bg-surface)')}/>`;
  for (let q = step; q <= g.xMax; q += step) s += `<path d="M${f1(g.X(q))} ${g.T}V${g.B}" ${stroke('var(--sim-stroke)', 1.3, 'opacity:0.4')}/>`;
  for (let p = 50; p <= g.yMax; p += 50) s += `<path d="M${g.L} ${f1(g.Y(p))}H${g.R}" ${stroke('var(--sim-stroke)', 1.3, 'opacity:0.4')}/>`;
  for (const p of o.yTicks ?? []) s += text(g.L - 8, g.Y(p) + 6, `${RS}${p}`, o.tick ?? 18, 'var(--sim-label-muted)', 'end');
  for (const q of o.xTicks ?? []) s += text(g.X(q), g.B + (o.tick ?? 18) + 6, String(q), o.tick ?? 18, 'var(--sim-label-muted)');
  s += `<path d="M${g.L} ${g.T - 6}V${g.B}H${g.R + 6}" ${stroke('var(--sim-label)', 3, 'stroke-linecap:round;stroke-linejoin:round')}/>`;
  return s;
}

/** One buyer's curve: the line through the three points, then the points. */
function curve(g, n, o = {}) {
  const pts = TABLE[n].map((q, i) => [g.X(q), g.Y(PRICES[i])]);
  const [a, c] = [pts[0], pts[2]];
  const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
  const draw = o.anim ? ` class="sv-draw" style="--len:${f1(len)};--dur:0.5s;--d:${o.d ?? 0}s"` : '';
  let s = `<path d="M${f1(a[0])} ${f1(a[1])}L${f1(c[0])} ${f1(c[1])}"${draw} ${stroke(ser(n), o.w ?? 5, 'stroke-linecap:round')}/>`;
  pts.forEach(([x, y], i) => {
    const pop = o.anim ? ` class="tb-pop" style="--d:${f1((o.d ?? 0) + 0.1 + i * 0.12)}s"` : '';
    s += `<g${pop}><circle cx="${f1(x)}" cy="${f1(y)}" r="${o.r ?? 7}" ${fill(ser(n), 'stroke:var(--sim-bg-surface);stroke-width:2.5')}/></g>`;
  });
  return s;
}

export class ThreeBuyersScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Srivalli\'s demand curve slopes down: 1 kg at 150 rupees, 2 kg at 100, 3 kg at 50. Then three small graphs on the same axes: Srivalli 1, 2 and 3 kg; Alex 2, 4 and 6 kg; Israt 3, 6 and 9 kg. Each curve slopes down; Israt\'s goes furthest right. Plus signs join them, and the sum is left for the next lesson.';

  async setup() {
    this.shown = 3;
    this.anim = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b && b.dataset.act === 'again' && this.stepIndex === 1) { this.clear(); this.build(); this.repaint(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.pop = -1; this.draw0 = false; }

  enter(step) {
    this.clear();
    if (step === 0) {
      this.anim = true; this.draw0 = true;
      this.after(1.2, () => { this.anim = false; this.repaint(); });
    } else this.build();
  }

  // b1: one buyer at a time.
  build() {
    this.shown = 0;
    this.anim = true;
    [0, 1, 2].forEach((n) => this.after(0.3 + n * (PER_S + 0.3), () => { this.shown = n + 1; this.pop = n; this.repaint(); this.pop = -1; }));
    this.after(0.3 + 3 * (PER_S + 0.3) + 0.2, () => { this.anim = false; this.repaint(); });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.shown = 3;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintThree(P) : this.paintOne(P);
    this.draw0 = false;
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: her curve alone, big.
  paintOne(P) {
    const g = P ? frame(118, 366, 40, 340, 4) : frame(118, 384, 40, 370, 4);
    let svg = axes(g, { yTicks: PRICES, xTicks: [1, 2, 3], tick: 20 });
    svg += `<text transform="translate(${P ? 26 : 30} ${f1((g.T + g.B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:var(--sim-label);font:800 22px var(--sim-font)">price (${RS} per kg)</text>`;
    svg += text((g.L + g.R) / 2, g.B + 62, 'quantity (kg)', 22);
    const [x0, y0, x1, y1] = [g.X(0.5), g.Y(175), g.X(3.5), g.Y(25)];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const draw = this.draw0 ? ` class="sv-draw" style="--len:${f1(len)};--dur:0.7s"` : '';
    svg += `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}"${draw} ${stroke(ser(0), 7, 'stroke-linecap:round')}/>`;
    TABLE[0].forEach((q, i) => {
      const pop = this.draw0 ? ` class="tb-pop" style="--d:${f1(0.5 + i * 0.15)}s"` : '';
      svg += `<g${pop}><circle cx="${f1(g.X(q))}" cy="${f1(g.Y(PRICES[i]))}" r="10" ${fill(ser(0), 'stroke:var(--sim-bg-surface);stroke-width:3')}/></g>`;
    });
    svg += text(x0 - 10, y0 + 2, 'D', 30, ser(0), 'end') + text(x1 + 4, y1 + 30, 'D\'', 30, ser(0), 'start');
    let over = '';
    if (P) {
      over += personSlot('srivalli', { x: 96, y: 556, h: 138, pose: 'point', facing: 1, mood: 'smile' });
      svg += nameTag(96, 560, 'srivalli', 17) + text(262, 520, 'one buyer', 28);
    } else {
      over += personSlot('srivalli', { x: 478, y: 376, h: 214, pose: 'point', facing: -1, mood: 'smile' });
      svg += nameTag(478, 380, 'srivalli', 19) + text(478, 128, 'one buyer', 28);
    }
    return { svg, over };
  }

  // b1: three graphs, one per buyer.
  paintThree(P) {
    let svg = '', over = '';
    const gs = P
      ? [0, 1, 2].map((n) => frame(100, 290, 14 + n * 172, 156 + n * 172, 10))
      : [0, 1, 2].map((n) => frame(76 + n * 154, 76 + n * 154 + 124, 168, 372, 10));
    gs.forEach((g, n) => {
      const on = n < this.shown, last = n === 2;
      const yT = P || n === 0 ? PRICES : [], xT = !P || last ? [3, 6, 9] : [];
      svg += axes(g, { yTicks: yT, xTicks: xT, tick: P ? 17 : 18, grid: 3 });
      if (!on) return;
      const pop = this.pop === n;
      const [fx, fy, fh] = P ? [346, g.B - 4, 124] : [(g.L + g.R) / 2, 136, 112];
      over += personSlot(WHO[n], { x: fx, y: fy, h: fh, pose: 'stand', facing: 0, mood: 'smile', cls: pop ? 'mpp-pop' : '' });
      svg += `<g${pop ? ' class="tb-pop"' : ''}>${nameTag(fx, fy + 2, WHO[n], 16)}</g>`;
      svg += curve(g, n, { anim: pop, d: 0.15, r: 7, w: 5 });
    });
    // the plus signs and the open sum
    if (P) {
      [0, 1].forEach((n) => { svg += text(195, gs[n].B + 28, '+', 34, 'var(--sim-label)'); });
      svg += text(346, 552, '= ?', 34, 'var(--sim-label)');
      svg += `<text transform="translate(18 ${f1((gs[0].T + gs[2].B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:var(--sim-label);font:800 21px var(--sim-font)">price (${RS} per kg)</text>`;
      svg += text(195, 552, 'quantity (kg)', 21);
      if (!this.anim) svg += text(160, 584, 'each curve slopes down', 22, 'var(--sim-label-muted)');
    } else {
      [0, 1].forEach((n) => { svg += text(gs[n].R + 14, 282, '+', 34, 'var(--sim-label)'); });
      svg += text(532, 282, '= ?', 30, 'var(--sim-label)');
      svg += `<text transform="translate(16 270) rotate(-90)" text-anchor="middle" style="fill:var(--sim-label);font:800 20px var(--sim-font)">price (${RS} per kg)</text>`;
      svg += text(284, 424, 'quantity (kg)', 21);
      if (!this.anim) svg += text(230, 460, 'each curve slopes down', 22, 'var(--sim-label-muted)');
    }
    if (!this.anim) {
      const [bx, by] = P ? [338, 584] : [470, 452];
      over += `<div class="tb-ab" style="left:${bx}px;top:${by}px"><button type="button" class="sv-hit tb-btn" data-act="again">again</button></div>`;
    }
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, shown: this.shown }; }
}
