/**
 * SlabStepsScene - L07 blk-l07-s03 "Tax Slabs" (3 beats) and blk-l07-s04 "A Small and a Large Income" (2 beats).
 * One file on two slides: BEAT_MAPS is keyed by the slide's beat count (3 -> views 0-2, 2 -> views 3-4).
 * SvgScene, design 560 x 490 landscape, 390 x 640 portrait.
 * The picture: a staircase over taxable income 0 to 30 lakh (book Table 5.1, new regime FY 2025-26, no rebate,
 * no cess): nil up to 4,00,000, then 5, 10, 15, 20, 25 and 30% for each next 4 lakh (30% above 24 lakh). Each
 * step has its rate written on it. The income bar lies under the axis; the part of each step above the bar fills,
 * so a filled column's area is that part's tax, with its tax on a chip.
 *   v0 Step 1: salary 14,00,000 less the 75,000 standard deduction = taxable 13,25,000 (key number).
 *   v1 Step 2: 13,25,000 fills four steps: chips 0 / 20,000 / 40,000 / 18,750; total 78,750; struck out
 *      "15% of everything = 1,98,750".
 *   v2 Progressive: income -/+ 50,000 or the slider (0 to 30 lakh, steps of 25,000), cases 8 / 16 / 24 lakh;
 *      live tax and "tax is X% of income" (8 lakh 2.5%, 16 lakh 7.5%, 24 lakh 12.5%).
 *   v3 Sai 3,80,000: inside the nil step, tax 0.
 *   v4 Anil 16,00,000 -> 16,10,000: before / after raise; the 10,000 sliver in the 20% step (zoom box) adds
 *      2,000 (1,20,000 -> 1,22,000; he keeps 8,000); the chips below stay the same.
 * Rest / cold start: v1 fully filled; v2 at 13,25,000; v4 after the raise. Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const LAKH = 100000, XMAX = 30 * LAKH;
const SLABS = [0, 5, 10, 15, 20, 25, 30].map((r, i) => ({ lo: i * 4 * LAKH, hi: i === 6 ? XMAX : (i + 1) * 4 * LAKH, rate: r }));
const partOf = (inc, s) => Math.max(0, Math.min(inc, s.hi) - s.lo);
const taxOf = (inc) => SLABS.reduce((t, s) => t + (partOf(inc, s) * s.rate) / 100, 0);
const SALARY = 1400000, STD = 75000, PRIYA = SALARY - STD;   // 13,25,000 -> 78,750
const FLAT = PRIYA * 0.15;                                   // 1,98,750
const SAI = 380000, ANIL0 = 1600000, ANIL1 = 1610000;         // 0; 1,20,000 -> 1,22,000
const CASES = [800000, 1600000, 2400000];
const MAP3 = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
const MAP2 = [3, 4].map((i) => [{ idx: i, dwellMs: null }]);

const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC_INK = 'color-mix(in oklab, var(--sim-accent) 55%, var(--sim-label))';
const STEP = 'var(--sim-series-1)', STEP_INK = 'color-mix(in oklab, var(--sim-series-1) 60%, var(--sim-label))';
const TINT = 'color-mix(in oklab, var(--sim-series-1) 12%, var(--sim-bg-surface))';
const FILL = 'color-mix(in oklab, var(--sim-series-1) 62%, var(--sim-bg-surface))';
const BAR = 'color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-bg-surface))', BAR_INK = 'color-mix(in oklab, var(--sim-series-3) 50%, var(--sim-label))';
const CUT = 'color-mix(in oklab, var(--sim-bad) 30%, var(--sim-bg-surface))', BAD_INK = shade('var(--sim-bad)', 80);
const RAISE = 'var(--sim-series-8)', RAISE_INK = 'color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label))';

const CSS = `
.ss-ab { position: absolute; transform: translate(-50%, -50%); display: flex; gap: 8px; align-items: center; }
.ss-btn { min-height: 46px; min-width: 46px; padding: 4px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ss-btn--pm { font-size: 26px; padding: 0; width: 48px; }
.ss-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 20%, var(--sim-bg-surface)); border-color: var(--sim-accent);
  box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.ss-btn:active { transform: translateY(3px); box-shadow: none; }
.ss-btn:focus-visible, .ss-range:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ss-range { position: absolute; margin: 0; height: 44px; transform: translateY(-50%); background: transparent; cursor: pointer; -webkit-appearance: none; appearance: none; }
.ss-range::-webkit-slider-runnable-track { height: 44px; background: transparent; }
.ss-range::-moz-range-track { height: 44px; background: transparent; }
.ss-range::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 44px; margin-top: 0; border-radius: 9px;
  background: var(--sim-bg-surface); border: 3px solid var(--sim-label); box-shadow: 0 3px 0 var(--sim-stroke); }
.ss-range::-moz-range-thumb { width: 22px; height: 40px; border-radius: 9px; background: var(--sim-bg-surface); border: 3px solid var(--sim-label); }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800, extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font);${extra}">${t}</text>`;
/** A small value chip (SVG): a rounded pill with the amount, centred on (x, y). */
const chipSvg = (x, y, t, size, o = {}) => {
  const w = t.length * size * 0.56 + 18, h = size + 12;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? STEP};stroke-width:2.5`)}/>`
    + text(x, y + size * 0.36, t, size, o.ink ?? STEP_INK, 'middle', 900);
};
const calm = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const pct1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

