// CommonsCatchScene - the same made-up stock, now shared. Fleets 1 to 5 each take 30 thousand a year. Beat 0: one fleet,
// flat line. Beat 1: three fleets, the stock gone in two years. Beat 2: try any number. Every number comes from runYears.
// Controls: data-act 1 to 5 (fleets).
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, tag, svgTrawler, svgSeaColumn, svgWaveLine, skyRect, controlRow, rowBtn, bindActs, MUTED } from '../L08/SeaDraw.js';
import { START, runYears, svgStockChart } from '../L07/StockModel.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const YEARS = 5, EACH = 30, PRE = [1, 3, 3];

export class CommonsCatchScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 590;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'A made-up model of one shared fish stock. Each fleet takes 30 thousand fish a year. One fleet leaves the stock flat. Three fleets empty it in two years.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 440 : 400; }
  async setup() {
    this.n = 1;
    await super.setup();
    this.row = controlRow(this);
    this._off = bindActs(this, (a) => { this.n = +a; this._row(); });
    this.enter(this.stepIndex);
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  _row() { if (this.row) this.row.innerHTML = [1, 2, 3, 4, 5].map((i) => rowBtn(i === 1 ? '1 fleet' : String(i), String(i), { pressed: this.n === i })).join(''); }
  enter(step) { this.n = PRE[step] ?? 1; this._row(); this.relayout?.(); }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, sy = 56, take = this.n * EACH, r = runYears(START, take, YEARS), left = P ? 44 : 56;
    let s = skyRect('ccS', 0, 0, W, sy + 4, 0, 4) + svgSeaColumn(0, sy, 1, { w: W, h: 40, bands: 2, wave: 2 }) + svgWaveLine(0, sy, 1, { w: W, amp: 2 });
    for (let i = 0; i < this.n; i++) s += svgTrawler(W * (i + 0.5) / 5, sy + 2, P ? 0.3 : 0.38, {});
    s += tag(W - 6, 16, 'made-up model', { anchor: 'end', size: 15 });
    const box = { x: left, y: 132, w: W - left - 14, h: H - 132 - 42 };
    s += tx(W / 2, 122, `${this.n} ${this.n === 1 ? 'fleet takes' : 'fleets take'} ${take},000 a year`, { size: P ? 18 : 20, display: true, weight: 700 });
    s += svgStockChart(box, { lines: [{ vals: r.stocks, col: 'var(--sim-series-1)' }], bars: r.took, years: YEARS, yMax: 160, ticks: [50, 100, 150], barLabels: true });
    s += tx(box.x + box.w / 2, H - 2, 'years; stock and catch in thousands of fish', { size: 15, col: MUTED, weight: 700 });
    return { svg: frame(st, s) };
  }
}
