/**
 * SensexWindowScene - L04 s03 "Shares and the SENSEX" (3 beats) and L04 s08 "One Year or Twenty Years" (2 beats).
 * One file on two slides: BEAT_MAPS is keyed by the slide's beat count (3 -> views 0-2, 2 -> views 3-4).
 * SvgScene + SimPlotSvg, design 560 x 500 landscape, 390 x 620 portrait. The line is the SENSEX, 1998 to 2026, in
 * rounded yearly values read off the book's chart (shape, not exact closes); the falls at 2008 and 2020 show.
 * The change on Rs 10,000 over a window = 10,000 x (value at sell / value at buy) - 10,000.
 *   v0 A share: a company building with one slice lit, "1 share = part of 1 company"; two ways it can earn
 *      (dividend, price rise); "neither is fixed". No chart yet.
 *   v1 The SENSEX: the line draws (replay), title "SENSEX, 1998 to 2026", chip "30 large companies", the 2008 and
 *      2020 falls marked.
 *   v2 Buy one year, sell later: buy and sell lines on the chart (drag them, or - / + under the chart), the window
 *      shaded; a card: Rs 10,000 put in at the buy year comes back as ... at the sell year, and the change (loss or
 *      gain, colour AND word). Default buy 2007, sell 2008: Rs 4,729, a loss of Rs 5,271.
 *   v3 Two windows: a one-year window (drag or - / +; default 2019 to 2020, a loss of Rs 2,771) and a fixed
 *      twenty-year window 2006 to 2026 (a gain of Rs 42,555), each with its change on Rs 10,000 in a big card.
 *   v4 The same, quieter: the line muted, no controls, the two cards side by side with who each window fits.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { plotFrame, axesOnSvg, plotLineSvg, toScreen } from 'simulations/base/kit/SimPlotSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MONEY_CSS, coin, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const Y0 = 1998;
const VALUES = [
  4000, 5000, 4000, 3300, 3400, 5800, 6600, 9400, 13700, 20300,
  9600, 17500, 20500, 15500, 19400, 21200, 27500, 26100, 26600, 34000,
  36000, 41500, 30000, 58000, 60800, 72000, 78000, 76000, 72000,
];
const LAST = Y0 + VALUES.length - 1;                  // 2026
const value = (y) => VALUES[Math.max(0, Math.min(VALUES.length - 1, y - Y0))];
const back = (y1, y2) => Math.round(10000 * value(y2) / value(y1));
const change = (y1, y2) => back(y1, y2) - 10000;
const signed = (n) => (n < 0 ? '-' : '+') + rs(Math.abs(n));
const LONG = [2006, 2026];
const MAP3 = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
const MAP2 = [0, 1].map((i) => [{ idx: i + 3, dwellMs: null }]);
const DRAW_S = 2.4;
const MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', INK = 'var(--sim-label)';
const LINE = 'var(--sim-series-1)';
const SHORT_COL = 'var(--sim-series-8)', LONG_COL = 'var(--sim-series-3)';
const BAD_INK = shade('var(--sim-bad)', 80), GOOD_INK = shade('var(--sim-good)', 62);
const toneOf = (n) => (n < 0 ? BAD_INK : GOOD_INK);
const word = (n) => (n < 0 ? 'loss' : 'gain');

const CSS = `
.sx-ab { position: absolute; transform: translate(-50%, -50%); }
.sx-row { position: absolute; display: flex; align-items: center; gap: 8px; transform: translate(-50%, -50%); }
.sx-btn { min-height: 48px; min-width: 52px; padding: 4px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 24px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.sx-btn:active { transform: translateY(3px); box-shadow: none; }
.sx-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.sx-btn[aria-disabled="true"] { opacity: 0.4; cursor: default; }
.sx-quiet { font-size: 20px; }
.sx-val { min-width: 112px; text-align: center; font: 800 24px/1 var(--sim-font); color: var(--sim-label); }
.sx-val--wide { min-width: 170px; }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, edge) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${edge ?? 'var(--sim-stroke)'};stroke-width:${edge ? 3.5 : 2.5}`)}/>`;

export class SensexWindowScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP3;
  static BEAT_MAPS = { 3: MAP3, 2: MAP2 };
  static CONTROLS = [];
  static ARIA_LABEL = 'A share makes you a part-owner of a company and can earn a dividend or a rise in its price; neither is fixed. A chart of the SENSEX, which follows 30 large companies, from 1998 to 2026 in rounded values: it ends many times higher but falls sharply in 2008 and 2020. Pick a buy year and a sell year: 10,000 rupees put in in 2007 comes back as 4,729 rupees in 2008, a loss of 5,271 rupees. A one-year window from 2019 to 2020 loses 2,771 rupees on 10,000; the twenty-year window from 2006 to 2026 gains 42,555 rupees.';

  async setup() {
    this.buy = 2007; this.sell = 2008; this.win = 2019;
    this.drawing = false;
    this.grab = null;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      const d = Number(b.dataset.val);
      if (b.dataset.act === 'replay') this.draw();
      else if (b.dataset.act === 'buy') this.setYears(this.buy + d, this.sell);
      else if (b.dataset.act === 'sell') this.setYears(this.buy, this.sell + d);
      else if (b.dataset.act === 'win') this.setWin(this.win + d);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.drawing = false; }

  enter(step) {
    this.clear();
    this.grab = null;
    this.buy = 2007; this.sell = 2008; this.win = 2019;
    if (step === 1) this.after(0.05, () => this.draw());
  }

  /** v1: the line draws by year; the fall marks come at the end (timed repaint). */
  draw() {
    if (this.stepIndex !== 1) return;
    this.clear();
    this.clockReset?.();
    this.drawing = true;
    this.play(DRAW_S + 0.2);
    this.after(DRAW_S + 0.3, () => { this.drawing = false; this.repaint(); });
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

  setYears(b, s) {
    if (this.stepIndex !== 2) return;
    b = Math.max(Y0, Math.min(LAST - 1, Math.round(b)));
    s = Math.max(Y0 + 1, Math.min(LAST, Math.round(s)));
    if (b >= s) { if (b !== this.buy) s = b + 1; else b = s - 1; }
    if (b === this.buy && s === this.sell) return;
    this.buy = b; this.sell = s;
    this.repaint();
  }

  setWin(w) {
    if (this.stepIndex !== 3) return;
    const n = Math.max(Y0, Math.min(LAST - 1, Math.round(w)));
    if (n === this.win) return;
    this.win = n;
    this.repaint();
  }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 500) * st.W / (st.portrait ? 390 : 560)); }

  geo(st) {
    const P = st.portrait, DW = P ? 390 : 560, k = st.W / DW;
    const top = P ? 180 : 170, bot = P ? 474 : 434;
    const rect = { x: 30 * k, y: top * k, w: (DW - 30) * k, h: (bot - top) * k };
    const f = plotFrame(rect, {
      x: { min: Y0, max: LAST, ticks: [2000, 2008, 2020, 2026], label: 'year' },
      y: { min: 0, max: 80000, ticks: [0, 20000, 40000, 60000, 80000], fmt: group },
      rightPad: 16 * k,
    });
    f.y.fmt = group;
    const d = { x: (v) => f.px(v) / k, y: (v) => f.py(v) / k };
    const pl = { x: f.plot.x / k, y: f.plot.y / k, w: f.plot.w / k, h: f.plot.h / k };
    return { P, DW, k, f, d, pl, top };
  }

  pointerDown(p) {
    const v = this.stepIndex;
    if ((v !== 2 && v !== 3) || !this.sv) return false;
    const g = this.geo(this.sv), x = p.x / g.k, y = p.y / g.k;
    if (x < g.pl.x - 14 || x > g.pl.x + g.pl.w + 14 || y < g.pl.y - 10 || y > g.pl.y + g.pl.h + 34) return false;
    const yr = g.f.vx(p.x);
    if (v === 2) {
      this.grab = Math.abs(yr - this.buy) <= Math.abs(yr - this.sell) ? 'buy' : 'sell';
      if (this.buy === this.sell - 1) this.grab = yr < this.buy + 0.5 ? 'buy' : 'sell';
    } else this.grab = 'win';
    this.pointerMove(p);
    this.repaint();
    return true;
  }

  pointerMove(p) {
    if (!this.grab || !this.sv) return false;
    const g = this.geo(this.sv), yr = g.f.vx(p.x), before = `${this.buy}/${this.sell}/${this.win}`;
    if (this.grab === 'win') this.win = Math.max(Y0, Math.min(LAST - 1, Math.round(yr - 0.5)));
    else if (this.grab === 'buy') this.buy = Math.max(Y0, Math.min(this.sell - 1, Math.round(yr)));
    else this.sell = Math.max(this.buy + 1, Math.min(LAST, Math.round(yr)));
    return before !== `${this.buy}/${this.sell}/${this.win}`;
  }

  pointerUp() { this.grab = null; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 500, k = st.W / DW;
    const g = this.geo(st), v = this.stepIndex;
    const out = v === 0 ? this.shareView(P) : this.chartView(g);
    return { svg: `<g transform="scale(${k.toFixed(4)})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k.toFixed(4)});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** v0: one company, one slice; two ways a share can earn. */
  shareView(P) {
    let svg = '';
    const cx = P ? 195 : 150, gy = P ? 280 : 330, bw = P ? 230 : 250, bh = bw * 220 / 280, x0 = cx - bw / 2, y0 = gy - bh;
    svg += text(P ? 195 : 280, 44, '1 share = part of 1 company', P ? 25 : 28);
    svg += `<ellipse cx="${cx}" cy="${gy}" rx="${f1(bw * 0.56)}" ry="12" ${fill('color-mix(in oklab, var(--sim-label) 12%, transparent)')}/>`;
    svg += civicSvg('office', cx, gy, { w: bw });
    const sx = x0 + bw * 0.56, sw = bw * 0.17;
    svg += `<rect x="${f1(sx)}" y="${f1(y0 + bh * 0.08)}" width="${f1(sw)}" height="${f1(bh * 0.9)}" rx="4" ${fill('color-mix(in oklab, var(--sim-accent) 42%, transparent)', 'stroke:var(--sim-accent);stroke-width:4')}/>`;
    svg += `<path d="M${f1(sx + sw / 2)} ${f1(y0 + bh * 0.06)}V${f1(y0 - 14)}" ${stroke(ACC, 3.5)}/>`;
    svg += text(sx + sw / 2, y0 - 22, '1 share', 24, shade(ACC, 62));
    svg += text(cx, gy + 38, 'one company', 21, MUTED, 'middle', 700);

    // the two ways it can earn
    const cards = P ? [[16, 340, 358, 84], [16, 436, 358, 84]] : [[300, 100, 246, 116], [300, 232, 246, 116]];
    const [a, b] = cards;
    svg += panel(a[0], a[1], a[2], a[3]) + panel(b[0], b[1], b[2], b[3]);
    const ix = (c) => c[0] + 38, ty = (c) => c[1] + (P ? 36 : 42);
    svg += coin(ix(a), a[1] + a[3] / 2, 20) + coin(ix(a) + 6, a[1] + a[3] / 2 - 8, 20);
    svg += text(ix(a) + 38, ty(a), 'dividend', 26, INK, 'start');
    svg += text(ix(a) + 38, ty(a) + 30, P ? 'part of the profit, paid out' : 'part of the profit', 20, INK, 'start', 700);
    if (!P) svg += text(ix(a) + 38, ty(a) + 56, 'paid to shareholders', 20, INK, 'start', 700);
    // price rise: a small rising line with an arrow
    const bx = ix(b), by = b[1] + b[3] / 2;
    svg += `<path d="M${bx - 20} ${by + 16}L${bx - 6} ${by + 2}L${bx + 4} ${by + 8}L${bx + 20} ${by - 14}" ${stroke(LINE, 5)}/>`
      + `<path d="M${bx + 8} ${by - 15}L${bx + 21} ${by - 16}L${bx + 21} ${by - 3}" ${stroke(LINE, 5)}/>`;
    svg += text(bx + 38, ty(b), 'price rise', 26, INK, 'start');
    svg += text(bx + 38, ty(b) + 30, P ? 'sell for more than you paid' : 'sell for more than', 20, INK, 'start', 700);
    if (!P) svg += text(bx + 38, ty(b) + 56, 'you paid', 20, INK, 'start', 700);

    // neither is fixed: a small wavy line
    const ny = P ? 572 : 400, nx = P ? 195 : 423;
    svg += `<path d="M${nx - 120} ${ny - 8}q14 -16 28 0t28 0t28 0" ${stroke(MUTED, 3.5)}/>`;
    svg += text(nx - 24, ny, 'neither is fixed', 24, INK, 'start');
    return { svg, over: '' };
  }

  /** v1-v4: the chart, with the parts each view needs. */
  chartView(g) {
    const { P, d, pl, top } = g, v = this.stepIndex, DW = P ? 390 : 560, mid = DW / 2;
    let svg = '', over = '';
    svg += text(4, top - 8, 'SENSEX value', 20, INK, 'start') + text(150, top - 8, '(rounded values)', 19, MUTED, 'start', 700);

    if (v === 1) {
      svg += text(mid, 44, 'SENSEX, 1998 to 2026', P ? 27 : 30);
      const cw = 236;
      svg += `<rect x="${f1(mid - cw / 2)}" y="66" width="${cw}" height="44" rx="22" ${fill('color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:2.5')}/>`
        + text(mid, 96, '30 large companies', 22, shade(ACC, 62));
      if (!this.drawing) {
        for (const y of [2008, 2020]) {
          const x = d.x(y), py = d.y(value(y)), ly = pl.y + 24;
          svg += `<path d="M${f1(x)} ${f1(ly + 8)}V${f1(py - 14)}" ${stroke('var(--sim-bad)', 2.5, 'stroke-dasharray:5 5')}/>`;
          svg += `<circle cx="${f1(x)}" cy="${f1(py)}" r="10" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-bad);stroke-width:4')}/>`;
          // portrait: both labels end just right of their line, so the two never meet
          const lx = g.P ? x + (y === 2020 ? 8 : 30) : x;
          svg += `<g class="mk-pop">${text(lx, ly, `${y} fall`, 21, BAD_INK, g.P ? 'end' : 'middle')}</g>`;
        }
        over += `<div class="sx-ab" style="left:${P ? 195 : 486}px;top:${P ? 540 : 88}px"><button type="button" class="sv-hit sx-btn sx-quiet" data-act="replay">replay</button></div>`;
      }
    }

    if (v === 2) {
      const ch = change(this.buy, this.sell);
      const bx = d.x(this.buy), sx = d.x(this.sell);
      svg += `<rect x="${f1(bx)}" y="${f1(pl.y)}" width="${f1(sx - bx)}" height="${f1(pl.h)}" ${fill('color-mix(in oklab, var(--sim-accent) 14%, transparent)')}/>`;
      svg += this.handle(bx, pl, 'buy', 'end') + this.handle(sx, pl, 'sell', 'start');
      svg += this.dot(bx, d.y(value(this.buy)), ACC) + this.dot(sx, d.y(value(this.sell)), ACC);
      // the card: what Rs 10,000 became, and the change
      svg += panel(12, 14, DW - 24, 112, toneOf(ch));
      svg += text(30, 48, `${rs(10000)} in ${this.buy}`, 21, MUTED, 'start', 700);
      const bk = rs(back(this.buy, this.sell));
      svg += text(30, 100, bk, 32, INK, 'start');
      svg += text(30 + bk.length * 19 + 10, 100, P ? `in ${this.sell}` : `back in ${this.sell}`, 21, MUTED, 'start', 700);
      svg += text(DW - 28, 60, signed(ch), P ? 30 : 34, toneOf(ch), 'end');
      svg += text(DW - 28, 100, word(ch), 24, toneOf(ch), 'end');
      over += this.stepper('buy', this.buy, P ? 195 : 140, P ? 520 : 470, this.buy <= Y0, this.buy >= this.sell - 1 && this.sell >= LAST);
      over += this.stepper('sell', this.sell, P ? 195 : 420, P ? 584 : 470, this.sell <= Y0 + 1, this.sell >= LAST);
    }

    if (v >= 3) {
      const quiet = v === 4;
      const a = this.win, b = a + 1, c1 = change(a, b), c2 = change(LONG[0], LONG[1]);
      // the twenty-year window: a band low on the chart with its bracket
      const lx = d.x(LONG[0]), rx = d.x(LONG[1]);
      svg += `<rect x="${f1(lx)}" y="${f1(pl.y)}" width="${f1(rx - lx)}" height="${f1(pl.h)}" ${fill(`color-mix(in oklab, ${LONG_COL} 12%, transparent)`)}/>`;
      const by = pl.y + 10;
      svg += `<path d="M${f1(lx)} ${f1(by + 10)}V${f1(by)}H${f1(rx)}V${f1(by + 10)}" ${stroke(shade(LONG_COL, 70), 4)}/>`;
      svg += text(lx + 10, by + 34, '20 years', 21, shade(LONG_COL, 62), 'start');
      // the one-year window
      const ax = d.x(a), bxx = d.x(b);
      svg += `<rect x="${f1(ax)}" y="${f1(pl.y)}" width="${f1(bxx - ax)}" height="${f1(pl.h)}" ${fill(`color-mix(in oklab, ${SHORT_COL} 30%, transparent)`, `stroke:${SHORT_COL};stroke-width:2.5`)}/>`;
      svg += this.dot(ax, d.y(value(a)), SHORT_COL) + this.dot(bxx, d.y(value(b)), SHORT_COL);
      svg += this.dot(lx, d.y(value(LONG[0])), LONG_COL) + this.dot(rx, d.y(value(LONG[1])), LONG_COL);
      if (!quiet) svg += `<circle cx="${f1((ax + bxx) / 2)}" cy="${f1(pl.y + pl.h)}" r="12" ${fill(SHORT_COL, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
      // the two cards, side by side
      const cw = (DW - 36) / 2, ch = 138;
      [[12, '1 year', `${a} to ${b}`, c1, SHORT_COL, 'needed it soon'], [24 + cw, '20 years', `${LONG[0]} to ${LONG[1]}`, c2, LONG_COL, 'could wait']].forEach(([x, nm, span, c, col, who]) => {
        svg += panel(x, 8, cw, ch, toneOf(c));
        svg += `<rect x="${f1(x + 14)}" y="22" width="22" height="22" rx="5" ${fill(`color-mix(in oklab, ${col} 45%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2.5`)}/>`;
        svg += text(x + 44, 40, nm, 22, INK, 'start');
        svg += text(x + 14, 80, signed(c), P ? 28 : 32, toneOf(c), 'start');
        svg += text(x + 14, 110, P ? word(c) : `${word(c)}, ${span}`, 20, toneOf(c), 'start');
        svg += text(x + 14, 135, quiet ? who : (P ? span : `on ${rs(10000)}`), 20, MUTED, 'start', 700);
      });
      if (!quiet) over += this.stepper('win', a, mid, P ? 530 : 470, a <= Y0, a >= LAST - 1, `${a} to ${b}`);
    }
    return { svg, over };
  }

  handle(x, pl, label, anchor) {
    return `<path d="M${f1(x)} ${f1(pl.y + 30)}V${f1(pl.y + pl.h)}" ${stroke(ACC, 3.5, 'stroke-dasharray:9 6')}/>`
      + `<circle cx="${f1(x)}" cy="${f1(pl.y + pl.h)}" r="12" ${fill(ACC, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`
      + text(x + (anchor === 'end' ? -6 : 6), pl.y + 24, label, 22, shade(ACC, 62), anchor);
  }

  dot(x, y, col) { return `<circle cx="${f1(x)}" cy="${f1(y)}" r="8" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`; }

  stepper(act, val, x, y, dn, up, label) {
    const name = act === 'win' ? 'window' : act;
    return `<div class="sx-row" style="left:${x}px;top:${y}px">`
      + `<button type="button" class="sv-hit sx-btn" data-act="${act}" data-val="-1" aria-label="${name} one year earlier" aria-disabled="${dn}">-</button>`
      + `<span class="sx-val${label ? ' sx-val--wide' : ''}" aria-live="polite">${label ?? `${act} ${val}`}</span>`
      + `<button type="button" class="sv-hit sx-btn" data-act="${act}" data-val="1" aria-label="${name} one year later" aria-disabled="${up}">+</button></div>`;
  }

  animate(st, t) {
    const v = this.stepIndex;
    if (v === 0) return;
    const g = this.geo(st), f = g.f, k = g.k, live = this.live;
    axesOnSvg(live, 'ax', f, 99, { size: Math.round(18 * k), fmtY: group });
    const pts = toScreen(f, VALUES.map((y, i) => [Y0 + i, y]));
    const quiet = v === 4;
    plotLineSvg(live, 'sx', pts, this.drawing ? t : 99, {
      col: quiet ? `color-mix(in oklab, ${LINE} 55%, var(--sim-label-muted))` : LINE, width: (quiet ? 4 : 5) * k,
      by: 'x', dur: DRAW_S, ease: (u) => u, head: this.drawing, headR: 8 * k, lip: !quiet,
    });
  }

  testState() {
    const v = this.stepIndex;
    return {
      view: v, buy: this.buy, sell: this.sell, back: back(this.buy, this.sell), change: change(this.buy, this.sell),
      win: this.win, oneYear: change(this.win, this.win + 1), twenty: change(LONG[0], LONG[1]), drawing: this.drawing,
    };
  }
}