export class SlabStepsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP3;
  static BEAT_MAPS = { 3: MAP3, 2: MAP2 };
  static CONTROLS = [];
  static ARIA_LABEL = 'Income tax slabs as a staircase over taxable income: nil up to 4 lakh rupees, then 5, 10, 15, 20 and 25 per cent for each next 4 lakh, and 30 per cent above 24 lakh. Priya earns 14,00,000 rupees; less the 75,000 rupee standard deduction, her taxable income is 13,25,000 rupees. It fills four steps: 0, 20,000, 40,000 and 18,750 rupees, a total of 78,750 rupees, not 15 per cent of everything, 1,98,750 rupees. Moving the income shows the tax and its share of income rising. Sai, 3,80,000 rupees, stays in the nil step and pays nothing. Anil rises from 16,00,000 to 16,10,000 rupees: only the extra 10,000 falls in the 20 per cent step, so his tax goes from 1,20,000 to 1,22,000 rupees.';

  async setup() {
    this.fresh = false;
    this.inc = PRIYA;
    this.raise = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      const a = b?.dataset.act;
      if (a === 'replay') this.run();
      else if (a === 'pm') this.setInc(this.inc + Number(b.dataset.val) * 50000);
      else if (a === 'case') this.setInc(Number(b.dataset.val));
      else if (a === 'raise') { this.clear(); this.raise = b.dataset.val === '1'; this.repaint(); }
    };
    this._onInput = (e) => { if (e.target?.classList?.contains('ss-range')) this.setInc(Number(e.target.value), true); };
    this.root.addEventListener('click', this._onClick);
    this.root.addEventListener('input', this._onInput);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    this.root?.removeEventListener('input', this._onInput);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter() { this.clear(); this.inc = PRIYA; this.raise = true; this.after(0.05, () => this.run()); }

  run() {
    this.clear();
    this.inc = PRIYA; this.raise = true;
    if (calm()) { this.repaint(); return; }
    this.fresh = true;
    this.after(this.stepIndex === 1 ? 3.4 : 1.6, () => { this.fresh = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  setInc(v, fromRange) {
    this.clear();
    this.inc = Math.max(0, Math.min(XMAX, Math.round(v / 25000) * 25000));
    if (fromRange) { this.repaintKeepRange(); return; }
    this.repaint();
  }

  /** Repaint without losing the slider under the finger: the range input is re-made, so focus goes back to it. */
  repaintKeepRange() {
    this.repaint();
    const r = this.root?.querySelector?.('.ss-range');
    try { r?.focus?.({ preventScroll: true }); } catch (_) { /* no focus in a headless host */ }
  }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 490) * st.W / (st.portrait ? 390 : 560)); }

  anim(cls, d, body) { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s"` : ''}>${body}</g>`; }

  geo(P) {
    return P ? { x0: 24, x1: 376, yB: 462, V: 8.5, bar: [472, 26], tick: 524, title: 552, chip: 17, rate: 19, nilDx: 6 }
      : { x0: 48, x1: 536, yB: 352, V: 8, bar: [362, 28], tick: 412, title: 444, chip: 18, rate: 22, nilDx: 22 };
  }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 490, k = (st.W / DW).toFixed(4);
    const g = this.geo(P), v = this.stepIndex;
    g.P = P;
    g.X = (inc) => g.x0 + ((g.x1 - g.x0) * inc) / XMAX;
    g.T = (s) => g.yB - (s.rate ? s.rate * g.V : 6);
    const inc = v === 0 ? PRIYA : v === 1 ? PRIYA : v === 2 ? this.inc : v === 3 ? SAI : this.raise ? ANIL1 : ANIL0;
    let svg = '', over = '';
    // which steps are lit: the ones the income reaches (all of them in v2)
    const lit = (i) => v === 2 || v === 0 || partOf(inc, SLABS[i]) > 0 || (v === 4 && i === 4);
    svg += this.stairs(g, lit, v === 0);
    if (v !== 0) svg += this.fills(g, inc, v);
    svg += this.rates(g, lit, inc, v);
    svg += this.axis(g, inc, v, P);
    const r = v === 0 ? this.readStep1(g, P) : v === 1 ? this.readStep2(g, P) : v === 2 ? this.readFree(g, P) : v === 3 ? this.readSai(g, P) : this.readAnil(g, P);
    svg += r.svg; over += r.over ?? '';
    if (!this.fresh && (v === 0 || v === 1)) over += `<div class="ss-ab" style="left:${P ? 330 : 500}px;top:${P ? 612 : 466}px"><button type="button" class="sv-hit ss-btn" data-act="replay">replay</button></div>`;
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  /** The staircase: a tinted column per slab, its rate on it, and one outline along the step tops. */
  stairs(g, lit, faint) {
    let s = '', edge = `M${f1(g.x0)} ${f1(g.yB)}`;
    SLABS.forEach((sl, i) => {
      const xa = g.X(sl.lo), xb = g.X(sl.hi), top = g.T(sl), on = lit(i);
      s += `<g style="opacity:${on ? (faint ? 0.75 : 1) : 0.3}"><rect x="${f1(xa)}" y="${f1(top)}" width="${f1(xb - xa)}" height="${f1(g.yB - top)}" ${fill(TINT)}/>`;
      s += '</g>';
      edge += `V${f1(top)}H${f1(xb)}`;
    });
    s += `<path d="${edge}" ${stroke(STEP, 3, 'stroke-linejoin:round')}/>`;
    return s;
  }

  /** Each step's rate, written at its foot (so the tax chips above the steps never cover it). */
  rates(g, lit, inc, v) {
    return SLABS.map((sl, i) => {
      const xa = g.X(sl.lo), xb = g.X(sl.hi), on = lit(i), filled = v !== 0 && partOf(inc, sl) > 0 && sl.rate;
      const t = sl.rate ? `${sl.rate}%` : 'nil';
      return `<g style="opacity:${on ? 1 : 0.35}">${text((xa + xb) / 2, g.yB - (sl.rate ? 11 : 14), t, g.rate, filled ? INK : STEP_INK, 'middle', 900)}</g>`;
    }).join('');
  }

  /** The filled part of each step the income reaches, and its tax chip. */
  fills(g, inc, v) {
    let s = '', chips = '';
    SLABS.forEach((sl, i) => {
      const part = partOf(inc, sl);
      if (part <= 0) return;
      const xa = g.X(sl.lo), xb = Math.max(g.X(sl.lo + part), xa + 4), top = g.T(sl);
      const d = (0.3 + i * 0.6).toFixed(2);
      const col = v === 4 && i === 4 ? RAISE : FILL;
      s += this.anim('mk-rise', v === 1 ? d : 0.2, `<rect x="${f1(xa)}" y="${f1(top)}" width="${f1(xb - xa)}" height="${f1(g.yB - top)}" ${fill(col)}/>`);
      if (v === 4 && i === 4) return;   // the sliver's chip is in the zoom box
      const t = (part * sl.rate) / 100, cx = sl.rate ? (xa + xb) / 2 : xa + g.nilDx;
      const cy = sl.rate ? top - 20 : g.yB - (g.P ? 100 : 54);   // portrait: the nil chip sits above the 5% chip's row
      chips += this.anim('mk-pop', v === 1 ? (+d + 0.45).toFixed(2) : 0.3, chipSvg(cx, cy, rs(t), g.chip));
    });
    return s + chips;
  }

  /** The axis, the income bar under it, lakh ticks and the axis title. */
  axis(g, inc, v, P) {
    let s = `<path d="M${f1(g.x0)} ${f1(g.yB)}H${f1(g.x1 + 6)}" ${stroke(INK, 3)}/>`;
    const [by, bh] = g.bar;
    s += `<rect x="${f1(g.x0)}" y="${f1(by)}" width="${f1(g.x1 - g.x0)}" height="${bh}" rx="7" ${fill('color-mix(in oklab, var(--sim-label) 6%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:1.5')}/>`;
    if (v === 0) {
      // salary 14,00,000; the last 75,000 cut off and lifted away
      const xs = g.X(SALARY), xc = g.X(PRIYA);
      s += `<rect x="${f1(g.x0)}" y="${f1(by)}" width="${f1(xc - g.x0)}" height="${bh}" rx="7" ${fill(BAR)}/>`;
      s += this.anim('mk-pop', 0.5, `<rect x="${f1(xc + 8)}" y="${f1(by - 14)}" width="${f1(Math.max(10, xs - xc))}" height="${bh}" rx="4" ${fill(CUT, 'stroke:var(--sim-bad);stroke-width:2;stroke-dasharray:4 3')}/>`);
    } else {
      s += `<rect x="${f1(g.x0)}" y="${f1(by)}" width="${f1(Math.max(0, g.X(inc) - g.x0))}" height="${bh}" rx="7" ${fill(BAR)}/>`;
      if (v === 4 && this.raise) s += `<rect x="${f1(g.X(ANIL0))}" y="${f1(by)}" width="4" height="${bh}" ${fill(RAISE)}/>`;
    }
    for (let l = 0; l <= 28; l += 4) {
      const x = g.X(l * LAKH);
      s += `<path d="M${f1(x)} ${f1(by + bh)}V${f1(by + bh + 8)}" ${stroke(MUTED, 2)}/>` + text(x, g.tick, String(l), P ? 18 : 20, MUTED, 'middle', 800);
    }
    s += text((g.x0 + g.x1) / 2, g.title, 'taxable income, in lakh rupees', P ? 19 : 20, INK, 'middle', 800);
    return s;
  }

  readStep1(g, P) {
    let s = '';
    const x = P ? 24 : 56, y = P ? 44 : 44;
    s += text(x, y, `salary ${rs(SALARY)}`, 23, INK, 'start', 800);
    s += this.anim('mk-pop', 0.5, text(x, y + 34, `- ${rs(STD)} standard deduction`, 21, BAD_INK, 'start', 800));
    s += this.anim('mk-pop', 0.9, text(x, y + 84, `= ${rs(PRIYA)}`, 36, ACC_INK, 'start', 900) + text(x, y + 114, 'taxable income', 21, INK, 'start', 800));
    s += text(P ? 366 : 536, P ? 44 : 44, 'Priya', 22, MUTED, 'end', 800);
    // the cut piece's amount, beside it on the bar
    const xc = g.X(PRIYA) + 14;
    s += text(xc + 14, g.bar[0] + g.bar[1] - 7, rs(STD), 20, BAD_INK, 'start', 900);
    return { svg: s };
  }

  readStep2(g, P) {
    let s = '';
    const x = P ? 24 : 56, y = P ? 50 : 50;
    s += text(x, y, `taxable ${rs(PRIYA)}`, 21, INK, 'start', 800);
    s += this.anim('mk-pop', 2.9, text(x, y + 46, `tax ${rs(taxOf(PRIYA))}`, 38, ACC_INK, 'start', 900));
    const t = `15% of everything = ${rs(FLAT)}`, w = t.length * 20 * 0.52;
    s += this.anim('mk-pop', 3.1, text(x, y + 88, t, 20, MUTED, 'start', 700)
      + `<path d="M${f1(x - 4)} ${f1(y + 81)}H${f1(x + w + 4)}" ${stroke(BAD_INK, 3)}/>`
      + text(x, y + 114, 'not this', 19, BAD_INK, 'start', 800));
    return { svg: s };
  }

  readFree(g, P) {
    let s = '', over = '';
    const tax = taxOf(this.inc), share = this.inc ? (100 * tax) / this.inc : 0;
    const x = P ? 24 : 56;
    s += text(x + 116, P ? 52 : 100, rs(this.inc), 26, INK, 'start', 900);
    over += `<div class="ss-ab" style="left:${x + 50}px;top:${P ? 44 : 92}px"><button type="button" class="sv-hit ss-btn ss-btn--pm" data-act="pm" data-val="-1" aria-label="50,000 rupees less">-</button><button type="button" class="sv-hit ss-btn ss-btn--pm" data-act="pm" data-val="1" aria-label="50,000 rupees more">+</button></div>`;
    s += text(x, P ? 112 : 148, `tax ${rs(tax)}`, 32, ACC_INK, 'start', 900);
    s += text(x, P ? 148 : 182, `tax is ${pct1(share)}% of income`, 22, INK, 'start', 800);
    const cases = CASES.map((c) => `<button type="button" class="sv-hit ss-btn" data-act="case" data-val="${c}" aria-pressed="${this.inc === c}">${c / LAKH} lakh</button>`).join('');
    over += `<div class="ss-ab" style="left:${P ? 195 : 190}px;top:${P ? 604 : 38}px">${cases}</div>`;
    const [by, bh] = g.bar;
    over += `<input type="range" class="ss-range" min="0" max="${XMAX}" step="25000" value="${this.inc}" aria-label="taxable income in rupees" style="left:${f1(g.x0 - 13)}px;top:${f1(by + bh / 2)}px;width:${f1(g.x1 - g.x0 + 26)}px">`;
    return { svg: s, over };
  }

  readSai(g, P) {
    let s = '';
    const x = P ? 24 : 56;
    s += text(x, 44, 'Sai', 22, MUTED, 'start', 800);
    s += this.anim('mk-pop', 0.3, text(x, 84, `taxable ${rs(SAI)}`, 24, INK, 'start', 800));
    s += this.anim('mk-pop', 0.6, text(x, 134, `tax ${rs(0)}`, 40, ACC_INK, 'start', 900));
    s += this.anim('mk-pop', 0.8, text(x, 170, 'all in the nil slab', 21, INK, 'start', 800));
    return { svg: s };
  }

  readAnil(g, P) {
    let s = '', over = '';
    const x = P ? 24 : 56, inc = this.raise ? ANIL1 : ANIL0, tax = taxOf(inc);
    s += text(x, P ? 32 : 32, 'Anil', 22, MUTED, 'start', 800);
    const tog = `<button type="button" class="sv-hit ss-btn" data-act="raise" data-val="0" aria-pressed="${!this.raise}">before</button><button type="button" class="sv-hit ss-btn" data-act="raise" data-val="1" aria-pressed="${this.raise}">after raise</button>`;
    over += `<div class="ss-ab" style="left:${P ? 195 : 196}px;top:${P ? 604 : 66}px">${tog}</div>`;
    const y0 = P ? 72 : 118;
    s += text(x, y0, `taxable ${rs(inc)}`, 22, INK, 'start', 800);
    s += text(x, y0 + 38, `tax ${rs(tax)}`, P ? 30 : 32, ACC_INK, 'start', 900);
    if (this.raise) s += this.anim('mk-pop', 0.3, text(x, y0 + 72, `+${rs(taxOf(ANIL1) - taxOf(ANIL0))} tax`, 28, RAISE_INK, 'start', 900)
      + text(x, y0 + 102, `he keeps ${rs(ANIL1 - ANIL0 - (taxOf(ANIL1) - taxOf(ANIL0)))}`, 21, INK, 'start', 800));
    else s += text(x, y0 + 72, `raise to ${rs(ANIL1)}?`, 21, MUTED, 'start', 800);
    // the zoom box: 15,70,000 to 16,20,000 around the 20% line
    const Z = P ? { x: 252, y: 14, w: 128, h: 94 } : { x: 384, y: 14, w: 164, h: 96 };
    const lo = 1570000, hi = 1620000, zx = (v) => Z.x + 8 + ((Z.w - 16) * (v - lo)) / (hi - lo), base = Z.y + Z.h - 10, zv = 2.4;
    s += `<rect x="${Z.x}" y="${Z.y}" width="${Z.w}" height="${Z.h}" rx="12" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:2.5')}/>`;
    const t15 = base - 15 * zv, t20 = base - 20 * zv;
    s += `<rect x="${f1(zx(lo))}" y="${f1(t15)}" width="${f1(zx(ANIL0) - zx(lo))}" height="${f1(base - t15)}" ${fill(FILL)}/>`;
    s += `<rect x="${f1(zx(ANIL0))}" y="${f1(t20)}" width="${f1(zx(hi) - zx(ANIL0))}" height="${f1(base - t20)}" ${fill(TINT)}/>`;
    if (this.raise) s += this.anim('mk-rise', 0.2, `<rect x="${f1(zx(ANIL0))}" y="${f1(t20)}" width="${f1(zx(ANIL1) - zx(ANIL0))}" height="${f1(base - t20)}" ${fill(RAISE)}/>`);
    s += `<path d="M${f1(zx(lo))} ${f1(t15)}H${f1(zx(ANIL0))}V${f1(t20)}H${f1(zx(hi))}" ${stroke(STEP, 3)}/><path d="M${f1(zx(lo))} ${f1(base)}H${f1(zx(hi))}" ${stroke(INK, 2.5)}/>`;
    s += text(zx(lo) + 4, t15 - 8, '15%', 18, STEP_INK, 'start', 900) + text(zx(hi) - 2, t20 - 8, '20%', 18, STEP_INK, 'end', 900);
    // tie the box to the 16 lakh corner on the staircase
    const cx = g.X(ANIL0), cy = g.T(SLABS[4]);
    s += `<path d="M${f1(P ? Z.x + 30 : Z.x + 20)} ${f1(Z.y + Z.h)}L${f1(cx)} ${f1(cy)}" ${stroke(MUTED, 2, 'stroke-dasharray:5 4')}/>`;
    s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="9" ${fill('none', `stroke:${RAISE};stroke-width:3`)}/>`;
    return { svg: s, over };
  }

  testState() {
    const v = this.stepIndex;
    const inc = v <= 1 ? PRIYA : v === 2 ? this.inc : v === 3 ? SAI : this.raise ? ANIL1 : ANIL0;
    return { view: v, fresh: this.fresh, inc, tax: taxOf(inc), parts: SLABS.map((s) => (partOf(inc, s) * s.rate) / 100), raise: this.raise };
  }
}
