// FishStockScene - a made-up village and one stock of fish. Setup (1 beat): the village, the stock, the two catches;
// no line, no outcome. Beat 0: a catch of 30 keeps the stock flat. Beat 1: 60 drains it; the bars are the yearly catch,
// so the fifth bar answers the predict. Beat 2: the learner sets any catch. Slider, readout and chart come from runYears.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, tag, svgCountryBoat, svgFish, svgSeaColumn, svgWaveLine, skyRect, rangeControl, controlRow, rowBtn, bindActs, MUTED } from '../L08/SeaDraw.js';
import { START, runYears, svgStockChart } from './StockModel.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const YEARS = 5, PRE = { 1: 30, 2: 60, 3: 60 };
const STOCK_COL = 'var(--sim-series-1)';

export class FishStockScene extends SvgScene {
  static BEAT_MAPS = { [Number.MAX_SAFE_INTEGER]: [one(0)], 1: [one(0)], 3: [one(1), one(2), one(3)] };
  static BEAT_STEP_MAP = [one(0), one(1), one(2), one(3)];
  static WIDTH = 680;
  static HEIGHT = 460;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 580;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'A made-up fish stock of 100 thousand fish growing by 30 per cent a year. A chart shows the stock and the yearly catch for five years.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? (this.stepIndex === 0 ? 360 : 410) : 380; }
  async setup() {
    this.take = 30;
    await super.setup();
    this.rg = rangeControl(this, { id: 'catch', label: 'Catch a year', min: 0, max: 80, step: 10, value: this.take, show: (v) => `${v},000`, onInput: (v) => { this.take = v; this._row(); this.repaint(); } });
    this.row = controlRow(this);
    this._off = bindActs(this, (a) => { this.take = +a; this.rg.set(this.take); this._row(); });
    this.enter(this.stepIndex);
    this.repaint();
  }
  destroy() { this._off?.(); this.rg?.destroy(); super.destroy(); }
  _row() { if (this.row) this.row.innerHTML = this.stepIndex === 3 ? [30, 60].map((n) => rowBtn(`${n},000 a year`, String(n), { pressed: this.take === n })).join('') : ''; }
  enter(step) {
    this.take = PRE[step] ?? 30;
    if (!this.rg) return;
    this.rg.set(this.take); this.rg.hide(step !== 3); this._row();
    this.relayout?.();
  }
  _sea(st, sy, h) {
    const W = st.W;
    return skyRect('fsS', 0, 0, W, sy + 4, 0, 4) + svgSeaColumn(0, sy, 1, { w: W, h, bands: 3, wave: 3 }) + svgWaveLine(0, sy, 1, { w: W, amp: 3 });
  }
  _school(cx, cy, n, W) {
    let s = '';
    for (let i = 0; i < n; i++) { const a = i * 2.4, r = 10 + i * 6.2; s += svgFish(cx + Math.cos(a) * r * 1.8, cy + Math.sin(a) * r * 0.5, 0.42, { kind: i % 3, flip: i % 2 === 0 }); }
    return s;
  }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex;
    if (step === 0) {
      const sy = 92;
      let s = this._sea(st, sy, H - sy);
      s += svgCountryBoat(W * 0.3, sy + 3, P ? 0.72 : 0.9, { nets: true }) + svgCountryBoat(W * 0.68, sy + 3, P ? 0.72 : 0.9, {});
      s += this._school(W / 2, sy + 118, 14, W);
      s += tag(W / 2, H - 62, 'A made-up stock: 100,000 fish', { size: 16 }) + tag(W / 2, H - 26, 'grows by 30% a year', { size: 16 });
      return { svg: frame(st, s) };
    }
    const take = this.take, r = runYears(START, take, YEARS), left = P ? 44 : 56;
    const box = { x: left, y: 62, w: W - left - 14, h: H - 62 - 50 };
    let s = '';
    s += svgStockChart(box, { lines: [{ vals: r.stocks, col: STOCK_COL }], bars: r.took, years: YEARS, yMax: 140, barLabels: true });
    s += `<circle cx="${left + 2}" cy="16" r="8" style="fill:${STOCK_COL}"/>` + tx(left + 16, 22, 'stock', { size: 16, anchor: 'start' });
    s += `<rect x="${left + 74}" y="8" width="16" height="16" rx="3" style="fill:var(--sim-series-2);stroke:var(--sim-label);stroke-width:1.5"/>` + tx(left + 96, 22, 'catch', { size: 16, anchor: 'start' });
    s += tx(W - 10, 22, 'thousands of fish', { size: 15, anchor: 'end', col: MUTED, weight: 700 });
    s += `<path d="M${left} 42h30" style="stroke:var(--sim-error);stroke-width:3;stroke-dasharray:8 5"/>` + tx(left + 38, 48, 'below this: too few to breed back', { size: 15, anchor: 'start', col: 'var(--sim-error)' });
    s += tx((box.x + box.x + box.w) / 2, H - 8, 'years', { size: 15, col: MUTED, weight: 700 });
    return { svg: frame(st, s) };
  }
}
